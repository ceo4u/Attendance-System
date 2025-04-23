const axios = require('axios');

async function testRestApi() {
  try {
    console.log('Starting REST API test...');
    
    // First, get a JWT token by logging in
    console.log('Logging in to get JWT token...');
    const loginResponse = await axios.post('http://localhost:3000/auth/login', {
      username: 'admin',
      password: 'password'
    });
    
    const token = loginResponse.data.access_token;
    console.log(`Got token: ${token}`);
    
    // Mark attendance using the REST API
    console.log('Marking attendance via REST API...');
    const attendanceResponse = await axios.post(
      'http://localhost:3000/attendance/mark',
      {
        classId: '123',
        studentId: '456',
        status: 'present'
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    console.log('Attendance marked successfully:');
    console.log(attendanceResponse.data);
    
    // Get attendance data
    console.log('\nGetting attendance data...');
    const getResponse = await axios.get(
      'http://localhost:3000/attendance/student?classId=123&studentId=456',
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    console.log('Attendance data:');
    console.log(getResponse.data);
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

testRestApi();
