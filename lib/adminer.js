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

			'after_save':null,
			'after_create':null,
			'after_edit':null,
			'after_drop':null
		}
	},

	'public':{
		'list':function(proto, next)
		{
			return pwf.create(this.get('list.controller'), this.mix_opts('list')).load(next);
		},

		'create':function(proto, data, next)
		{
			return this.edit(pwf.model.create(this.get('model'), data)).load(next);
		},

		'edit':function(proto, obj, next)
		{
			return pwf.create(this.get('edit.controller'), this.mix_opts('edit', {'item':obj})).load(next);
		},

		'drop':function(proto, obj, next)
		{
			return pwf.create(this.get('drop.controller'), this.mix_opts('drop', {'item':obj})).load(next);
		},

		'mix_opts':function(proto, mode, add)
		{
			if (typeof add != 'object') {
				add = {};
			}

			return Object.merge({
				'model':this.get('model'),
				'parent':this.get_el(),
			}, this.get(mode), add);
		}
	}
});
