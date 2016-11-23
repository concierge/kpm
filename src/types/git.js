const fs = require('fs'),
    path = require('path'),
    git = require('concierge/git');

exports.install = (callback, url, dir, cleanup, api, event) => {
    api.sendMessage($$`Attempting to install module from "${url}"`, event.thread_id);
    git.clone(url, dir, (err) => {
        if (err) {
            cleanup(err, url);
            return;
        }
        callback(url, dir, cleanup, api, event);
    });
};

exports.update = (callback, module, api, event) => {
    git.pullWithPath(module.__descriptor.folderPath, (err) => {
        try {
            // force hubot.json to update
            const hbp = path.join(module.__descriptor.folderPath, 'hubot.json');
            fs.unlinkSync(hbp);
        } catch(e) {}
        callback(module, api, event, err);
    });
};

exports.typeTest = (op, selector) => {
    switch (op) {
        case 'install':
            return selector.startsWith('ssh') || selector.endsWith('.git');
        case 'update':
            const folderPath = selector.__descriptor.folderPath;
            return fs.statSync(path.join(folderPath, '.git')).isDirectory();
    }
};
