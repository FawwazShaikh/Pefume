async function runTests() {
  console.log('--- RUNNING HTTP REQUEST TESTS ---');

  // Test 1: GET /api/cart without Authorization
  console.log('\n[TEST 1] GET /api/cart (No token)');
  try {
    const res = await fetch('http://localhost:5000/api/cart', { method: 'GET' });
    const text = await res.text();
    console.log(`Response Status: ${res.status} ${res.statusText}`);
    console.log(`Response Body: ${text}`);
  } catch (err) {
    console.error('Request failed:', err);
  }

  // Test 2: GET /api/cart with invalid token
  console.log('\n[TEST 2] GET /api/cart (Invalid token)');
  try {
    const res = await fetch('http://localhost:5000/api/cart', {
      method: 'GET',
      headers: { 'Authorization': 'Bearer invalid_test_token_xyz' }
    });
    const text = await res.text();
    console.log(`Response Status: ${res.status} ${res.statusText}`);
    console.log(`Response Body: ${text}`);
  } catch (err) {
    console.error('Request failed:', err);
  }

  // Test 3: POST /api/cart without Authorization
  console.log('\n[TEST 3] POST /api/cart (No token)');
  try {
    const res = await fetch('http://localhost:5000/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ variantId: 'some-variant-id', quantity: 1 })
    });
    const text = await res.text();
    console.log(`Response Status: ${res.status} ${res.statusText}`);
    console.log(`Response Body: ${text}`);
  } catch (err) {
    console.error('Request failed:', err);
  }

  // Test 4: POST /api/cart with invalid token
  console.log('\n[TEST 4] POST /api/cart (Invalid token)');
  try {
    const res = await fetch('http://localhost:5000/api/cart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer invalid_test_token_xyz'
      },
      body: JSON.stringify({ variantId: 'some-variant-id', quantity: 1 })
    });
    const text = await res.text();
    console.log(`Response Status: ${res.status} ${res.statusText}`);
    console.log(`Response Body: ${text}`);
  } catch (err) {
    console.error('Request failed:', err);
  }
}

runTests();
