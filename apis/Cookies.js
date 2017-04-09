const EventEmitter = require('events');

class MyEmitter extends EventEmitter {}

export  const emitter = new MyEmitter();

function notifyChange(){
	emitter.emit('change');
}

import CookieCache from '../utils/CookieCache';

if (!chrome.cookies) {
	chrome.cookies = chrome.experimental.cookies;
}

// A simple Timer class.
function Timer() {
	this.start_ = new Date();

	this.elapsed = function() {
		return (new Date()) - this.start_;
	}

	this.reset = function() {
		this.start_ = new Date();
	}
}

export const cache = new CookieCache();

function removeAll() {
	var all_cookies = [];
	cache.getDomains().forEach(function(domain) {
		cache.getCookies(domain).forEach(function(cookie) {
			all_cookies.push(cookie);
		});
	});
	cache.reset();
	var count = all_cookies.length;
	var timer = new Timer();
	for (var i = 0; i < count; i++) {
		removeCookie(all_cookies[i]);
	}
	timer.reset();
	chrome.cookies.getAll({}, function(cookies) {
		for (var i in cookies) {
			cache.add(cookies[i]);
			removeCookie(cookies[i]);
		}
	});
}

export function removeCookie(cookie, cb) {
	var url = "http" + (cookie.secure ? "s" : "") + "://" + cookie.domain +
			  cookie.path;
	chrome.cookies.remove({"url": url, "name": cookie.name}, function(a, b, c){
		cb && cb(a,b,c);
		console.log('after remove', a,b,c);
		notifyChange();
	});
}

function removeCookiesForDomain(domain) {
	var timer = new Timer();
	cache.getCookies(domain).forEach(function(cookie) {
		removeCookie(cookie);
	});
}

export function setCookie(domain, cookie, cb){
	let {
		name,
		value,
		path,
		secure,
		httpOnly,
		sameSite,
		expirationDate
	} = cookie;
	var url = "http" + (cookie.secure ? "s" : "") + "://" + domain +
			  cookie.path;
	let newCookie = {
		url,
		name,
		value,
		path,
		secure,
		httpOnly,
		sameSite,
		expirationDate:expirationDate*1000
	}
	chrome.cookies.set(newCookie, cb);
}


function listener(info) {
	console.log('cookie changed', info);
	cache.remove(info.cookie);
	if (!info.removed) {
		cache.add(info.cookie);
	}
	notifyChange();
}

function startListening() {
	chrome.cookies.onChanged.addListener(listener);
}

function stopListening() {
	chrome.cookies.onChanged.removeListener(listener);
}

export function init() {
	var timer = new Timer();
	chrome.cookies.getAll({}, function(cookies) {
		startListening();
		var start = new Date();
		for (var i in cookies) {
			cache.add(cookies[i]);
		}
		timer.reset();
		notifyChange();
	});
}
