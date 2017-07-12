module.exports = moduleList => {
    return {
        run: (args, api, event, opts) => {
            const search = () => {
                let install = false;
                if (args[0] === '--install') {
                    install = true;
                    args.shift();
                }

                const query = args.join(' ').toLowerCase(),
                    mods = Object.keys(moduleList.getModuleTable()),
                    fmods = mods.filter(v => v.toLowerCase().contains(query));

                if (!install) {
                    let l;
                    if (fmods.length === 0) {
                        l = $$`No modules found in the KPM table.`;
                    }
                    else {
                        l = $$`Modules found for your query:` + `\t- ${fmods.join('\n\t- ')}\n`
                    }
                    api.sendMessage(l, event.thread_id);
                }
                else {
                    opts['install'].run(fmods, api, event, opts);
                }
            };
            moduleList.refreshModuleTable().then(search);
        },
        command: 'search [--install] [<query>]',
        help: $$`Searches the KPM table for modules.`,
        detailedHelp: $$`Searches the KPM table for modules and filters the results.`
    };
};
