module.exports = moduleList => {
    return {
        run: (args, api, event) => {
            if (args.length > 0) {
                return api.sendMessage($$`List does not take any arguments`, event.thread_id);
            }

            const l = $$`Installed KPM modules are:`;
            let mods = Object.keys(moduleList.getModuleList()).map(m => `\t- ${m}`).join('\n');
            if (!mods) {
                mods = $$`No modules currently installed using KPM.`;
            }
            api.sendMessage(l + mods, event.thread_id);
        },
        command: 'list',
        help: $$`Lists all installed modules (except preinstalled ones).`,
        detailedHelp: $$`Lists all modules that have been installed using KPM.`
    };
};
