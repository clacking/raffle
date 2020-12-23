const express = require('express');
const app = express();
const http = require('http').Server(app);
const { handler } = require('./handler');
const io = handler(http);
const path = require('path');

app.use(express.static(path.join(__dirname, '../build')));

app.get('/*', function(req, res) {
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

http.listen(4000, () =>{
    console.log(`[${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}]`, `server listening at 4000.`);
});
