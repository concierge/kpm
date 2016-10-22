module.exports = () => {
    return {
        run: function(args, api, event) {
            if (args.length !== 1) {
                api.sendMessage($$`Too many arguments given to start.`, event.thread_id);
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
                this.modulesLoader.startIntegration(this.onMessage.bind(this), module);
                api.sendMessage($$`"${module.__descriptor.name}" has been started.`, event.thread_id);
            }
            catch (e) {
                console.critical(e);
                api.sendMessage($$`"${module.__descriptor.name}" failed to start.`, event.thread_id);
            }
        },
        command: 'start <integrationName>',
        help: $$`Starts an integration`,
        detailedHelp: $$`Starts an integration extended`
    };
};
