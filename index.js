const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');

const server = http.createServer(onRequest);
const PORT = 3000;

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});

function onRequest(req, res) {
  if (req.url === '/' || req.url === '/index.html') {
    // Serve the HTML form
    fs.readFile('index.html', (err, data) => {
      if (err) {
        res.writeHead(500, {'Content-Type': 'text/plain'});
        res.end('Internal Server Error');
        return;
      }
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.end(data);
    });
  } else if (req.url.startsWith('/proxy?url=')) {
    // Proxy request
    const requestedUrl = decodeURIComponent(req.url.slice('/proxy?url='.length));
    if (!requestedUrl) {
      res.writeHead(400, {'Content-Type': 'text/plain'});
      res.end('Please provide a valid URL.');
      return;
    }

    // Fetch the requested URL
    const protocol = requestedUrl.startsWith('https') ? https : http;
    protocol.get(requestedUrl, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    }).on('error', (err) => {
      console.error('Proxy Error:', err);
      res.writeHead(500, {'Content-Type': 'text/plain'});
      res.end('An error occurred while processing your request.');
    });
  } else {
    // Invalid URL
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.end('Not Found');
  }
}
