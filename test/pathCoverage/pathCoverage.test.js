'use strict';

const request = require('supertest');
const { expect } = require('chai');
const { BASE_URL, startServer, stopServer } = require('./setup');

/**
 * Path Coverage test suite for the E-Commerce REST API.
 *
 * Path coverage = (paths exercised) / (total paths). The API exposes exactly
 * four paths, so one request per path is enough to reach 100% path coverage:
 *
 *   1. GET  /api/healthcheck
 *   2. POST /api/register
 *   3. POST /api/login
 *   4. POST /api/checkout
 *
 * Test data is taken from the valid, pre-seeded values documented in README.md.
 * Requests are sent over HTTP against a running server instance (see setup.js).
 */
describe('Path Coverage - E-Commerce REST API', function () {
  // Booting a child server process can take a moment on first run.
  this.timeout(20000);

  // Use a request agent bound to the running server's HTTP base URL,
  // rather than passing the in-process Express `app`.
  const api = () => request(BASE_URL);

  before(async function () {
    await startServer();
  });

  after(function () {
    stopServer();
  });

  it('GET /api/healthcheck - returns service health status', async function () {
    const res = await api().get('/api/healthcheck');

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('status', 'ok');
    expect(res.body).to.have.property('timestamp');
  });

  it('POST /api/register - creates a new user account', async function () {
    // Unique username/email so the path is exercised against a 201 success.
    const suffix = Date.now();
    const newUser = {
      username: `dave_${suffix}`,
      email: `dave_${suffix}@example.com`,
      password: 'mypassword',
    };

    const res = await api()
      .post('/api/register')
      .send(newUser)
      .set('Content-Type', 'application/json');

    expect(res.status).to.equal(201);
    expect(res.body).to.have.property('message');
    expect(res.body).to.have.nested.property('user.username', newUser.username);
    expect(res.body).to.have.nested.property('user.email', newUser.email);
  });

  it('POST /api/login - authenticates a seeded user and returns a JWT', async function () {
    // Valid pre-seeded credentials from README.md (alice / password123).
    const res = await api()
      .post('/api/login')
      .send({ username: 'alice', password: 'password123' })
      .set('Content-Type', 'application/json');

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('token').that.is.a('string');
    expect(res.body).to.have.nested.property('user.username', 'alice');
  });

  it('POST /api/checkout - places an authenticated order with cash discount', async function () {
    // Authenticate first to obtain a token (checkout requires a Bearer token).
    const loginRes = await api()
      .post('/api/login')
      .send({ username: 'alice', password: 'password123' })
      .set('Content-Type', 'application/json');

    expect(loginRes.status).to.equal(200);
    const token = loginRes.body.token;

    // Valid checkout payload from README.md: Laptop x1 + Wireless Mouse x2, cash.
    const res = await api()
      .post('/api/checkout')
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .send({
        items: [
          { productId: 1, quantity: 1 },
          { productId: 3, quantity: 2 },
        ],
        paymentMethod: 'cash',
      });

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('message');
    expect(res.body).to.have.nested.property('order.paymentMethod', 'cash');
    expect(res.body).to.have.nested.property('order.discountRate', 0.1);
    expect(res.body.order).to.have.property('total').that.is.a('number');
  });
});
