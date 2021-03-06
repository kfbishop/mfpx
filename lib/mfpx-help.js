//-----------------------------------------------------------------------
// mfpx-help
//-----------------------------------------------------------------------
var	mfpConfig        = require("./mfpx-config"),
	cfg              = mfpConfig.config;

//-----------------------------------------------------------------------
module.exports = function(args) {
	var topic = args[1],
		help = [];
	switch( topic ) {
	case "config": {
		help = config();
		break;
	}
	default:
		help = base();
		break;
	}
	console.log("MFP eXtras, (mfpx v%s)", mfpConfig.mfpx_version);
	console.log(help.join("\n"));
};

//-----------------------------------------------------------------------
var	base = function() {
	return [
		"",
		"Available commands:",
		"  set <version> .................................. Set default mfp command version",
		"  install <version> .................... Download and install a version of MFP CLI",
		"  export [./<project>.zip] ...................... Export an MFP Cordova app to Zip",
		"  import ................................. Import an extracted MFP export zip file",
		"  kill .............. Kill and remove tmp files from mis-behaving local MFP server",
		"  clean .............................. Kill and Cleanup local MFP server instances",
		"  -v ........................................ Show 'MFP eXtras' and 'MFP' versions",
		"  -? ............................................. Show 'MFP eXtras' specific help",
		"",
		"Available help topics:",
		"  -? config ...................................... Describe specific config values",
		"",
		"All other commands go directly to real MFP CLI."
	];
};

//-----------------------------------------------------------------------
var	config = function() {
	return [
		"",
		"Configuration file: " + mfpConfig.cfgFile,
		"",
		"Config entry details:",
		"  mfp_version      : Default installed version of 'mfp' to execute",
		"  mfp_versions     : Map of available MFP versions. See below for details",
		"  mfp_install_dir  : Where to keep installation archives",
		"  manage_app_home  : Dynamically support app home linking? (eg apps --> apps-7.1)",
		"  app_home         : Linked directory where apps reside. Real dir at: ${app_home}-${version}",
		"",
		"'mfp_versions' entry details:",
		"  cmd              : Fully qualified path to this version of the mfp command",
		"  java_home        : [optional] Sets a specific Java Runtime for the command",
		"  server_port      : [optional] Default port to use on 'kill' command. Default is 10080",
		"",
		"Current Config:",
		JSON.stringify(cfg, null, 2)
	];
};