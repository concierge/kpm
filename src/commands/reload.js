module.exports = () => {
    return {
        run: function(args, api, event) {
            if (args.length !== 1) {
                api.sendMessage($$`Too many arguments given to reload.`, event.thread_id);
                return;
            }
            let lowerName = args[0].trim().toLowerCase(),
                module = this.modulesLoader.getLoadedModules().filter((val) => {
                    return val.__descriptor.name.toLowerCase() === lowerName;
                })[0];

            if (!module) {
                api.sendMessage($$`"${args[0]}" is not a valid module/script.`, event.thread_id);
                return;
            }

            try {
                api.sendMessage($$`Restarting module "${module.__descriptor.name}"...`, event.thread_id);
                let res = this.modulesLoader.unloadModule(module).success;
                let descriptor = this.modulesLoader.verifyModule(module.__descriptor.folderPath);
                res = res && this.modulesLoader.loadModule(descriptor).success;
                if (!res) {
                    throw new Error('Reload failed');
                }
                api.sendMessage($$`"${module.__descriptor.name}" has been reloaded.`, event.thread_id);
            }
            catch (e) {
                console.critical(e);
                api.sendMessage($$`"${module.__descriptor.name}" failed to reload.`, event.thread_id);
            }
        },
        command: 'reload <moduleName>',
        help: $$`Reloads a module.`,
        detailedHelp: $$`Reloads a module extended`
    };
};
