const path = require('path'),
    fs = require('fs');

module.exports = moduleCtrl => {
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

            let dir;
            try {
                dir = moduleCtrl.findUnloadedModule(args[0]);
            }
            catch (e) {
                return api.sendMessage(e.message, event.thread_id);
            }

            moduleCtrl.load(dir)
                .then(res => {
                    api.sendMessage($$`"${res.name}" has been loaded.`, event.thread_id);
                    if (start) {
                        return moduleCtrl.start(moduleCtrl.findLoadedModule(m => m === res));
                    }
                })
                .catch(() => api.sendMessage($$`"${args[0].trim()}" failed to load.`, event.thread_id));
        },
        command: 'load [--start] <moduleName>',
        help: $$`Loads a module.`,
        detailedHelp: $$`Loads a module extended`
    };
};
