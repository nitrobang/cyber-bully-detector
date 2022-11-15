var {PythonShell} = require('python-shell');

const users=[];
var room_count=[0,0,0];

//join user to chat
function userJoin(id,username,room,pub_key){
    const user={
        id:id,
        username:username,
        room:room,
        pub_key:pub_key,
        warning:0
    };
    let room_n= get_room_number(room);
    room_count[room_n]+=1;
    users.push(user);
    return user;
}

//get current user
function getCurrentUser(id){
    return users.find(user=>user.id===id)
}

//users leave
function userLeave(id){
    const index=users.findIndex(user=>user.id===id);
    if(index!=-1){
        let room_n=get_room_number(users[index].room);
        room_count[room_n]-=1;
        return users.splice(index,1)[0];
    }
}

//get room users
function getRoomUsers(room){
    return users.filter(user=>user.room===room);
}

//is room empty
function need_key(room){
    let room_n=get_room_number(room);
    if(room_count[room_n]==1) return true;
    else return false;
}

// class name to number
function get_room_number(room){
    if(room=='class1') return 0;
    else if(room=='class2') return 1;
    else return 2;
}

// send socket id
function get_socket_id(room){
    const index=users.findIndex(user=> (user.room===room));
    return users[index].id;
}


async function warning(data){
    const username = data.username;
    const room = data.room;
    const message =  data.message;       
    const index= await users.findIndex(user=> user.room===room && user.username===username);
    PythonShell.run('utils/bullyDetector.py', {args:message}, function (err, results) {
        if (err) throw err;
        if(results[0] == 1){
            console.log("Offensive")
            var t = users[index].warning
            users[index].warning = ++t ;
            return users[index]
        }else{
            console.log("Non Offensive")
            return NaN
        }

    });      
}



module.exports={
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers,
    get_socket_id,
    need_key,
    users,
}

