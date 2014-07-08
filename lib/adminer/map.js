(function()
{
	var
		mod_name = 'adminer.map',
		mod = {
			'parents':['container'],

			'storage':{
				'opts':{
					'list':{
						'cname':'adminer.list',
						'declination':'dative-plural'
					},
					'create':{
						'cname':'adminer.editor',
						'declination':'accusative'
					},
					'edit':{
						'object':true,
						'cname':'adminer.editor',
						'declination':'accusative'
					},
					'info':{
						'object':true,
						'cname':'adminer.obvious',
						'declination':'accusative'
					},
					'drop':{
						'object':true,
						'cname':'adminer.destroyer',
						'declination':'accusative'
					}
				}
			},


			'public':{
				'remap':function(proto, mod, data) {
					return this.set(mod, pwf.merge(true, this.get(mod), data));
				}
			}
		};

	/// Register, because we have existing pwf
	if (typeof pwf == 'object') {
		pwf.rc(mod_name, mod);
	}

	/// Export module because we may be inside nodejs.
	if (typeof module == 'object') {
		module.exports = mod;
	}
})();

