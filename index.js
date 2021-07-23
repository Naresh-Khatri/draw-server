const server = require('http').createServer()

io = require('socket.io')(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
})

const PORT = process.env.PORT || 3000

const msgsData = []

const canvasData = []
let cSteps = -1

io.on('connection', socket => {
    console.log("New connection: " + socket.id)
    socket.emit('getPrevMsgsData', msgsData)
    socket.emit('getPrevCanvasData', canvasData)
    socket.on('ping',(time)=>{
        socket.emit('ping', time)
    })
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
        this.canvasData = []
        socket.broadcast.emit('clearCanvas', Object.assign(user, {
            time: Date.now(),
            username: "Server",
            text: `${user.username} cleared Canvas!`,
        }))
    })
    socket.on('sendUndo', user => {
        cSteps--
        socket.broadcast.emit('receiveUndo', user)
    })
    socket.on('sendRedo', user => {
        cSteps++
        socket.broadcast.emit('receiveRedo', user)
    })

    socket.on('lockCanvas', username => {
        socket.broadcast.emit('lockCanvas', username)
    })
    socket.on('releaseCanvas', (canvasPic) => {
        cSteps++
        canvasData.push(canvasPic)
        if (cSteps < canvasData.length - 1) {
            canvasData.length = cSteps
        }
        socket.broadcast.emit('releaseCanvas', canvasPic)
    })

    socket.on('sendMsg', data => {
        // msgsData.push(data)
        appendMsgData(data)
        // console.log(data)
        socket.broadcast.emit('receiveMsg', data)
    })
})

server.listen(PORT, () => {
    console.log(`Listening on http://localhost:${PORT}`)
})

function appendMsgData(msgData) {
    //logic to append text if last and new msg owners are same

    if (msgsData.length == 0)
        msgsData.push(msgData)
    else {
        if (msgsData[msgsData.length - 1].username == msgData.username) {
            console.log('same user')
            msgsData[msgsData.length - 1].text.push(msgData.text[0])
            msgsData[msgsData.length - 1].time = msgData.time
            // msgsData.push(msgs)
        }
        else {
            console.log('different user')
            msgsData.push(msgData)
        }
    }
    console.log(msgsData[msgsData.length - 1])
}