import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';
const TEST_EMAIL = `loadtest+${Date.now()}@example.com`;
const TEST_PASSWORD = 'LoadTest123!';

export const options = {
  stages: [
    { duration: '1m', target: 50 },
    { duration: '3m', target: 50 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    'http_req_duration{scenario:default}': ['p(95)<500'],
    'http_req_failed{scenario:default}': ['rate<0.01'],
  },
};

export function setup() {
  // Register a test user first
  const registerPayload = JSON.stringify({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    displayName: 'Load Test User',
  });

  const registerRes = http.post(`${BASE_URL}/api/auth/register`, registerPayload, {
    headers: { 'Content-Type': 'application/json' },
  });

  let token;
  if (registerRes.status === 201 || registerRes.status === 200) {
    const body = JSON.parse(registerRes.body);
    token = body.data.accessToken;
  } else {
    // If registration fails (user exists), try login
    const loginPayload = JSON.stringify({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });

    const loginRes = http.post(`${BASE_URL}/api/auth/login`, loginPayload, {
      headers: { 'Content-Type': 'application/json' },
    });

    check(loginRes, {
      'login succeeded': (r) => r.status === 200,
    });

    const body = JSON.parse(loginRes.body);
    token = body.data.accessToken;
  }

  // Create a test sale to have data to query
  const salePayload = JSON.stringify({
    title: 'Load Test Sale',
    description: 'A sale for load testing',
    address: '123 Main St',
    latitude: 40.7128,
    longitude: -74.006,
    startsAt: new Date(Date.now() + 86400000).toISOString(),
    endsAt: new Date(Date.now() + 172800000).toISOString(),
  });

  const saleRes = http.post(`${BASE_URL}/api/sales`, salePayload, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  let saleId = null;
  let listingId = null;
  if (saleRes.status === 201 || saleRes.status === 200) {
    const saleBody = JSON.parse(saleRes.body);
    saleId = saleBody.data.id;

    // Create a test listing
    const listingPayload = JSON.stringify({
      title: 'Load Test Item',
      description: 'An item for load testing',
      price: 25.0,
      category: 'OTHER',
    });

    const listingRes = http.post(
      `${BASE_URL}/api/sales/${saleId}/listings`,
      listingPayload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (listingRes.status === 201 || listingRes.status === 200) {
      const listingBody = JSON.parse(listingRes.body);
      listingId = listingBody.data.id;
    }
  }

  return { token, saleId, listingId };
}

function authHeaders(data) {
  return {
    headers: {
      Authorization: `Bearer ${data.token}`,
      'Content-Type': 'application/json',
    },
  };
}

function browseNearbySales(data) {
  const res = http.get(
    `${BASE_URL}/api/sales/nearby?lat=40.7128&lng=-74.0060&radiusKm=10`,
    authHeaders(data)
  );
  check(res, { 'browse nearby 200': (r) => r.status === 200 });
}

function searchListings(data) {
  const queries = ['furniture', 'electronics', 'clothing', 'toys', 'books', 'test'];
  const q = queries[Math.floor(Math.random() * queries.length)];
  const res = http.get(`${BASE_URL}/api/search?q=${q}`, authHeaders(data));
  check(res, { 'search 200': (r) => r.status === 200 });
}

function viewSaleDetail(data) {
  if (!data.saleId) return;
  const res = http.get(`${BASE_URL}/api/sales/${data.saleId}`, authHeaders(data));
  check(res, { 'sale detail 200': (r) => r.status === 200 });
}

function viewListingDetail(data) {
  if (!data.listingId) return;
  const res = http.get(`${BASE_URL}/api/listings/${data.listingId}`, authHeaders(data));
  check(res, { 'listing detail 200': (r) => r.status === 200 });
}

export default function (data) {
  const roll = Math.random();

  if (roll < 0.4) {
    browseNearbySales(data);
  } else if (roll < 0.7) {
    searchListings(data);
  } else if (roll < 0.9) {
    viewSaleDetail(data);
  } else {
    viewListingDetail(data);
  }

  sleep(1);
}
