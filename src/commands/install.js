const urll = require('url'),
    sanitize = require('sanitize-filename'),
    tmp = require('tmp'),
    fs = require('fs-extra'),
    path = require('path');

module.exports = (types, moduleTable, moduleCtrl) => {
    const installFinal = (moduleLocation, cleanup, api, event, descriptor) => {
        const moduleList = moduleTable.getModuleList();
        try {
            if (moduleList[descriptor.name] || moduleList[`kpm_${descriptor.name}`]) {
                api.sendMessage($$`A module with name or directory "${descriptor.name}" has already been installed.`, event.thread_id);
                return cleanup();
            }

            descriptor.safeName = sanitize(descriptor.name);
            const instDir = path.join(global.__modulesPath, descriptor.safeName);
            fs.move(moduleLocation, instDir, (err => {
                if (err) {
                    console.debug(err);
                    api.sendMessage($$`An unknown error occurred while installing "${descriptor.name}".`, event.thread_id);
                    cleanup();
                    return;
                }

                descriptor.folderPath = instDir;
                moduleCtrl.load(descriptor.folderPath)
                    .then(() => api.sendMessage($$`"${descriptor.name}" (${descriptor.version}) is now installed.`, event.thread_id))
                    .catch(() => {
                        api.sendMessage($$`"${descriptor.name}" (${descriptor.version}) could not be installed, it appears to be invalid (syntax error?).`, event.thread_id);
                        fs.emptyDir(descriptor.folderPath, () => fs.rmdir(descriptor.folderPath, () => {}));
                    });
                cleanup();
            }));
        }
        catch (e) {
            console.critical(e);
            api.sendMessage($$`Could not install "${name}".`, event.thread_id);
            cleanup();
        }
    };

    return {
        run: (args, api, event) => {
            if (args.length === 0) {
                return api.sendMessage($$`Nothing provided to install!`, event.thread_id);
            }

            for (let i = 0; i < args.length; i++) {
                let url = args[i],
                    spl = url.split('/');
                if (spl.length === 1) {
                    moduleTable.refreshModuleTable(url, (u, err) => {
                        if (err || !moduleTable.getModuleTable()[u]) {
                            return;
                        }
                        url = moduleTable.getModuleTable()[u];
                    });
                }
                else if (!url.startsWith('ssh') && !url.startsWith('http')) {
                    if (spl.length === 2) {
                        url = 'https://github.com/' + url.trim() + '.git';
                    }
                    else {
                        api.sendMessage($$`Invalid KPM module provided "${url}"`, event.thread_id);
                        continue;
                    }
                }

                const failed = (err, url) => {
                    api.sendMessage($$`Failed to install module from "${url}"`, event.thread_id);
                    console.critical(err);
                };

                tmp.dir((err, dir, cleanupCallback) => {
                    if (err) {
                        return failed(err, url);
                    }
                    const cleanup = (f, url) => {
                        fs.emptyDir(dir, () => {
                            cleanupCallback(); // not a lot we can do about errors here.
                        });
                        if (f) {
                            failed(f, url);
                        }
                    };

                    try {
                        types('install', url, (url, moduleLocation, cleanup, api, event) => {
                            moduleCtrl.verify(moduleLocation)
                                .then(installFinal.bind(this, moduleLocation, cleanup, api, event))
                                .catch(() => {
                                    api.sendMessage($$`"${url}" is not a valid module/script.`, event.thread_id);
                                    return cleanup();
                                });
                        }, url, dir, cleanup, api, event);
                    }
                    catch (e) {
                        api.sendMessage($$`Invalid KPM module provided "${url}"`, event.thread_id);
                        console.critical(e);
                    }
                });
            }
        },
        command: 'install <url|ref> [<url|ref> [<url|ref> [...]]]',
        help: $$`Installs one or more modules from exising git repositories or github references.`,
        detailedHelp: $$`Installs one or more modules from existing git repositories or github references if ones of the same name do not already exist.`
    };
};
