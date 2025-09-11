export let siteSocket;

export function wsConnect(path) {
  return (siteSocket = new WsSocket(path));
}

class WsSocket {
  constructor(path) {
    const protocol = location.protocol === 'https' ? 'wss://' : 'ws://';
    this.url = url(protocol + location.host + path, { sri: site.sri });
    this.connect();
  }

  connect = () => {
    const ws = (this.ws = new WebSocket(this.url.toString()));
    ws.onmessage = e => {
      const data = JSON.parse(e.data);
      console.log(data);
      setTimeout(() => ws.send(JSON.stringify({ message: 'ping' })), 1000);
    };
    ws.onclose = e => {
      console.error('Chat socket closed unexpectedly');
    };
  };

  reload = () => {
    this.ws.close();
    this.connect();
  };
}

export const url = (path, params) => {
  const searchParams = new URLSearchParams();
  for (const k of Object.keys(params)) if (params[k]) searchParams.append(k, params[k]);
  const query = searchParams.toString();
  return query ? `${path}?${query}` : path;
};
