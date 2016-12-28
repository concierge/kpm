let types = null,
    moduleList = null,
    platform = null;

const updateCommon = (module, api, event, err) => {
    if (err) {
        api.sendMessage($$`Update failed`, event.thread_id);
        return;
    }

    api.sendMessage($$`Restarting module "${module.__descriptor.name}"...`, event.thread_id);
    platform.modulesLoader.unloadModule(module);

    // load new module copy
    const descriptor = platform.modulesLoader.verifyModule(module.__descriptor.folderPath);
    try {
        const result = platform.modulesLoader.loadModule(descriptor);
        if (!result.success) {
            throw new Error('Restarting module failed');
        }
        api.sendMessage($$`"${module.__descriptor.name}" is now at version ${result.module.__descriptor.version}.`, event.thread_id);
    }
    catch (e) {
        api.sendMessage($$`Loading updated "${module.__descriptor.name}" failed`, event.thread_id);
    }
};

const update = (module, api, event) => {
    api.sendMessage($$`Updating "${module.__descriptor.name}" (${module.__descriptor.version})...`, event.thread_id);
    try {
        types('update', module, updateCommon, module, api, event);
    }
    catch (e) {
        api.sendMessage($$`Update failed`, event.thread_id);
    }
};

module.exports = function (typess, list, platformp) {
    types = typess;
    moduleList = list;
    platform = platformp;
    return {
        run: function (args, api, event) {
            let updateMods = moduleList.parseRuntimeModuleList(args, 'update', api, event);
            for (let m in updateMods) {
                update.call(this, updateMods[m], api, event);
            }
        },
        command: 'update [<moduleName> [<moduleName> [...]]]',
        help: $$`Updates one or all modules.`,
        detailedHelp: $$`Updates one or all modules extended`
    };
};
