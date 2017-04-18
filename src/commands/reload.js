module.exports = moduleCtrl => {
    return {
        run: (args, api, event) => {
            if (args.length !== 1) {
                return api.sendMessage($$`Too many arguments given to reload.`, event.thread_id);
            }

            const mod = moduleCtrl.findLoadedModule(args[0]);
            if (!mod) {
                return api.sendMessage($$`"${args[0]}" is not a valid module/script.`, event.thread_id);
            }

            api.sendMessage($$`Restarting module "${mod.__descriptor.name}"...`, event.thread_id);
            moduleCtrl.reload(mod)
                .then(() => api.sendMessage($$`"${mod.__descriptor.name}" has been reloaded.`, event.thread_id))
                .catch(() => api.sendMessage($$`"${mod.__descriptor.name}" failed to reload.`, event.thread_id));
        },
        command: 'reload <moduleName>',
        help: $$`Reloads a module.`,
        detailedHelp: $$`Reloads a module extended`
    };
};
