//-----------------------------------------------------------------------
//-- mfpx-util
//-----------------------------------------------------------------------
var	mfpConfig   = require("./mfpx-config");

//-----------------------------------------------------------------------
module.exports = {
	
	//-----------------------------------------------------------------------
	// Is cmd in path?
	inPath : function ( cmd ) {
		var path       = require('path'),
			fs         = require('fs');
	
		//console.log("Running test for: ", cmd);	
		//-- Try walking path
		//console.time("path");
		var valid = false;
		process.env.PATH.split(path.delimiter).some( function(p) {
			var full = path.join(p, cmd);
			//console.log("testing: ", full);
			if ( fs.existsSync(full) ) {
				//console.log("Found:", full);
				try {
					fs.accessSync( full, fs.X_OK );
					//console.log("Found and executable: ", full);
					return true;
				} catch(e) {
					//-- not executable
					//console.error("Err: ", e, full);
				}
			}
		});
		console.log("CMD in path = ", valid);
		//console.timeEnd("path");
		return false;
	}
};

//-----------------------------------------------------------------------
