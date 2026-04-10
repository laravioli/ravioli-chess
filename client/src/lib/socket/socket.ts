type Sri = string;
type Tpe = string;
type Payload = any;
type MsgBase = {
  t: Tpe;
  d?: Payload;
};
type MsgIn = MsgBase;

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
  params: Params;
}

export let siteSocket: WsSocket | undefined;

export function wsConnect(path: Path) {
  if (!siteSocket) siteSocket = new WsSocket(path);
  else if (path !== siteSocket.getPath()) siteSocket.reconnect(path);
  return siteSocket;
}

export function wsReload() {
  if (siteSocket) siteSocket.connect();
}
//todo: finish copying lichess
class WsSocket {
  averageLag = 0;
  private path: Path;
  private ws: WebSocket | undefined;
  private readonly options: Options;
  private readonly settings: Settings;
  private pingSchedule: Timeout;
  private connectSchedule: Timeout;
  private lastPingTime: number = performance.now();
  private pongCount = 0;
  pageReceive: (msg: MsgIn) => void | undefined;

  constructor(path: Path) {
    this.options = {
      idle: false,
      debug: false,
      pongTimeout: 9000,
      autoReconnectDelay: 3500,
      protocol: location.protocol === 'https:' ? 'wss:' : 'ws:',
      pingDelay: 2500,
    };
    this.path = path;
    this.settings = { params: { sri: site.sri } };
    this.connect();
  }

  connect = () => {
    this.destroy();
    const ws = (this.ws = new WebSocket(this.url().toString()));
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      this.handle(data);
    };
    ws.onclose = (_event) => {};
    ws.onerror = (err) => {
      console.error(`Chat socket error: ${err}`);
    };
  };

  reconnect = (path: Path) => {
    this.path = path;
    this.connect();
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
    const pingData = 'p';
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

  private readonly handle = (data: MsgIn) => {
    switch (data.t || false) {
      case false:
        break;
      default:
        console.log(data.d);
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

  private readonly url = () => {
    const o = this.options.protocol + location.host + this.path;
    const searchParams = new URLSearchParams();
    for (const k of Object.keys(this.settings.params))
      if (this.settings.params[k]) searchParams.append(k, this.settings.params[k]);
    const query = searchParams.toString();
    return query ? `${o}?${query}` : o;
  };

  getPath = () => this.path;
}
