const request = require('request');

module.exports = (config, moduleCtrl) => {
    let moduleTableUrl = null,
    	moduleTableUpdateTimeout = null,
    	moduleTable = {
    		lastUpdated: null,
    		modules: {}
    	};

    const getModuleTable = () => moduleTable.modules;

    const getModuleList = () => {
        const list = {};
        moduleCtrl.listAllLoadedModules().forEach(m => list[m.__descriptor.name] = m);
        return list;
    };

    const isModuleName = name => !!getModuleList()[name];

    const parseRuntimeModuleList = (args, cmd, api, event) => {
    	let updateMods = getModuleList();
    	if (args.length > 0) {
    		let m = {};
    		for (let i = 0; i < args.length; i++) {
    			if (!isModuleName(args[i])) {
    				api.sendMessage($$`"${args[i]}" is not an installed module.`, event.thread_id);
    				return null;
    			}
    			m[args[i]] = updateMods[args[i]];
    		}
    		updateMods = m;
    	}
    	if (Object.keys(updateMods).length === 0) {
    		api.sendMessage($$`No modules are installed to ${cmd}.`, event.thread_id);
    		return null;
    	}
    	return updateMods;
    };

    const refreshModuleTable = () => {
        return new Promise(resolve => {
            if (moduleTable.lastUpdated !== null && new Date() - moduleTable.lastUpdated < moduleTableUpdateTimeout) {
        		return resolve();
        	}

            request.get(moduleTableUrl, (err, response) => {
                if (err) {
                    return resolve(err);
                }
                if (response.statusCode === 200 && response.body) {
            		const b = response.body;
            		if (b && b.length > 0) {
            			const spl = b.split('\n'),
                            foundModules = {};
            			let shouldParse = false;
            			for (let i = 0; i < spl.length; i++) {
            				if (!spl[i].startsWith('|')) {
            					continue;
            				}

            				const items = spl[i].split('|');
            				if (items.length < 4) {
            					continue;
            				}
            				if (!shouldParse) {
            					if (items[1] === '---' && items[2] === '---') {
            						shouldParse = true;
            					}
            					continue;
            				}
            				foundModules[items[1]] = items[2];
            			}
            			moduleTable.modules = foundModules;
            			moduleTable.lastUpdated = new Date();
            		}
            		resolve();
            	}
            	else {
            		resolve($$`Could not update the list of KPM entries. Module entries may not be up to date.`);
            	}
            });
        });
    };

    if (!config.hasOwnProperty('tableUrl')) {
        config.tableUrl = 'https://raw.githubusercontent.com/wiki/concierge/Concierge/KPM-Table.md';
    }
	moduleTableUrl = config.tableUrl;

	if (!config.hasOwnProperty('tableUpdateTimeout')) {
        config.tableUpdateTimeout = 3600000;
    }
	moduleTableUpdateTimeout = config.tableUpdateTimeout;

	return {
		getModuleList: getModuleList,
		parseRuntimeModuleList: parseRuntimeModuleList,
		getModuleTable: getModuleTable,
		refreshModuleTable: refreshModuleTable
	};
};
