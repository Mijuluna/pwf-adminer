(function()
{
	var
		mod_name = 'adminer.list',
		mod = {
			'parents':['container', 'domel'],
			'uses':['model', 'config'],

			'storage':{
				'opts':{
					'attrs':null,
					'attrs_exclude':null
				}
			},

			'proto':{
				'rel_types':['model', 'collection']
			},

			'public':{
				'get_attrs':function(proto) {
					var
						include_def = opts['attrs'],
						include = null,
						exclude = opts['attrs_exclude'],
						mattrs  = pwf.model.get_attrs(this.get('model')),
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
								attr = pwf.jquery.extend({}, mattrs[i]),
								attr_include = include === null || include.indexOf(attr.name) >= 0,
								attr_exclude = exclude !== null && exclude.indexOf(attr.name) >= 0;

							if (name == 'edit') {
								attr_exclude = attr_exclude || ['id', 'created_at', 'updated_at'].indexOf(attr.name) >= 0;
							} else {
								attr_exclude = attr_exclude || ['id'].indexOf(attr.name) >= 0;
							}

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
								attr = pwf.jquery.extend({}, pwf.model.get_attr_def(this.get('model'), attr_name)),
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
				},

				'get_inputs':function(mode, obj) {
					var
						attrs = this.get_attrs(mode),
						inputs = [];

					for (var i = 0; i < attrs.length; i++) {
						if (typeof attrs[i].is_fake == 'undefined' || !attrs[i].is_fake) {
							inputs.push(pwf.form.input_from_attr(obj, attrs[i]));
						}
					}

					return inputs;
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