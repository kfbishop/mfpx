//-----------------------------------------------------------------------
//-- mfpx-set
//-----------------------------------------------------------------------
var	mfpConfig   = require("./mfpx-config"),
	server      = require("./mfpx-server"),
	mfpRun      = require("./mfpx-run"),
	fs          = require("fs"),
	path        = require("path"),
	rimraf      = require('rimraf');

//-----------------------------------------------------------------------
exports.set = function( args ) {
	var ver         = args[0],
	    mfpDir      = "",
	    mfpVerDir   = "",
		mfpInstance = null,
		versions    = mfpConfig.get("mfp_versions"),
		appHome     = mfpConfig.get("app_home");

	if ( !ver ) {
		console.log("Syntax: mfpx set <newVersion>");
		console.log("Where : newVersion matches an entry in config's mfp_versions map.");
		console.log("");		
		console.log("MFPX Config file    : " + mfpConfig.cfgFile );
		console.log("Current MFP version : " + mfpConfig.get("mfp_version") );
		console.log("Available versions  : " + Object.keys( versions ).join(", ") );
		return -1;
	}
	
    mfpDir    = mfpConfig.ibmDir + "/mobilefirst";
	mfpVerDir = mfpDir + "-" + ver;
	mfpInstance = mfpConfig.get("mfp_versions")[ver];
	
	//-- Ensure clean environment (assumptions on directories!)
	if ( !mfpInstance ) {
		console.error("Error: Requested version '%s' not found in config's 'mfp_verisons'", ver);
		console.log("Manually edit '%s' to define requested version and re-run set command.", mfpConfig.cfgFile);
		return -1;
	}
	if(! fs.existsSync( path.resolve(mfpInstance.install_dir, "mfp") ) ) {
		console.error("Error: Requested version '%s' does not appear to be installed.", ver);
		console.log("Download and install this version to directory:",  mfpInstance.cmd);
		console.log("Download URL: %s", mfpInstance.download_url);
		console.log("Then, ensure 'mfp_versions' settings are correct and rerun set command.");
		return -1;
	}

	console.log("Switching MFPX to version:", ver);
	server.kill();

	console.log("Updating active mfp settings directory:", mfpVerDir);
	if ( fs.existsSync( mfpDir ) ) {
		console.log("Clearing out old mobilefirst entry...");
		try { fs.unlinkSync( mfpDir );  } catch(e) {}
		try { rimraf.sync( mfpDir ); 	} catch(e) {}
	}
	if ( !fs.existsSync( mfpVerDir ) ) {
		fs.mkdirSync( mfpVerDir );
	}
	fs.symlinkSync(mfpVerDir, mfpDir, 'dir');

	if ( mfpConfig.get("manage_app_home") ) {
		console.log("Updating app_home to point to:", appHome+"-"+ver);
		if ( ! fs.existsSync( appHome+"-"+ver ) ) {
			fs.mkdirSync( appHome+"-"+ver );
		}
		fs.unlinkSync( appHome );
		fs.symlinkSync(appHome+"-"+ver, appHome, 'dir');
	}
	
	mfpConfig.set("mfp_version", ver);
	console.log("MFP version set to:", ver);
	mfpRun(["--version"], true);
};

//-----------------------------------------------------------------------
