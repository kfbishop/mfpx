/* global PROGRAM */
//-----------------------------------------------------------------------------
//-- mfpx-export
//-----------------------------------------------------------------------------
var fs         = require('fs'),
	mfpConfig  = require("./mfpx-config"),
	mfpRun     = require("./mfpx-run"),
	mfpProject = require("./mfpx-project"),
	cfg        = mfpConfig.config,
	defaultPlugins = [
		'cordova-plugin-mfp',
		'org.apache.cordova.device',
		'org.apache.cordova.dialogs',
		'org.apache.cordova.geolocation',
		'org.apache.cordova.globalization',
		'org.apache.cordova.inappbrowser',
		'org.apache.cordova.network-information'
	];


//-----------------------------------------------------------------------------
exports.export = function(args) {
	var path       = require("path"),
		archiver   = require('archiver'),
		targetFile = args[0],
		
		zip         = archiver('zip'),
		sourceFiles = ['plugins/*.json','platforms/platforms.json'],
		ignoreDirs  = ['mobilefirst','platforms','plugins','node_modules'],
		ignoreFiles = ['.DS_Store'],
		projectDir  = path.basename( process.cwd() ),
		output      = null;

	//-- Are we inside a cordova project?
	if ( !mfpProject.inMfpCordovaProject() ) {
		// Used default mfp export
		mfpRun(["export"]);
		return -1;
	}
	if ( !targetFile ) {
		targetFile = projectDir;
	}
	if ( !/\.zip$/.test(targetFile) ) {
		targetFile += ".zip";
	}
	console.log("Exporting MFP cordova project to:", targetFile);
	
	//-- Find our files we want
	ignoreFiles.push(targetFile); // In case its to be written to current dir.
	fs.readdirSync(".").forEach( function(f) {
		if ( fs.statSync(f).isDirectory() && ignoreDirs.indexOf(f) == -1) {
			sourceFiles.push(f + "/**/*");
		} else {
			if ( ignoreFiles.indexOf(f) == -1 ) {
				sourceFiles.push(f);
			}
		}
	});
	//console.log("Files to zip:", sourceFiles);
	
	output = fs.createWriteStream(targetFile);
	output.on('close', function () {
	    console.log("Finished, wrote: " + Math.round((zip.pointer() / 1024000)) + ' MB.');
	});

	zip.on('error', function(err){
	    throw err;
	});

	zip.pipe(output);
	//-- TODO: the src list area is fragile and needs better customization
	zip.bulk([
	    {
			expand: true,
			src: [ sourceFiles ],
			dest: projectDir,
			dot: true
		}
	]);
	zip.finalize();

	return 0;
};


//-----------------------------------------------------------------------------
// Import assumes you have already unzipped the export.zip file and changed
// into the project folder.
exports.import = function() {
	var pluginsFile = "./plugins/fetch.json",
		platformsFile = "./platforms/platforms.json",
		tmpPlugins = null,
		tmpPlatforms = null;

	if ( !mfpProject.inMfpCordovaProject() ) {
		console.log("import - assumes you have already extracted the zip file and changed into the new project's directory");
		return -1;
	}
	//-- Add base mfp plugin
	console.log("Locating and importing plugins...");
	if ( fs.existsSync(pluginsFile)) {
		tmpPlugins = fs.readFileSync(pluginsFile,"utf8");
		tmpPlugins = JSON.parse( tmpPlugins );
		Object.keys(tmpPlugins).forEach(function(key) {
			var val = tmpPlugins[key].source;
			if ( val.url ) {
				console.log("Remote plugin: ", key, val.url);
				mfpRun(["cordova","plugin","add", val.url], true);
			} else {
				console.log("Local plugin :", key);
				mfpRun(["cordova","plugin","add", key], true);
			}
		});
	} else {
		console.warn("Unable to locate: " + pluginsFile);
		console.log("Adding default plugins only");
		defaultPlugins.forEach(function(p) {
			console.log("Default plugin :", p);
			mfpRun(["cordova","plugin","add", p], true);
		});
	}	
	
	console.log("Running first 'mfp push --nosend' to regen some needed files");	
	mfpRun(["push","--nosend"], true);

	//-- recreate platforms
	console.log("Regenerating platforms...");
	if ( fs.existsSync(platformsFile)) {
		tmpPlatforms = fs.readFileSync(platformsFile,"utf8");
		tmpPlatforms = JSON.parse( tmpPlatforms );
		Object.keys(tmpPlatforms).forEach(function(key) {
			console.log("Platform:", key);
			mfpRun(["cordova","platform","add", key], true);
			//-- Bug in mfp?   have to ad/remove/add
			mfpRun(["cordova","platform","remove", key], true);
			mfpRun(["cordova","platform","add", key], true);
		});
	} else {
		console.warn("Unable to locate: " + platformsFile);
		console.log("Manually add desired platforms using 'mfp cordova platform add'");
	}	

	console.log("Running final test 'mfp push --nosend' to validate updated project");	
	mfpRun(["push","--nosend"], true);
};

//-----------------------------------------------------------------------------
