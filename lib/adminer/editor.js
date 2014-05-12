(function()
{
	var
		mod_name = 'adminer.editor',
		mod = {
			'parents':['caller', 'adminer.abstract.object'],
			'uses':['async'],

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
				this.get_el().create_divs(['cf'], 'adminer-editor');
			},

			'proto':{
				'default_exclude_list':['id', 'created_at', 'updated_at'],

				'construct':function(proto) {
					proto('construct_form');
				},

				'construct_form':function(proto) {
					var
						data = this.get_form_data(),
						els  = [
							{
								"element":'container',
								'type':'inputs',
								'elements':data.inputs
							},
							{
								"element":'container',
								'type':'buttons',
								'elements':data.buttons
							}
						];

					proto('correct_inputs', data.inputs);

					this.get_el().form = pwf.create('form', {
						'ref':this,
						'action':data.url,
						'parent':data.parent,
						'data':data.item.get_data(),
						'heading':data.heading,
						'on_before_send':data.calls.before_send,
						'on_error':data.calls.on_error,
						'on_ready':data.calls.on_ready,
						'elements':els
					});

					this.get_el().cf.find('.button-named-get_back button').bind('click', this, function(e) {
						e.data.get_el().form.get_back = true;
						e.data.get_el().form.send();
					});
				},

				'correct_inputs':function(proto, inputs) {
					return inputs;
				},

				'error':function(proto, err, response) {
					this.respond('on_load', [err]);
					this.respond('on_error', [err]);
				},

				'saved':function(proto, err, response) {
					var is_new = this.is_new();

					if (!err) {
						this.get('item').update(response.data);
					}

					this.respond('on_load', [err, response]);
					this.respond('after_save', [err, this.get('item')]);
					this.respond(is_new ? 'after_create':'after_edit', [err, this.get('item')]);
				},


				'loaded':function(proto, err)
				{
					proto('construct');
					this.respond('on_load', [err]);
				},
			},

			'public':{
				'is_new':function()
				{
					return this.get('item').get('id') === null;
				},


				'load':function(proto, next)
				{
					var jobs = function(obj) {
						return [
							function(a_next) {
								obj.preload_item(a_next);
							},
							function(a_next) {
								obj.preload_rels(obj.get_attrs(), a_next);
							}
						];
					}(this);


					pwf.async.series(jobs, function(ctrl, proto, next) {
						return function(err, obj) {
							proto('loaded', err);

							if (typeof next == 'function') {
								next(err);
							}
						};
					}(this, proto, next));
				},


				'get_inputs':function()
				{
					var
						attrs = this.get_attrs(),
						inputs = [];

					for (var i = 0; i < attrs.length; i++) {
						if (typeof attrs[i].is_fake == 'undefined' || !attrs[i].is_fake) {
							inputs.push(pwf.form.input_from_attr(this.get('item'), attrs[i]));
						}
					}

					return inputs;
				},


				'get_buttons':function()
				{
					var
						opt_buttons = this.get('buttons'),
						buttons = [];

					if (opt_buttons !== null) {
						for (var i = 0; i < opt_buttons.length; i++) {
							var
								opts = {'element':'button', 'type':'button'},
								def = Object.merge(opts, opt_buttons[i]);

							if (typeof def.label != 'undefined' && typeof def.label != 'object') {
								def.label = pwf.locales.trans(def.label);
							}

							buttons.push(def);
						}
					}

					return buttons;
				},


				'get_calls':function(proto)
				{
					return function(ctrl, proto) {
						return {
							'before_send':function(err, form) {
								ctrl.respond('before_load', [err, ctrl]);
								ctrl.respond('before_save', [err, ctrl]);
							},
							'on_error':function(err, response) {
								proto('error', err, response);
							},
							'on_ready':function(err, data, response) {
								proto('saved', err, data);
							}
						};
					}(this, proto);
				},


				'get_url':function()
				{
					return pwf.config.get('models.url.' + (this.is_new() ? 'create':'edit'))
						.replace('{model}', this.get('model'))
						.replace('{id}', this.get('item').get('id'));
				},


				'get_heading':function()
				{
					return this.is_new() ? 'adminer-model-obj-create':'adminer-model-obj-edit';
				},


				'get_form_data':function(proto)
				{
					var data = {
						'parent':this.get_el().cf,
						'item':this.get('item'),
						'inputs':this.get_inputs(),
						'buttons':this.get_buttons(),
						'calls':this.get_calls(),
						'is_new':this.is_new(),
						'heading':this.get_heading(),
						'url':this.get_url()
					};

					data.heading = pwf.locales.trans(data.heading, {
						'model_name':pwf.locales.trans_model(data.item.cname(), 'accusative').text(),
						'id':data.item.get('id')
					});

					return data;
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
