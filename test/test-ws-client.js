const { io } = require('socket.io-client');
const axios = require('axios');
const readline = require('readline');

async function testWebSocketClient() {
  try {
    console.log('Starting WebSocket test client...');

    // First, get a JWT token by logging in
    console.log('Logging in to get JWT token...');
    const loginResponse = await axios.post('http://localhost:3000/auth/login', {
      username: 'admin',
      password: 'password'
    });

    const token = loginResponse.data.access_token;
    console.log(`Got token: ${token}`);

    // Connect to WebSocket server with the token
    const socket = io('http://localhost:3000/attendance', {
      transports: ['websocket'],
      auth: {
        token
      }
    });

    // Create readline interface for user input
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    // Handle connection events
    socket.on('connect', () => {
      console.log('Connected to WebSocket server');

      // Subscribe to a class
      socket.emit('subscribeToClass', { classId: '123' }, (response) => {
        console.log('Subscribed to class:', response);
      });

      // Show menu
      showMenu(socket, rl);
    });

    // Handle attendance updates
    socket.on('attendanceUpdate', (data) => {
      console.log('Received attendance update:', data);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      rl.close();
      process.exit(0);
    });
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
}

function showMenu(socket, rl) {
  console.log('\n--- Menu ---');
  console.log('1. Mark attendance');
  console.log('2. Exit');

  rl.question('Select an option: ', (answer) => {
    switch (answer) {
      case '1':
        markAttendance(socket, rl);
        break;
      case '2':
        console.log('Exiting...');
        socket.disconnect();
        rl.close();
        process.exit(0);
        break;
      default:
        console.log('Invalid option');
        showMenu(socket, rl);
    }
  });
}

function markAttendance(socket, rl) {
  console.log('\n--- Mark Attendance ---');

  rl.question('Enter class ID: ', (classId) => {
    rl.question('Enter student ID: ', (studentId) => {
      rl.question('Enter status (present, absent, late, excused): ', (status) => {
        console.log(`Marking attendance for class: ${classId}, student: ${studentId}, status: ${status}`);

        socket.emit('markAttendance', {
          classId,
          studentId,
          status
        }, (response) => {
          console.log('Attendance marked response:', response);
          showMenu(socket, rl);
        });
      });
    });
  });

}

testWebSocketClient();
