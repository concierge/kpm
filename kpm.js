let git = require.once(rootPathJoin('core/git.js')),
    deasync = require('deasync'),
    request = require('request'),
    moduleList = null,
    opts = null;

exports.load = () => {
    moduleList = require.once('./src/modulelist.js')(exports.config, exports.platform, deasync, request);
    opts = {
        'install': require.once('./src/commands/install.js')(git, moduleList, request),
        'uninstall': require.once('./src/commands/uninstall.js')(moduleList),
        'update': require.once('./src/commands/update.js')(git, moduleList),
        'list': require.once('./src/commands/list.js')(moduleList),
        'search': require.once('./src/commands/search.js')(moduleList),
        'config': require.once('./src/commands/configure.js')(),
        'reload': require.once('./src/commands/reload.js')(),
        'load': require.once('./src/commands/load.js')(),
        'unload': require.once('./src/commands/unload.js')(),
        'help': require.once('./src/commands/help.js')()
    };
};

exports.unload = () => {
    moduleList = null;
    opts = null;
};

exports.run = (api, event) => {
    let commands = event.arguments,
        command = commands.length >= 2 ? commands[1].toLowerCase() : null;
    if (command === null || !opts[command]) {
        let t = $$`Invalid usage of KPM`;
        for (let opt in opts) {
            t += '\t- ' + opts[opt].command + '\n';
        }
        api.sendMessage(t, event.thread_id);
        return false;
    }

    commands.splice(0, 2);
    opts[command].run.call(exports.platform, commands, api, event, opts);

    return true;
};
