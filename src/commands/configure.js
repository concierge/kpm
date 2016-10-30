let getPropertyForString = function(searchObject, defaultProperty, searchQuery) {
    let query = searchQuery.replace(/\[([^\]]+)\]/g, '.$1');
    query = query.replace(/^\./, '');
    let properties = query.split('.'),
        parent = searchObject,
        value = searchObject[defaultProperty],
        property = defaultProperty;

    if (properties[0] === '^') {
        properties.splice(0, 1);
    }
    for (let i = 0, n = properties.length; i < n; i++) {
        for (let j = i; j < properties.length; j++) {
            let key = properties.slice(i, j + 1).join('.');
            if (key in value) {
                property = key;
                parent = value;
                value = value[key];
                i = j;
                break;
            }
            else if (j + 1 === properties.length) {
                return {
                    parent: value,
                    property: key,
                    value: void(0),
                    query: searchQuery
                };
            }
        }
    }
    return {
        parent: parent,
        property: property,
        value: value,
        query: searchQuery,
    };
};

module.exports = () => {
    return {
        run: function(args, api, event) {
            if (args.length !== 2 && args.length !== 3) {
                api.sendMessage($$`Incorrect arguments for configure.`, event.thread_id);
                return;
            }
            let cfg = this.config.loadConfig(args[0]),
                queryResult = getPropertyForString({ data: cfg }, 'data', args[1]);

            if (args.length === 3) {
                let inputData;
                try {
                    inputData = JSON.parse(args[2]);
                }
                catch(e) {
                    api.sendMessage($$`Assuming configuration value is a string not JSON.`, event.thread_id);
                    inputData = args[2];
                }

                if (queryResult.query === '^') {
                    if (typeof(inputData) !== 'object' || Array.isArray(inputData)) {
                        api.sendMessage($$`Cannot change config to a different type.`, event.thread_id);
                        return;
                    }
                    for (let key in queryResult.parent[queryResult.property]) {
                        if (queryResult.parent[queryResult.property].hasOwnProperty(key)) {
                            delete queryResult.parent[queryResult.property][key];
                        }
                    }
                    for (let key in inputData) {
                        if (inputData.hasOwnProperty(key)) {
                            queryResult.parent[queryResult.property][key] = inputData[key];
                        }
                    }
                }
                else {
                    queryResult.parent[queryResult.property] = inputData;
                }

                for (let key of Object.keys(cfg)) {
                    if (key.startsWith('ENV_') && key === key.toUpperCase()) {
                        process.env[key.substr(4)] = cfg[key];
                    }
                }
            }

            api.sendMessage(`${queryResult.query} = ${JSON.stringify(queryResult.parent[queryResult.property], null, 4)}`, event.thread_id);
        },
        command: 'config <moduleName> <query> [<newJsonValue>]',
        help: $$`Gets and sets the configuration of modules.`,
        detailedHelp: $$`Gets and sets the configuration of modules extended`
    };
};
