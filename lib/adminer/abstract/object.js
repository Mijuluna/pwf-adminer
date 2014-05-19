(function()
{
	var
		mod_name = 'adminer.abstract.object',
		mod = {
			'parents':['adminer.abstract.common'],
			'uses':['model', 'config'],

			'storage':{
				'opts':{
					'reload':false,
					'item':null,
					'preload':[]
				}
			},

			'proto':{
			},

			'public':{
				'is_new':function() {
					return this.get('item').id === null;
				},


				'reload':function(proto, next) {
					var jobs = function(obj, proto) {
						return [
							function(next) {
								obj.preload_item_force(true, next);
							},

							function(next) {
								obj.preload_rels(obj.get_attrs_to_preload(), next);
							}
						];
					}(this, proto);

					this.respond('before_load');

					pwf.async.series(jobs, function(ctrl, next) {
						return function(err) {
							ctrl.respond('on_reload', [err]);

							if (typeof next == 'function') {
								next(err, this);
							}
						};
					}(this, next));
				},


				'preload_item':function(proto, next) {
					if (typeof this.get('item') == 'number') {
						this.preload_item_force(false, next);
					} else {
						next();
					}
				},


				'preload_item_force':function(proto, really, next) {
					var
						id, item = this.get('item'),
						really = typeof really == 'undefined' ? false:!!really;

					if (typeof item == 'string' || typeof item == 'number') {
						id = item;
					} else {
						id = item.get('id');
					}

					pwf.model.find(this.get('model'), id, function(obj, next) {
						return function(err, item) {
							if (!err) {
								obj.set('item', item);
							}

							next(err);
						};
					}(this, next), really);
				},


				'get_attrs_to_preload':function(proto) {
					var
						attrs = this.get_attrs(),
						pre   = this.get('preload'),
						model = this.get('item').model();

					for (var i = 0, len = pre.length; i < len; i++) {
						var def = model.get_attr_def(pre[i]);

						if (def !== null) {
							attrs.push(def);
						}
					}

					return attrs;
				},


				'preload_rels':function(proto, attrs, next) {
					var
						obj = this.get('item'),
						jobs = [],
						preload = {},
						url = pwf.config.get('models.url.browse');

					if (typeof url != 'string') {
						throw new Error('Please set models.url.browse to URL');
					}

					for (var i = 0; i < attrs.length; i++) {
						var rel = attrs[i];

						if (proto('rel_types').indexOf(rel.type) >= 0) {
							var val = obj.get(rel.name);

							if (typeof preload[rel.model] == 'undefined') {
								preload[rel.model] = [];
							}

							if (val !== null) {
								if (typeof val == 'object' && typeof val.length == 'number') {
									for (var ival = 0; ival < val.length; ival++) {
										if (typeof val[ival] == 'number') {
											preload[rel.model].push(val[ival]);
										}
									}
								} else if (typeof val == 'number') {
									preload[rel.model].push(val);
								}
							}
						}
					}

					for (var model_name in preload) {
						var ids = preload[model_name].unique();

						if (ids.length > 0) {
							jobs.push(function(obj, model_name, ids) {
								return function(next) {
									pwf.create('model.list', {
										'url':url.replace('{model}', model_name),
										'model':model_name,
										'page':0,
										'per_page':Math.pow(2,32),
										'filters':JSON.stringify({
											'id':ids
										})
									}).load(function(obj, model_name, next) {
										return function(err, data) {
											next(err, data);
										};
									}(obj, model_name, next));
								};
							}(obj, model_name, ids));
						}
					}

					if (jobs.length > 0) {
						pwf.async.parallel(jobs, function(obj, next) {
							return function(err) {
								if (typeof next == 'function') {
									next(err, obj);
								}
							};
						}(obj, next));
					} else {
						next(null, obj);
					}

					return this;
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
