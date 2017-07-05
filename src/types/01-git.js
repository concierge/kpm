const path = require('path'),
    git = require('concierge/git'),
    npm = require('concierge/npm'),
    files = require('concierge/files');

exports.install = async(callback, url, dir, cleanup, api, event) => {
    api.sendMessage($$`Attempting to install module from "${url}"`, event.thread_id);
    try {
        await git.clone(url, dir);
        if (await files.fileExists(path.join(dir, 'package.json')) === 'file') {
            await npm(['install'], dir);
        }
    }
    catch (e) {
        return cleanup(e, url);
    }
    callback(url, dir, cleanup, api, event);
};

exports.update = async(callback, module, api, event) => {
    await git.pullWithPath(module.__descriptor.folderPath);
    const nodeModules = path.join(module.__descriptor.folderPath, 'node_modules'),
        hubotJson = path.join(module.__descriptor.folderPath, 'hubot.json');
    if (await files.fileExists(nodeModules) === 'directory') {
        await npm(['update'], module.__descriptor.folderPath);
    }
    if (await files.fileExists(hubotJson)) {
        await files.unlink(hubotJson);
    }
    callback(module, api, event, err);
};

exports.typeTest = async(op, selector) => {
    switch (op) {
        case 'install':
            return selector.startsWith('ssh') || selector.endsWith('.git');
        case 'update':
            const folderPath = selector.__descriptor.folderPath;
            return await files.fileExists(path.join(folderPath, '.git')) === 'directory';
    }
};
