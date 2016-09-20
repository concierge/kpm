let urll = require('url'),
    sanitize = require('sanitize-filename'),
    tmp = require('tmp'),
    fs = require('fs-extra'),
    path = require('path'),
    request = null,
    git = null,
    moduleTable = null,

    installCommon = function (name, moduleLocation, cleanup, api, event) {
        try {
            let descriptor = this.modulesLoader.verifyModule(moduleLocation),
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
            let instDir = path.resolve('./modules/kpm_' + descriptor.safeName);
            fs.copy(moduleLocation, instDir, function (err) {
                if (err) {
                    console.debug(err);
                    api.sendMessage($$`An unknown error occurred while installing "${descriptor.name}".`, event.thread_id);
                    cleanup();
                    return;
                }

                descriptor.folderPath = instDir;
                let m = this.modulesLoader.loadModule(descriptor, this);
                if (m !== null) {
                    api.sendMessage($$`"${descriptor.name}" (${descriptor.version}) is now installed.`, event.thread_id);
                }
                else {
                    api.sendMessage($$`"${descriptor.name}" (${descriptor.version}) could not be installed, it appears to be invalid (syntax error?).`, event.thread_id);
                    fs.emptyDir(descriptor.folderPath, function () {
                        // just delete if we can, not a lot we can do about errors here.
                    });
                }
                cleanup();
            }.bind(this));
        }
        catch (e) {
            console.critical(e);
            api.sendMessage($$`Could not install "${name}".`, event.thread_id);
            cleanup();
        }
    },

    gitInstall = function(url, api, event) {
        api.sendMessage($$`Attempting to install module from "${url}"`, event.thread_id);
        tmp.dir(function (err, dir, cleanupCallback) {
            if (err) {
                throw err;
            }
            let cleanup = function(){
                fs.emptyDir(dir, function () {
                    cleanupCallback(); // not a lot we can do about errors here.
                });
            }.bind(this);

            git.clone(url, dir, function (err1) {
                if (err1) {
                    console.critical(err1);
                    cleanup();
                    return api.sendMessage($$`Failed to install module from "${url}"`, event.thread_id);
                }
                let parsed = urll.parse(url),
                    cleaned = sanitize(path.basename(parsed.pathname));
                return installCommon.call(this, cleaned, dir, cleanup, api, event);
            }.bind(this));
        }.bind(this));
    },

    scriptInstall = function (url, api, event) {
        api.sendMessage($$`Attempting to install script from "${url}"`, event.thread_id);
        tmp.dir(function(err, dir, cleanupCallback) {
            if (err) {
                throw err;
            }
            let cleanup = function() {
                fs.emptyDir(dir, function() {
                    cleanupCallback(); // not a lot we can do about errors here.
                });
            }.bind(this);

            let parsed = urll.parse(url),
                cleaned = sanitize(path.basename(parsed.pathname));
            request.get({ url: url }, function(error, response, body) {
                if (err) {
                    console.critical(err);
                    cleanup();
                    return api.sendMessage($$`Failed to install "${cleaned}"`, event.thread_id);
                }

                fs.writeFileSync(path.join(dir, cleaned), body, 'utf8');
                return installCommon.call(this, cleaned, dir, cleanup, api, event);
            }.bind(this));
        }.bind(this));
    };

module.exports = function (gitt, list, requests) {
    git = gitt;
    moduleTable = list;
    request = requests;
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

                if (url.startsWith('ssh') || url.endsWith('.git')) {
                    gitInstall.call(this, url, api, event);
                }
                else if (url.startsWith('http') && (url.endsWith('.coffee') || url.endsWith('.js'))) {
                    scriptInstall.call(this, url, api, event);
                }
                else {
                    api.sendMessage($$`Invalid KPM module provided "${url}"`, event.thread_id);
                }
            }
        },
        command: 'install <url|ref> [<url|ref> [<url|ref> [...]]]',
        help: $$`Installs one or more modules from exising git repositories or github references.`,
        detailedHelp: $$`Installs one or more modules from existing git repositories or github references if ones of the same name do not already exist.`
    };
};
