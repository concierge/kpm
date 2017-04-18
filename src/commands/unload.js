module.exports = moduleCtrl => {
    return {
        run: (args, api, event) => {
            if (args.length !== 1) {
                api.sendMessage($$`Too many arguments given to unload.`, event.thread_id);
                return;
            }

            const mod = moduleCtrl.findLoadedModule(args[0]);
            if (!mod) {
                api.sendMessage($$`"${args[0]}" is not a valid module/script.`, event.thread_id);
                return;
            }

            moduleCtrl.unload(mod)
                .then(() => api.sendMessage($$`"${mod.__descriptor.name}" has been unloaded.`, event.thread_id))
                .catch(() => api.sendMessage($$`"${mod.__descriptor.name}" failed to unload.`, event.thread_id));
        },
        command: 'unload <moduleName>',
        help: $$`Unloads a module.`,
        detailedHelp: $$`Unloads a module extended`
    };
};
