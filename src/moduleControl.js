const path = require('path'),
    fs = require('fs');

/**
* Class to abstract away the concept of module and platform, such that concierge
* APIs can change with minimal interruption to KPM.
*/
class ModuleController {
    constructor(platform) {
        this.platform = platform;
    }

    static _cleanName (name) {
        return name.trim().toLowerCase();
    }

    findUnloadedModule (name) {
        if (this.findLoadedModule(name)) {
            throw new Error($$`"${name}" is already loaded.`);
        }
        const lowerName = ModuleController._cleanName(name);
        const attempts = [
            lowerName,
            `kpm_${lowerName}`,
            name.trim(),
            `kpm_${name.trim()}`
        ];
        for (let attempt of attempts) {
            try {
                const loadDir = path.join(global.__modulesPath, lowerName);
                const stats = fs.lstatSync(loadDir);
                if (stats.isDirectory()) {
                    return loadDir;
                }
            }
            catch (e) {}
        }
        throw Error($$`"${name.trim()}" failed to load - no such module.`);
    }

    findLoadedModule (arg, type) {
        const modules = this.listAllLoadedModules(type);
        let func = arg;
        if (typeof(func) !== 'function') {
            func = mod => ModuleController._cleanName(mod.__descriptor.name) === ModuleController._cleanName(arg);
        }
        return modules.find(func);
    }

    listAllLoadedModules (type) {
        return this.platform.modulesLoader.getLoadedModules(type);
    }

    async getConfig (args) {
        return await this.platform.config.loadConfig(args);
    }

    async verify (dir) {
        const result = await this.platform.modulesLoader.verifyModule(dir);
        if (!result) {
            throw new Error('Directory is not a valid module.');
        }
        return result;
    }

    async load (dir) {
        const descriptor = await this.verify(dir);
        return await this.platform.modulesLoader.loadModule(descriptor);
    }

    async unload (mod) {
        return await this.platform.modulesLoader.unloadModule(mod);
    }

    async reload (mod) {
        const shouldStart = mod.__running,
            dir = mod.__descriptor.folderPath;
        await this.unload(mod);
        const res = await this.load(dir);
        if (shouldStart) {
            this.start(res.module);
        }
        return res;
    }

    async start (mod) {
        return await this.platform.modulesLoader.startIntegration(mod);
    }

    async stop (mod) {
        return await this.platform.modulesLoader.stopIntegration(mod);
    }
}

module.exports = ModuleController;
