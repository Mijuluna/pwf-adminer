(function()
{
	var
		mod_name = 'adminer.list',
		mod = {
			'parents':['model.list', 'adminer.abstract.common'],

			'storage':{
				'filter':null,
				'opts':{
					'heading':null,
					'ui_filters':[]
				}
			},

			'init':function(proto) {
				var url = pwf.config.get('models.url.browse');
				this.set('url', url.replace('{model}', this.get('model')));
			},

			'proto':{
				'method':'list',
				'pagi_dest':['top', 'bottom'],


				'el_attached':function(proto) {
					proto('send_signal');
					proto('construct');
				},


				'construct':function(proto) {
					proto('create_base');
					proto('create_heading');
					proto('create_container');
					proto('create_head');
					proto('create_filters');
					proto('create_pagi');
				},

				'create_base':function(proto) {
					var el = this.get_el();

					el.create_divs(['marginer', 'inner', 'header', 'filter', 'pagi_top', 'content', 'pagi_bottom']);
					el.marginer.append(el.inner);
					el.inner
						.append(el.header)
						.append(el.filter)
						.append(el.pagi_top)
						.append(el.content)
						.append(el.pagi_bottom);
				},


				'create_heading':function() {
					var
						el = this.get_el('header'),
						str = this.get('heading');

					if (str === null) {
						str = 'adminer-model-list';
					}

					str = pwf.locales.trans(str, {'model_name':pwf.locales.trans_model(this.get('model'), 'dative-plural').text()});

					el.heading = pwf.jquery.div('heading').html(str);
					el.html(el.heading);
				},


				'create_container':function(proto) {
					var el = this.get_el();

					el.content.create_divs(['inner'], 'content');
					el.table = pwf.jquery('<table cellspacing="0" cellpadding="0"/>');
					el.table.addClass('adminer-table');
					el.table.head = pwf.jquery('<thead/>');
					el.table.body = pwf.jquery('<tbody/>');

					el.table
						.append(el.table.head)
						.append(el.table.body)
						.appendTo(el.content.inner);
				},

				'create_head':function(proto) {
					var
						el = this.get_el(),
						attrs = this.get_attrs();

					el.table.head.tr = pwf.jquery('<tr/>');
					el.table.head.append(el.table.head.tr);

					for (var i = 0; i < attrs.length; i++) {
						var th = pwf.jquery('<th/>').addClass('attr-' + attrs[i].name);

						th.html(pwf.locales.trans_attr(this.get('model'), attrs[i].name));
						el.table.head.tr.append(th);
					}

					el.table.head.tr.append(pwf.jquery('<th/>').addClass('actions'));
				},


				'create_filters':function(proto) {
					proto.storage.filter = pwf.create('form', {
						'parent':this.get_el('filter'),
						'elements':proto('get_filter_elements'),
						'on_change':function(ctrl) {
							return function() {
								ctrl.respond('before_load');
								ctrl.load();
							};
						}(this)
					});
				},


				'create_pagi':function(proto) {
					var dest = proto('pagi_dest');

					for (var i = 0; i < dest.length; i++) {
						var el = this.get_el('pagi_' + dest[i]);

						el.pagi = pwf.create('paginator', {
							'parent':el,
							'page':this.get('page'),
							'per_page':this.get('per_page'),
							'total':this.get_total(),
							'on_change':function() {
								this.get_el().trigger('paginator-change', this);
							}
						});
					}

					this.get_el().bind('paginator-change', this, proto('callbacks').page_change);
				},


				'update_pagi':function(proto) {
					var dest = proto('pagi_dest');

					for (var i = 0; i < dest.length; i++) {
						var el = this.get_el('pagi_' + dest[i]);

						el.pagi.update({
							'page':this.get('page'),
							'per_page':this.get('per_page'),
							'total':this.get_total()
						}).update_status();
					}
				},


				'get_filter_elements':function(proto) {
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
						}

						elements.push(element);
					}

					return elements;
				},


				'get_filter_data':function(proto) {
					var
						static = this.get('filters'),
						form   = proto.storage.filter.get_data(),
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
							data.push(proto('get_ui_filter_value', proto.storage.filter.get_input(key), form[key]));
						}
					}

					return data;
				},


				'get_ui_filter_value':function(proto, input, value)
				{
					var filter;

					if (input.get('attrs')) {
						var attrs = input.get('attrs');

						filter = {
							'type':'or',
							'or':[]
						};

						for (var i = 0; i < attrs.length; i++) {
							filter.or.push(proto('get_ui_filter_input_value', attrs[i], input.get('type'), value));
						}
					} else {
						filter = proto('get_ui_filter_input_value', input.get('name'), input.get('type'), value);
					}

					return filter;
				},


				'get_ui_filter_input_value':function(proto, attr, type, value)
				{
					var filter;

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

					return filter;
				},



				'loaded':function(proto) {
					proto('redraw');
					proto('update_pagi');

					this.respond('on_load');
				},

				'redraw':function() {
					var
						el = this.get_el(),
						list = this.get_data();

					el.table.body.html('');

					for (var i = 0; i < list.data.length; i++) {
						var tr = this.create_item(list.data[i]);

						el.table.body.append(tr);
						tr.addClass((i%2) ? 'even':'odd');
					}
				},

				'create_item_actions':function(proto, item, tr) {
					var
						tda = pwf.jquery('<td/>').addClass('actions'),
						actions = this.get('actions');

					if (actions !== null) {
						for (var i = 0; i < actions.length; i++) {
							tda.append(proto('create_item_action', item, tr, actions[i]));
						}
					}

					tr.append(tda);
				},

				'create_item_action':function(proto, item, tr, action) {
					return pwf.jquery.icon(action, '16x16')
						.bind('click', {'proto':proto, 'item':item, 'action':action}, proto('callbacks').item_action);
				},

				'item_action':function(proto, item, action) {
					if (proto.type('item_action_' + action) == 'function') {
						proto('item_action_' + action, item);
					} else {
						this.get_el().trigger('adminer_item_action_' + action, {
							'action':action,
							'origin':this,
							'item':item
						});
					}
				},

				'callbacks':{
					'item_action':function(e) {
						if (typeof e.data.action.callback == 'function') {
							e.data.action.callback(e.data.item, e.data.action);
						} else {
							e.data.proto('item_action', e.data.item, e.data.action);
						}
					},

					'page_change':function(e, paginator) {
						e.data.page(paginator.get('page'));
					},
				}
			},

			'public':{
				'create_item':function(proto, item) {
					var
						tr = pwf.jquery('<tr/>'),
						attrs = this.get_attrs();

					for (var i = 0; i < attrs.length; i++) {
						tr.append(this.create_item_col(item, attrs[i]));
					}

					proto('create_item_actions', item, tr);
					return tr;
				},

				'create_item_col':function(proto, item, attr) {
					var
						td  = pwf.jquery('<td/>'),
						val = this.render_value(item, attr);

					td.html(val);
					return td;
				},

				'render_value':function(proto, item, attr) {
					return pwf.model.attr_to_html(attr, item);
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
