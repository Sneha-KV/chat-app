const socket = io();

// Elements
$messageFormButton = document.querySelector('#message-form');
$sendMsgButton = document.querySelector('#sendMsg');
$messageInput = document.querySelector('.message-input');
$sendLocationButton = document.querySelector('#send-location');
$messages = document.querySelector('#messages');
$sidebar = document.querySelector('#side-bar');
$goToBottomButton = document.querySelector('#goToBottom');

//Templates
const messageTemp = document.querySelector('#message-template').innerHTML;
const locationTemp = document.querySelector('#location-template').innerHTML;
const sidebarTemp = document.querySelector('#sidebar-template').innerHTML;

//Options
const {username , room} = Qs.parse(location.search, { ignoreQueryPrefix : true})
// Receive message from server
socket.on('message', (message)=> {
    // console.log(message);
    const html = Mustache.render(messageTemp, {
        username: message.username,
        message : message.text,
        createdAt : moment(message.createdAt).format('h:mm a') //moment library
    });
    $messages.insertAdjacentHTML('beforeend',html);
    autoscroll();

});

// Receive location from user
socket.on('locationMessage', (locationMsg)=> {
    console.log('Message-', locationMsg);
    const html = Mustache.render(locationTemp,  {
        username: locationMsg.username,
        url: locationMsg.url,
        createdAt: moment(locationMsg.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
})

// receive users in the room from server
socket.on('roomData', ({room, users}) => {
    console.log(room, '---', users);
    const roomhtml = Mustache.render(sidebarTemp, {
        room,
        users
    });
    $sidebar.innerHTML = roomhtml
})

// Scroll issue - Scroll to the bottom, if user receives a new message and user is at the last msg
// But if user is not at the end, he is seeing the chat history, dont scroll down
const autoscroll = (bottom) => {

    console.log('test')
    // New message Element
    const $newMessage = $messages.lastElementChild;

    // Height of messages container
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    // Visible Height
    const visibleHeight = $messages.offsetHeight;

    //Height of messages container
    const containerHeight = $messages.scrollHeight;

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight;
    
    if(containerHeight - newMessageHeight <= scrollOffset || bottom) {
        $messages.scrollTop = $messages.scrollHeight;
        $goToBottomButton.style.display = "none";
    } else {
        $goToBottomButton.style.display = "block";
    }
}
$messageFormButton.addEventListener('submit',(e)=>{
    // var msg = document.getElementById('msg').value;
    e.preventDefault();
    $sendMsgButton.setAttribute('disabled','disabled');
    
    var msg = e.target.elements.message.value;
    socket.emit('sendMessage',msg, (ackMsg)=> {
        console.log(ackMsg);
        $sendMsgButton.removeAttribute('disabled');
        $messageInput.value = '';
        $messageInput.focus();
    });
    
});

//function to share location
$sendLocationButton.addEventListener('click', ()=> {
    $sendLocationButton.setAttribute('disabled', 'disabled');
    if(!navigator.geolocation) {
        return alert('Location not supported');
    }

   navigator.geolocation.getCurrentPosition((position)=> {
       console.log(position);
       var location = { 
           latitude: position.coords.latitude, 
           longitude: position.coords.longitude
        }
       socket.emit('sendLocation', location, ()=> {
        console.log('Location shared!'); // acknowledgement callback
        $sendLocationButton.removeAttribute('disabled');
    });
       
   })
})



socket.emit('join', {username, room}, (error) => {
    if(error) {
        alert(error);
        location.href = '/'
    }
    
})

window.onscroll = function() {autoscroll()};

// function scrollFunction() {
//   if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
//     mybutton.style.display = "block";
//   } else {
//     mybutton.style.display = "none";
//   }
// }