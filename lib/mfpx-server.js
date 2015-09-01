//-----------------------------------------------------------------------------
//-- mfpx-server
//-----------------------------------------------------------------------------
var spawnSync  = require('child_process').spawnSync,
	rimraf     = require('rimraf'),
	mfpConfig  = require("./mfpx-config"),
	mfpRun     = require("./mfpx-run"),
	cfg        = mfpConfig.config;

//-----------------------------------------------------------------------------
// Utility script to kill MFP dev server / ports.
//-----------------------------------------------------------------------------
exports.kill = function() {
	var port       = null,
		currentMfp = null,
		resp       = null,
	    pid        = null;

	currentMfp = mfpConfig.get("mfp_instance_version");
	port = currentMfp.server_port || "10080";

	mfpRun( ["stop"], true);

	pid = _getPid();
	if ( pid ) {
		console.log("Server still running...");
		mfpRun( ["stop", "--kill"], true);
		pid = _getPid();
		if ( pid ) {
			_killPid( pid );
		}
	}

	console.log("Checking for port %s being left open...", port);
	resp = spawnSync("lsof", ["-i", ":"+port, "-F"], {encoding:"utf8"});
	if ( resp.stdout ) {
		pid = resp.stdout.split('\n')[0];
		pid = pid.slice(1); // strip off leading "p" (see output of "lsof -F")
		console.log("Port being held open by process PID:", pid);
		_killPid( pid );
	}

	console.log("Cleaning temporary MFP files...");
	rimraf.sync(process.env.TMPDIR+"/wlBuildResources");
	rimraf.sync(process.env.TMPDIR+"/wlPreview");
	
	// Clean out all server instances
	console.log("Removing any current versions of the server...");
	rimraf.sync( mfpConfig.ibmDir + "/mobilefirst/server/" + cfg.verson + "*");
	console.log("Creating new server instance...");
	if ( cfg.version >= 7.1 ) {
		mfpRun(["server", "create"], true);
	} else {
		mfpRun(["create", "server"], true);
	}

	console.log("Done");
}

//-----------------------------------------------------------------------
var _getPid = function() {
	var p = null,
		resp = null;
		
	console.log("Checking for Liberty processes for Worklight...");
	resp = spawnSync("pgrep", ["-f", "wlp.\*worklight"], {encoding:"utf8"});
	if ( resp.stdout ) {
		p = resp.stdout.slice(0, - 1); // Drop "\n"
		console.log("Found pid: ", p);
	}
	return p;
};

//-----------------------------------------------------------------------
var _killPid = function( pid ) {
	if( _isPidValid(pid) ) {
		console.log("Trying to nicely kill PID:", pid);
		process.kill(pid);
		if( _isPidValid(pid) ) {
			console.log("Being less nice...");
			process.kill(pid, 'SIGKILL');
		}
		console.log("Process has been killed.");
	}
};

//-----------------------------------------------------------------------
var _isPidValid = function( pid ) {
	var alive = true;
	try {
		process.kill(pid,'0');
	} catch(e) {
		//-- Throws if pid invalid, which is good in this case
		alive = false;
	}
	//console.log("is_valid_pid:", pid, alive);
	return alive;
};

//-----------------------------------------------------------------------------