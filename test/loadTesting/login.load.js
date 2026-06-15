import http from 'k6/http';
import { check } from 'k6';

/**
 * K6 load test for the Login endpoint (POST /api/login).
 *
 * Scenario (per the load-testing requirements):
 *   - Stage 1: ramp to 10 virtual users over the first 5s
 *   - Stage 2: ramp to 30 virtual users over the next 20s
 *   - Stage 3: ramp down to 0 virtual users over the final 5s
 *   Total duration: 30s, peaking at 30 VUs.
 *
 * Threshold:
 *   - 95th percentile of request duration must stay under 500ms.
 *
 * Test data comes from the valid, pre-seeded credentials in README.md.
 */

// Base URL of the running API (override with BASE_URL when invoking k6).
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const LOGIN_URL = `${BASE_URL}/api/login`;

// Valid pre-seeded credentials documented in README.md.
const VALID_CREDENTIALS = {
  username: 'alice',
  password: 'password123',
};

export const options = {
  stages: [
    { duration: '5s', target: 10 }, // ramp up to 10 VUs in the first 5s
    { duration: '20s', target: 30 }, // ramp up to 30 VUs over the next 20s
    { duration: '5s', target: 0 }, // ramp down to 0 VUs in the final 5s
  ],
  thresholds: {
    // 95th percentile response time must be below 500ms.
    http_req_duration: ['p(95)<500'],
  },
};

export default function () {
  const payload = JSON.stringify(VALID_CREDENTIALS);
  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  const res = http.post(LOGIN_URL, payload, params);

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response has token': (r) => {
      try {
        return typeof r.json('token') === 'string' && r.json('token').length > 0;
      } catch (e) {
        return false;
      }
    },
    'login successful message': (r) => {
      try {
        return r.json('message') === 'Login successful.';
      } catch (e) {
        return false;
      }
    },
  });
}
