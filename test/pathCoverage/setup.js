'use strict';

const { spawn } = require('child_process');
const path = require('path');
const http = require('http');

/**
 * Shared test setup for the Path Coverage suite.
 *
 * Per the automation rules, Supertest must run against a real HTTP instance of
 * the API (not by requiring the Express `app` object). To honour that, we boot
 * the server as a separate Node process and point the tests at its base URL.
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const SERVER_ENTRY = path.resolve(__dirname, '..', '..', 'server.js');

let serverProcess = null;

/** Poll the healthcheck endpoint until the server responds or we time out. */
function waitForServer(url, timeoutMs = 15000, intervalMs = 250) {
  const deadline = Date.now() + timeoutMs;

  return new Promise((resolve, reject) => {
    const attempt = () => {
      const req = http.get(`${url}/api/healthcheck`, (res) => {
        res.resume();
        if (res.statusCode === 200) {
          resolve();
        } else {
          retry();
        }
      });

      req.on('error', retry);
    };

    const retry = () => {
      if (Date.now() > deadline) {
        reject(new Error(`Server did not become ready at ${url} within ${timeoutMs}ms`));
        return;
      }
      setTimeout(attempt, intervalMs);
    };

    attempt();
  });
}

async function startServer() {
  // When the server is managed externally (e.g. started in the background by
  // the CI pipeline), skip spawning our own process and simply wait for the
  // already-running API to answer its healthcheck.
  if (process.env.START_SERVER === 'false') {
    await waitForServer(BASE_URL);
    return;
  }

  serverProcess = spawn(process.execPath, [SERVER_ENTRY], {
    env: { ...process.env, PORT: process.env.PORT || '3000' },
    stdio: 'inherit',
  });

  serverProcess.on('error', (err) => {
    // Surface spawn failures (e.g. missing entry point) loudly.
    console.error('Failed to start API server:', err);
  });

  await waitForServer(BASE_URL);
}

function stopServer() {
  if (serverProcess && !serverProcess.killed) {
    serverProcess.kill();
    serverProcess = null;
  }
}

module.exports = { BASE_URL, startServer, stopServer };
