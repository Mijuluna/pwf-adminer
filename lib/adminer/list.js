(function()
{
	var
		mod_name = 'adminer.list',
		mod = {
			'parents':['model.list', 'adminer.abstract.common', 'adminer.abstract.filters'],

			'storage':{
				'filter':null,
				'opts':{
					'pagi':'paginator'
				}
			},

			'init':function() {
				var url = pwf.config.get('models.url.browse');
				this.set('url', url.replace('{model}', this.get('model')));
			},

			'proto':{
				'method':'list',
				'pagi_dest':['top', 'bottom'],


				'el_attached':function(p)
				{
					p('send_signal');
					p('construct');
				},


				'construct':function(p)
				{
					p('create_base');
					p('create_heading');
					p('create_container');
					p('create_head');
					p('create_filters');
					p('create_pagi');
				},


				'create_base':function(p)
				{
					var el = this.get_el();

					el.create_divs(['marginer', 'inner', 'header', 'filter', 'pagi_top', 'content', 'pagi_bottom']);
					el.marginer.append(el.inner);
					el.inner
						.append(el.header)
						.append(el.filter)
						.append(el.pagi_top)
						.append(el.content)
						.append(el.pagi_bottom);

					el.content.create_divs(['inner'], 'content');
				},


				'create_heading':function()
				{
					var
						el = this.get_el('header'),
						str = this.get('heading');

					if (str === null) {
						str = 'adminer-model-list';
					}

					if (str) {
						str = pwf.locales.trans(str, {'model_name':pwf.locales.trans_model(this.get('model'), 'dative-plural').text()});

						el.heading = pwf.jquery.div('heading').html(str);
						el.html(el.heading);
					}
				},


				'create_container':function(p)
				{
					var el = this.get_el();

					el.table = pwf.jquery('<table cellspacing="0" cellpadding="0"/>');
					el.table.addClass('adminer-table');
					el.table.head = pwf.jquery('<thead/>');
					el.table.body = pwf.jquery('<tbody/>');

					el.table
						.append(el.table.head)
						.append(el.table.body)
						.appendTo(el.content.inner);
				},


				'create_head':function(p)
				{
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


				'create_pagi':function(p)
				{
					if (this.get('pagi')) {
						var dest = p('pagi_dest');

						for (var i = 0; i < dest.length; i++) {
							var el = this.get_el('pagi_' + dest[i]);

							el.pagi = pwf.create(this.get('pagi'), {
								'parent':el,
								'page':this.get('page'),
								'per_page':this.get('per_page'),
								'total':this.get_total(),
								'on_change':function() {
									this.get_el().trigger('pagi_change', this);
								}
							});
						}

						this.get_el().bind('pagi_change', this, p.get('callbacks.page_change'));
					}
				},


				'update_pagi':function(p)
				{
					if (this.get('pagi')) {
						var dest = p('pagi_dest');

						for (var i = 0; i < dest.length; i++) {
							var el = this.get_el('pagi_' + dest[i]);

							el.pagi.update({
								'page':this.get('page'),
								'per_page':this.get('per_page'),
								'total':this.get_total()
							}).update_status();
						}
					}
				},


				'loaded':function(p)
				{
					p('redraw');
					p('update_pagi');

					this.respond('on_load');
				},

				'redraw':function()
				{
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


				'create_item_actions':function(p, item, tr)
				{
					var
						tda = pwf.jquery('<td/>').addClass('actions'),
						actions = this.get('actions');

					if (actions !== null) {
						for (var i = 0; i < actions.length; i++) {
							tda.append(p('create_item_action', item, tr, actions[i]));
						}
					}

					tr.append(tda);
				},


				'create_item_action':function(p, item, tr, action)
				{
					return pwf.jquery.icon(action, '16x16')
						.bind('click', {'p':p, 'item':item, 'action':action}, p('callbacks').item_action);
				},


				'item_action':function(p, item, action)
				{
					if (p.type('item_action_' + action) == 'function') {
						p('item_action_' + action, item);
					} else {
						this.get_el().trigger('adminer_item_action', {
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
							e.data.p('item_action', e.data.item, e.data.action);
						}
					},

					'page_change':function(e, paginator) {
						e.data.page(paginator.get('page'));
					},
				}
			},

			'public':{
				'create_item':function(p, item)
				{
					var
						tr = pwf.jquery('<tr/>'),
						attrs = this.get_attrs();

					for (var i = 0; i < attrs.length; i++) {
						tr.append(this.create_item_col(item, attrs[i]));
					}

					p('create_item_actions', item, tr);
					return tr;
				},


				'load':function(p, next)
				{
					pwf.schema.check(this.get('model'), function(err) {
						if (err) {
							next(err);
						} else {
							p('load_list_data', next);
						}
					});
				},


				'create_item_col':function(p, item, attr)
				{
					var
						td  = pwf.jquery('<td/>'),
						val = this.render_value(item, attr);

					td.html(val);
					return td;
				},


				'render_value':function(p, item, attr)
				{
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
