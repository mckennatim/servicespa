//var moment = require('moment');
var env = require('../../env.json')
var cfg= env[process.env.NODE_ENV||'development']
var mysql = require('mysql');
var mconn = cfg.mysql;
const conn = mysql.createConnection(mconn);

const req={body:{job:' Gore St Garden - MHHM '.trim()}, userTok:{coid:'RRCLLC'}}
const res ={
  jsonp: (a)=>{
    console.log('a.job: ', a.job)
  }
}

console.log('req: ', req)

var q = conn.query( 'SELECT id,job,categories,hrs,labor,archived,`default`,defcat FROM jobs WHERE coid=? AND job=?;' , [req.userTok.coid, req.body.job], function(error, results) {
  console.log(q.sql)
  console.log('results[0]: ', results[0])
  res.jsonp({ job: results[0], binfo: req.userTok })
})



