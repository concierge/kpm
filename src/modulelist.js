const deasync = require('deasync'),
    request = require('request');

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

    const refreshModuleTable = (url, callback) => {
    	if (moduleTable.lastUpdated != null && new Date() - moduleTable.lastUpdated < moduleTableUpdateTimeout) {
    		return callback(url);
    	}

    	let sreq = deasync(request.get);
    	let response = sreq(moduleTableUrl);
    	if (response.statusCode === 200 && response.body) {
    		let b = response.body;
    		if (b && b.length > 0) {
    			let spl = b.split('\n'),
    				shouldParse = false,
    				foundModules = {};
    			for (let i = 0; i < spl.length; i++) {
    				if (!spl[i].startsWith('|')) {
    					continue;
    				}

    				let items = spl[i].split('|');
    				if (items.length !== 4) {
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
    		callback(url);
    	}
    	else {
    		callback(url, $$`Could not update the list of KPM entries. Module entries may not be up to date.`);
    	}
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
