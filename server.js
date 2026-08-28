import express from 'express';
import http from 'http';
import https from 'https';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const currentDirectory = dirname(fileURLToPath(import.meta.url));
const staticDirectory = join(currentDirectory, 'dist');
const backendOrigin = process.env.BACKEND_URL;
// Only backend endpoints are proxied. SPA pages that share the /auth/ prefix
// (e.g. /auth/test, /auth/login) must stay on the static app shell.
function shouldProxy(req) {
  const p = req.path;
  if (p.startsWith('/api/')) return true;
  if (p === '/email-verification') return true;
  if (p === '/resend-verification' && req.method === 'POST') return true;
  if (p === '/auth/google' || p.startsWith('/auth/google/')) return true;
  const isAuthApiPath = p === '/auth/login' || p === '/auth/register' || p === '/resend-verification';
  if (isAuthApiPath && req.method !== 'GET') return true;
  return false;
}

// Endpoints that the frontend expects to receive as JSON. If the upstream
// (backend) returns HTML instead (e.g. a Bonto wake-on-request splash page
// while the backend container is sleeping), we must NOT forward that HTML to
// the client, otherwise response.json() will throw "Unexpected token '<'".
function expectsJson(req) {
  const p = req.path;
  if (p.startsWith('/api/')) return true;
  if (p === '/email-verification') return true;
  if (p === '/resend-verification' && req.method === 'POST') return true;
  const isAuthApiPath = p === '/auth/login' || p === '/auth/register';
  if (isAuthApiPath && req.method !== 'GET') return true;
  return false;
}

const app = express();

app.use((req, res, next) => {
  if (!backendOrigin || !shouldProxy(req)) {
    next();
    return;
  }
  const target = new URL(req.originalUrl, backendOrigin);
  const transport = target.protocol === 'https:' ? https : http;
  const upstream = transport.request(target, {
    method: req.method,
    headers: { ...req.headers, host: target.host }
  }, (backendResponse) => {
    const contentType = backendResponse.headers['content-type'] || '';
    const isHtml = /text\/html/i.test(contentType);

    // If this request is expected to return JSON but the backend answered with
    // an HTML splash/error page, replace it with a proper JSON error so the
    // frontend can handle it instead of throwing on JSON.parse.
    if (expectsJson(req) && isHtml) {
      backendResponse.resume();
      res.status(503).json({
        message: 'The server is starting up. Please refresh in a few seconds.'
      });
      return;
    }

    res.writeHead(backendResponse.statusCode, backendResponse.headers);
    backendResponse.pipe(res);
  });
  upstream.on('error', () => {
    if (!res.headersSent) {
      res.status(502).json({ message: 'Backend is waking up, please try again in a few seconds.' });
    } else {
      res.end();
    }
  });
  req.pipe(upstream);
});

app.use(express.static(staticDirectory));
// SPA fallback: any unknown route serves the app shell so client-side routing works.
app.use((req, res) => {
  res.sendFile(join(staticDirectory, 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Frontend running on port ${port}`);
});
