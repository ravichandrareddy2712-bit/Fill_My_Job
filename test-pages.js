const http = require('http');

const pages = ['/', '/pricing', '/faq', '/contact', '/onboarding', '/dashboard'];
let completed = 0;

pages.forEach(page => {
  http.get('http://localhost:3000' + page, (res) => {
    console.log(page + ' -> HTTP ' + res.statusCode);
    completed++;
    if (completed === pages.length) process.exit(0);
  }).on('error', (e) => {
    console.log(page + ' -> ERROR: ' + e.message);
    completed++;
    if (completed === pages.length) process.exit(0);
  });
});
