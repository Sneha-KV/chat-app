const users = [];

//add users, Remove User, getUser
const addUser = ({ id, username, room}) => {
    //clean the data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();
    
    //validate the data
    if (!username || !room) {
        return {
            error: 'Username and room are required!'
        }
    }

    //  check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username;
    });

    // validate username
    if(existingUser) {
        return {
            error: `Pick another user name! ${username} is already taken`
        }
    }

    //Store the user
    const user = { id, username, room}
    users.push(user);
    return {
        user
    }
}

// Remove a user
const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id);
    if(index !== -1) {
        return users.splice(index, 1) [0]
    } else {
        console.log('No user found with id-',id);
    }
}

// get user with id
const getUser = (id) => {
    const reqUser = users.find((user) => user.id === id);
    return reqUser;
}

//get Users in a room
const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase();
    const usersInRoom = users.filter((user)=> user.room === room);
    return usersInRoom;
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}