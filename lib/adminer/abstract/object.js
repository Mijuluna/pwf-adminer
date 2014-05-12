(function()
{
	var
		mod_name = 'adminer.abstract.object',
		mod = {
			'parents':['adminer.abstract.common'],
			'uses':['model', 'config'],

			'storage':{
				'opts':{
					'item':null
				}
			},

			'proto':{
			},

			'public':{
				'is_new':function() {
					return this.get('item').id === null;
				},


				'preload_item':function(proto, next) {
					if (typeof this.get('item') == 'number') {
						pwf.model.find(this.get('model'), this.get('item'), function(obj, next) {
							return function(err, item) {
								if (!err) {
									obj.set('item', item);
								}

								next(err);
							};
						}(this, next));
					} else {
						next();
					}
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
										preload[rel.model].push(val[ival]);
									}
								} else if (typeof val == 'number') {
									preload[rel.model].push(val[ival]);
								}
							}
						}
					}

					for (var model_name in preload) {
						var ids = preload[model_name].unique();

						if (ids.length > 0) {
							jobs.push(function(obj, model_name, ids) {
								return function(next) {
									pwf.list.create({
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
							return function() {
								if (typeof next == 'function') {
									next(obj);
								}
							};
						}(obj, next));
					} else {
						next(obj);
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
