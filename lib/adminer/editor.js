(function()
{
	var
		mod_name = 'adminer.editor',
		mod = {
			'parents':['adminer.abstract.object'],

			'storage':{
				'is_new':false,
				'opts':{
					'inputs':{},
					'buttons':[
						{
							'label':'adminer-save',
							'name':'save',
							'type':'submit'
						}
					]
				}
			},

			'proto':{
				'method':'edit',


				'construct':function(proto) {
					proto('construct_ui');
					proto('construct_heading');
					proto('construct_form');
				},


				'construct_ui':function(proto) {
					var el = this.get_el().create_divs(['inner', 'heading', 'cf'], 'adminer-editor');
					el.inner.append(el.heading).append(el.cf);
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
						'before_send':data.calls.before_send,
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


				'saved':function(proto, err, response) {
					this.respond('on_load', [err, response]);

					if (err) {
						proto('error', err, response);
					} else {
						this.respond('after_save', [err, this.get('item')]);
						this.respond(proto.storage.is_new ? 'after_create':'after_edit', [err, this.get('item')]);

						proto.storage.is_new = false;
					}
				},


				'loaded':function(proto) {
					proto('send_signal');
					proto('construct');
					this.respond('on_load');
				}
			},

			'public':{
				'is_new':function() {
					return this.get('item').get('id') === null;
				},


				'get_inputs':function() {
					var
						attrs = this.get_attrs(),
						inputs = [];

					for (var i = 0; i < attrs.length; i++) {
						if (typeof attrs[i].is_fake == 'undefined' || !attrs[i].is_fake) {
							inputs.push(pwf.form.input_from_attr(this.get('item'), attrs[i], this.get_attr_input_extra(attrs[i].name)));
						}
					}

					return inputs;
				},


				'get_attr_input_extra':function(proto, name) {
					var inputs = this.get('inputs');

					if (inputs !== null && typeof inputs[name] != 'undefined') {
						return inputs[name];
					}

					return null;
				},


				'get_buttons':function() {
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

							if (typeof def.on_click == 'function') {
								var method = def.on_click;
								def.on_click = function(ctrl, method) {
									return function(e) {
										method.apply(ctrl, [e]);
									};
								}(this, method);
							}

							buttons.push(def);
						}
					}

					return buttons;
				},


				'get_calls':function(proto) {
					return function(ctrl, proto) {
						return {
							'before_send':function(err, form) {
								proto.storage.is_new = ctrl.is_new();
								ctrl.respond('before_load', [err, ctrl]);
								ctrl.respond('before_save', [err, ctrl]);
							},

							'on_error':function(err, response) {
								proto('error', err, response);
							},

							'on_ready':function(err, data, response) {
								var fire = true;

								if (!err) {
									ctrl.get('item').update(data.data);

									if (ctrl.get('reload')) {
										fire = false;

										return ctrl.reload(function(data, response) {
											return function(err) {
												proto('saved', err, data);
											};
										}(data, response));
									}
								}

								if (fire) {
									proto('saved', err, data);
								}
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
						'url':this.get_url()
					};

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
