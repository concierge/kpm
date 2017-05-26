module.exports = moduleCtrl => {
    return {
        run: function(args, api, event) {
            if (args.length !== 1) {
                return api.sendMessage($$`Too many arguments given to stop.`, event.thread_id);
            }

            const mod = moduleCtrl.findLoadedModule(args[0], 'integration');
            if (!mod) {
                return api.sendMessage($$`"${args[0]}" is not a valid module/script.`, event.thread_id);
            }

            moduleCtrl.stop(mod)
                .then(() => api.sendMessage($$`"${mod.__descriptor.name}" has been stopped.`, event.thread_id))
                .catch(() => api.sendMessage($$`"${mod.__descriptor.name}" failed to stop.`, event.thread_id))
        },
        command: 'stop <integrationName>',
        help: $$`Stops an integration`,
        detailedHelp: $$`Stops an integration extended`
    };
};
