# Overview

MFP eXtras (mfpx) is a simple launcher/utility for the MobileFirst Platform (MFP) Command Line Interface (CLI).  It acts as a wrapper to the official CLI that performs functions not currently part of the official product release. Some features may eventually go into the product, or be obsoleted by future CLI versions.

## Primary Features

The following features are currently provided by the CLI launcher:
- Custom and manual installation
- Multiple installed versions of the MFP CLI
    - Including standard and iOS versions
    - Easily switch between CLI versions, including custom workspaces for each version
- Simple installation of latest nightly drivers (NEW!)
- Set custom environment settings, such as Java runtime version
- Force kill a mis-behaving MFP Server


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


# Install

1. Uninstall any existing instance of the MFP.  This can be done by running the uninstall app (ie /Applications/IBM/MobileFirst-CLI/uninstall/Uninstall), and follow the prompts
    - Note: The uninstaller is bad about cleaning up the "/etc/profile" and "/etc/zprofile" files.  Manually edit these files (as root) and remove all MFP related entries.

1. Perform a manual install at least one instance of the MFP CLI. See the following blog post for assistance.


# Commands
The following commands are available as part of this mfp luancher.

## Change active version
Change the active version to be used when running 'mfp'. After running this command, all subsequent commands will be run using the defined version, and the applied to the app in the current APP_HOME directory.

```c
> mfp set <M.m>
```

Example: `mfp set 7.1-ios`

It is assumed that you have already installed the target version. In the example above, the ios specific version of mfp is requested. Normally, you might just want to specify `mfp set 7.1`.


## Update latest version of mfp

Updates the latest pre-release version of the cLI. This command is only available to IBM internal users. Depending on your connections, this command can take take a while to complete.

```c
> mfp update
```

At the time of this document, version 7.1 is in progress, and will be downloaded and configured. Obviously, as a work in progress, this version may fail spectacularly. Be aware of that its not released or tested!

## Kill server

The Liberty server has a bad habit of getting confused.  We're working to resolve this issue but as of now its still an issue. Common catalysts are sing the Studio and CLI concurrently, or using different versions of the CLI. This command tries to be nice, and get aggressively forceful in ensuring the server is shut down.  We're adding this support to the product CLI, as it just a bad situation.

```c
> mfp kill <port>
```

You can provide a specific port to override the default '10080' port used by the MFP development server. The default port can be defined in the config value `DEFAULT_MFP_PORT`.

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


