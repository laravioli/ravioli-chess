import type { Site } from '@/lib/site/site';
import type { Path } from '@/lib/tree/interface';

export let siteSocket: WsSocket;

export function wsConnect(path: Path) {
  return (siteSocket = new WsSocket(path));
}

class WsSocket {
  ws: WebSocket;
  url: string;

  constructor(path: string) {
    const protocol = location.protocol === 'https' ? 'wss://' : 'ws://';
    this.url = url(protocol + location.host + path, {
      sri: window.site.sri,
    });
    this.connect();
  }

  connect = () => {
    const ws = (this.ws = new WebSocket(this.url.toString()));
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      console.log(data);
      setTimeout(() => ws.send(JSON.stringify({ message: 'ping' })), 1000);
    };
    ws.onclose = (_event) => {
      console.error('Chat socket closed unexpectedly');
    };
    ws.onerror = (_err) => {
      this.ws?.close();
    };
  };

  reload = () => {
    this.ws.close();
    this.connect();
  };
}

export const url = (path: string, params: Site) => {
  const searchParams = new URLSearchParams();
  for (const k of Object.keys(params)) if (params[k]) searchParams.append(k, params[k]);
  const query = searchParams.toString();
  return query ? `${path}?${query}` : path;
};
