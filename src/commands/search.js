let moduleList = null;

module.exports = (list) => {
	moduleList = list;
	return {
		run: function(args, api, event, opts) {
			moduleList.refreshModuleTable(null, function() {
				let install = false;
				if (args[0] === '--install') {
					install = true;
					args.shift();
				}

				let query = args.join(' ').toLowerCase(),
					mods = Object.keys(moduleList.getModuleTable()),
					fmods = mods.filter((v) => v.toLowerCase().contains(query));

				if (!install) {
					let l = $$`Modules found for your query:`;
					l += '\t- ' + fmods.join('\n\t- ') + '\n';
					if (fmods.length === 0) {
						l += $$`No modules found in the KPM table.`;
					}
					api.sendMessage(l, event.thread_id);
				}
				else {
					opts['install'].run.call(this, fmods, api, event, opts);
				}
			}.bind(this));
		},
		command: 'search [--install] [<query>]',
		help: $$`Searches the KPM table for modules.`,
		detailedHelp: $$`Searches the KPM table for modules and filters the results.`
	};
};
