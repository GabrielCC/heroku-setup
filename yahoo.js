// trebe schimbat userul,
// parola si numele friendului

var yahoo_user = {
	username : 'gabriel_croitoru11',
	password : 'passwordpassword',
	friend   : 'defilerk2000',
	requestToken : false,
	request_params : false
	};
var presence = '{ }';
var yahoo_key = 'dj0yJmk9d2ozTWlnQXJINzVGJmQ9WVdrOVltTmlaMWhrTm1jbWNHbzlNVGczT1RrMk1nLS0mcz1jb25zdW1lcnNlY3JldCZ4PTJh';
var yahoo_secret = '9f764cb3500e0c80c5d2ca71b0319658e8c3a326'; 

var captchadata = false;
var captchaword = false;

var yahoo_api = {
	login :'https://login.yahoo.com/WSLogin/V1/get_auth_token?&login=' + yahoo_user.username + '&passwd=' + yahoo_user.password + '&oauth_consumer_key=' + yahoo_key +'/',
	login_captcha : 'https://login.yahoo.com/WSLogin/V1/get_auth_token?&login=' + yahoo_user.username + '&passwd=' + yahoo_user.password + '&oauth_consumer_key=' + yahoo_key +'&captchadata=' + captchadata + '&captchaword=' + captchaword,
	server : 'http://developer.mesclsenger.yahooapis.com/',
	contacts : 'v1/session?fieldsBuddyList=%2Bgroups', 
	presence : 'v1/presence?sid='
}
if(captchaword) {
	yahoo_api.login = yahoo_api.login_captcha;
}

var hash = require('hashlib');
var querystring = require('querystring');
var rest = require('restler');
function randomString(time) {
	var str = time  + Math.floor(Math.random()*1000);
	return hash.md5(str).substr(0, 13);
}
var time = new Date().getTime() / 1000;
time = Math.floor(time);
var oauth_nonce_value = randomString(time);
function oauthCredentials() {
	var url = 'https://api.login.yahoo.com/oauth/v2/get_token';
	url += '?oauth_consumer_key=' + querystring.escape(yahoo_key);
	url += '&oauth_nonce=' + querystring.escape(oauth_nonce_value);
	url += '&oauth_signature=' + querystring.escape(yahoo_secret + '&');
	url += '&oauth_signature_method=PLAINTEXT';
	url += '&oauth_timestamp=' + time;
	url += '&oauth_token=' + (yahoo_user.requestToken);
	url += '&oauth_version=1.0';
	//console.log(yahoo_user.requestToken);
	rest.get(url).on('complete',function(data){
		signIn(data);
	}).on('error', errorCallback);
}

function sendPm(data) {
	var params = eval(data);
	var session_id = params['sessionId'];
	var url = 'http://developer.messenger.yahooapis.com/v1/message/yahoo/' + yahoo_user.friend + '?sid=' + session_id;
	var time = Math.floor(new Date().getTime()/1000)
	var oauth_signature = yahoo_secret + '%26' + yahoo_user.request_params['oauth_token_secret'];
	var oauth_token = yahoo_user.request_params['oauth_token'];
	url += '&oauth_consumer_key='+ yahoo_key;		
	url += '&realm=yahooapis.com'
	url += '&oauth_nonce='+ randomString(time);
	url += '&oauth_signature=' + oauth_signature;
	url += '&oauth_signature_method=PLAINTEXT';
	url += '&oauth_timestamp=' + time;
	url += '&oauth_token=' + querystring.escape(oauth_token);
	url += '&oauth_version=1.0';	
	url += '&notifyServerToken=1';
	var header = { 'Content-Type' :'application/json', 'charset' : 'utf-8' };
	console.log(url);
	error_flag = false;
	var smessage = '{"message" : "Hello from nodejs land"}';
	rest.post(url , {headers: header, data : smessage}).on('complete', function(data) {
		if(!error_flag) { 
			console.log(data);
		}
	}).on('error', errorCallback);
	
}

function errorCallback(data) {
	console.log('Error date');	
	error_flag = true;
	var error_data = querystring.parse(data, '\n', '=');
	if(error_data['CaptchaUrl']) {
		console.log(error_data['ErrorDescription']);
		captchadata = error_data['CaptchaData'];
		console.log(error_data['CaptchaUrl']);
		readCaptchaWord();	
	} else {
		console.log(data);
	}
}
var error_flag = false;
function signIn(data) {
	yahoo_user.request_params = querystring.parse(data, '&', '=');
	console.log(yahoo_user.request_params);
	var time = Math.floor(new Date().getTime()/1000)
	var oauth_signature = yahoo_secret + '%26' + yahoo_user.request_params['oauth_token_secret'];
	var oauth_token = yahoo_user.request_params['oauth_token'];
	var url = 'http://developer.messenger.yahooapis.com/v1/session';
	url += '?oauth_consumer_key='+ yahoo_key;		
	url += '&realm=yahooapis.com'
	url += '&oauth_nonce='+ randomString(time);
	url += '&oauth_signature=' + oauth_signature;
	url += '&oauth_signature_method=PLAINTEXT';
	url += '&oauth_timestamp=' + time;
	url += '&oauth_token=' + querystring.escape(oauth_token);
	url += '&oauth_version=1.0';	
	url += '&notifyServerToken=1';
	var header = { 'Content-Type' :'application/json', 'charset' : 'utf-8' };
	console.log(url);
	error_flag = false;
	rest.post(url , {headers: header, data : presence}).on('complete', function(data) {
		if(!error_flag) { 
			sendPm(data);
		}
	}).on('error', errorCallback);
}

rest.get(yahoo_api.login).on('complete', function(data) {
	if(!error_flag) {
		yahoo_user.requestToken = data.replace('RequestToken=', '').replace('\n','');
		oauthCredentials();
	}
    }).on('error', errorCallback);

var stdin = process.openStdin()
  , stdio = process.binding("stdio");

function sendCaptcha() {
var login_captcha = 'https://login.yahoo.com/WSLogin/V1/get_auth_token?&login=' + yahoo_user.username + '&passwd=' + yahoo_user.password + '&oauth_consumer_key=' + yahoo_key +'&captchadata=' + captchadata + '&captchaword=' + captchaword;
error_flag = false;
console.log(login_captcha);
    rest.get(login_captcha).on('complete', function(data) {
	if(!error_flag) {
		yahoo_user.requestToken = data.replace('RequestToken=', '').replace('\n','');
		//console.log(yahoo_user.requestToken);
		oauthCredentials();
	}
    }).on('error', errorCallback);      	
}

function readCaptchaWord() {
	captchaword = '';
	stdin.on('keypress', function (chunk, key) {
		if(!captchaword) { captchaword = chunk; }
		else captchaword += chunk;
		if (chunk == '\n') {
			stdin.removeAllListeners('keypress')
			sendCaptcha();
			return;
		}
	});
}
