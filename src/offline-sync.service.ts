import { Injectable } from '@nestjs/common';

@Injectable()
export class OfflineSyncService {
  private queue: any[] = [];

  addToQueue(data: any): void {
    this.queue.push(data);
  }

  async sync(): Promise<void> {
    while (this.queue.length > 0) {
      const data = this.queue.shift();
      await this.sendToServer(data);
    }
  }

  async sendToServer(data: any): Promise<void> {
    // Implement your logic to send data to the server
    console.log('Sending data to server:', data);
  }
}