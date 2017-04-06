const EventEmitter = require('events');

class MyEmitter extends EventEmitter {}

export  const emitter = new MyEmitter();

function notifyChange(){
	emitter.emit('change');
}

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

// Compares cookies for "key" (name, domain, etc.) equality, but not "value"
// equality.
function cookieMatch(c1, c2) {
	return (c1.name == c2.name) && (c1.domain == c2.domain) &&
		   (c1.hostOnly == c2.hostOnly) && (c1.path == c2.path) &&
		   (c1.secure == c2.secure) && (c1.httpOnly == c2.httpOnly) &&
		   (c1.session == c2.session) && (c1.storeId == c2.storeId);
}

// Returns an array of sorted keys from an associative array.
function sortedKeys(array) {
	var keys = [];
	for (var i in array) {
		keys.push(i);
	}
	keys.sort();
	return keys;
}

// Shorthand for document.querySelector.
function select(selector) {
	return document.querySelector(selector);
}

// An object used for caching data about the browser's cookies, which we update
// as notifications come in.
function CookieCache() {
	this.cookies_ = {};

	this.reset = function() {
		this.cookies_ = {};
	}

	this.add = function(cookie) {
		var domain = cookie.domain;
		if (!this.cookies_[domain]) {
			this.cookies_[domain] = [];
		}
		this.cookies_[domain].push(cookie);
	};

	this.remove = function(cookie) {
		var domain = cookie.domain;
		if (this.cookies_[domain]) {
			var i = 0;
			while (i < this.cookies_[domain].length) {
				if (cookieMatch(this.cookies_[domain][i], cookie)) {
					this.cookies_[domain].splice(i, 1);
				} else {
					i++;
				}
			}
			if (this.cookies_[domain].length == 0) {
				delete this.cookies_[domain];
			}
		}
	};

	// Returns a sorted list of cookie domains that match |filter|. If |filter| is
	//  null, returns all domains.
	this.getDomains = function(filter) {
		var result = [];
		sortedKeys(this.cookies_).forEach(function(domain) {
			if (!filter || domain.indexOf(filter) != -1) {
				result.push(domain);
			}
		});
		return result;
	}

	this.getCookies = function(domain) {
		return this.cookies_[domain];
	};
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
//		notifyChange();
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
//	setTimeout(notifyChange, 100);
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
