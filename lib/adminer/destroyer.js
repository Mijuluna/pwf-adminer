(function()
{
	var
		mod_name = 'adminer.destroyer',
		mod = {
			'parents':['caller', 'adminer.abstract.object'],

			'storage':{
				'opts':{
					'after_drop':null,
					'buttons':[
						{
							'label':'adminer-drop',
							'name':'drop',
							'click':'drop'
						}
					]
				}
			},


			'proto':{
				'method':'drop',


				'el_attached':function(proto)
				{
					this.get_el().create_divs(['cf'], 'adminer-editor');
				},


				'construct':function(p) {
					p('create_ui');
					p('create_heading');
					p('create_desc');
					p('create_rels');
					p('create_buttons');
				},


				'create_ui':function() {
					this.get_el('cf').create_divs(['heading', 'desc', 'rels', 'buttons']);
				},


				'create_heading':function() {
					var el = this.get_el();

					el.heading = el.cf.heading;
					el.cf.heading.html(pwf.locales.trans('adminer-model-obj-drop', {
						'model_name':pwf.locales.trans_model(this.get('model'), 'accusative').text(),
						'id':this.get('item').get('id')
					}));
				},


				'create_desc':function() {
					var el = this.get_el();

					el.heading = el.cf.desc;
					el.cf.desc.html(pwf.locales.trans('adminer-model-obj-drop-desc', {
						'model_name':pwf.locales.trans_model(this.get('model')).text(),
						'id':this.get('item').get('id')
					}));
				},


				'create_rels':function(p) {
					var
						el = this.get_el(),
						item = this.get('item'),
						attr_defs = item.model().get_attrs(),
						attrs = [];

					el.rels = el.cf.rels;

					for (var i = 0; i < attr_defs.length; i++) {
						if (attr_defs[i].type == 'collection') {
							attrs.push(attr_defs[i].name);
						}
					}

					if (attrs.length) {
						el.rels.create_divs(['heading']);
						el.rels.list = pwf.jquery('<ul/>');

						el.rels.append(el.rels.list);
						el.rels.heading.html(pwf.locales.trans('adminer-delete-model-rels-too', {
							'model':pwf.locales.trans_model(this.get('model'), 'dative').text()
						}));

						for (var i = 0; i < attrs.length; i++) {
							p('create_rel_list', attrs[i]);
						}
					}
				},


				'create_rel_list':function(p, attr) {
					var
						el = this.get_el('rels'),
						item = this.get('item'),
						related = item.get(attr),
						el_rel  = pwf.jquery.div('rel');

					el_rel.heading = pwf.jquery.div('rel-heading');
					el_rel.list = pwf.jquery('<ul/>');

					el_rel.heading.html(pwf.locales.trans_attr(item.cname(), attr));

					el.list.append(el_rel);
					el_rel
						.append(el_rel.heading)
						.append(el_rel.list);

					for (var i = 0; i < related.length; i++) {
						p('create_rel_list_item', related[i], el_rel.list);
					}
				},


				'create_rel_list_item':function(p, item, list) {
					var
						el = pwf.jquery('<li/>');

					el.html(pwf.locales.trans_model(item.cname()) + '#' + item.get('id'));
					list.append(el);
				},


				'create_buttons':function(p) {
					var
						el = this.get_el('cf'),
						buttons = this.get('buttons');

					for (var i = 0; i < buttons.length; i++) {
						var
							button = pwf.jquery('<button/>').html(pwf.locales.trans(buttons[i].label)).appendTo(el.buttons),
							click = buttons[i].click;

						if (typeof click == 'string') {
							button.bind('click', {'p':p, 'action':click}, p('callbacks').button_action);
						}
					}
				},


				'loaded':function(p, err) {
					p('send_signal');
					p('construct');
					this.respond('on_load', [err]);
				},


				'action':function(p, action, next) {
					if (action == 'drop') {
						this.drop(next);
					}
				},


				'callbacks':{
					'button_action':function(e) {
						e.data.p('action', e.data.action);
					}
				}
			},

			'public':{
				'get_url':function() {
					return pwf.config.get('models.url.drop')
						.replace('{model}', this.get('model'))
						.replace('{id}', this.get('item').get('id'));
				},


				'drop':function(p, next) {
					this.get_el('cf').buttons.hide();
					this.respond('before_load');

					pwf.comm.get(this.get_url(), {}, function(ctrl, p, next) {
						return function(err, response) {
							ctrl.respond('on_load', [err]);

							if (typeof next == 'function') {
								next.apply(ctrl, [err, response.data]);
							}

							ctrl.respond('after_save', [err, response.data]);
							ctrl.respond('after_drop', [err, response.data]);
						};
					}(this, p, next));
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
