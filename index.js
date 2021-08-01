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

const usersMap = new Map()
let usersCount = 0

io.on('connection', socket => {
    usersCount++
    // usersMap.set(socket.id, { username: socket.id})
    socket.emit('receivePrevMsgsData', msgsData)
    socket.emit('receivePrevCanvasData', {canvasData, cSteps})
    usersMap.set(socket.id, { username: 'unknown' })
    socket.emit('updateUserList', Object.fromEntries(usersMap))

    //to check if same username exist
    socket.on('getUsersList', () => {
        socket.emit('receiveUsersList', Object.fromEntries(usersMap))
    })
    socket.on('userJoin', user => {
        console.log('joined ')
        console.log(user)
        usersMap.set(socket.id, { username: user.username })
        console.log(usersMap)
        socket.broadcast.emit('userJoin', user)
        socket.broadcast.emit('receiveUsersList', Object.fromEntries(usersMap))
    })
    socket.on('ping', (time) => {
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
            text: [`${user.username} cleared Canvas!`],
        }))
    })
    socket.on('sendUndo', user => {
        if(cSteps>-1)
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
        console.log(cSteps + ' 74')

        cSteps++
        canvasData.push(canvasPic)
        if (cSteps < canvasData.length - 1) {
            console.log(cSteps+ ' 79')
            canvasData.length = cSteps
        }
        console.log(canvasData.length)
        socket.broadcast.emit('releaseCanvas', canvasPic)
    })

    socket.on('sendMsg', data => {
        // msgsData.push(data)
        appendMsgData(data)
        // console.log(data)
        socket.broadcast.emit('receiveMsg', data)
    })
    socket.on('disconnect', () => {

        console.log('disconnected ')
        socket.broadcast.emit('releaseCanvas')
        socket.broadcast.emit('userLeft', usersMap.get(socket.id))
        console.log(usersMap.delete(socket.id))
        console.log(socket.id)
        console.log(usersMap)
        socket.broadcast.emit('receiveUsersList', Object.fromEntries(usersMap))
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