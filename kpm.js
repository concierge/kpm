let moduleList = null,
    types = null,
    opts = null,
    ctrl = null;

exports.load = platform => {
    ctrl = new (require('./src/moduleControl.js'))(platform);
    moduleList = require('./src/moduleList.js')(exports.config, ctrl);
    types = require('./src/types.js');
    opts = {
        'install': require('./src/commands/install.js')(types, moduleList, ctrl),
        'uninstall': require('./src/commands/uninstall.js')(moduleList, ctrl),
        'update': require('./src/commands/update.js')(types, moduleList, ctrl),
        'list': require('./src/commands/list.js')(moduleList),
        'search': require('./src/commands/search.js')(moduleList),
        'config': require('./src/commands/configure.js')(ctrl),
        'reload': require('./src/commands/reload.js')(ctrl),
        'load': require('./src/commands/load.js')(ctrl),
        'unload': require('./src/commands/unload.js')(ctrl),
        'start': require('./src/commands/start.js')(ctrl),
        'stop': require('./src/commands/stop.js')(ctrl),
        'help': require('./src/commands/help.js')()
    };
};

exports.unload = () => {
    moduleList = null;
    opts = null;
    ctrl = null;
    types = null;
};

exports.run = (api, event) => {
    const commands = event.arguments,
        command = commands.length >= 2 ? commands[1].toLowerCase() : null;
    if (command === null || !opts[command]) {
        const t = $$`Invalid usage of KPM` + Object.keys(opts).map(o => `\t- ${opts[o].command}`).join('\n');
        api.sendMessage(t, event.thread_id);
        return false;
    }

    commands.splice(0, 2);
    opts[command].run(commands, api, event, opts);

    return true;
};
