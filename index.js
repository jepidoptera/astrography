const express = require('express');
const http = require('http');
const path = require('path')
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

http.createServer(app).listen(port);

console.log('serving on', port)