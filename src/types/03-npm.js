const npm = require('concierge/npm'),
    path = require('path'),
    fs = require('fs-extra');

const fixMain = (jsonPath, property) => {
    const json = JSON.parse(fs.readFileSync(jsonPath).toString());
    json[property] = 'index.js';
    fs.writeFileSync(jsonPath, JSON.stringify(json, null, 4));
};

const rebuildModule = (pack, dir) => {
    const packageJsonPath = path.join(dir, 'package.json');
    try {
        fs.unlinkSync(packageJsonPath);
    }
    catch(e) {}
    fs.copySync(path.join(dir, `node_modules/${pack}/package.json`), packageJsonPath);
    fixMain(packageJsonPath, 'main');

    try {
        const kassyJsonPath = path.join(dir, 'kassy.json');
        try {
            fs.unlinkSync(kassyJsonPath);
        }
        catch(e) {}
        fs.copySync(path.join(dir, `node_modules/${pack}/kassy.json`), kassyJsonPath);
        fixMain(kassyJsonPath, 'startup');
    }
    catch(e) {}
};

exports.install = (callback, url, dir, cleanup, api, event) => {
    url = url.trim().toLowerCase();
    api.sendMessage($$`Attempting to install module from "${'npm: ' + url}"`, event.thread_id);
    npm.install(url, dir);
    rebuildModule(url, dir);
    fs.writeFileSync(path.join(dir, 'index.js'), `module.exports=require('${url}');\n`);
    fs.writeFileSync(path.join(dir, '.npm'), JSON.stringify({package:url}), 'utf8');
    callback(url, dir, cleanup, api, event);
};

exports.update = (callback, module, api, event) => {
    const p = JSON.parse(fs.readFileSync(path.join(module.__descriptor.folderPath, '.npm')).toString()).package;
    npm.update(p, module.__descriptor.folderPath);
    rebuildModule(p, module.__descriptor.folderPath);
    callback(module, api, event);
};

const checkExists = name => {
    name = name.trim().toLowerCase();
    if (/\s+/g.test(name)) {
        return false;
    }
    const rname = name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const result = npm(['search', '--json', `/^${rname}$/`]);
    const json = JSON.parse(result);
    return !!json.find(p => p.name === name);
};

exports.typeTest = (op, selector) => {
    switch (op) {
        case 'install':
            return checkExists(selector);
        case 'update':
            const folderPath = selector.__descriptor.folderPath;
            return fs.statSync(path.join(folderPath, '.npm')).isFile();
    }
};
