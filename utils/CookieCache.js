// Returns an array of sorted keys from an associative array.
function sortedKeys(array) {
	var keys = [];
	for (var i in array) {
		keys.push(i);
	}
	keys.sort();
	return keys;
}
// Compares cookies for "key" (name, domain, etc.) equality, but not "value"
// equality.
function cookieMatch(c1, c2) {
	return (c1.name == c2.name) && (c1.domain == c2.domain) &&
		   (c1.hostOnly == c2.hostOnly) && (c1.path == c2.path) &&
		   (c1.secure == c2.secure) && (c1.httpOnly == c2.httpOnly) &&
		   (c1.session == c2.session) && (c1.storeId == c2.storeId);
}
export default function CookieCache() {
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
