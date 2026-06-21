import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import jwt from 'jsonwebtoken';

const clients = new Map<string, WebSocket>();

/**
 * Initializes the WebSocket server and binds to the HTTP server instance.
 */
export const initWebSocketServer = (server: http.Server): void => {
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    try {
      const url = new URL(request.url || '', `http://${request.headers.host || 'localhost'}`);
      const token = url.searchParams.get('token');

      if (!token) {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'bizgrowth_secret') as any;
      
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, decoded.userId);
      });
    } catch (err) {
      console.error('WebSocket connection upgrade failed:', err);
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
    }
  });

  wss.on('connection', (ws: WebSocket, userId: string) => {
    clients.set(userId, ws);
    console.log(`🔌 Client connected to WebSocket: User ID ${userId}`);

    ws.on('close', () => {
      clients.delete(userId);
      console.log(`🔌 Client disconnected from WebSocket: User ID ${userId}`);
    });

    ws.on('error', (err) => {
      console.error(`WebSocket error for user ${userId}:`, err);
      clients.delete(userId);
    });
  });
};

/**
 * Sends a real-time message payload to a connected user ID.
 */
export const sendRealTimeUpdate = (userId: string, type: string, data: any): boolean => {
  const ws = clients.get(userId);
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type, data }));
    return true;
  }
  return false;
};
