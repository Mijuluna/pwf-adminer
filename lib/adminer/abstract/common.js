(function()
{
	var
		mod_name = 'adminer.abstract.common',
		mod = {
			'parents':['domel', 'caller'],
			'uses':['config'],

			'storage':{
				'opts':{
					'actions':['info', 'edit', 'drop'],
					'attrs':null,
					'exclude':null
				}
			},

			'proto':{
				'rel_types':['model', 'collection'],
				'default_exclude_list':['id'],


				'el_attached':function(p) {
					p('send_signal');
				},


				'send_signal':function(p) {
					this.get_el().trigger('adminer_menu_update', {
						'method':p('method'),
						'origin':this
					});
				},


				'item_action':function(p, item, action) {
					var ref = this.get('ref');

					if (ref !== null) {
						if (typeof ref[action] == 'function') {
							ref[action](item);
						} else throw new Error('adminer-item-action:unknown-action:' + action);
					} else throw new Error('adminer-item-action:no-ref');
				},
			},

			'public':{
				'get_attrs':function(p) {
					var
						include_def = this.get('attrs'),
						include = null,
						exclude = this.get('exclude'),
						mattrs  = pwf.get_class(this.get('model')).get_attrs(),
						rattrs  = [];

					typeof include_def == 'undefined' && (include_def = null);
					typeof exclude == 'undefined' && (exclude = null);

					if (include_def !== null) {
						include = [];

						for (var i = 0; i < include_def.length; i++) {
							if (typeof include_def[i] == 'object') {
								include.push(include_def[i].name);
							} else {
								include.push(include_def[i]);
							}
						}
					}

					if (include === null) {
						/// User did not specify attribute list. Pick from all attributes, order by model definition

						for (var i = 0; i < mattrs.length; i++) {
							var
								attr = pwf.merge({}, mattrs[i]),
								attr_include = include === null || include.indexOf(attr.name) >= 0,
								attr_exclude = exclude !== null && exclude.indexOf(attr.name) >= 0;


							attr_exclude = attr_exclude || p('default_exclude_list').indexOf(attr.name) >= 0;

							if (attr_include && !attr_exclude) {
								if (include !== null) {
									var
										index = include.indexOf(attr.name),
										atd   = include_def[index];

									if (typeof atd.opts == 'object') {
										attr.input_opts = atd.opts;
									}
								}

								rattrs.push(attr);
							}
						}
					} else {
						/// User selected attributes to include.

						for (var i = 0; i < include.length; i++) {
							var
								attr_name = include[i],
								attr = pwf.merge(pwf.get_class(this.get('model')).get_attr(attr_name)),
								attr_exclude = exclude !== null && exclude.indexOf(attr_name) >= 0;

							attr_exclude = attr_exclude || ['id'].indexOf(attr_name) >= 0;

							if (attr !== null && typeof attr.name == 'string' && !attr_exclude) {
								var
									index = include.indexOf(attr.name),
									atd   = include_def[index];

								if (typeof atd.opts == 'object') {
									attr.input_opts = atd.opts;
								}

								rattrs.push(attr);
							}
						}
					}

					return rattrs;
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
