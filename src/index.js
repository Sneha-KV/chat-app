const express = require('express');
const path = require('path');
const socketio = require('socket.io');
const http = require('http');
const Filter = require('bad-words');

// custom files
const { generateMessage, generateLocationMessage } = require('./utils/messages');


const app = express();
const server = http.createServer(app);
const io = socketio(server);

const publicDirectoryPath = path.join(__dirname,'../public');
const port = process.env.PORT || 3000;

app.use(express.static(publicDirectoryPath));
// var count = 0;

io.on('connection', (socket)=> { // socket is the newly formed connection
    console.log('New client connected');
 
    socket.emit('message', generateMessage('Welcome!')); // emit is like trigger.Here we are triggering an event called message
    socket.broadcast.emit('message', generateMessage('A new user has joined'));

    socket.on('sendMessage', (msg,callback) => {
        // when msg is sent, broadcast it to all connections
        const filter = new Filter();
        if(filter.isProfane(msg)) {
            return callback('Language!');
        }
        io.emit('message', generateMessage(msg));
        callback('Delivered!');
    })
   
    socket.on('disconnect', ()=> {
        io.emit('message',generateMessage('A user has left'));
    })
    
    // receive location from user and send to others
    socket.on('sendLocation', (coords,callback) => {
        io.emit('locationMessage',generateLocationMessage(`https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`));
        callback();
    })
   
    // socket.emit('countUpdated', count);
    // socket.on('increment', ()=> {
    //     count++;
    //     // socket.emit('countUpdated', count); -> for just this connection
    //     io.emit('countUpdated',count); // for all connections
    // })
})

server.listen(port, ()=> {
    console.log('Server started on port -',port)
})