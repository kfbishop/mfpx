//-----------------------------------------------------------------------------
//-- mfpx-install
//-----------------------------------------------------------------------------
var fs         = require('fs'),
	http       = require('http'),
	path       = require("path"),
	Q          = require("q"),
	mfpConfig  = require("./mfpx-config");

//-----------------------------------------------------------------------
exports.install = function( args ) {
	var ver            = args[0],
		isDevVer       = ver.match(/^.*\-dev$/),
		verInstance    = null,
		versions       = mfpConfig.get("mfp_versions"),
		installersDir  = mfpConfig.get("installers_dir"),
		targetPath;

	if ( !ver ) {
		console.log("Syntax: mfpx install <version>");
		console.log("Where : <version> matches an entry in config's mfp_versions map.");
		console.log("");		
		console.log("MFPX Config file    : " + mfpConfig.cfgFile );
		console.log("Available versions  : " + Object.keys( versions ).join(", ") );
		return -1;
	}

	verInstance = mfpConfig.get("mfp_versions")[ver];
	//console.log("verInstance:", verInstance);
	
	//-- Ensure clean environment (assumptions on directories!)
	if ( !verInstance ) {
		console.error("Error: Requested version '%s' not found in config's 'mfp_verisons'", ver);
		console.log("Manually edit '%s' to define requested version and re-run set command.", mfpConfig.cfgFile );
		return -1;
	}
	
	targetPath = verInstance.install_dir;
	
	if( !isDevVer && fs.existsSync( path.resolve(targetPath, "mfp") ) ) {
		console.error("Error: Requested version '%s' is already installed.", ver);
		console.log("If desired, uninstall existing version and then re-run install command.");
		console.log("Existing version installed at:", targetPath );
		return -1;
	}

	_makeAndChangeDir( installersDir );

	_getDownloadUrl( ver )
		.then( function( url ) {
			_download( url, installersDir )
				.then( function(installFile) {
					var newInstallDir = _extractInstaller(installFile);
					_runInstaller(newInstallDir, targetPath);	
					console.log("Run 'mfp set %s' to use this version after installation", ver);		
				});
		});
};

//-----------------------------------------------------------------------
// Download requested file
var _download = function( url, targetPath ) {
	var targetFile = path.resolve( targetPath, path.basename( url ) ),
		outfile,
		total = 0,
		subtotal = 0,
		inbytes = 0,
		mb = 1048576,
		pct = 0,
		deferred = Q.defer();

	if ( _doesTargetFileExist(targetFile) ) {
		deferred.resolve(targetFile);
	} else {
		console.log("Downloading file: " + url);
		outfile = fs.createWriteStream(targetFile);
		http.get( url, function(resp) {
			resp.pipe(outfile);
			total = Math.round(parseInt(resp.headers["content-length"]) / mb);
			if ( process.stdin.isTTY ) {
				resp.on("data", function(chunk) {
					inbytes += chunk.length;
					subtotal = Math.round(inbytes / mb);
					pct = Math.round( (subtotal/total)*100 );
					process.stdout.write("Received " + subtotal + " of " + total + "MB (" + pct + "%)     \r");
				});
			}
			resp.on('end', function() {
				console.log('Download completed                    ');
				deferred.resolve(targetFile);
			});
		}).on('error', function(e) {
			deferred.reject("Error: " + e.message);
		});
	}
	return deferred.promise;
}

//-----------------------------------------------------------------------
// Extract resource form zip, and more into proper place
var _extractInstaller = function( filename ) {
	var cp         = require('child_process'),
		rimraf     = require('rimraf'),
		version,
		tmpDir     = path.resolve(process.cwd(), "tmp"),
		installerDir;

	_makeAndChangeDir( tmpDir );
	//-- clear out anything existing
	rimraf.sync(".");
	console.log("Extracting installer files from:", filename);
	cp.spawnSync("unzip", [ path.resolve("..", filename) ]);
	//-- Determine installer directory, should be only thing in here
	installerDir = fs.readdirSync(tmpDir)[0];
	console.log("MFP Installer extracted to:", installerDir);
	return installerDir; //deferred.promise;
}
		
//-----------------------------------------------------------------------
var _runInstaller = function( installerDir, targetPath ) {
	var cp         = require('child_process'),
		platform   = require('os').platform();
	
	console.log("Running installer program.");
	console.log("================================================================================");
	console.log("================================================================================");
	console.log("=====   Ensure you install to: %s", targetPath);
	console.log("=====   Or update 'install_dir' entry in config file to installed location.");
	console.log("================================================================================");
	console.log("================================================================================");
	switch ( platform ) {
		case "darwin": // OSX
			var cmd = path.resolve( installerDir, "install_mac.app");
			console.log("Running: ", cmd);
			cp.spawn( "/usr/bin/open", [cmd] );
			break;
		default:
			console.error("Unknown O/S '%s', manual install required.", platform );
			return -1;
	}
}

//-----------------------------------------------------------------------
// Utility to pull the latest MFP drivers from internal repo
// Pattern: mobilefirst-cli-installer-7.1.0-20150523-0739.zip
var _getLatestVersion = function( baseUrl ) {
	var matchpattern = /"(mobilefirst[_-]cli[_-]installer[_-].*\.zip)"/,
		filename, 
		listData = "",
		deferred = Q.defer();

	//-- Pull list of files
	console.log("Searching for latest installer from update site...");
	http.get(baseUrl, function(resp) {
        resp.on('data', function(data) {
            listData += data;
        });
        resp.on('end', function() {
			//console.log("Response: " + listData);
			filename = listData.match(matchpattern);
			if ( filename ) {
				//-- Strip quotes
				filename = filename[0].replace(matchpattern, "$1");
				//filename = filename[0].substr(1, filename[0].length-2;
				console.log("Located file: ", filename);
				deferred.resolve( baseUrl + "/" + filename);
			} else {
				deferred.reject("Unable to locate a CLI installer at: ", baseUrl);
			}
		});
	}).on('error', function(e) {
		deferred.reject("Got error: " + e.message);
	});
	return deferred.promise;

};

//-----------------------------------------------------------------------------
var _getDownloadUrl = function( ver ) {
	var deferred    = Q.defer(),
		verInstance = mfpConfig.get("mfp_versions")[ver],
		isDevVer    = ver.match(/^.*\-dev$/),
		url         = verInstance.download_url;

	if ( isDevVer ) {
		console.log("Dev version requested, need to find latest version...");
		return _getLatestVersion( url );
	} else {
		deferred.resolve( url );
	}
	return deferred.promise;
};

//-----------------------------------------------------------------------------
var _doesTargetFileExist = function( file ) {
	if ( fs.existsSync(file) && fs.statSync(file).size > 0) {
		// Dont re-download if exists (and has size), pull dummy file to keep flow
		console.log("Target file exists, not downloading:", file);
		return true;
	}
	return false;
};

//-----------------------------------------------------------------------------
var _makeAndChangeDir = function( dir ) {
	//-- Make/Move to install dir
	try { fs.mkdirSync(dir); } catch(e) {}
	try {
		process.chdir(dir);
		console.log('Changed to directory: ' + process.cwd());
	} catch(err) {
		console.error("Failed to change to installers_dir:", installersDir);
		throw err;
	}
};
	

//-----------------------------------------------------------------------------