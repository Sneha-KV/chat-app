const generateMessage = (username, text) => {
    return {
        username,
        text,
        createdAt : new Date().getTime()
    }
}

const generateLocationMessage = (username, url) => {
    return {
        username,
        url,
        createdAt : new Date().getTime()
    }
}

const generateFileMessage = (username, file, fileName, fileType) => {
    return {
        username,
        file,
        fileName,
        fileType,
        createdAt : new Date().getTime()
    }
}
module.exports = {
    generateMessage,
    generateLocationMessage,
    generateFileMessage
}