---
layout: post
title: Learn to debug JHipster generator, increase your chances to fix bounty issues
description: 
date: 2022-11-16 12:00:00 -0300
tags: jhipster
image: img/postbanners/2022-05-14-cover-debug-jhipster-generator.jpeg
permalink: /:categories/:title:output_ext
draft: true

---

![cover image](https://renanfranca.github.io/img/postbanners/2022-05-14-cover-debug-jhipster-generator.jpeg)

## Motivation

You can earn money by fixing issues with bounty labels!

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">Want to make some money doing open source <a href="https://twitter.com/java?ref_src=twsrc%5Etfw">@Java</a> development? There&#39;s over $2500 USD available for fixing issues in the <a href="https://twitter.com/jhipster?ref_src=twsrc%5Etfw">@JHipster</a> + <a href="https://twitter.com/QuarkusIO?ref_src=twsrc%5Etfw">@QuarkusIO</a> blueprint!<br><br>💰 <a href="https://t.co/p80VRNrGw0">https://t.co/p80VRNrGw0</a><br><br>See our bug bounty program for more info: <a href="https://t.co/PBURlaaqhg">https://t.co/PBURlaaqhg</a><a href="https://twitter.com/hashtag/java?src=hash&amp;ref_src=twsrc%5Etfw">#java</a> <a href="https://twitter.com/hashtag/jhipster?src=hash&amp;ref_src=twsrc%5Etfw">#jhipster</a> <a href="https://twitter.com/hashtag/opensource?src=hash&amp;ref_src=twsrc%5Etfw">#opensource</a></p>&mdash; Matt Raible (@mraible) <a href="https://twitter.com/mraible/status/1440286692049522690?ref_src=twsrc%5Etfw">September 21, 2021</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

Take a look at the available [bounty issues](https://github.com/jhipster/generator-jhipster/issues?q=is%3Aissue+is%3Aopen+label%3A%22%24%24+bug-bounty+%24%24%22).

## Hands on

Here I will show you how to debug the jhipster import-jdl command with an inline entity example. I am using VSCode with Windows 10.

``` shell
jhipster import-jdl --inline 'entity RenanClass(RenanTable) { testString String }'
```

1. First clone the generator-jhipster into a folder, and follow the instructions below:

	[**_Set NPM to use the cloned project_**](https://github.com/jhipster/generator-jhipster/blob/master/CONTRIBUTING.md#set-npm-to-use-the-cloned-project)

2. Then open the generator-jhipster root folder and your VSCode will look like that:

	![image](https://renanfranca.github.io/img/debug-jhipster-generator/vscode-generator-folder.png)

	<figcaption>VSCode with generator-jhipster folder</figcaption>

3. Click at the bottom to change the Auto Attach to [Smart](https://code.visualstudio.com/docs/nodejs/nodejs-debugging#_auto-attach).

4. Click on Debug icon (left) :

	![image](https://renanfranca.github.io/img/debug-jhipster-generator/vscode-debug-view.png)

	<figcaption>VSCode Debug View</figcaption>

	You will see at the top left some debug options. There are many options pre-configured for different commands. Choose the _jhipster import-jdl_ and click on the setting icon:

	![image](https://renanfranca.github.io/img/debug-jhipster-generator/vscode-debug-options.png)

	<figcaption>VSCode JHipster Debug Options</figcaption>

5. Make a copy of _jhipster import-dl_ configuration and change it to be like that:

	```json
{  
            "type": "node",  
            "request": "launch",  
            "name": "CUSTOM jhipster import-jdl",  
            "program": "${workspaceFolder}/cli/jhipster.js",  
            "args": [  
                "import-jdl",  
                "--inline",  
                "entity RenanClass(RenanTable) { testString String }",  
                "-d"  
            ],  
            "cwd": "${workspaceFolder}/test-integration/samples/app-sample-dev/",  
            "console": "integratedTerminal"  
        }
	```
	![image](https://renanfranca.github.io/img/debug-jhipster-generator/vscode-launch-json.png)

	<figcaption>VSCode launch.json</figcaption>

6. Choose the new debug option _CUSTOM jhipster import-jdl_ and hit the play button:

	![image](https://renanfranca.github.io/img/debug-jhipster-generator/vscode-run-debug.png)

	<figcaption>VSCode run Debug</figcaption>

7. My suggestion for your first breakpoint. Open the file _cli\jhipster.js_ and put the breakpoint at line 50:

	`if (preferLocal) {`

8. If everything works and you got the execution stopped at the first breakpoint, I will recommend another one. Open file _cli\jdl.js_ and put the breakpoint at line 48:

	logger.debug(`jdlFiles: ${toString(jdlFiles)}`);

## You could get this failure message

```bash
PS C:\Users\Renan\Documents\JHipster\TUTORIALS\how_debug_with_vscode\generator-jhipster\test-integration\samples\app-sample-dev>  ${env:NODE_OPTIONS}='--require "c:/Users/Renan/AppData/Local/Programs/Microsoft VS Code Insiders/resources/app/extensions/ms-vscode.js-debug/src/bootloader.bundle.js" --inspect-publish-uid=http'; ${env:VSCODE_INSPECTOR_OPTIONS}='{"inspectorIpc":"\\\\.\\pipe\\node-cdp.10508-2.sock","deferredMode":false,"waitForDebugger":"","execPath":"C:\\Program Files\\nodejs\\node.exe","onlyEntrypoint":false,"autoAttachMode":"always","fileCallback":"C:\\Users\\Renan\\AppData\\Local\\Temp\\node-debug-callback-f76952482a888dfe"}'; & 'C:\Program Files\nodejs\node.exe' '.\..\..\..\cli\jhipster.js' 'import-jdl' '--inline' 'entity RenanClass(RenanTable) { testString String }' '-d'  
Debugger attached.  
Waiting for the debugger to disconnect...  
internal/modules/cjs/loader.js:905  
  throw err;  
  ^Error: Cannot find module 'semver'
```

**To solve this misconfiguration** go to generator-jhipster root folder and confirm that you executed the following command:

`npm link`

Then go to the _test-integration\samples\app-sample-dev_ folder (if you hit the play button again, you are already there). After that, execute this command:

`npm link generator-jhipster`

Then run this command:

`jhipster --skip-jhipster-dependencies`

Now, hit the debug button and it will work smoothly =) !

## That is all. Thank you for your attention

All steps I mentioned above are described at the [CONTRIBUTING.md](https://github.com/jhipster/generator-jhipster/blob/master/CONTRIBUTING.md#use-a-debugger). I’ve never work with node.js, yeoman, and ejs before. Because that, I had to read the instructions over and over again until I figured out how to make it works.

In my opinion the [CONTRIBUTING.md](https://github.com/jhipster/generator-jhipster/blob/master/CONTRIBUTING.md#use-a-debugger) do the job, but we have to study to understand it.

# Thank you JHipster!
