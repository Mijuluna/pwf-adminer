pwf.rc('adminer', {
	'parents':['caller', 'domel'],

	'storage':{
		'opts':{
			'model':null,
			'actions':[],
			'default':{},

			'mods':{
				'list':'adminer.list',
				'edit':'adminer.editor',
				'info':'adminer.obvious',
				'drop':'adminer.destroyer'
			},

			'list':{},
			'edit':{},
			'info':{},
			'drop':{},

			'before_load':null,
			'before_save':null,
			'before_create':null,
			'before_edit':null,
			'before_drop':null,

			'on_load':null,
			'on_error':null,
			'on_reload':null,

			'after_save':null,
			'after_create':null,
			'after_edit':null,
			'after_drop':null
		}
	},


	'proto':{
		'el_attached':function(proto) {
			proto('construct_els');
			proto('construct_menu');
			proto('bind_events');
		},


		'construct_els':function() {
			this.get_el().create_divs(['menu', 'content'], 'adminer');
		},


		'construct_menu':function(proto, active_item, ctrl) {
			var el = this.get_el('menu');

			el.html('');
			el.append(proto('link', 'list', 'dative-plural', active_item));
			el.append(proto('link', 'create', 'accusative',  active_item));

			if (typeof ctrl != 'undefined' && ctrl.meta.parents.indexOf('adminer.abstract.object') > -1) {
				var item = ctrl.get('item');

				if (item !== null && (typeof item == 'object' && item.get('id'))) {
					el.append(pwf.jquery.span('adminer-menu-separator'));
					el.append(proto('link', 'info', 'dative',  active_item, item));
					el.append(proto('link', 'edit', 'accusative',  active_item, item));
					el.append(proto('link', 'drop', 'accusative',  active_item, item));
				}
			}
		},


		'bind_events':function(proto) {
			var ctx = {
				'proto':proto,
				'ctrl':this
			};

			this.get_el()
				.bind('adminer_item_action_list', ctx, proto('callbacks_adminer').action_item)
				.bind('adminer_item_action_info', ctx, proto('callbacks_adminer').action_item)
				.bind('adminer_item_action_edit', ctx, proto('callbacks_adminer').action_item)
				.bind('adminer_item_action_drop', ctx, proto('callbacks_adminer').action_item)
				.bind('adminer_menu_update', ctx, proto('callbacks_adminer').update_menu);
		},


		'link':function(proto, action, locales_mode, active_item, obj) {
			var
				ctx = {
					'action':action,
					'proto':proto,
					'ctrl':this,
					'params':{
						'item':obj
					}
				},
				link = pwf.jquery('<a/>')
					.addClass('adminer-action adminer-action-' + action)
					.html(pwf.locales.trans('adminer-action-' + action, {
						'model_name':pwf.locales.trans_model(this.get('model'), locales_mode).text()
					}))
					.bind('click', ctx, proto('callbacks_adminer').action);


			if (action == active_item) {
				link.addClass('active');
			} else {
				link.removeClass('active');
			}

			return link;
		},


		'callbacks_adminer':{
			'action':function(e) {
				if (typeof e.data.ctrl[e.data.action] == 'function') {
					e.data.ctrl[e.data.action](e.data.params);
				} else {
					e.data.ctrl.action(e.data.action, e.data.params);
				}
			},

			'action_item':function(e, data) {
				pwf.callbacks.cancel(e);

				if (typeof e.data.ctrl[e.data.action] == 'function') {
					e.data.ctrl[e.data.action](data);
				} else {
					e.data.ctrl.action(data.action, data);
				}
			},

			'update_menu':function(e, data) {
				pwf.callbacks.cancel(e);
				e.data.proto('construct_menu', data.method, data.origin);
			}
		}
	},


	'public':{
		'create':function(proto, data, next)
		{
			var obj = pwf.model.create(this.get('model'), data).update(this.get('default'));
			v(obj);
			return this.action('edit', {'item':obj}, next);
		},


		'action':function(proto, action, params, next)
		{
			var mod = this.get('mods.' + action);

			this.clear();

			return pwf.create(mod, this.mix_opts(action, params)).load(next);
		},

		'clear':function()
		{
			if (this.get_el('content') !== null) {
				this.get_el('content').html('');
			}

			return this;
		},

		'mix_opts':function(proto, mode, add)
		{
			var data;

			if (typeof add != 'object') {
				add = {};
			}

			data = pwf.merge(true, {
				'parent':this.get_el().content,
				'model':this.get('model'),
				'ref':this,
			}, this.get(mode), add);

			this
				.supply(data, 'before_load')
				.supply(data, 'before_save')
				.supply(data, 'before_create')
				.supply(data, 'before_edit')
				.supply(data, 'before_drop')
				.supply(data, 'on_load')
				.supply(data, 'on_error')
				.supply(data, 'on_reload')
				.supply(data, 'after_save')
				.supply(data, 'after_create')
				.supply(data, 'after_edit')
				.supply(data, 'after_drop');

			return data;
		},

		'supply':function(proto, data, attr)
		{
			if (typeof data[attr] == 'undefined' && this.get(attr) !== null) {
				data[attr] = this.get(attr);
			}

			return this;
		}
	}
});
