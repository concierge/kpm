module.exports = (types, moduleList, moduleCtrl) => {
    const updateCommon = (mod, api, event, err) => {
        if (err) {
            api.sendMessage($$`Update failed`, event.thread_id);
            return;
        }

        api.sendMessage($$`Restarting module "${mod.__descriptor.name}"...`, event.thread_id);
        moduleCtrl.reload(mod)
            .then(res => api.sendMessage($$`"${res.name}" is now at version ${res.version}.`, event.thread_id))
            .catch(() => api.sendMessage($$`Loading updated "${mod.__descriptor.name}" failed`, event.thread_id));
    };

    return {
        run: (args, api, event) => {
            const updateMods = moduleList.parseRuntimeModuleList(args, 'update', api, event);
            for (let m in updateMods) {
                api.sendMessage($$`Updating "${updateMods[m].__descriptor.name}" (${updateMods[m].__descriptor.version})...`, event.thread_id);
                try {
                    types('update', updateMods[m], updateCommon, updateMods[m], api, event);
                }
                catch (e) {
                    console.critical(e);
                    api.sendMessage($$`Update failed`, event.thread_id);
                }
            }
        },
        command: 'update [<moduleName> [<moduleName> [...]]]',
        help: $$`Updates one or all modules.`,
        detailedHelp: $$`Updates one or all modules extended`
    };
};
