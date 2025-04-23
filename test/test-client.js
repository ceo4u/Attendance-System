const io = require('socket.io-client');
const socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log('Connected to server');
  socket.emit('subscribeToClass', { classId: '123' });
});

socket.on('attendanceUpdate', (data) => {
  console.log('Received attendance update:', data);
});