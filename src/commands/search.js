let moduleList = null;

module.exports = (list) => {
	moduleList = list;
	return {
		run: function(args, api, event) {
			moduleList.refreshModuleTable(null, function() {
				let query = args.join(' ').toLowerCase();
				let l = $$`Modules found for your query:`,
					mods = Object.keys(moduleList.getModuleTable());
				for (let i = 0; i < mods.length; i++) {
					if (mods[i].toLowerCase().contains(query)) {
						l += '\t- ' + mods[i] + '\n';
					}
				}
				if (mods.length === 0) {
					l += $$`No modules found in the KPM table.`;
				}
				api.sendMessage(l, event.thread_id);
			});
		},
		command: 'search [<query>]',
		help: $$`Searches the KPM table for modules.`,
		detailedHelp: $$`Searches the KPM table for modules and filters the results.`
	};
};
