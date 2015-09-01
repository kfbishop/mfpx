#!/usr/bin/env node
//--------------------------------------------------------------------
// Simple multi-MFP launcher script
// Karl Bishop <kfbishop@us.ibm.com>
//--------------------------------------------------------------------
// Licensed Materials - Property of IBM
// 5725-I43 (C) Copyright IBM Corp. 2015. All Rights Reserved.
// US Government Users Restricted Rights - Use, duplication or
// disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
//--------------------------------------------------------------------

//-- GLOBALS
var pkg           = require("../package.json"),
	mfpConfig     = require("../lib/mfpx-config"),
	path          = require("path"),
	cfg           = mfpConfig.config,
	args          = process.argv.slice(2),
	mod           = null,
	action        = null;

var cmds = {
	"export"   : {"mod":"../lib/mfpx-export" , "func":"export"},
	"import"   : {"mod":"../lib/mfpx-export" , "func":"import"},
	"set"      : {"mod":"../lib/mfpx-set"    , "func":"set"},
	"kill"     : {"mod":"../lib/mfpx-server" , "func":"kill"},
	"install"  : {"mod":"../lib/mfpx-install", "func":"install"},
	"-?"       : {"mod":"../lib/mfpx-help"   , "func":null},
	"-v"       : {"mod":"../lib/mfpx-run"    , "func":null},
	"mfp"      : {"mod":"../lib/mfpx-run"    , "func":null}
};

//-----------------------------------------------------------------------
// MAIN
//-----------------------------------------------------------------------

mfpConfig.load();
mfpConfig.mfpx_version = pkg.version;

//-----------------------------------------------------------------------
// Process args and launch action
if ( !(args && args[0]) ) { args = ["mfp"] };

//console.log("Arguments:", args);
//console.log("CFG:", mfpConfig);

if ( mfpConfig.get("mfp_version") === null && (args[0] !== "set" && args[0] !== "install") ) {
	console.error("Error: No version set in config file. Run 'mfpx set <version>' or 'mfpx install'\n");
}

action = cmds[ args[0] ];
if ( action && args[0] !== "-v") {
	args = args.slice(1);
} else {
	action = cmds["mfp"];
}
mod = require(action.mod);
//console.log("Action:", action);
//console.log("Args:", args);

if ( action.func ) {
	mod[ action.func ]( args );
} else {
	mod( args );
}

//-----------------------------------------------------------------------
