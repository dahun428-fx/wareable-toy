type MessageHandler = (data: any) => void;

export class ReconnectingWebSocket {
  private ws: WebSocket | null = null;
  private url: string;
  private handlers: Map<string, Set<MessageHandler>> = new Map();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private isManualClose = false;

  constructor(url: string) {
    this.url = url;
  }

  connect() {
    this.isManualClose = false;
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.emit('connection', { status: 'connected' });
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.emit(message.type, message.data);
        this.emit('message', message);
      } catch {}
    };

    this.ws.onclose = () => {
      this.emit('connection', { status: 'disconnected' });
      if (!this.isManualClose && this.reconnectAttempts < this.maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
        this.reconnectTimer = setTimeout(() => {
          this.reconnectAttempts++;
          this.connect();
        }, delay);
      }
    };

    this.ws.onerror = () => {
      // onclose will handle reconnection
    };
  }

  disconnect() {
    this.isManualClose = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    this.ws?.close();
    this.ws = null;
  }

  on(event: string, handler: MessageHandler) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);
    return () => this.handlers.get(event)?.delete(handler);
  }

  private emit(event: string, data: any) {
    this.handlers.get(event)?.forEach((handler) => handler(data));
  }

  get isConnected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}
