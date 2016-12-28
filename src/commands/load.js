let path = require('path');
let fs = require('fs');

module.exports = () => {
    return {
        run: function(args, api, event, opts) {
            let start = false;
            if (args[0] === '--start') {
                start = true;
                args.shift();
            }

            if (args.length !== 1) {
                api.sendMessage($$`Too many arguments given to load.`, event.thread_id);
                return;
            }
            let lowerName = args[0].trim().toLowerCase();
            let loadDir;
            let module = this.modulesLoader.getLoadedModules().filter(val => val.__descriptor.name.toLowerCase() === lowerName)[0];
            if (module) {
                api.sendMessage($$`"${args[0]}" is already loaded.`, event.thread_id);
                return;
            }
            try {
                let stats;
                try {
                    loadDir = path.join(global.__modulesPath, lowerName);
                    stats = fs.lstatSync(loadDir);
                }
                catch (e) {
                    loadDir = path.join(global.__modulesPath, 'kpm_' + lowerName);
                    stats = fs.lstatSync(loadDir);
                }
                if (!stats.isDirectory()) {
                    throw Error($$`"${lowerName}" failed to load - no such module.`);
                }
            }
            catch (e) {
                api.sendMessage($$`"${lowerName}" failed to load - no such module.`, event.thread_id);
                return;
            }
            try {
                const descriptor = this.modulesLoader.verifyModule(loadDir);
                if (!this.modulesLoader.loadModule(descriptor).success) {
                    throw new Error('Load failed');
                }
                api.sendMessage($$`"${lowerName}" has been loaded.`, event.thread_id);
            }
            catch (e) {
                console.critical(e);
                api.sendMessage($$`"${lowerName}" failed to load.`, event.thread_id);
            }

            if (start) {
                opts['start'].run.call(this, args, api, event);
            }
        },
        command: 'load [--start] <moduleName>',
        help: $$`Loads a module.`,
        detailedHelp: $$`Loads a module extended`
    };
};
