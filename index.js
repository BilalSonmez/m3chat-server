// Setup basic express server
const express = require('express');
const app = express();
const path = require('path');
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 3000;

server.listen(port, () => {
    console.log('Server listening at port %d', port);
});

let userCount = 0;

io.on('connection', (socket) => {
    let userAdd = false;
    socket.on('disconnect', () => {
        if (userAdd) {
            --userCount;
            console.log('Giden kullanıcı: ' + socket.userData.username);
            socket.broadcast.emit('userLeft', socket.userData.username);
            socket.broadcast.emit('userCount', userCount);
            socket.userData = {};
        }
    });
    socket.on('chatMessage', (msg) => {
        socket.broadcast.emit('chatMessage', msg);
    });
    socket.on("insertUser", (userData) => {
        if (userAdd) return;
        console.log('Yeni kullanıcı: ' + userData.username);
        socket.userData = userData;
        ++userCount;
        userAdd = true;
        socket.broadcast.emit('userEnter', socket.userData.username);
        socket.broadcast.emit('userCount', userCount);
        socket.on('userTyping', () => {
            socket.broadcast.emit('userTyping', socket.userData.username);
        });
        socket.on('userStopTyping', () => {
            socket.broadcast.emit('userStopTyping', socket.userData.username);
        });
    });
});