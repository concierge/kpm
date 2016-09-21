module.exports = function () {
    return {
        run: function(args, api, event, opts) {
            if (args.length > 1) {
                api.sendMessage($$`You can only show detailed help for one command at a time.`, event.thread_id);
                return;
            }
            let msg;
            if (args.length === 1) {
                if (!opts[args[0]] || args[0] === 'help') {
                    api.sendMessage($$`No such command to show help for.`, event.thread_id);
                    return;
                }
                msg = opts[args[0]].command + '\n--------------------\n' + opts[args[0]].detailedHelp;
                api.sendMessage(msg, event.thread_id);
            }
            else {
                msg = '';
                for (let opt in opts) {
                    if (opt === 'help') {
                        continue;
                    }
                    msg += opts[opt].command + '\n\t' + opts[opt].help + '\n';
                }
                api.sendMessage(msg, event.thread_id);
            }
        },
        command: 'help [<command>]'
    };
};
