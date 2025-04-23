const redis = require('redis');

async function checkRedisCache() {
  try {
    console.log('Checking Redis cache...');
    
    // Create Redis client
    const client = redis.createClient({
      url: 'redis://localhost:6379'
    });
    
    client.on('error', (err) => console.log('Redis Client Error', err));
    
    await client.connect();
    
    // Check for attendance data
    const key = 'attendance_123_456_2025-04-23';
    console.log(`Checking key: ${key}`);
    
    const value = await client.get(key);
    if (value) {
      console.log(`Found value: ${value}`);
      try {
        const parsedValue = JSON.parse(value);
        console.log('Parsed value:', parsedValue);
      } catch (e) {
        console.log('Value is not valid JSON');
      }
    } else {
      console.log('Key not found in Redis');
    }
    
    // List all keys
    console.log('\nListing all attendance keys:');
    const keys = await client.keys('attendance_*');
    if (keys.length > 0) {
      for (const k of keys) {
        console.log(`- ${k}`);
      }
    } else {
      console.log('No attendance keys found');
    }
    
    await client.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkRedisCache();
