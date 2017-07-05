const npm = require('concierge/npm'),
    path = require('path'),
    files = require('concierge/files');

const copy = async(src, dst) => {
    return await files.writeFile(dst, await files.readFile(src));
};

const fixMain = async(jsonPath, property) => {
    const json = await files.readJson(jsonPath);
    json[property] = 'index.js';
    return await files.writeFile(jsonPath, JSON.stringify(json, null, 4));
};

const rebuildModule = async(pack, dir) => {
    const packageJsonPath = path.join(dir, 'package.json');
    if (await files.fileExists(packageJsonPath) === 'file') {
        await files.unlink(packageJsonPath);
    }

    await copy(path.join(dir, `node_modules/${pack}/package.json`), packageJsonPath);
    await fixMain(packageJsonPath, 'main');

    try {
        const kassyJsonPath = path.join(dir, 'kassy.json');
        if (await files.fileExists(kassyJsonPath)) {
            files.unlink(kassyJsonPath);
        }
        await copy(path.join(dir, `node_modules/${pack}/kassy.json`), kassyJsonPath);
        await fixMain(kassyJsonPath, 'startup');
    }
    catch(e) {}
};

exports.install = async(callback, url, dir, cleanup, api, event) => {
    url = url.trim().toLowerCase();
    api.sendMessage($$`Attempting to install module from "${'npm: ' + url}"`, event.thread_id);
    await npm.install(url, dir);
    await Promise.all([
        await rebuildModule(url, dir),
        await files.writeFile(path.join(dir, 'index.js'), `module.exports=require('${url}');\n`),
        await files.writeFile(path.join(dir, '.npm'), JSON.stringify({package:url}), 'utf8')
    ]);
    callback(url, dir, cleanup, api, event);
};

exports.update = async(callback, module, api, event) => {
    const p = await files.readJson(path.join(module.__descriptor.folderPath, '.npm')).package;
    await npm.update(p, module.__descriptor.folderPath);
    await rebuildModule(p, module.__descriptor.folderPath);
    callback(module, api, event);
};

const checkExists = async(name) => {
    name = name.trim().toLowerCase();
    if (/\s+/g.test(name)) {
        return false;
    }
    const rname = name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const result = await npm(['search', '--json', `/^${rname}$/`]);
    const json = JSON.parse(result);
    return !!json.find(p => p.name === name);
};

exports.typeTest = async(op, selector) => {
    switch (op) {
        case 'install':
            return await checkExists(selector);
        case 'update':
            const folderPath = selector.__descriptor.folderPath;
            return await files.fileExists(path.join(folderPath, '.npm')) === 'file';
    }
};
