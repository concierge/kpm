const urll = require('url'),
    sanitize = require('sanitize-filename'),
    tmp = require('tmp'),
    fs = require('fs-extra'),
    path = require('path');
let types = null,
    moduleTable = null,
    platform = null,

    installCommon = (url, moduleLocation, cleanup, api, event) => {
        try {
            const parsed = urll.parse(url),
                cleaned = sanitize(path.basename(parsed.pathname)),
                descriptor = platform.modulesLoader.verifyModule(moduleLocation),
                moduleList = moduleTable.getModuleList();

            if (!descriptor) {
                api.sendMessage($$`"${name}" is not a valid module/script.`, event.thread_id);
                cleanup();
                return;
            }

            if (moduleList[descriptor.name] || moduleList['kpm_' + descriptor.name]) {
                api.sendMessage($$`A module with name or directory "${descriptor.name}" has already been installed.`, event.thread_id);
                cleanup();
                return;
            }

            descriptor.safeName = sanitize(descriptor.name);
            const instDir = path.resolve('./modules/kpm_' + descriptor.safeName);
            fs.copy(moduleLocation, instDir, (err => {
                if (err) {
                    console.debug(err);
                    api.sendMessage($$`An unknown error occurred while installing "${descriptor.name}".`, event.thread_id);
                    cleanup();
                    return;
                }

                descriptor.folderPath = instDir;
                const m = platform.modulesLoader.loadModule(descriptor);
                if (m.success) {
                    api.sendMessage($$`"${descriptor.name}" (${descriptor.version}) is now installed.`, event.thread_id);
                }
                else {
                    api.sendMessage($$`"${descriptor.name}" (${descriptor.version}) could not be installed, it appears to be invalid (syntax error?).`, event.thread_id);
                    fs.emptyDir(descriptor.folderPath, () => {
                        // just delete if we can, not a lot we can do about errors here.
                    });
                }
                cleanup();
            }));
        }
        catch (e) {
            console.critical(e);
            api.sendMessage($$`Could not install "${name}".`, event.thread_id);
            cleanup();
        }
    };

module.exports = function (typess, list, platformp) {
    types = typess;
    moduleTable = list;
    platform = platformp;
    return {
        run: function(args, api, event) {
            if (args.length === 0) {
                api.sendMessage($$`Nothing provided to install!`, event.thread_id);
                return;
            }

            for (let i = 0; i < args.length; i++) {
                let url = args[i],
                    spl = url.split('/');
                if (spl.length === 1) {
                    moduleTable.refreshModuleTable(url, function(u, err) {
                        if (err || !moduleTable.getModuleTable()[u]) {
                            return;
                        }
                        url = moduleTable.getModuleTable()[u];
                    }.bind(this));
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
                        failed(err, url);
                        return;
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
                        types('install', url, installCommon, url, dir, cleanup, api, event);
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
