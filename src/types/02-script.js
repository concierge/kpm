const request = require('request'),
    files = require('concierge/files'),
    path = require('path'),
    urll = require('url'),
    sanitize = require('sanitize-filename')
    util = require('util'),
    requestp = util.promisify(request.get);

exports.install = async(callback, url, dir, cleanup, api, event) => {
    api.sendMessage($$`Attempting to install script from "${url}"`, event.thread_id);
    try {
        const response = await requestp({ url: url}),
            parsed = urll.parse(url),
            cleaned = sanitize(path.basename(parsed.pathname));
        await Promise.all([
            files.writeFile(path.join(dir, cleaned), body, 'utf8'),
            files.writeFile(path.join(dir, '.url'), JSON.stringify({url:url}), 'utf8')
        ]);
    }
    catch (err) {
        return cleanup(err, url);
    }
    callback(url, dir, cleanup, api, event);
};

exports.update = async(callback, module, api, event) => {
    try {
        const fp = module.__descriptor.folderPath,
            urlp = path.join(fp, '.url'),
            hbp = path.join(fp, 'hubot.json'),
            urldata = await files.readJson(urlp),
            hbdata = await files.readJson(hbp),
            scr = path.join(fp, hbdata.startup);

        const response = await requestp({ url: urldata.url });
        await files.unlink(scr);
        await files.writeFile(scr, body, 'utf8');
        callback(module, api, event);
    }
    catch (e) {
        callback(module, api, event, e);
    }
};

exports.typeTest = async(op, url) => {
    switch (op) {
        case 'install':
            return url.startsWith('http') && (url.endsWith('.coffee') || url.endsWith('.js'));
        case 'update':
            const folderPath = url.__descriptor.folderPath;
            return await files.fileExists(path.join(folderPath, '.url')) === 'file' &&
                files.fileExists(path.join(folderPath, 'hubot.json')) === 'file';
    }
};
