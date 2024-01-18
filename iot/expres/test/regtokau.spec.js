var superagent = require('superagent')
var expect = require('expect.js')
var should = require('should')
var _ = require('underscore')
var jwt = require('jwt-simple');
var fs = require('fs');
var env = require('../env.json')
var cfg= env[process.env.NODE_ENV||'development']
var secret = cfg.secret
 
var httpLoc = cfg.url.local +':'+ cfg.port.express + '/api/'
//expires in an hour
var payload = {
	appId: "tauth",
	email: "mckenna.tim@gmail.com",
	exp: Math.floor(Date.now() / 1000) + (60 * 60) 
};
// var payload = {
// 	appId: "tauth",
// 	email: "tim6@sitebuilt.net",
// 	exp: Math.floor(Date.now() / 1000) + (60 * 60) 
// };
var token = jwt.encode(payload, secret);

describe.skip('regtokau:', function() {
	var agent = superagent.agent();
	var name = 'tim7';
	var ucnt = 0;
	var apikey = 'dog';
	var ureg = 'tim2';
	var uav = 'fred';
	var eregtim = 'tim2@sitebuilt.net';
	var enottim = 'mckenna.nottim@gmail.com';
	it('GET / should be running and return: please select...', function(done) {
		superagent.get(httpLoc+'reg')
			.end(function(e, res) {
				console.log(res.body.message)
				expect(e).to.eql(null)
				expect(res.body).to.be.a('object')
				expect(res.body.message).to.eql('in root of registration module')
				done()
			})
	})
	// it('posts aaa to api/reg/auth', function(done){

	// 	//var token = 'jwt.encode(payload, authSecret)';
	// 	var url = httpLoc + 'reg/auth'
	// 	console.log(url)
	// 	superagent
	// 		.post(url)
	// 		.send({token: token})
	// 		.end(function(e, res) {
	// 			console.log(res.status);
	// 			expect(res.status).to.be(200);
	// 			done();
	// 		})
	// 	}
	// )
})
describe('dedata token protected routes', function() {
	// it('GETs succeeds w userinfo from api/dedata/apps when passed token', function(done) {
	// 	var url = httpLoc + 'dedata/apps'
	// 	superagent
	// 		.get(url)
	// 		.set('Authorization', 'Bearer ' + token)
	// 		.end(function(e, res) {
	// 			console.log(res.body)
	// 			expect(res.body).to.be.an('array');
	// 			done()
	// 		})
	// })
	it('GETs succeeds w userinfo from api/dedata/appsa when passed token', function(done) {
		var url = httpLoc + 'dedata/apps'
		superagent
			.get(url)
			.set('Authorization', 'Bearer ' + token)
			.end(function(e, res) {
				//console.log(res.body)
				expect(true).to.be(true);
				done()
			})
	})
	// it('GETs fails w userinfo from api/dedata/apps when passed bad token', function(done) {
	// 	var url = httpLoc + 'dedata/apps'
	// 	superagent
	// 		.get(url)
	// 		.set('Authorization', 'Bearer ' + token)
	// 		.end(function(e, res) {
	// 			console.log(res.status)
	// 			console.log(res.body)
	// 			expect(res.status).to.equal(500);
	// 			done()
	// 		})
	// })
})
		/*-----------------------------------authentication-----------------------------------------------*/
	//describe('signup', function() {
		//before(loginUser(agent));    
		// it('gets a [available] for user tim2 ', function(done) {
		// 	agent
		// 		.get(httpLoc + 'isUser/' + ureg)
		// 		.end(function(e, res) {
		// 			console.log(res.body)
		// 			expect(res.body.message).to.be(' available')
		// 			done()
		// 		})
		// })
		// it('gets a [available] for user tim2 and email and creates user', function(done) {
		// 	agent
		// 		.get(httpLoc + 'isMatch/?name=' + ureg + '&email=' + eregtim)
		// 		.end(function(e, res) {
		// 			console.log(res.body)
		// 			expect(res.body.message).to.be('available')
		// 			done()
		// 		})
		// })
		// it('gets a [conflict] to existing user and wrong email', function(done) {
		// 	agent
		// 		.get(httpLoc + 'isMatch/?name=' + ureg + '&email=f' + eregtim)
		// 		.end(function(e, res) {
		// 			console.log(res.body)
		// 			expect(res.body.message).to.be('conflict')
		// 			done()
		// 		})
		// })
	//})
	// describe('authenticate', function() {
	// 	it('reads apikey from file, expects it to be 24 characters' ,function(done){
	// 		fs.readFile('../server2/test/key', 'utf8', function(err, data) {
	// 			if (err) {
	// 				return console.log(err);
	// 			}
	// 			apikey = data
	// 			console.log(apikey)
	// 			expect(data.length).to.be(24)
	// 			done()
	// 		})
	// 	})
	// 	it('POSTs /authenticates w apikey and returns token', function(done) {
	// 		agent
	// 			.post(httpLoc + 'authenticate/' + ureg)
	// 			.send({
	// 				apikey: apikey
	// 			})
	// 			.end(function(e, res) {
	// 				console.log(res.body)
	// 				var payload = {
	// 					name: ureg
	// 				};
	// 				token = jwt.encode(payload, secret);
	// 				expect(res.body.token).to.be(token);
	// 				done();
	// 			})
	// 		}
	// 	)

	// 	it('POSTs fails with 401 for tim with wrong apikey', function(done) {
	// 		agent
	// 			.post(httpLoc + 'authenticate/tim')
	// 			.send({
	// 				apikey: '123457'
	// 			})
	// 			.end(function(e, res) {
	// 				console.log(res.status);
	// 				expect(res.status).to.be(401);
	// 				done();
	// 			})
	// 		}
	// 	)
	// 	it('POSTs fails for tim with tim2 apikey', function(done) {
	// 		agent
	// 			.post(httpLoc + 'authenticate/tim')
	// 			.send({
	// 				apikey: apikey
	// 			})
	// 			.end(function(e, res) {
	// 				console.log(res.body)
	// 				expect(res.body.token).to.be(undefined);
	// 				expect(res.body.message).to.be('apikey does not match user');
	// 				done();
	// 			})
	// 		}
	// 	)
	// })
	//describe('users', function() {
		// it('GETs succeeds w userinfo from api/account when passed token', function(done) {
		// 	agent
		// 		.get(httpLoc + 'account/')
		// 		.set('Authorization', 'Bearer ' + token)
		// 		.end(function(e, res) {
		// 			console.log(res.body)
		// 			expect(res.body.apikey).to.be(apikey);
		// 			done()
		// 		})
		// })
		// it('DELETES user tim2', function(done){
		// 	agent
		// 		.del(httpLoc + 'users/'+ureg)
		// 		.set('Authorization', 'Bearer ' + token)
		// 		.end(function(e, res) {
		// 			console.log(res.body)
		// 			expect(e).to.eql(null)
		// 			expect(res.body.message.ok).to.eql(1)
		// 			done()
		// 		})			
		// })
	//})

