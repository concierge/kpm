const rmdir = require('rimraf');

module.exports = (modulesList, moduleCtrl) => {
    const uninstall = (mod, api, event, preserveSelf) => {
        if (mod.__descriptor.name === 'kpm' && preserveSelf) {
            return api.sendMessage($$`Uninstall Self`, event.thread_id);
        }
        api.sendMessage($$`Unloading module "${mod.__descriptor.name}".`, event.thread_id);

        moduleCtrl.unload(mod)
            .then(() => {
                rmdir(mod.__descriptor.folderPath, error => {
                    if (error) {
                        LOG.debug(error);
                        api.sendMessage($$`Failed to delete module "${mod.__descriptor.name}".`, event.thread_id);
                    }
                    else {
                        api.sendMessage($$`Uninstalled module "${mod.__descriptor.name}".`, event.thread_id);
                    }
                });
            })
            .catch(() => api.sendMessage($$`"${mod.__descriptor.name}" failed to unload.`, event.thread_id));
    };

    return {
        run: (args, api, event) => {
            const ind = args.indexOf('--no-preserve-kpm');
            if (ind >= 0) {
                args.splice(ind, 1);
            }
            const uninstallMods = modulesList.parseRuntimeModuleList(args, 'uninstall', api, event);
            for (let m in uninstallMods) {
                uninstall(uninstallMods[m], api, event, ind < 0);
            }
        },
        command: 'uninstall [<moduleName> [<moduleName> [...]]]',
        help: $$`Uninstalls one or more modules.`,
        detailedHelp: $$`Uninstalls one or more modules extended`
    };
};
