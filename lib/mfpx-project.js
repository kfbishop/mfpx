//-----------------------------------------------------------------------------
//-- mfpx-project
//-----------------------------------------------------------------------------
var fs = require("fs"),
	path = require("path");

var details = {
	mfpVersion     : null,
	mfpProjectType : null,
	mfpxOverride   : null	
};

//-----------------------------------------------------------------------------
// Determine project type, and gather some details
var getProjectDetails = function() {
	if ( isMfpCordovaProject() ) {
		
	} else if( isMfpLegacyProject() ) {
		
	} 
	return details;
};

//-----------------------------------------------------------------------------
//-- Are we inside a cordova project?
var isMfpCordovaProject = function() {
	if ( !fs.existsSync("application-descriptor.xml") ) {
		console.error("Error: You do not appear to be at the top level of an MFP Cordova project");
		return false;
	} else {
		return true;
	}
}

//-----------------------------------------------------------------------------
//-- Are we inside a cordova project?
//-- File:  .settings/org.eclipse.core.resources.prefs :: wl_version=7.0.0.00.20150312-0731
var isMfpLegacyProject = function() {
	var stat = false;
	var verFile = path.join(".settings", "org.eclipse.core.resources.prefs");
	if ( fs.existsSync( verFile ) ) {
		var f = fs.readFileSync("org.eclipse.core.resources.prefs", "utf8").split("\n");
		f.forEach(function(line) {
			if( line.startsWith("wl_version") ) {
				details.version = line.replace(/^wl_version=([0-9]\.[0-9]\.[0-9]).*$/, "$1");
				stat = true;
			}
		});
	}
	return stat;
}

//-----------------------------------------------------------------------------
//-- Are we inside a cordova project?
var isMfpLegacyApp = function() {
	if ( !fs.existsSync("application-descriptor.xml") ) {
		console.error("Error: You do not appear to be at the top level of an MFP Cordova project");
		return false;
	} else {
		return true;
	}
}

//-----------------------------------------------------------------------------
exports.getProjectDetails   = getProjectDetails;
exports.isMfpCordovaProject = isMfpCordovaProject;

//-----------------------------------------------------------------------------
