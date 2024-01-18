var express = require('express');
var moment = require('moment-timezone');
var combinePuJc = require('../../utilities').combinePuJc
var cons = require('tracer').console();
var conn = require('../../db/mysqldb')
var bearerTokenCoid = require('../regtokau/strategy').bearerTokenCoid

var router = express.Router();

function addAppId(req,res,next){
    req.appid = 'tcard'
    next()
  }

module.exports = function() {
    router.get('/', function(req, res) {
        res.jsonp({ message: "in root of tcard module" })
    });
    router.get('/settings', addAppId, bearerTokenCoid, function(req, res) {
        if (!req.userTok.auth) {
            var mess = { message: 'in get /tcard/settings (not authorized)-' + req.userTok.message }
            cons.log(mess)
            res.jsonp(mess)
        } else {
            var query = conn.query('SELECT * FROM `timecards`.`cosr` WHERE effective <= CURDATE() AND coid =? ORDER BY effective DESC LIMIT 1 ', req.userTok.coid, function(error, settings) {
                cons.log(query.sql)
                cons.log(error)
                res.jsonp(settings)
            })

        }
    })    
    router.get('/test/:wk', function(req, res) {
        const emailid = "tim@sitebuilt.net"
        const wk = req.params.wk
        const yr = moment().format('YYYY')
        const wdprt = `${yr}-W${wk.toString().padStart(2,'0')}%`
        cons.log(wdprt)
        var query = conn.query('SELECT * FROM tcardpu WHERE emailid = ? AND wdprt LIKE(?)', [emailid, wdprt], function(error, punch) {
            cons.log(query.sql)
            cons.log(error)
            var query2 = conn.query('SELECT * FROM tcardjc WHERE emailid = ? AND wdprt LIKE(?)', [emailid, wdprt], function(error2, jcost) {
                cons.log(query2.sql)
                cons.log(error2)
                cons.log(jcost)
                cons.log(punch)
                res.jsonp({ punch: punch, jcost: jcost })
            })
        })
    });
    router.put('/update', addAppId, bearerTokenCoid, function(req, res) {
        if (!req.userTok.auth) {
            var mess = { message: 'in get /tcard/update (not authorized)-' + req.userTok.message }
            cons.log(mess)
            res.jsonp(mess)
        } else {
            cons.log(req.body)
            const { wdprt, hrs, inout, jcost } = req.body.tday
            const pdata = { wdprt: wdprt, emailid: req.userTok.emailid, inout: JSON.stringify(inout), hrs: hrs, coid: req.userTok.coid }
            var query0 = conn.query('INSERT INTO tcardpu SET ? ON DUPLICATE KEY UPDATE ?', [pdata, pdata], function(error, results) {
                cons.log(query0.sql)
                cons.log(error)
                cons.log(results)
                let jcdata = { wdprt: wdprt, emailid: req.userTok.emailid, coid: req.userTok.coid }
                var query1 = conn.query('DELETE FROM tcardjc WHERE wdprt=? AND emailid=? AND coid=? ', [wdprt, req.userTok.emailid, req.userTok.coid], function(error) {
                    cons.log(query1.sql)
                    cons.log(error)
                    jcost.map((jc) => {
                        jcdata.job = jc.job
                        jcdata.cat = jc.cat
                        jcdata.hrs = jc.hrs
                        var query2 = conn.query('INSERT INTO tcardjc SET ? ', jcdata, function(error, results) {
                            cons.log(query2.sql)
                            cons.log(error)
                            cons.log(results)
                        })
                    })
                    res.jsonp(req.body)
                })
            })
        }
    })
    router.put('/updjc', addAppId, bearerTokenCoid, function(req, res) {
        if (!req.userTok.auth) {
            var mess = { message: 'in get /tcard/updjc (not authorized)-' + req.userTok.message }
            cons.log(mess)
            res.jsonp(mess)
        } else {
            cons.log(req.body)
            let emailid = req.userTok.emailid
            if(req.body.tday.emailid){
                emailid=req.body.tday.emailid
            }
            const { wdprt, jcost } = req.body.tday
            let jcdata = { wdprt: wdprt, emailid: emailid, coid: req.userTok.coid }
            var query = conn.query('DELETE FROM tcardjc WHERE wdprt=? AND emailid=? AND coid=? ', [wdprt, emailid, req.userTok.coid], function(error) {
                cons.log(query.sql)
                cons.log(error)
                jcost.map((jc) => {
                    jcdata.job = jc.job
                    jcdata.cat = jc.cat
                    jcdata.hrs = jc.hrs
                    var query2 = conn.query('INSERT INTO tcardjc SET ? ', jcdata, function(error, results) {
                        cons.log(query2.sql)
                        cons.log(error)
                        cons.log(results)
                    })
                })
                res.jsonp({ message: 'updated tcardjc data' })
            })
        }
    })
    router.put('/updpu', addAppId, bearerTokenCoid, function(req, res) {
        if (!req.userTok.auth) {
            var mess = { message: 'in get /tcard/updpu (not authorized)-' + req.userTok.message }
            cons.log(mess)
            res.jsonp(mess)
        } else {
            cons.log(req.body)
            let emailid = req.userTok.emailid
            if(req.body.tday.emailid){
                emailid=req.body.tday.emailid
            }            
            const { wdprt, hrs, inout } = req.body.tday
            const pdata = { wdprt: wdprt, emailid: emailid, inout: JSON.stringify(inout), hrs: hrs, coid: req.userTok.coid }
            var query = conn.query('INSERT INTO tcardpu SET ? ON DUPLICATE KEY UPDATE ?', [pdata, pdata], function(error, results) {
                cons.log(query.sql)
                cons.log(error)
                cons.log(results)
                res.jsonp(req.body)
            })
        }
    })
    router.put('/updstat', addAppId, bearerTokenCoid, function(req, res) {
        if (!req.userTok.auth) {
            var mess = { message: 'in get /tcard/updstat (not authorized)-' + req.userTok.message }
            cons.log(mess)
            res.jsonp(mess)
        } else {
            const pdata = req.body.wkstat
            let emailid = req.userTok.emailid
            if(req.body.wkstat.emailid){
                emailid=req.body.wkstat.emailid
            }
            pdata.emailid = emailid
            pdata.coid = req.userTok.coid

            var query = conn.query('INSERT INTO tcardwk SET ? ON DUPLICATE KEY UPDATE ?', [pdata, pdata], function(error, results) {
                cons.log(query.sql)
                cons.log(error)
                cons.log(results)
                res.jsonp(pdata)
            })
        }
    })
    router.get('/wstat/:wk', addAppId, bearerTokenCoid, function(req, res) {
        if (!req.userTok.auth) {
            var mess = { message: 'in get /tcard/wstat/:wk (not authorized)-' + req.userTok.message }
            cons.log(mess)
            res.jsonp(mess)
        } else {
            const wk = req.params.wk
            const yr = moment().format('YYYY')
            const wprt = `${yr}-W${wk.toString().padStart(2,'0')}`
            var query = conn.query('SELECT `wprt`, `status`, `hrs` FROM tcardwk WHERE emailid = ? AND coid = ? AND wprt =?', [req.userTok.emailid, req.userTok.coid, wprt], function(error, wstat) {
                cons.log(query.sql)
                cons.log(error)
                res.jsonp(wstat)
            })

        }
    })
    router.get('/week/:yr/:wk', addAppId, bearerTokenCoid, function(req, res) {
        if (!req.userTok.auth) {
            var mess = { message: 'in get /tcard/week/:yr/:wk (not authorized)-' + req.userTok.message }
            cons.log(mess)
            res.jsonp(mess)
        } else {
            const wk = req.params.wk
            const yr = req.params.yr
            const wprt = `${yr}-W${wk.toString().padStart(2,'0')}`
            const wdprt = `${wprt}%`
            var query0 = conn.query('SELECT `wprt`, `emailid`, `status`, `hrs` FROM tcardwk WHERE emailid = ? AND coid = ? AND wprt =?', [req.userTok.emailid, req.userTok.coid, wprt], function(error0, wstat) {
                cons.log(query0.sql)
                cons.log(error0)
                cons.log(wstat)
                cons.log(wdprt)
                var query = conn.query('SELECT `wdprt`, `inout`, `hrs` FROM tcardpu WHERE emailid = ? AND coid = ? AND wdprt LIKE(?)', [req.userTok.emailid, req.userTok.coid, wdprt], function(error1, punch) {
                    cons.log(query.sql)
                    cons.log(error1)
                    var query2 = conn.query('SELECT `wdprt`, `job`, `cat`, `hrs` FROM tcardjc WHERE emailid = ? AND coid = ? AND wdprt LIKE(?)', [req.userTok.emailid, req.userTok.coid, wdprt], function(error2, jcost) {
                        cons.log(query2.sql)
                        cons.log(error2)
                        cons.log(jcost)
                        cons.log(punch)
                        var q = conn.query('SELECT `job`, `category` FROM jobcatact WHERE `year`=? AND week=? AND coid=? ORDER BY job, category', [req.params.yr, req.params.wk*1, req.userTok.coid], function(error3, jobs) {
                            cons.log(q.sql)
                            cons.log(jobs)
                            cons.log(error3)
                            const wkarr = combinePuJc(punch, jcost, yr, wk, req.userTok.emailid)
                            let tjobs = jobs
                            if(jobs.length ==0){
                                var q5 = conn.query('SELECT `job`, `category` FROM jobcatact WHERE `active`=1 AND week=0 AND coid=? ORDER BY idx, category', [req.userTok.coid], function(error3, djobs) {
                                    cons.log(q5.sql)
                                    cons.log(djobs)
                                    tjobs = djobs
                                    res.jsonp({ wk: wk, wkarr: wkarr, jobs: tjobs, wstat: wstat[0] })
                                })
                            } else{
                                res.jsonp({ wk: wk, wkarr: wkarr, jobs: tjobs, wstat: wstat[0]})
                            }
                        })
                    })
                })
            })
        }
    });
    router.delete('/del', addAppId, bearerTokenCoid, function(req, res) {
        if (!req.userTok.auth) {
            var mess = { message: 'in get /tcard/delete (not authorized)-' + req.userTok.message }
            cons.log(mess)
            res.jsonp(mess)
        } else {
            mess = { message: 'nothing happenning yet-' }
                // const week = req.params.wk * 1
            cons.log(req.body)
            let emailid = req.userTok.emailid
            if(req.body.tday.emailid){
                emailid=req.body.tday.emailid
            }       
            const wdprt = req.body.tday.wdprt
            var query1 = conn.query('DELETE FROM tcardpu WHERE wdprt=? AND emailid=? AND coid=?', [wdprt, emailid, req.userTok.coid], function(error, results) {
                cons.log(query1.sql)
                cons.log(error)
                cons.log(results)
                res.jsonp(results)
            })
        }
    })
    return router
}
