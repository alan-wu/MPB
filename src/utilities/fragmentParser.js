//Try parsing this #dialog=Flatmaps&name=body&dataUrl=static/body;dialog=OrgansViewer&species=human&system=Cardiovascular&part=Heart;dialog=DataViewer&url=myURL

const queryString = require('query-string');

exports.FragmentParser = function() {
	
	const getFragments = hash => {
		let s = hash;
		if (s.charAt(0) === "#") {
			s = s.substr(1);
		}
		return s.split(";");
	}
		
	const getQueryJSON = fragment => {
		if (fragment && fragment !== "")
			return queryString.parse(fragment);
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
