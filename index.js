const server = require('http').createServer()

io = require('socket.io')(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
})

const PORT = process.env.PORT || 3000

io.on('connection', socket => {
    console.log("New connection: " + socket.id)
    socket.on('brushMove', (data) => {
        socket.broadcast.emit('brushMove', data)
    })
    socket.on('undo', (data) => {
        socket.broadcast.emit('brushMove', data)
    })
    socket.on('redo', (data) => {
        socket.broadcast.emit('brushMove', data)
    })
    socket.on('clearCanvas', id => {
        console.log('clearing canvas ');
        socket.broadcast.emit('clearCanvas', id )
    })
})

server.listen(PORT, () => {
    console.log(`Listening on http://localhost:${PORT}`)
})