//var moment = require('moment');
var env = require('../../env.json')
var cfg= env[process.env.NODE_ENV||'development']
var mysql = require('mysql');
var mconn = cfg.mysql;
const conn = mysql.createConnection(mconn);

const req={
  body:{
    job: "12 Parley Vale phase 2", 
    categories: '[{"cat":"maintain","hrs":"", "labor$":"", "def":1},{"cat":"front_yard","hrs":"", "labor$":"", "def":1}]', 
    hrs: null, 
    labor: null, 
    default:1,
    defcat:1
  },
    userTok:{
      coid:'reroo'
    }
  }

  req.body.coid=req.userTok.coid

  console.log('req.body: ', req.body)

const res ={
  jsonp: (a)=>{
    console.log('a.job: ', a.job)
  }
}

console.log('req: ', req)

var q = conn.query( 'INSERT INTO jobs SET ? ON DUPLICATE KEY UPDATE ?' , [req.body, req.body], function(error, results) {
  console.log(q.sql)
  console.log('results: ', results)
  res.jsonp({ job: results, binfo: req.userTok })
})



