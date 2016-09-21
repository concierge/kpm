let git = null,
    moduleList = null,

    update = function (module, api, event) {
        api.sendMessage($$`Updating "${module.name}" (${module.__version})...`, event.thread_id);
        git.pullWithPath(module.__folderPath, function (err) {
            if (err) {
                api.sendMessage($$`Update failed`, event.thread_id);
            }
            else {
                api.sendMessage($$`Restarting module "${module.name}"...`, event.thread_id);
                this.modulesLoader.unloadModule(module, this.config);

                // load new module copy
                let descriptor = this.modulesLoader.verifyModule(module.__folderPath);
                try {
                    this.modulesLoader.loadModule(descriptor, this);
                    api.sendMessage($$`"${module.name}" is now at version ${module.__version}.`, event.thread_id);
                }
                catch (e) {
                    api.sendMessage($$`Loading updated "${module.name}" failed`, event.thread_id);
                }
            }
        }.bind(this));
    };

module.exports = function (gitt, list) {
    git = gitt;
    moduleList = list;
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
