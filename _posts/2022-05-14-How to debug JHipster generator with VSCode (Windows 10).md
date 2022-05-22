---
layout: post
title: How to debug JHipster generator with VSCode (Windows 10)
description: 
date: 2022-05-14 23:11:42 -0300
tags: jhipster
image: img/postbanners/2022-05-14-cover-debug-jhipster-generator.jpeg
permalink: /:categories/:title:output_ext
draft: true

---

![cover image](https://renanfranca.github.io/img/postbanners/2022-05-14-cover-debug-jhipster-generator.jpeg)

Here I will show you how to debug the jhipster import-jdl command with an inline entity example.

``` shell
jhipster import-jdl --inline 'entity RenanClass(RenanTable) { testString String }'
```

1. First clone the generator-jhipster into a folder, follow the instructions below:

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

7. My suggestion to be your first breakpoint. Open the file _cli\jhipster.js_ and put the breakpoint at the line 50:

`if (preferLocal) {`

8. If everything works and you got the execution stopped at the first breakpoint, I will recommended another one. Open file _cli\jdl.js_ and put the breakpoint at line 48:

logger.debug(`jdlFiles: ${toString(jdlFiles)}`);

**You could get this failure message**:

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

Go to the _test-integration\samples\app-sample-dev_ folder (if you hit the play button again, you are already there). After that, execute this command:

`npm link generator-jhipster`

Then run this command:

`jhipster --skip-jhipster-dependencies`

Now, hit the debug button and it will work smoothly =) !

## That is all. Thank you for your attention

All steps I mentioned above are described at the [CONTRIBUTING.md](https://github.com/jhipster/generator-jhipster/blob/master/CONTRIBUTING.md#use-a-debugger). I’ve never work with node.js, yeoman, and ejs before. Because that, I had to read the instructions over and over again until I figured out how to make it works.

In my opinion the [CONTRIBUTING.md](https://github.com/jhipster/generator-jhipster/blob/master/CONTRIBUTING.md#use-a-debugger) do the job, but we have to study to understand it.

# Thank you JHipster!
