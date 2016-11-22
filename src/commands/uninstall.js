let modulesList = null,
    rmdir = require('rimraf'),

    uninstall = function(module, api, event) {
        api.sendMessage($$`Unloading module "${module.__descriptor.name}".`, event.thread_id);
        // unload the current version
        const result = this.modulesLoader.unloadModule(module, this.config);
        if (!result.success) {
            api.sendMessage($$`"${module.__descriptor.name}" failed to unload.`, event.thread_id);
            return;
        }

        rmdir(module.__descriptor.folderPath, function (error) {
            if (error) {
                console.debug(error);
                api.sendMessage($$`Failed to delete module "${module.__descriptor.name}".`, event.thread_id);
            }
            else {
                api.sendMessage($$`Uninstalled module "${module.__descriptor.name}".`, event.thread_id);
            }
        });
    };

module.exports = function (list) {
    modulesList = list;
    return {
        run: function(args, api, event) {
            let uninstallMods = modulesList.parseRuntimeModuleList(args, 'uninstall', api, event);
            for (let m in uninstallMods) {
                uninstall.call(this, uninstallMods[m], api, event);
            }
        },
        command: 'uninstall [<moduleName> [<moduleName> [...]]]',
        help: $$`Uninstalls one or more modules.`,
        detailedHelp: $$`Uninstalls one or more modules extended`
    };
};
