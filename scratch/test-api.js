const http = require('http');
const fs = require('fs');

const data = JSON.stringify({
  title: "Test Title",
  summary: "Test summary",
  customSlug: "test-slug",
  image_prompt: "Test image",
  inline_images: [],
  content: "This is a test content.",
  auditReport: "- Öneriler:\n- Tarih ekle."
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/admin/audit-fix',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, (res) => {
  let responseBody = '';
  res.on('data', (chunk) => {
    responseBody += chunk;
  });
  res.on('end', () => {
    fs.writeFileSync('scratch/result.json', JSON.stringify({
      statusCode: res.statusCode,
      body: JSON.parse(responseBody)
    }, null, 2));
    console.log('Saved to scratch/result.json');
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(data);
req.end();
