import { io } from 'socket.io-client';

class SocketClient {
  constructor(url = 'ws://localhost:3005') {
    this.url = url;
    this.socket = null;
    this.isConnected = false;
    this.connectionPromise = null;
  }

  connect() {
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      this.socket = io(this.url, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      this.socket.on('connect', () => {
        console.error(`Connected to Adobe proxy server at ${this.url}`);
        this.isConnected = true;
        this.socket.emit('register', { application: 'premiere' });
      });

      this.socket.once('registration_response', (data) => {
        console.error('Registration response:', data.message);
        resolve(this.socket);
      });

      this.socket.on('disconnect', () => {
        console.error('Disconnected from proxy server');
        this.isConnected = false;
      });

      this.socket.on('error', (error) => {
        console.error('Socket error:', error);
        reject(error);
      });

      // Timeout after 10 seconds
      setTimeout(() => {
        if (!this.isConnected) {
          reject(new Error('Connection timeout'));
        }
      }, 10000);
    });

    return this.connectionPromise;
  }

  async sendCommand(command) {
    if (!this.isConnected) {
      await this.connect();
    }

    return new Promise((resolve, reject) => {
      const packet = {
        application: 'premiere',
        command: command
      };

      this.socket.emit('command_packet', packet);

      const timeout = setTimeout(() => {
        this.socket.off('packet_response');
        reject(new Error('Command timeout after 20 seconds'));
      }, 20000);

      this.socket.once('packet_response', (response) => {
        clearTimeout(timeout);

        if (response.status === 'SUCCESS') {
          resolve(response);
        } else {
          reject(new Error(response.error || 'Command failed'));
        }
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connectionPromise = null;
    }
  }
}

// Export singleton instance
export const socketClient = new SocketClient();