import { io, Socket } from 'socket.io-client';

class WebSocketService {
  private socket: Socket | null = null;
  private static instance: WebSocketService;

  private constructor() {}

  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  public connect(token: string) {
    if (this.socket?.connected) return;

    // Connexion au namespace WS du backend
    this.socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000', {
      path: '/ws/socket.io', // Ajuster selon config backend (FastAPI SocketIO)
      auth: { token },
      transports: ['websocket'],
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('🟢 WS Connected:', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      console.log('🔴 WS Disconnected');
    });
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public on(event: string, callback: (...args: any[]) => void) {
    this.socket?.on(event, callback);
  }

  public off(event: string) {
    this.socket?.off(event);
  }
}

export const wsService = WebSocketService.getInstance();