//https://github.com/lichess-org/lila/blob/master/ui/lib/src/socket.ts
import { defined } from '@/lib/common';

type Sri = string;
type Tpe = string;
type Payload = any;
type MsgBase = {
  t: Tpe;
  d?: Payload;
};
type MsgIn = MsgBase;
type MsgOut = MsgBase;

type Path = '/socket/site' | '/socket/play/123';

interface Params extends Record<string, any> {
  readonly sri: Sri;
}

interface Options {
  idle: boolean;
  pongTimeout: number; // time to wait for pong before resetting the connection
  pingDelay: number; // time between pong and ping
  autoReconnectDelay: number;
  protocol: string;
  debug?: boolean;
  reloadOnResume?: boolean;
}

interface Settings {
  receive?: (t: Tpe, d: Payload) => void;
  options?: Partial<Options>;
  params?: Params;
}

export interface SocketSendOpts {
  sign: string;
  ackable: boolean;
  withLag?: boolean;
  millis?: number;
}

export let siteSocket: WsSocket | undefined;

export function wsConnect(path: Path, settings?: Partial<Settings>) {
  if (!siteSocket) siteSocket = new WsSocket(path, settings);
  else if (path !== siteSocket.getPath()) siteSocket.connect(path, settings);
  return siteSocket;
}

export function wsReload() {
  if (siteSocket) siteSocket.connect();
}

class WsSocket {
  averageLag = 0;

  private path: Path;
  private settings: Settings;
  private options: Options;
  private ws: WebSocket | undefined;
  private pingSchedule: Timeout;
  private connectSchedule: Timeout;
  private lastPingTime: number = performance.now();
  private pongCount = 0;
  private resendWhenOpen: [string, Payload, Partial<SocketSendOpts>][] = [];

  constructor(path: Path, settings: Partial<Settings> = {}) {
    this.path = path;

    this.options = {
      idle: false,
      debug: false,
      pongTimeout: 9000,
      autoReconnectDelay: 3500,
      protocol: location.protocol === 'https:' ? 'wss:' : 'ws:',
      ...settings.options,
      pingDelay: 2500,
    };
    this.settings = {
      receive: settings.receive,
      params: {
        sri: site.sri,
        ...settings.params,
      },
    };
    this.connect();
  }

  connect = (path?: Path, settings?: Partial<Settings>) => {
    this.destroy();
    if (path) this.path = path;
    if (settings) {
      this.options = { ...this.options, ...this.settings.options };
      this.settings = {
        receive: settings.receive,
        params: {
          sri: site.sri,
          ...settings.params,
        },
      };
    }
    try {
      const ws = (this.ws = new WebSocket(
        url(this.options.protocol, this.path, this.settings.params),
      ));
      ws.onerror = (e) => this.onError(e);
      ws.onclose = this.onClose;
      ws.onopen = () => {
        this.debug('connected to ' + ws.url);
        this.onSuccess();
        this.pingNow();
        this.resendWhenOpen.forEach(([t, d, o]) => this.send(t, d, o));
        this.resendWhenOpen = [];
      };
      ws.onmessage = (e) => {
        if (e.data == 0) return this.pong();
        const m = JSON.parse(e.data);
        this.handle(m);
      };
    } catch (e) {
      this.onClose({ code: 4000, reason: String(e) } as CloseEvent);
    }
    this.scheduleConnect();
  };

  send = (t: string, d: Payload, o: Partial<SocketSendOpts> = {}, noRetry = false): void => {
    const msg: Partial<MsgOut> = { t };
    if (d !== undefined) {
      if (o.withLag) d.l = Math.round(this.averageLag);
      if (defined(o.millis) && o.millis >= 0) d.s = Math.round(o.millis * 0.1).toString(36);
      msg.d = d;
    }
    const message = JSON.stringify(msg);
    this.debug('send ' + message);
    if (!this.ws || this.ws.readyState === WebSocket.CONNECTING) {
      if (!noRetry) this.resendWhenOpen.push([t, msg.d, o]);
    } else this.ws.send(message);
  };

  private readonly scheduleConnect = (delay: number = this.options.pongTimeout): void => {
    if (this.options.idle) delay = 10 * 1000 + Math.random() * 10 * 1000;
    clearTimeout(this.pingSchedule);
    clearTimeout(this.connectSchedule);
    this.connectSchedule = setTimeout(() => {
      this.connect();
    }, delay);
  };

