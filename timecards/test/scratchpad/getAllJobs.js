//var moment = require('moment');
var env = require('../../env.json')
var cfg= env[process.env.NODE_ENV||'development']
var mysql = require('mysql');
var mconn = cfg.mysql;
const conn = mysql.createConnection(mconn);


const str = '[{"cat":"general","hrs":"", "labor$":"", "def":1},{"cat":"admin","hrs":"", "labor$":"", "def":1},{"cat":"PTO","hrs":"", "labor$":"", "def":1}]'

const arr = JSON.parse(str)
console.log('arr: ', arr)
const req={userTok:{coid:'RRCLLC'}}

var q = conn.query( 'SELECT id,job,categories,`default`,defcat FROM jobs WHERE coid=? AND archived=0 ORDER BY job;' , [req.userTok.coid], function(error, results) {
  // console.log('error: ', error)
  console.log(q.sql)
  const djobs = results.reduce((acc,r)=>{
    const catarr = JSON.parse(r.categories)
    if (catarr.length==0){
      const rec = {id:r.id, job:r.job, category:'', default:r.default}
      acc.push(rec)
    }
    if(catarr.length>0){
      catarr.map((c,i)=>{
        if(c.def){
          acc.push({id:r.id, job:r.job, category:c.cat, default:c.def})
        }
      })
    }
    return acc
  },[])
  console.log('djobs: ', djobs)
})



