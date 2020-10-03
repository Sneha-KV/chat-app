const express = require('express');
const path = require('path');
const socketio = require('socket.io');
const http = require('http');
const Filter = require('bad-words');

// custom files
const { generateMessage, generateLocationMessage, generateFileMessage } = require('./utils/messages');
const {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
} = require('./utils/users');


const app = express();
const server = http.createServer(app);
const io = socketio(server);

const publicDirectoryPath = path.join(__dirname,'../public');
const port = process.env.PORT || 3000;

app.use(express.static(publicDirectoryPath));
// var count = 0;

io.on('connection', (socket)=> { // socket is the newly formed connection
    console.log('New client connected');
   
    
    socket.on('join',(options, callback) => {
        const { error, user } = addUser({ id: socket.id, ...options });

        if(error) {
            return callback(error);
        }
        socket.join(user.room);
        socket.emit('message', generateMessage('Admin','Welcome!')); // emit is like trigger.Here we are triggering an event called message
        socket.to(user.room).broadcast.emit('message', generateMessage(`${user.username} has joined!`)); // give admin as user name if needed
        io.to(user.room).emit('roomData', {room: user.room, users: getUsersInRoom(user.room)});
        callback();
        // socket.emit, socket.broadcast, io.emit
        //socket.to().emit

    })
    socket.on('sendMessage', (msg,callback) => {
        // when msg is sent, broadcast it to all connections
        const filter = new Filter();
        if(filter.isProfane(msg)) {
            return callback('Language!');
        }
        var user = getUser(socket.id); //get the details of user for room
        if(user) {
            io.to(user.room).emit('message', generateMessage(user.username, msg));
            callback('Delivered!');
        }
        
    })
   
    socket.on('disconnect', ()=> {
        user = removeUser(socket.id);
        if(user) 
            {
                io.to(user.room).emit('message',generateMessage('Admin', `${user.username} has left`));
                io.to(user.room).emit('roomData', {room: user.room, users: getUsersInRoom(user.room)}); // sending all users in that room
            }
    })
    
    // receive location from user and send to others
    socket.on('sendLocation', (coords,callback) => {
        var user = getUser(socket.id); //get the details of user for room
        if(user) {
            io.to(user.room).emit('locationMessage',generateLocationMessage(user.username,`https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`));
            callback();
        }
        
    })
   
    // receive files from User
    socket.on('uploadFile', (msg) => {
        console.log('received base64 file from' + msg.username);
        console.log(getUser(socket.id));
        // socket.username = msg.username;
        var user = getUser(socket.id);
        // // socket.broadcast.emit('base64 image', //exclude sender
       
        io.to(user.room).emit('receiveFile',   generateFileMessage(user.username, msg.file, msg.fileName,msg.fileType));//include sender
    
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