(function()
{
	var
		mod_name = 'adminer.obvious',
		mod = {
			'parents':['adminer.abstract.object'],

			'init':function(proto) {
				var el = this.get_el().create_divs(['inner', 'heading', 'cf'], 'adminer-editor');
				el.inner.append(el.heading).append(el.cf);
			},

			'proto':{
				'heading_declination':'dative',
				'default_exclude_list':[],
				'method':'info',

				'construct':function(proto) {
					proto('construct_ui');
					proto('construct_heading');
					proto('construct_info');
				},


				'construct_ui':function() {
					var el = this.get_el().create_divs(['header', 'heading', 'info']);
					el.header.append(el.heading);
				},


				'construct_info':function(proto) {
					var
						attrs = this.get_attrs(),
						el = this.get_el('info');

					for (var i = 0; i <attrs.length; i++) {
						proto('construct_attr', attrs[i]).addClass(i%2 ? 'odd':'even').appendTo(el);
					}
				},


				'construct_attr':function(proto, attr) {
					var
						item = this.get('item'),
						wrap = pwf.jquery.div('obvious-attr').create_divs(['name', 'value'], 'obvious');

					wrap.name
						.html(pwf.locales.trans_attr(this.get('model'), attr.name))
						.append(':');

					wrap.value.html(proto('get_attr_value', attr));
					return wrap;
				},


				'get_attr_value':function(proto, attr) {
					return pwf.model.attr_to_html(attr, this.get('item'));
				},


				'loaded':function(proto, err) {
					proto('construct');
					proto('send_signal');
					this.respond('on_load', [err]);
				},
			},

			'public':{
				'get_heading':function() {
					return 'adminer-model-obj-info';
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
