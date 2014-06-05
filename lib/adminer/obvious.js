(function()
{
	var
		mod_name = 'adminer.obvious',
		mod = {
			'parents':['adminer.abstract.object'],

			'storage':{
				'opts':{
					'buttons':[
						{
							'label':'adminer-save',
							'name':'save',
							'type':'submit'
						}
					]
				}
			},

			'init':function(proto) {
				var el = this.get_el().create_divs(['inner', 'heading', 'cf'], 'adminer-editor');
				el.inner.append(el.heading).append(el.cf);
			},

			'proto':{
				'method':'info',

				'construct':function(proto) {
					proto('construct_heading');
					proto('construct_info');
				},

				'loaded':function(proto, err) {
					proto('construct');
					proto('send_signal');
					this.respond('on_load', [err]);
				},
			},

			'public':{
				'get_heading':function() {
					return 'adminer-model-info-create';
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
