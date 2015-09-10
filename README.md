# Overview

MFP eXtras (mfpx) is a simple launcher/utility for the MobileFirst Platform (MFP) Command Line Interface (CLI).  It acts as a wrapper to the official CLI that performs functions not currently part of the official product release. Some features may eventually go into the product, or be obsoleted by future CLI versions.

## Primary Features

The following features are currently provided by the MFPX CLI:
- Supports multiple installed versions of the MFP CLI
  - Easily switch between CLI versions
  - Enable custom workspaces and settings for each version
  - Direct install all current MFP CLI versions
  - Simple installation of latest pre-release nightly drivers (IBM Internal only)
  - Set custom settings -- such as Java runtime -- per version
- Local server smackdown
  - Force kill a mis-behaving MFP Server
  - Clean up local server issues
- Custom export/import support for new MFP Cordova apps


# Prerequisites

This launcher requires [node.js](https://nodejs.org/) to be previously installed. Additionally, its only been used/tested on OSX. Some commands require OSX, so if you are a Windows user and want to get things working under that platform, contributions are welcomed!

The following node modules are used by mfpx, and should already be installed globally.
- child_process
- http
- fs
- unzip

If you receive an error on any of these, run the following command to install them. OSX users may need to prefix with `sudo`.

```c
$ npm install -g <module>
```

Obviously, you will also need at least one instance of the MFP CLI. You can install the latest released version [here](https://developer.ibm.com/mobilefirstplatform/install/#clui). For prior releases, see this [Stack Overflow post]() for options.  To obtain the latest pre-release nightly, simply run `mfp update`.


## Installation

1. Install the mfpx runtime and dependencies:

  ```$ npm install -g mfpx```

  Note: You may need to use `sudo` for osx/linux systems.

2. Edit your `~/.profile` (or similar) and add the following alias.  

  ```alias mfp="mfpx"```
  
  The GUI installers (hopefully going away soon!) will still add the real `mfp` command to your PATH, but aliases are interpreted before PATH entries.
   


# Commands
The following commands are available as part of this mfp launcher:

## Change active version
Change the active version to be used when running 'mfp'. After running this command, all subsequent commands will be run using the defined version, and the applied to the app in the current APP_HOME directory.

```c
$ mfp set <M.m>
```

Example: `mfp set 7.1`

It is assumed that you have already installed the target version. In the example above, the iOS specific version of mfp is requested. Normally, you might just want to specify `mfp set 7.1`.


## Install a version of mfp, or dev driver (IBM internal only)

Updates the latest pre-release version of the CLI. This command is only available to IBM internal users. Depending on your connections, this command can take take a while to complete.

```c
> mfp install <M.m>[-dev]
```

At the time of this document, version 7.1 is in progress, and will be downloaded and configured. Obviously, as a work in progress, this version may fail spectacularly. Be aware of that its not released or tested!

Special entries in the 'mfp_version' config map that end with "-dev", will dynamically search the IBM internal dev driver site for the latest available version, download and install it.  Contact the author or Tooling team in Raleigh for the proper URL.

## Kill server

The Liberty server has a bad habit of getting confused.  We're working to resolve this issue but as of now it's still an issue. Common catalysts are using the Studio and CLI concurrently, or using different versions of the CLI. This command tries to be nice, and get aggressively forceful in ensuring the server is shut down.  We're adding this support to the product CLI, as it just a bad situation.

```c
> mfp kill
```

The default port to kill is '10080', and is defined for each version in the .mfpx.json config file.


## Help (-?)

Help specific to the launcher itself can be exposed using the '-?' argument.  Sample out is:

```c
MFP Launcher, v1.0.0
Configuration file: /Users/kfbishop/.ibm/mobilefirst-launcher.json
MFP Command: /Users/kfbishop/dev/mobilefirst/mobilefirst-cli-7.1/bin/mobilefirst-cli.js

Current Config:
{
  "VERSION": "7.1",
  "JAVA_HOME": "/Library/Java/JavaVirtualMachines/jdk1.7.0_55.jdk/Contents/Home",
  "MFP_HOME": "/Users/kfbishop/dev/mobilefirst",
  "MFP_INSTALL_DIR": "/Users/kfbishop/dev/mobilefirst/installers",
  "MANAGE_APP_HOME": true,
  "APP_HOME": "/Users/kfbishop/dev/mobilefirst/apps",
  "DEFAULT_MFP_PORT": "10080"
}

Config descriptions:
  VERSION          : Installed version of 'mfp' to execute
  JAVA_HOME        : Set specific Java Runtime? (eg /Library/Java/JavaVirtualMachines/jdk1.8.0.jdk/Contents/Home
  MFP_HOME         : MFP Home directory for custom runtimes
  MFP_INSTALL_DIR  : Where to keep installation archives
  MANAGE_APP_HOME  : Dynamically support app home linking? (eg apps --> apps-7.1)
  APP_HOME         : Linked directory where apps reside. Real dir at: ${APP_HOME}-X.y
  DEFAULT_MFP_PORT : Default port to use on 'mfp kill <port>'

```

At this time, only manual updates are supported. The exception is the VERSION value, that can be set using the `mfp set version` command.


