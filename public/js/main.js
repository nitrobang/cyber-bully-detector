const socket=io();
const { time } = require('console');
const crypto = require('crypto');
const rsa=require('node-rsa');
ls = window.sessionStorage;
const chatForm=document.getElementById('chat-form');
const chats = document.getElementById('chats')
const chatMessages=document.querySelector('.chat-messages');
const roomName=document.getElementById('room-name');
const userList=document.getElementById('users');
const {username,room}=Qs.parse(location.search,{
    ignoreQueryPrefix:true
});

 
//Setting up the RSA key Pair
var publicKey=GeneratePair();
var user_data={username:username,room:room,pub_key:publicKey}


//join room
socket.emit('joinRoom',user_data);

// Server Response
socket.on('Server_Response',({T_KEY})=>{
    if(T_KEY==0) generate_thread_key();
    else {
        let d_key=priv_Decrypt(T_KEY);
        let key= d_key.slice(0,d_key.indexOf('.'));
        let iv = d_key.slice(d_key.indexOf('.')+1);
        ls.setItem('key',key);
        ls.setItem('iv',iv);
    }
});

//If new user asks for Thread Key
socket.on('send_T_KEY',({ID,PubKey})=>{
    let key=ls.getItem('key')+ '.' + ls.getItem('iv');
    socket.emit('Thread_Key',({
        ID:ID,
        Key:pub_Encrypt(key,PubKey)
    }));
});


socket.on('roomUsers',function({room,users}){
    outputRoomName(room);
    outputUsers(users);
})

//message from server
socket.on('message',(msg)=>{
    let message=msg;
    console.log(message);
    outputMessage(message);
    //Scroll down
    chatMessages.scrollTop=chatMessages.scrollHeight;
})

//Announcement from server
socket.on('announce',(msg)=>{
    let message=msg;
    console.log(message);
    announceUser(message);
    //Scroll down
    chatMessages.scrollTop=chatMessages.scrollHeight;
})

socket.on('warning',(msg)=>{
    var date = new Date()
    var time = date.getHours()+":"+date.getMinutes()
    let message = {
        username: "BOT",
        time: time,
        text: msg,
    }
    announceUser(message)
})

socket.on('banned',()=>{
    alert("You are banned from the room")
    window.location.replace("/")
})

//message submit
chatForm.addEventListener('submit',function(e){
    e.preventDefault();
    const msg=e.target.elements.msg.value;
    //Emit a message to server
    socket.emit('chatMessage',encrypt(msg));
    e.target.elements.msg.value='';
    e.target.elements.msg.focus();
})


chats.addEventListener('click',function(e){
    e.preventDefault();
    if(e.target.id == 'report'){
        data = String(e.target.alt).split(",")
        socket.emit('reportMessage',({
            message: data[0],
            username: data[1],
            room: data[2],
        }))
        alert("Reported")
    }
})


//Output message to DOM
function outputMessage(message){
    let d_mesg=decrypt(message.text);
    const div=document.createElement('div');
    var sameUser = ""
    if(message.username==user_data.username) sameUser = "hidden";
    div.classList.add('message');
    div.innerHTML=`<p class="meta">
                        ${message.username} &nbsp&nbsp<span>${message.time}</span>
                        <span class="options">
                            <img id="report" src="/css/report.png" alt="${d_mesg},${message.username},${user_data.room}"  ${sameUser}>
                        <span>
                    </p>
                    <p class="text">
                        ${d_mesg}
                    </p>`;
    document.querySelector(".chat-messages").appendChild(div);
}


//Announcement to users
function announceUser(message){
    const div=document.createElement('div');
    div.classList.add('message');
    div.innerHTML=`<p class="meta">${message.username} 
                        <span>${message.time}</span>
                    </p>
                    <p class="text">
                        <i>${message.text}</i>
                    </p>`;
    document.querySelector(".chat-messages").appendChild(div);
}


//Add roomname to DOM
function outputRoomName(room){
    roomName.innerText=room;
}

//Add users to DOM
function outputUsers(users){
    userList.innerHTML=
    `${users.map(user=>`<li>${user.username}</li>`).join('')}`;
}

//Generate Public/Private Key pair
function GeneratePair(){
    var key=new rsa().generateKeyPair(2048);
    var pub_key=key.exportKey("public");
    var priv_key=key.exportKey("private");
    ls.setItem("Private_Key",priv_key);
    return pub_key;
}

//Decrypt with private key
function priv_Decrypt(text){
    var data_ue=crypto.privateDecrypt(ls.getItem('Private_Key'),Buffer.from(text,'base64'));
    return data_ue.toString('utf8');
}

//Encrypt with public key
function pub_Encrypt(text,pub_key){
    var buffer = Buffer.from(text);
    var data_e=crypto.publicEncrypt(pub_key,buffer);
    return data_e.toString('base64'); 
}

//Encrypt the messages with aes-256-cbc encryption
function encrypt(text) {
    let key=String_to_Array(ls.getItem('key'));
    let iv=String_to_Array(ls.getItem('iv'));
    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return encrypted.toString('hex');
}

//Decrypt the aes-256-cbc encrypted messages
function decrypt(text) {
    let key=String_to_Array(ls.getItem('key'));
    let iv=String_to_Array(ls.getItem('iv'));
    let iv_d = Buffer.from(iv,toString('hex'), 'hex');
    let encryptedText = Buffer.from(text, 'hex');
    let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv_d);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

//generate thread key
function generate_thread_key(){
    let key = crypto.randomBytes(32);   
    let iv = crypto.randomBytes(16);
    ls.setItem('key',Array_to_String(key));
    ls.setItem('iv',Array_to_String(iv));
}

function Array_to_String(typedArray){
    const arr = Array.from ? Array.from(typedArray) : [].map.call(typedArray, (v => v));
    const str = JSON.stringify(arr);
    return str
}

function String_to_Array(data){
    const retrievedArr = JSON.parse(data);
    const retrievedTypedArray = new Uint8Array(retrievedArr);
    return retrievedTypedArray;
}
