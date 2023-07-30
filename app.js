var express = require('express')
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/messenger.html')
})

server.listen(4000);

let users = []
let connections = []

//50 последних сообщений
let history = []

io.sockets.on('connection', function (socket) {

    const connectionId = socket.id
    let username = 'Anon'

    socket.emit('load history', history)
    socket.emit('load users', users)

    //Добавление имени пользователя в массив подключенных пользователей
    socket.on('new user', function (data) {
        users.push({ id: connectionId, username: data })
        io.sockets.emit('add user', { username: data })
        username = data;
    })

    socket.on('disconnect', function (data) {
        let id = users.find(item => item.id === connectionId)
        let index = users.indexOf(id)
        users.splice(index, 1)

        io.sockets.emit('update users', users)
    })

    socket.on('send message', function (data) {
        if (history.length > 50) {
            history.splice(1, 1)
        }
        history.push({author: username, msg: data })
        io.sockets.emit('add message', {author: username, msg: data })
    })
});