  private readonly schedulePing = (delay: number): void => {
    clearTimeout(this.pingSchedule);
    this.pingSchedule = setTimeout(this.pingNow, delay);
  };

  private readonly pingNow = (): void => {
    clearTimeout(this.pingSchedule);
    clearTimeout(this.connectSchedule);
    const pingData = '"p"';
    try {
      this.ws!.send(pingData);
      this.lastPingTime = performance.now();
    } catch (e) {
      this.debug(e, true);
    }
    this.scheduleConnect();
  };

  private readonly computePingDelay = (): number =>
    this.options.pingDelay + (this.options.idle ? 1000 : 0);

  private readonly pong = (): void => {
    clearTimeout(this.connectSchedule);
    this.schedulePing(this.computePingDelay());
    const currentLag = Math.min(performance.now() - this.lastPingTime, 10000);
    this.pongCount++;

    // Average first 4 pings, then switch to decaying average.
    const mix = this.pongCount > 4 ? 0.1 : 1 / this.pongCount;
    this.averageLag += mix * (currentLag - this.averageLag);
  };

  private readonly handle = (m: MsgIn) => {
    switch (m.t || false) {
      case false:
        break;
      default:
        this.settings.receive?.(m.t, m.d);
        break;
    }
  };

  private readonly debug = (msg: unknown, always = false): void => {
    if (always || this.options.debug) console.debug(msg);
  };

  destroy = (): void => {
    clearTimeout(this.pingSchedule);
    clearTimeout(this.connectSchedule);
    this.disconnect();
    this.ws = undefined;
  };

  private readonly disconnect = (): void => {
    const ws = this.ws;
    if (ws) {
      this.debug('Disconnect');
      ws.onerror = ws.onclose = ws.onopen = ws.onmessage = () => {};
      ws.close();
    }
  };

  private readonly onError = (e: unknown): void => {
    this.options.debug = true;
    this.debug(`error: ${e} ${JSON.stringify(e)}`); // e not always from lila
  };

  private readonly onClose = (e: CloseEvent): void => {
    if (this.ws) {
      this.debug('Will autoreconnect in ' + this.options.autoReconnectDelay);
      this.scheduleConnect(this.options.autoReconnectDelay);
    }
    if (e.wasClean && e.code < 1002) return;
    clearTimeout(this.pingSchedule);
  };

  private readonly onSuccess = (): void => {
    let disconnectTimeout: Timeout | undefined;
    idleTimer(
      10 * 60 * 1000,
      () => {
        this.options.idle = true;
        disconnectTimeout = setTimeout(this.destroy, 2 * 60 * 60 * 1000);
      },
      () => {
        this.options.idle = false;
        if (this.ws) clearTimeout(disconnectTimeout);
        else if (this.options.reloadOnResume) location.reload();
      },
    );
  };

  getPath = () => this.path;
}

function url(protocol: string, path: Path, params?: Params) {
  const o = protocol.concat(location.host.concat(path));
  let searchParams: URLSearchParams | undefined;
  if (params) {
    searchParams = new URLSearchParams();
    Object.keys(params).forEach((p) => searchParams!.append(p, params[p]));
  }
  return searchParams ? `${o}?${searchParams.toString()}` : o;
}

function idleTimer(delay: number, onIdle: () => void, onWakeUp: () => void): void {
  const events = ['mousemove', 'touchstart'];

  let listening = false,
    active = true,
    lastSeenActive = performance.now();

  const onActivity = () => {
    if (!active) {
      // console.log('Wake up');
      onWakeUp();
    }
    active = true;
    lastSeenActive = performance.now();
    stopListening();
  };

  const startListening = () => {
    if (!listening) {
      events.forEach((e) => document.addEventListener(e, onActivity));
      listening = true;
    }
  };

  const stopListening = () => {
    if (listening) {
      events.forEach((e) => document.removeEventListener(e, onActivity));
      listening = false;
    }
  };

  setInterval(() => {
    if (active && performance.now() - lastSeenActive > delay) {
      // console.log('Idle mode');
      onIdle();
      active = false;
    }
    startListening();
  }, 10000);
}
