let path = require('path');

module.exports = () => {
	return {
		run: function(args, api, event) {
			if (args.length !== 1) {
				api.sendMessage($$`Too many arguments given to load.`, event.thread_id);
				return;
			}
			let lowerName = args[0].trim().toLowerCase();
            let loadDir;
			try {
                loadDir = path.resolve('./modules/' + lowerName);
            }
            catch (e) {
                api.sendMessage($$`"${lowerName}" failed to load - no such module.`, event.thread_id);
                return;
            }
            try {
				let descriptor = this.modulesLoader.verifyModule(loadDir);
				this.modulesLoader.loadModule(descriptor, this);
				api.sendMessage($$`"${lowerName}" has been loaded.`, event.thread_id);
			}
			catch (e) {
				console.critical(e);
				api.sendMessage($$`"${lowerName}" failed to load.`, event.thread_id);
			}
		},
		command: 'load <moduleName>',
		help: $$`Loads a module.`,
		detailedHelp: $$`Loads a module extended`
	};
};
