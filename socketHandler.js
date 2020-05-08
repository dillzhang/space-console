function handleIo(io) {
    io.on('connection', (socket) => {
        console.log(`Socket Connected ${socket.id}`);
        
        socket.on('input', (data) => {
            console.log(`${socket.id}'s input: ${data}`);
            socket.broadcast.emit('broadcast', data);
        });

        socket.on('response', (data) => {
            console.log(`${socket.id}'s response: ${data}`);
            socket.broadcast.emit('output', data);
        });
    });
}


module.exports = handleIo;