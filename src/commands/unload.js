module.exports = () => {
    return {
        run: function(args, api, event) {
            if (args.length !== 1) {
                api.sendMessage($$`Too many arguments given to unload.`, event.thread_id);
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
                const result = this.modulesLoader.unloadModule(module);
                if (!result.success) {
                    throw new Error('Unoading failed');
                }
                api.sendMessage($$`"${module.__descriptor.name}" has been unloaded.`, event.thread_id);
            }
            catch (e) {
                console.critical(e);
                api.sendMessage($$`"${module.__descriptor.name}" failed to unload.`, event.thread_id);
            }
        },
        command: 'unload <moduleName>',
        help: $$`Unloads a module.`,
        detailedHelp: $$`Unloads a module extended`
    };
};
