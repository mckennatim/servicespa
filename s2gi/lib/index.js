var http = require('http')
var conn = require('./mysqldb')
    // var passport = require('passport');
var env = require('../env.json')
var cfg = env[process.env.NODE_ENV || 'development']
var app = require('./cors');
var regtokau = require('./modules/regtokau/regtokau')();
var s2g = require('./modules/s2g/s2g')();
// var wss = require('./modules/wss/wss')();
var server = http.createServer(app);
var io = require('socket.io').listen(server);

app.use('/api/reg', regtokau);
app.use('/api/s2g', s2g);
// app.use('/api/wss', wss);

app.get('/api', function(req, res) {
    res.send("<h4>in s2gt server /api</h4>")
});

app.get('/', function(req, res) {
    res.send("<h4>in s2gi server /</h4>")
});

app.set('port', cfg.port.express || 3011);

io.on('connect', (socket) => {
    io.emit('message', 'connected io')
  
  
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
      io.in(message.lid).emit('message',message)
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

server.listen(app.get('port'), function() {
    console.log('s2g server listening on port ' + server.address().port);
})

// // module.exports = io;
// // var io = socketio.listen(server)
// var io = require('socket.io')(server)


// io.on('connection', (socket) => {
//     console.log('connected t0 socketio')
//     socket.on('room', (room)=>{
//         console.log('room', room)
//     })
// });

