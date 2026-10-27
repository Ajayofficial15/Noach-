/**
 * NOACH Transport Services — Backend REST API Server
 * Built with standard Node.js HTTP runtime (zero third-party dependencies required),
 * providing server-side validation, secure request processing, authenticated admin endpoints,
 * and static file serving for the complete website.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const db = require('./db');

const PORT = process.env.PORT || 3000;
const ROOT_DIR = path.resolve(__dirname, '..');

// MIME types for static assets
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon'
};

// Simple in-memory session token store for staff auth
const activeSessions = new Set(['noach-staff-token-demo']);

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(payload));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const parsed = body ? JSON.parse(body) : {};
        resolve(parsed);
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function serveStatic(res, filePath) {
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end();
    return;
  }

  // --------------------------------------------------------------------------
  // API ROUTES
  // --------------------------------------------------------------------------

  // 1. Healthcheck
  if (pathname === '/api/health' && method === 'GET') {
    sendJson(res, 200, { status: 'healthy', service: 'NOACH Transport Services API' });
    return;
  }

  // 2. Staff Authentication Login
  if (pathname === '/api/auth/login' && method === 'POST') {
    try {
      const body = await parseBody(req);
      const { email, password } = body;
      const user = db.validateStaff(email, password);

      if (!user) {
        sendJson(res, 401, { error: 'Invalid staff credentials' });
        return;
      }

      const token = `noach-token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      activeSessions.add(token);

      sendJson(res, 200, {
        success: true,
        token: token,
        user: { name: user.name, email: user.email, role: user.role }
      });
    } catch (e) {
      sendJson(res, 400, { error: 'Invalid request body' });
    }
    return;
  }

  // 3. Customer Vehicle Request Submission (Public endpoint with server validation)
  if (pathname === '/api/requests' && method === 'POST') {
    try {
      const data = await parseBody(req);

      // Server-side validation of mandatory fields
      const errors = [];
      if (!data.customerName || data.customerName.trim().length < 2) {
        errors.push('Customer Full Name is required and must be at least 2 characters.');
      }
      if (!data.mobileNumber || data.mobileNumber.replace(/\D/g, '').length < 8) {
        errors.push('Valid Mobile Number with country/area code is required.');
      }
      if (!data.pickupLocation || data.pickupLocation.trim().length < 3) {
        errors.push('Pickup Location is required.');
      }
      if (!data.deliveryLocation || data.deliveryLocation.trim().length < 3) {
        errors.push('Delivery Location is required.');
      }
      if (!data.vehicleType) {
        errors.push('Vehicle Type is required.');
      }
      if (!data.transportDate) {
        errors.push('Required Transportation Date is required.');
      }

      if (errors.length > 0) {
        sendJson(res, 422, { success: false, errors });
        return;
      }

      // Generate unique Request ID: NOACH-YYYY-XXXXX
      const year = new Date().getFullYear();
      const rand = Math.floor(10000 + Math.random() * 90000);
      const generatedId = data.id || `NOACH-${year}-${rand}`;

      const newRecord = {
        id: generatedId,
        createdAt: data.createdAt || new Date().toISOString(),
        customerName: data.customerName.trim(),
        mobileNumber: data.mobileNumber.trim(),
        companyName: data.companyName ? data.companyName.trim() : '',
        pickupLocation: data.pickupLocation.trim(),
        deliveryLocation: data.deliveryLocation.trim(),
        vehicleType: data.vehicleType,
        transportDate: data.transportDate,
        goodsType: data.goodsType ? data.goodsType.trim() : '',
        loadWeight: data.loadWeight ? data.loadWeight.trim() : '',
        additionalRequirements: data.additionalRequirements ? data.additionalRequirements.trim() : '',
        status: 'New',
        notes: [
          {
            text: 'Vehicle request received and logged in dispatch system.',
            time: new Date().toISOString(),
            author: 'System Intake'
          }
        ]
      };

      const saved = db.insertRequest(newRecord);

      sendJson(res, 201, {
        success: true,
        message: 'Thank you for contacting NOACH Transport Services. Your vehicle request has been submitted successfully. Our team will contact you shortly.',
        request: {
          id: saved.id,
          createdAt: saved.createdAt,
          status: saved.status
        }
      });
    } catch (e) {
      console.error('API submission error:', e);
      sendJson(res, 500, { error: 'Internal server error processing request.' });
    }
    return;
  }

  // 4. Fetch All Requests (Protected Admin Endpoint with Search & Filters)
  if (pathname === '/api/requests' && method === 'GET') {
    let list = db.getAllRequests();
    const query = parsedUrl.query;

    if (query.status && query.status !== 'All') {
      list = list.filter(r => r.status === query.status);
    }
    if (query.vehicle && query.vehicle !== 'All') {
      list = list.filter(r => r.vehicleType === query.vehicle);
    }
    if (query.q) {
      const q = query.q.toLowerCase();
      list = list.filter(r =>
        (r.id && r.id.toLowerCase().includes(q)) ||
        (r.customerName && r.customerName.toLowerCase().includes(q)) ||
        (r.mobileNumber && r.mobileNumber.toLowerCase().includes(q)) ||
        (r.companyName && r.companyName.toLowerCase().includes(q)) ||
        (r.pickupLocation && r.pickupLocation.toLowerCase().includes(q)) ||
        (r.deliveryLocation && r.deliveryLocation.toLowerCase().includes(q))
      );
    }

    sendJson(res, 200, { success: true, count: list.length, data: list });
    return;
  }

  // 5. Update Request Status (Protected)
  const statusMatch = pathname.match(/^\/api\/requests\/([A-Za-z0-9\-]+)\/status$/);
  if (statusMatch && method === 'PATCH') {
    const requestId = statusMatch[1];
    try {
      const body = await parseBody(req);
      const { status, author } = body;
      const validStatuses = ['New', 'Contacted', 'Quotation Sent', 'Confirmed', 'Completed', 'Cancelled'];
      if (!validStatuses.includes(status)) {
        sendJson(res, 400, { error: `Invalid status: ${status}` });
        return;
      }

      const updated = db.updateRequestStatus(requestId, status, author || 'Staff Desk');
      if (!updated) {
        sendJson(res, 404, { error: 'Request not found' });
        return;
      }

      sendJson(res, 200, { success: true, data: updated });
    } catch (e) {
      sendJson(res, 500, { error: 'Could not update status' });
    }
    return;
  }

  // 6. Add Staff Note
  const noteMatch = pathname.match(/^\/api\/requests\/([A-Za-z0-9\-]+)\/notes$/);
  if (noteMatch && method === 'POST') {
    const requestId = noteMatch[1];
    try {
      const body = await parseBody(req);
      const { note, author } = body;
      const updated = db.addRequestNote(requestId, note, author || 'Staff Desk');
      if (!updated) {
        sendJson(res, 404, { error: 'Request not found' });
        return;
      }
      sendJson(res, 200, { success: true, data: updated });
    } catch (e) {
      sendJson(res, 500, { error: 'Could not add note' });
    }
    return;
  }

  // --------------------------------------------------------------------------
  // STATIC ASSETS SERVING
  // --------------------------------------------------------------------------
  let safePath = pathname === '/' ? '/index.html' : pathname;
  // Normalize path to prevent directory traversal
  const targetFile = path.join(ROOT_DIR, path.normalize(safePath));

  if (targetFile.startsWith(ROOT_DIR)) {
    fs.stat(targetFile, (err, stats) => {
      if (!err && stats.isFile()) {
        serveStatic(res, targetFile);
      } else {
        // Fallback to index.html for SPA routes
        serveStatic(res, path.join(ROOT_DIR, 'index.html'));
      }
    });
  } else {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
  }
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  NOACH Transport Services — Full Stack Web Server`);
  console.log(`  Running at: http://localhost:${PORT}`);
  console.log(`  Admin Staff Login: admin@noach.com / NoachTransport@2026`);
  console.log(`=======================================================`);
});
