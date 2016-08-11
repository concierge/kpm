module.exports = () => {
	return {
		run: function(args, api, event) {
			if (args.length !== 1) {
				api.sendMessage($$`Too many arguments given to reload.`, event.thread_id);
				return;
			}
			let lowerName = args[0].trim().toLowerCase(),
				module = this.modulesLoader.getLoadedModules().filter((val) => {
					return val.name.toLowerCase() === lowerName;
				})[0];

			if (!module) {
				api.sendMessage($$`"${args[0]}" is not a valid module/script.`, event.thread_id);
				return;
			}

			try {
				api.sendMessage($$`Restarting module "${module.name}"...`, event.thread_id);
				this.modulesLoader.unloadModule(module, this.config);
				let descriptor = this.modulesLoader.verifyModule(module.__folderPath);
				this.modulesLoader.loadModule(descriptor, this);
				api.sendMessage($$`"${module.name}" has reloaded.`, event.thread_id);
			}
			catch (e) {
				console.critical(e);
				api.sendMessage($$`"${module.name}" failed to reload.`, event.thread_id);
			}
		},
		command: 'reload <moduleName>',
		help: $$`Reloads a module.`,
		detailedHelp: $$`Reloads a module extended`
	};
};
