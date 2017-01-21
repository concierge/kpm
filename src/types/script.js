const request = require('request'),
    fs = require('fs'),
    path = require('path'),
    urll = require('url'),
    sanitize = require('sanitize-filename');

exports.install = (callback, url, dir, cleanup, api, event) => {
    api.sendMessage($$`Attempting to install script from "${url}"`, event.thread_id);
    request.get({ url: url }, (err, response, body) => {
        if (err) {
            cleanup(err, url);
            return;
        }
        const parsed = urll.parse(url),
            cleaned = sanitize(path.basename(parsed.pathname));
        fs.writeFileSync(path.join(dir, cleaned), body, 'utf8');
        fs.writeFileSync(path.join(dir, '.url'), JSON.stringify({url:url}), 'utf8');
        callback(url, dir, cleanup, api, event);
    });
};

exports.update = (callback, module, api, event) => {
    try {
        const fp = module.__descriptor.folderPath,
            urlp = path.join(fp, '.url'),
            hbp = path.join(fp, 'hubot.json'),
            urldata = JSON.parse(fs.readFileSync(urlp, 'utf8')),
            hbdata = JSON.parse(fs.readFileSync(hbp, 'utf8')),
            scr = path.join(fp, hbdata.startup);

        request.get({ url: urldata.url }, (err, response, body) => {
            if (err) {
                callback(module, api, event, err);
                return;
            }
            fs.unlinkSync(scr);
            fs.writeFileSync(scr, body, 'utf8');
            callback(module, api, event, err);
        });
    }
    catch (e) {
        callback(module, api, event, e);
    }
};

exports.typeTest = (op, url) => {
    switch (op) {
        case 'install':
            return url.startsWith('http') && (url.endsWith('.coffee') || url.endsWith('.js'));
        case 'update':
            const folderPath = selector.__descriptor.folderPath;
            return fs.statSync(path.join(folderPath, '.url')).isFile() && fs.statSync(path.join(folderPath, 'hubot.json')).isFile();
    }
};
