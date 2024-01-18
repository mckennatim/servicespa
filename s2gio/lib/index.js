var app = require('./cors');
const server = require('https').Server(app);
const io = require('socket.io')(server,{  secure: true,
  rejectUnauthorized: false, path: '/s2gio/socket.io'});
var env = require('../env.json')
var cfg= env[process.env.NODE_ENV||'development']
var conn = require('../mysqldb')

io.of('/s2gio')

io.on('connect', (socket) => {
  io.emit('message', '/s2gio/connected io')


  socket.on('switch2room', (room)=>{
    console.log('swwwwww')
    console.log('switch2room: ', room)
    socket.leaveAll()
    socket.join(room, ()=>{
      console.log('subscribe ', socket.rooms);  
      io.in(room).emit('message', `inside ${room} party people?`)   
    })
  })

  socket.on('message', (message)=>{
    console.log('message: ', message)
    io.in('/s2gio/'+message.lid).emit('message',message)
    if(message.done==-1){
      const qry=conn.query('DELETE FROM items WHERE lid=? AND product=?',[message.lid,message.product],()=>{
        console.log('qry.sql: ', qry.sql)
      })
    }else{
      const qry = conn.query('INSERT INTO items SET ? ON DUPLICATE KEY UPDATE ?', [message,message], (error,results)=>{
        console.log('qry.sql: ', qry.sql)
      })
    }
  })
});

server.listen(cfg.port.socket);
console.log('wss listening on '+cfg.port.socket);


// socket.on('unsubscribe', (room)=>{
//   console.log('leaving room: ', room)
//   socket.emit('message', 'you unsubscribing from ', room)
//   console.log('Object.keys(socket.rooms): ', Object.keys(socket.rooms))
//   socket.leave(room, ()=>{
//     let rooms = Object.keys(socket.rooms);
//     console.log('unsuscribe ',socket.rooms); 
//   })

// socket.on('unsubscribeAll', ()=>{
//   var rooms = io.sockets.adapter.sids[socket.id]; 
//   for(var room in rooms) { socket.leave(room); }
// })  
  
// })
// socket.on('subscribe', (room)=>{
//   console.log('subs room: ', room)
//   socket.join(room, ()=>{
//     console.log('subscribe ', socket.rooms);  
//     io.in(room).emit('message', `inside ${room} party people?`)   
//   })
// })