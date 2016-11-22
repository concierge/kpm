module.exports = () => {
    return {
        run: function(args, api, event) {
            if (args.length !== 1) {
                api.sendMessage($$`Too many arguments given to stop.`, event.thread_id);
                return;
            }
            let lowerName = args[0].trim().toLowerCase(),
                module = this.modulesLoader.getLoadedModules('integration').filter((val) => {
                    return val.__descriptor.name.toLowerCase() === lowerName;
                })[0];

            if (!module) {
                api.sendMessage($$`"${args[0]}" is not a valid module/script.`, event.thread_id);
                return;
            }

            try {
                const result = this.modulesLoader.stopIntegration(module);
                if (!result.success) {
                    throw new Error('Stopping failed');
                }
                api.sendMessage($$`"${module.__descriptor.name}" has been stopped.`, event.thread_id);
            }
            catch (e) {
                console.critical(e);
                api.sendMessage($$`"${module.__descriptor.name}" failed to stop.`, event.thread_id);
            }
        },
        command: 'stop <integrationName>',
        help: $$`Stops an integration`,
        detailedHelp: $$`Stops an integration extended`
    };
};
