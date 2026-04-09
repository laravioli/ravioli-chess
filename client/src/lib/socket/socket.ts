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

interface Settings {
  params: Params;
}

export let siteSocket: WsSocket | undefined;

export function wsConnect(path: Path) {
  //first connection
  if (!siteSocket) siteSocket = new WsSocket(path);
  //from there -> resilient to shitty strict mode
  //may change handlers
  else if (path == siteSocket.getPath()) return siteSocket;
  //change backend socket
  else siteSocket.reconnect(path);
  return siteSocket;
}

export function wsReload() {
  if (siteSocket) siteSocket.connect();
}

class WsSocket {
  ws: WebSocket | undefined;
  private path: Path;
  private readonly protocol: string;
  private readonly settings: Settings;
  pageReceive: (msg: MsgIn) => void | undefined;

  constructor(path: Path) {
    this.path = path;
    this.protocol = location.protocol === 'https' ? 'wss://' : 'ws://';
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

  private readonly handle = (data: MsgIn) => {
    switch (data.t || false) {
      case false:
        break;
      default:
        console.log(data.d);
    }
  };

  destroy = (): void => {
    this.disconnect();
    this.ws = undefined;
  };

  private readonly disconnect = (): void => {
    const ws = this.ws;
    if (ws) {
      ws.onerror = ws.onclose = ws.onopen = ws.onmessage = () => {};
      ws.close();
    }
  };

  private readonly url = () => {
    const o = this.protocol + location.host + this.path;
    const searchParams = new URLSearchParams();
    for (const k of Object.keys(this.settings.params))
      if (this.settings.params[k]) searchParams.append(k, this.settings.params[k]);
    const query = searchParams.toString();
    return query ? `${o}?${query}` : o;
  };

  getPath() {
    return this.path;
  }
}
