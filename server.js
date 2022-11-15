const express = require("express")
const app = express()
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const path = require('path');
const formatMessage = require('./utils/messages');
const {userJoin,getCurrentUser,userLeave,getRoomUsers,get_socket_id,need_key,users}=require('./utils/users');

var {PythonShell} = require('python-shell');

//set statc folder
app.use(express.static(path.join(__dirname,'public')));

//run when client connects
io.on('connection',(socket)=>{
    socket.on('joinRoom',(user_data)=>{
        const user=userJoin(socket.id,user_data.username,user_data.room,user_data.pub_key);
        socket.join(user.room);
        io.to(user.room).emit('roomUsers',{
            room: user.room,
            users: getRoomUsers(user.room)
        });
        if(need_key(user_data.room)) io.to(socket.id).emit('Server_Response',{T_KEY:0});
        else io.to(get_socket_id(user_data.room)).emit('send_T_KEY',{
            ID: socket.id,
            PubKey: user_data.pub_key
        })
        socket.to(user.room).emit('announce',formatMessage(`${user.username}`,'has joined the server'));
    });
    socket.on('Thread_Key',({ID,Key})=>{
        io.to(ID).emit('Server_Response',({T_KEY:Key}));
    });


    //runs when client disconnect
    socket.on('disconnect',function(){
        const user=userLeave(socket.id);
        if(user){
            //send user and room info
            io.to(user.room).emit('roomUsers',{
            room: user.room,
            users: getRoomUsers(user.room)
            })
            socket.to(user.room).emit('announce',formatMessage(`${user.username}`,'has left the server'));
        }
    })
    //listen for chat message
    socket.on('chatMessage',(msg)=>{
        console.log('A message received');
        var user=getCurrentUser(socket.id);
        io.to(user.room).emit('message',formatMessage(`${user.username}`,msg));
    })

    socket.on('reportMessage',(data)=>{
        const messageData = "Your are warned against engaging in bullying"
        const username = data.username;
        const room = data.room;
        const message =  data.message;       
        const index= users.findIndex(user=> user.room===room && user.username===username);
        if(index!=-1){
            PythonShell.run('utils/bullyDetector.py', {args:message}, function (err, results) {
                if (err) throw err;
                if(results[0] == 1){
                    console.log("Offensive")
                    var t = users[index].warning
                    users[index].warning = ++t ;
                    console.log("Sending Warning")
                    io.to(users[index].id).emit('warning',messageData)
                }else{
                    console.log("Non Offensive");
                }
                if(users[index].warning > 3){
                    io.to(users[index].id).emit('banned')
                }
            })
        }
    })
})

const port=process.env.PORT || 3000
server.listen(port,function(){
    console.log(`Server running on port ${port}...`);
})