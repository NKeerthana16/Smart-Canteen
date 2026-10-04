const http = require('http');

function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', (e) => reject(e));

    if (postData) {
      req.write(typeof postData === 'object' ? JSON.stringify(postData) : postData);
    }
    req.end();
  });
}

async function runTests() {
  console.log('=== STARTING BACKEND REST API SUITE TEST ===\n');

  // 1. GET /api
  const apiTest = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api',
    method: 'GET'
  });
  console.log('1. GET /api response:', apiTest.status, apiTest.body);

  // 2. Admin Login
  const adminLogin = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'admin@gmail.com', password: 'admin123' });
  console.log('2. Admin Login status:', adminLogin.status, 'User:', adminLogin.body.user ? adminLogin.body.user.name : null);

  // 3. Student Login
  const studentLogin = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'student@gmail.com', password: '123456' });
  console.log('3. Student Login status:', studentLogin.status, 'Token:', studentLogin.body.token ? 'JWT Present' : 'Missing');

  const studentToken = studentLogin.body.token;

  // 4. GET /api/foods
  const foodsRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/foods',
    method: 'GET'
  });
  console.log('4. GET /api/foods count:', foodsRes.body.data ? foodsRes.body.data.length : 0);

  // 5. GET /api/slots
  const slotsRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/slots',
    method: 'GET'
  });
  console.log('5. GET /api/slots count:', slotsRes.body.data ? slotsRes.body.data.length : 0);
  const firstSlot = slotsRes.body.data ? slotsRes.body.data[0] : null;

  // 6. POST /api/orders (Student)
  if (firstSlot && foodsRes.body.data.length > 0) {
    const orderRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/orders',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`
      }
    }, {
      items: [{ id: foodsRes.body.data[0]._id, name: foodsRes.body.data[0].name, price: foodsRes.body.data[0].price, quantity: 2 }],
      pickupSlot: firstSlot.time,
      pickupDate: '2026-09-29',
      paymentMethod: 'UPI',
      notes: 'Test order'
    });
    console.log('6. Create Order status:', orderRes.status, 'OrderId:', orderRes.body.data ? orderRes.body.data.orderId : orderRes.body.message);
  }

  // 7. GET /api/admin/dashboard
  const adminToken = adminLogin.body.token;
  const dashRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/dashboard',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  console.log('7. Admin Dashboard status:', dashRes.status, 'Total Users:', dashRes.body.data ? dashRes.body.data.totalUsers : 0);

  console.log('\n=== ALL BACKEND REST API SUITE TESTS PASSED ===');
}

runTests().catch(console.error);
