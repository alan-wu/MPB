const queryString = require('query-string');

//This object parses the url fragments and return releavant json objects or stringify json object into fragments.
exports.FragmentParser = function() {
	
	const getFragments = hash => {
		let s = hash;
		if (s.charAt(0) === "#") {
			s = s.substr(1);
		}
		return s.split(";");
	}
		
	const getQueryJSON = fragment => {
		if (fragment && fragment !== "") {
			let objects = queryString.parse(fragment);
			for (let property in objects) {
				let value = objects[property];
				if (!Number.isNaN(Number(value))) {
					value = Number(value);
				} else if (value !== null && (value.toLowerCase() === 'true' || value.toLowerCase() === 'false')) {
					value = value.toLowerCase() === 'true';
				}
				objects[property] = value;
			}
			return objects;
			
		}
		return undefined;
	}
	
	
	this.parseString = string => {
		if (string !== "") {
			let settings = [];
			let fragments = getFragments(string);
			for (let i = 0; i < fragments.length; i++) {
				let queryJSON = getQueryJSON(fragments[i]);
				if (queryJSON)
					settings.push(queryJSON);
			}
			return settings;
		}
		return undefined;
	}
	
	this.parse = location => {
		const hash = location.hash;
		return this.parseString(hash);
	}
	
	this.stringify = settings => {
		let string = "";
		for (let i = 0; i < settings.length; i++) {
			if (settings[i] !== undefined) {
				const stringified = queryString.stringify(settings[i]);
				if (stringified) {
					if (string == "") {
						string = "#" + stringified;
					} else {
						string = string + ";" + stringified;
					}				
				} 
				
			}	
		}
		return string;
	}
}
