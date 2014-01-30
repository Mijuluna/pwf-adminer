/**
 * Dynamic data model abstraction. Handles predefined data formats and data
 * types. Also caches data on client-side for simpler updates and lower memory
 * consumption.
 */
(function()
{
	var
		mod_name = 'adminer',
		mod_inst = true,
		mod = function()
		{
			var
				class_adminer = function(arg_opts)
				{
					var
						list,
						info,
						form,
						opts = {
							"model":null,

							"info_attrs":null,
							"info_attrs_exclude":null,

							"list_attrs":null,
							"list_attrs_exclude":null,
							"list_filters":null,
							"list_per_page":20,
							"list_sort":null,
							"list_sort_options":null,

							"edit_attrs":null,
							"edit_attr_exclude":null,

							"on_load_info":null,
							"on_load_list":null,
							"on_load_edit":null,

							"on_load":null,
							"on_error":null
						};


					this.update = function(arg_opts)
					{
						opts = pwf.jquery.extend(opts, arg_opts);
						return this;
					};


					this.get = function(name)
					{
						return typeof opts[name] == 'undefined' ? null:opts[name];
					};


					this.list = function()
					{
						if (typeof list == 'undefined') {
							list = new class_adminer_list(this);
						}

						return list;
					};


					this.info = function()
					{
					};


					this.create = function()
					{
						return this.edit(pwf.model.create(this.get('model')));
					};


					this.edit = function(obj)
					{
						return new class_adminer_edit(this, obj);
					};


					this.drop = function(obj)
					{
					};


					this.get_attrs = function(name)
					{
						var
							include = opts[name + '_attrs'],
							exclude = opts[name + '_attrs_exclude'],
							mattrs  = pwf.model.get_attrs(this.get('model')),
							rattrs  = [];

						typeof include == 'undefined' && (include = null);
						typeof exclude == 'undefined' && (exclude = null);

						for (var i = 0; i < mattrs.length; i++) {
							var
								attr = mattrs[i],
								attr_include = include === null || include.indexOf(attr.name) >= 0,
								attr_exclude = exclude !== null && exclude.indexOf(attr.name) >= 0;

							if (name == 'edit') {
								attr_exclude = attr_exclude || ['id', 'created_at', 'updated_at'].indexOf(attr.name) >= 0;
							}

							if (attr_include && !attr_exclude) {
								rattrs.push(attr);
							}
						}

						return rattrs;
					};


					this.update(arg_opts);
				},


				class_adminer_list = function(arg_ref)
				{
					var
						ref = arg_ref,
						page = 0,
						parent,
						loader,
						filter,
						el;


					this.ref = function()
					{
						return ref;
					};


					this.get_page = function()
					{
						return page;
					};


					this.construct = function(arg_parent)
					{
						var attrs = ref.get_attrs('list');

						el = pwf.jquery.div('adminer-list');
						el.create_divs(['header', 'filter', 'pagi_top', 'content', 'pagi_bottom']);
						el.header.heading = pwf.jquery.div('heading').html(pwf.locales.trans('adminer-model-list', {'model_name':pwf.locales.trans_model(ref.get('model'), 'dative-plural').text()}));

						el.table = pwf.jquery('<table cellspacing="0" cellpadding="0"/>');
						el.table.addClass('adminer-table');

						el.table.head = pwf.jquery('<thead/>');
						el.table.body = pwf.jquery('<tbody/>');
						el.table.head.tr = pwf.jquery('<tr/>');

						el.header.html(el.header.heading);
						el.append(el.table);
						el.table.append(el.table.head).append(el.table.body);
						el.table.head.append(el.table.head.tr);

						for (var i = 0; i < attrs.length; i++) {
							var th = pwf.jquery('<th/>').addClass('attr-' + attrs[i].name);

							th.html(pwf.locales.trans_attr(ref.get('model'), attrs[i].name));
							el.table.head.tr.append(th);
						}

						parent = arg_parent;
						parent.html(el);

						return this.create_filters().create_loader();
					};


					this.create_filters = function()
					{
						var inputs = [];

						filter = pwf.form.create({
							"parent":el.filter,
							"inputs":inputs
						});

						return this;
					};


					this.create_loader = function()
					{
						var url = pwf.config.get('models.url_browse');

						if (typeof url != 'string') {
							throw new Error('Please set models.url_browse to URL');
						}

						loader = pwf.list.create({
							'url':url.replace('{model}', ref.get('model')),
							'model':ref.get('model'),
							'per_page':ref.get('list_per_page'),
							'page':this.get_page(),
							'on_load':function(ctrl) { return function() { callback_redraw(ctrl); } }(this),
							'on_error':function(ctrl) { return function(list, response, message) { callback_load_error(ctrl, response, message); } }(this)
						});

						return this;
					};


					this.get_filter_value = function()
					{
						var
							data   = filter.get_data(),
							filt   = {},
							length = 0;

						for (var key in data) {
							if (typeof data[key] != 'undefined' && data[key] !== null) {
								if (key == 'month') {
									filt[key] = data[key].format('YYYY-MM');
									length ++;
								} else {
									if (typeof data[key].length == 'number' && data[key].length > 0) {
										filt[key] = data[key];
										length ++;
									}
								}
							}
						}

						return length > 0 ? filt:null;
					};


					this.update_loader = function()
					{
						loader.update({'filters':JSON.stringify(this.get_filter_value())});
					};


					this.load = function(next)
					{
						this.update_loader();
						loader.load(next);
						return this;
					};


					this.update_display = function()
					{
						var list = loader.list();
						el.table.body.html('');

						for (var i = 0; i < list.data.length; i++) {
							var tr = this.create_item(list.data[i]);

							el.table.body.append(tr);
							tr.addClass((i%2) ? 'even':'odd');
						}

						return this;
					};


					this.create_item = function(item)
					{
						var
							el = pwf.jquery('<tr/>'),
							attrs = ref.get_attrs('list');

						for (var i = 0; i < attrs.length; i++) {
							el.append(this.create_item_col(item, attrs[i]));
						}

						return el;
					};


					this.create_item_col = function(item, attr)
					{
						var
							td  = pwf.jquery('<td/>'),
							val = pwf.model.attr_to_html(attr, item);

						td.html(val);

						return td;
					};


					var callback_redraw = function(ctrl)
					{
						ctrl.update_display();

						if (typeof ctrl.ref().get('on_load') == 'function') {
							ctrl.ref().get('on_load')(ctrl);
						}
					};


					var callback_load_error = function(ctrl, response, message)
					{
						if (typeof ctrl.ref().get('on_error') == 'function') {
							ctrl.ref().get('on_error')(ctrl, response, message);
						} else throw new Error('Failed to load adminer list and no error handler was given.');
					};
				},


				class_adminer_edit = function(arg_ref, arg_obj)
				{
					var
						ref = arg_ref,
						obj = arg_obj;


					this.construct = function(parent)
					{
						var
							attrs = ref.get_attrs('edit'),
							inputs = [],
							form,
							url = pwf.config.get('models.url_create'),
							heading = obj.get('id') === null ? 'adminer-model-obj-create':'adminer-model-obj-edit';

						if (typeof url != 'string') {
							throw new Error('Please set models.url_browse to URL');
						}

						for (var i = 0; i < attrs.length; i++) {
							if (typeof attrs[i].is_fake == 'undefined' || !attrs[i].is_fake) {
								inputs.push(pwf.form.input_from_attr(obj, attrs[i].name));
							}
						}

						form = pwf.form.create({
							'action':url.replace('{model}', ref.get('model')),
							'parent':parent,
							'data':obj.get_data(),
							'heading':pwf.locales.trans(heading, {'model_name':pwf.locales.trans_model(obj.cname(), 'accusative').text()}),
							'elements':[
								{
									"element":'container',
									'type':'inputs',
									'elements':inputs,
								},
								{
									"element":'container',
									'type':'buttons',
									'elements':[
										{
											'element':'button',
											'label':pwf.locales.trans(obj.get('id') === null ? 'adminer-obj-create':'adminer-obj-save'),
											'type':'submit'
										},
										{
											'element':'button',
											'label':pwf.locales.trans(obj.get('id') === null ? 'adminer-obj-create-and-edit':'adminer-obj-save-and-edit'),
											'type':'submit'
										}
									],
								}
							]
						});

						return form;
					};
				};


			this.is_ready = function()
			{
				return pwf.mi(['schema', 'locales']);
			};


			this.create = function(arg_opts)
			{
				return new class_adminer(arg_opts);
			};
		};


	/// Register, because we have existing pwf
	if (typeof pwf == 'object') {
		pwf.register(mod_name, mod, mod_inst);
	}

	/// Export module because we may be inside nodejs.
	if (typeof process != 'undefined') {
		module.exports = mod;
	}
})();
