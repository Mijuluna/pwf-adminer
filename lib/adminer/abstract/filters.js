(function()
{
	var
		mod_name = 'adminer.abstract.filters',
		mod = {
			'storage':{
				'opts':{
					'ui_filters':[]
				}
			},

			'proto':{
				'create_filters':function(p) {
					p.storage.filter = pwf.create('form', {
						'parent':this.get_el('filter'),
						'elements':p('get_filter_elements'),
						'on_change':function(ctrl) {
							return function() {
								ctrl.respond('before_load');
								ctrl.set('page', 0);
								ctrl.load();
							};
						}(this)
					});
				},


				'get_filter_elements':function(p) {
					var
						filters = this.get('ui_filters'),
						elements = [];

					for (var i = 0; i < filters.length; i++) {
						var
							filter = filters[i],
							element,
							attr;

						if (typeof filter == 'string') {
							attr = filter;
							element = pwf.form.input_from_attr(this.get('model'), attr, {'required':false});

							if (element['type'] == 'select') {
								element['type'] = 'checkbox';
								element['multiple'] = true;
							}
						} else {
							element = filter;

							if (typeof element['label'] == 'string') {
								element['label'] = pwf.locales.trans(element['label']);
							}
						}

						elements.push(element);
					}

					return elements;
				},


				'get_filter_data':function(p) {
					var
						static = this.get('filters'),
						form   = p.storage.filter.get_data(),
						data;

					if (static !== null) {
						if (typeof static == 'object' && typeof static.length == 'undefined') {
							data = [];
							for (var key in static) {
								data.push({
									'attr':key,
									'type':'exact',
									'exact':static[key]
								});
							}
						} else {
							data = static.slice(0);
						}
					} else {
						data = [];
					}

					for (var key in form) {
						if (form[key]) {
							var filter = p('get_ui_filter_value', p.storage.filter.get_input(key), form[key]);

							if (filter !== null) {
								data.push(filter);
							}
						}
					}

					return data;
				},


				'get_ui_filter_value':function(p, input, value)
				{
					var filter;

					if (input.get('attrs')) {
						var attrs = input.get('attrs');

						filter = {
							'type':'or',
							'or':[]
						};

						for (var i = 0; i < attrs.length; i++) {
							filter.or.push(p('get_ui_filter_input_value', attrs[i], input.get('type'), value));
						}
					} else if (typeof input.get('get_filter') == 'function') {
						filter = input.respond(input.get('get_filter'));
					} else {
						filter = p('get_ui_filter_input_value', input.get('name'), input.get('type'), value);
					}

					return filter;
				},


				'get_ui_filter_input_value':function(p, attr, type, value)
				{
					var filter;

					if (value instanceof Array && value.length == 0) {
						filter = null;
					} else {
						if (type == 'text') {
							filter = {
								'attr':attr,
								'type':'icontains',
								'icontains':value
							};
						} else {
							filter = {
								'attr':attr,
								'type':'exact',
								'exact':value
							};
						}
					}

					return filter;
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
