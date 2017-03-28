# KPM Package Manager

KPM is the defacto package manager for the [Concierge](https://github.com/concierge/Concierge) project. It came about as a simple way of installing, uninstalling and updating modules within Concierge - KPM is to Concierge what NPM is to Node.js. Modules can be installed directly as scripts or git repositories or can be registered on the [KPM Table](https://github.com/concierge/Concierge/wiki/KPM-Table) for quick installation.

### Installation
KPM is installed by default on your first run of Concierge, so provided it wasn't uninstalled you should be good to go. If not, you will need to manually install this respository:
```shell
cd Concierge/modules
git clone https://github.com/concierge/kpm.git
```
Then restart any running instances of Concierge.

### Usage
KPM is fairly intuitive to use, and detail about how to use each command can be found using the `kpm help` and `kpm help <command>` commands. The following commands are currently avalible for use:
- `install <url|ref> [<url|ref> [<url|ref> [...]]]`  
  Installs one or more modules from exising git repositories or github references.
- `uninstall [<moduleName> [<moduleName> [...]]] [--no-preserve-kpm]`  
  Uninstalls one or more modules.
- `update [<moduleName> [<moduleName> [...]]]`  
  Updates one or all modules.
- `list`  
  Lists all installed modules (except preinstalled ones).
- `search [--install] [<query>]`  
  Searches the KPM table for modules.
- `config <moduleName> <query> [<newJsonValue>]`  
  Gets and sets the configuration of modules.
- `reload <moduleName>`  
  Reloads a module.
- `load [--start] <moduleName>`  
  Loads a module.
- `unload <moduleName>`  
  Unloads a module.
- `start <integrationName>`  
  Starts an integration.
- `stop <integrationName>`  
  Stops an integration.
- `help [moduleName]`  
  Displays a command list and optionally more detail about a command.

#### Examples
- Install [admin](https://github.com/concierge/admin) using the [KPM Table](https://github.com/concierge/Concierge/wiki/KPM-Table)  
  `/kpm install admin`
- Install [creator](https://github.com/concierge/creator) as a git repository  
  `/kpm install https://github.com/concierge/creator.git`
- Install [8ball](https://github.com/concierge/8ball) as a github reference  
  `/kpm install concierge/8ball`
- Install [hubot-cowsay](https://raw.githubusercontent.com/github/hubot-scripts/master/src/scripts/cowsay.coffee) as a script  
  `/kpm install https://raw.githubusercontent.com/github/hubot-scripts/master/src/scripts/cowsay.coffee`

### FAQ
#### Won't KPM enable anyone in my chats to install things?
Yes. Security is not within the scope of this module. However if you want to limit user access to KPM, a module such as [admin](https://github.com/concierge/admin) is designed for this purpose and will work well.

#### What Does KPM stand for?
In the beginning when KPM was created, Concierge was called "Kassy". So KPM stood for **K**assy **P**ackage **M**anager.  
Rather than renaming the module when Kassy was renamed to Concierge, the acronym meaning changed. As is the case with most cool projects these days it is now a recursive acronym:  
**K**PM **P**ackage **M**anager

#### How Do I Update KPM?
`/kpm update kpm` is the easiest approach.

### License and Copyright
Copyright © Matthew Knox and Contributors 2017. Avalible under the MIT license. All contributions welcome.
