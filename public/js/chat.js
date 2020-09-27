const socket = io();

// Elements
$messageFormButton = document.querySelector('#message-form');
$sendMsgButton = document.querySelector('#sendMsg');
$messageInput = document.querySelector('.message-input');
$sendLocationButton = document.querySelector('#send-location');
$messages = document.querySelector('#messages');

//Templates
const messageTemp = document.querySelector('#message-template').innerHTML;
const locationTemp = document.querySelector('#location-template').innerHTML;


socket.on('message', (message)=> {
    // console.log(message);
    const html = Mustache.render(messageTemp, {
        message : message.text,
        createdAt : moment(message.createdAt).format('h:mm a') //moment library
    });
    $messages.insertAdjacentHTML('beforeend',html)

});

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

socket.on('locationMessage', (locationMsg)=> {
    console.log('Message-', locationMsg);
    const html = Mustache.render(locationTemp,  {
        url: locationMsg.url,
        createdAt: moment(locationMsg.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
})
// socket.on('countUpdated', (count)=> {
//     console.log('count updated ',count);
// })

// // on click of buttton
// document.querySelector('#increment').addEventListener('click', () => {
//     console.log('clicked');
//     socket.emit('increment'); 

// })