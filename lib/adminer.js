pwf.rc('adminer', {
	'parents':['caller', 'domel'],

	'storage':{
		'opts':{
			'model':null,
			'actions':[],

			'list':{
				'controller':'adminer.list',
			},
			'edit':{
				'controller':'adminer.editor',
			},
			'info':{
				'controller':'adminer.obvious',
			},
			'drop':{
				'controller':'adminer.destroyer',
			},

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


	'init':function(proto) {
		proto('construct_els');
		proto('construct_menu');
	},


	'proto':{
		'construct_els':function() {
			this.get_el().create_divs(['menu', 'content'], 'adminer');
		},

		'construct_menu':function(proto) {
			var el = this.get_el();

			el.menu.append(proto('link', 'list'));
			el.menu.append(proto('link', 'create'));
		},

		'link':function(proto, action) {
			return pwf.jquery('<a/>')
				.html(pwf.locales.trans('adminer-action-' + action))
				.bind('click', {'obj':this, 'proto':proto, 'action':action}, proto('adminer_callbacks').action);
		},

		'adminer_callbacks':{
			'action':function(e) {
				e.data.obj[e.data.action]();
			}
		}
	},


	'public':{
		'list':function(proto, next)
		{
			this.clear();
			return pwf.create(this.get('list.controller'), this.mix_opts('list')).load(next);
		},

		'create':function(proto, data, next)
		{
			this.clear();
			return this.edit(pwf.model.create(this.get('model'), data), next);
		},

		'edit':function(proto, obj, next)
		{
			this.clear();
			return pwf.create(this.get('edit.controller'), this.mix_opts('edit', {'item':obj})).load(next);
		},

		'drop':function(proto, obj, next)
		{
			this.clear();
			return pwf.create(this.get('drop.controller'), this.mix_opts('drop', {'item':obj})).load(next);
		},

		'clear':function()
		{
			this.get_el().content.html('');
		},

		'mix_opts':function(proto, mode, add)
		{
			var data;

			if (typeof add != 'object') {
				add = {};
			}

			data = Object.merge({
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
