(function()
{
	var
		mod_name = 'adminer.list',
		mod = {
			'parents':['domel', 'model.list', 'adminer.abstract'],

			'init':function(proto) {
				var url = pwf.config.get('models.url_browse');

				this.set('url', url.replace('{model}', this.get('model')));

				proto('create_base');
				proto('create_container');
				proto('create_head');
				proto('create_filters');

				return this.create_loader();
			},

			'proto':{
				'create_base':function(proto) {
					var el = this.get_el();

					el.create_divs(['header', 'filter', 'pagi_top', 'content', 'pagi_bottom']);
					el.header.heading = pwf.jquery.div('heading').html(pwf.locales.trans('adminer-model-list', {'model_name':pwf.locales.trans_model(ref.get('model'), 'dative-plural').text()}));
					el.header.html(el.header.heading);
				},

				'create_container':function(proto) {
					var el = this.get_el();

					el.table = pwf.jquery('<table cellspacing="0" cellpadding="0"/>');
					el.table.addClass('adminer-table');
					el.table.head = pwf.jquery('<thead/>');
					el.table.body = pwf.jquery('<tbody/>');

					el.append(el.table);
					el.table.append(el.table.head).append(el.table.body);
				},

				'create_head':function(proto) {
					var
						el = this.get_el(),
						attrs = ref.get_attrs('list');

					el.table.head.tr = pwf.jquery('<tr/>');
					el.table.head.append(el.table.head.tr);

					for (var i = 0; i < attrs.length; i++) {
						var th = pwf.jquery('<th/>').addClass('attr-' + attrs[i].name);

						th.html(pwf.locales.trans_attr(ref.get('model'), attrs[i].name));
						el.table.head.tr.append(th);
					}

					el.table.head.tr.append(pwf.jquery('<th/>').addClass('actions'));
				},

				'create_filters':function(proto) {
					var
						el = this.get_el(),
						inputs = [];

					filter = pwf.form.create({
						"parent":el.filter,
						"inputs":inputs
					});

					return this;
				},

				'loaded':function(proto) {
					proto('redraw');

					if (typeof this.get('on_load') == 'function') {
						this.get('on_load')(this);
					}
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

				'callbacks':{
					'item_action':function(e) {
						if (typeof e.data.action.callback == 'function') {
							e.data.action.callback(e.data.item, e.data.action);
						} else throw new Error('You must pass a callback to item actions.');
					}
				}
			},

			'public':{
				'create_item':function(proto, item) {
					var
						tr = pwf.jquery('<tr/>'),
						attrs = ref.get_attrs('list'),
						actions = ref.get('item_actions'),
						tda = pwf.jquery('<td/>').addClass('actions');

					for (var i = 0; i < attrs.length; i++) {
						tr.append(this.create_item_col(item, attrs[i]));
					}

					for (var i = 0; i < actions.length; i++) {
						var
							action = actions[i],
							icon = pwf.jquery.icon(action.icon, '16x16');

						icon.bind('click', {'item':item, 'action':action}, proto('callbacks').item_action);
						tda.append(icon);
					}

					tr.append(tda);

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
