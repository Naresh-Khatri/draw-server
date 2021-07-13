const server = require('http').createServer()

io = require('socket.io')(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
})

const PORT = process.env.PORT || 3000

const msgsData = []

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
    socket.on('clearCanvas', user => {
        console.log('clearing canvas ');
        socket.broadcast.emit('clearCanvas', Object.assign(user, {
            time: Date.now(),
            username: "Server",
            text: `${user.username} cleared Canvas!`,
        }))
    })

    socket.on('lockCanvas', username=>{
        socket.broadcast.emit('lockCanvas', username)
    })
    socket.on('releaseCanvas',()=>{
        socket.broadcast.emit('releaseCanvas')
    })

    socket.on('sendMsg', data => {
        console.log(data)
        socket.broadcast.emit('receiveMsg', data)
    })
})

server.listen(PORT, () => {
    console.log(`Listening on http://localhost:${PORT}`)
})