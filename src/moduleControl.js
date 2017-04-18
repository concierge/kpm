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

    getConfig (args) {
        return this.platform.config.loadConfig(args);
    }

    static _wrapResult (method) {
        return new Promise((resolve, reject) => {
            try {
                const result = method();
                if (!result.success) {
                    result.error = new Error(result.message);
                    reject(result);
                }
                else {
                    resolve(result);
                }
            }
            catch (e) {
                console.critical(e);
                reject({
                    success: false,
                    error: e
                });
            }
        });
    }

    verify (dir) {
        return new Promise((resolve) => {
            const result = this.platform.modulesLoader.verifyModule(dir);
            if (!result) {
                throw new Error('Directory is not a valid module.');
            }
            resolve(result);
        });
    }

    load (dir) {
        return this.verify(dir)
            .then(ModuleController._wrapResult(() => {
                const descriptor = this.platform.modulesLoader.verifyModule(dir);
                return this.platform.modulesLoader.loadModule(descriptor);
            }));
    }

    unload (mod) {
        return ModuleController._wrapResult(() => this.platform.modulesLoader.unloadModule(mod));
    }

    reload (mod) {
        const shouldStart = mod.__running,
            dir = mod.__descriptor.folderPath;
        return this.unload(mod)
            .then(this.load.bind(this, dir))
            .then(res => {
                if (shouldStart) {
                    mod = this.findLoadedModule(m => m.__descriptor === res, 'integration');
                    return this.start(mod)
                                .then(() => res);
                }
                return res;
            });
    }

    start (mod) {
        return ModuleController._wrapResult(() => this.platform.modulesLoader.startIntegration(this.platform.onMessage, mod));
    }

    stop (mod) {
        return ModuleController._wrapResult(() => this.platform.modulesLoader.stopIntegration(mod));
    }
}

module.exports = ModuleController;
