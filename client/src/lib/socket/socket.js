class WsSocket {
  constructor(path) {
    const protocol = location.protocol === "https" ? "wss:" : "ws:";
    this.url = new URL(path, protocol + location.host);
  }
  connect = () => {
    const ws = (this.ws = new WebSocket(this.url.toString()));
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      console.log(data);
      setTimeout(() => ws.send(JSON.stringify(data)), 1000);
    };
    ws.onclose = (e) => {
      console.error("Chat socket closed unexpectedly");
    };
  };
}
