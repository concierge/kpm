const deasync = require('deasync'),
    request = require('request');
let moduleList = null,
    types = null,
    opts = null;

exports.load = () => {
    moduleList = require('./src/modulelist.js')(exports.config, exports.platform, deasync, request);
    types = require('./src/types.js');
    opts = {
        'install': require('./src/commands/install.js')(types, moduleList, exports.platform),
        'uninstall': require('./src/commands/uninstall.js')(moduleList),
        'update': require('./src/commands/update.js')(types, moduleList, exports.platform),
        'list': require('./src/commands/list.js')(moduleList),
        'search': require('./src/commands/search.js')(moduleList),
        'config': require('./src/commands/configure.js')(),
        'reload': require('./src/commands/reload.js')(),
        'load': require('./src/commands/load.js')(),
        'unload': require('./src/commands/unload.js')(),
        'start': require('./src/commands/start.js')(),
        'stop': require('./src/commands/stop.js')(),
        'help': require('./src/commands/help.js')()
    };
};

exports.unload = () => {
    moduleList = null;
    opts = null;
};

exports.run = (api, event) => {
    const commands = event.arguments,
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
