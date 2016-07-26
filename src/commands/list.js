let moduleList = null;

module.exports = (list) => {
	moduleList = list;
	return {
		run: function(args, api, event) {
			if (args.length > 0) {
				api.sendMessage($$`List does not take any arguments`, event.thread_id);
				return;
			}

			let l = $$`Installed KPM modules are:`,
				mods = Object.keys(moduleList.getModuleList());
			for (let i = 0; i < mods.length; i++) {
				l += '\t- ' + mods[i] + '\n';
			}
			if (mods.length === 0) {
				l += $$`No modules currently installed using KPM.`;
			}
			api.sendMessage(l, event.thread_id);
		},
		command: 'list',
		help: $$`Lists all installed modules (except preinstalled ones).`,
		detailedHelp: $$`Lists all modules that have been installed using KPM.`
	};
};
