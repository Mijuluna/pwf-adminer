(function()
{
	var
		mod_name = 'adminer.abstract.object',
		mod = {
			'parents':['adminer.abstract.common'],
			'uses':['async', 'model', 'config'],

			'storage':{
				'waiting_rels':[],

				'opts':{
					'reload':false,
					'item':null,
					'preload':[]
				}
			},

			'proto':{
				'default_exclude_list':['id', 'created_at', 'updated_at'],
				'heading_declination':'accusative',

				'load_obj_data':function(proto, next) {
					var jobs = function(obj) {
						return [
							function(a_next) {
								obj.preload_item(a_next);
							},

							function(a_next) {
								obj.preload_rels(obj.get_attrs_to_preload(), a_next);
							},

							function(a_next) {
								obj.preload_waiting_rels(a_next);
							}
						];
					}(this);


					pwf.async.series(jobs, function(ctrl, proto, next) {
						return function(err, obj) {
							if (typeof err == 'undefined' || err === null) {
								proto('loaded');
							} else {
								proto('error', err);
							}

							ctrl.respond(next, [err]);
						};
					}(this, proto, next));
				},


				'construct_heading':function(proto) {
					var heading = this.get_heading();

					if (heading) {
						this.get_el('heading').html(pwf.jquery.div('heading').html(
							pwf.locales.trans(heading, {
								'model_name':pwf.locales.trans_model(this.get('model'), proto('heading_declination')).text(),
								'id':this.get('item').get('id')
							})
						));
					}
				},


				'error':function(proto, err, response) {
					this.respond('on_error', [err, response]);
				}
			},

			'public':{
				'is_new':function() {
					var item = this.get('item');

					if (typeof item == 'number') {
						return item > 0;
					} else if (item === null) {
						return true;
					}

					return this.get('item').get('id') === null;
				},


				'load':function(proto, next)
				{
					proto('before_load');
					proto('load_obj_data', next);
					return this;
				},


				'reload':function(proto, next) {
					var jobs = function(obj, proto) {
						return [
							function(next) {
								obj.preload_item_force(true, next);
							},

							function(next) {
								obj.preload_rels(obj.get_attrs_to_preload(), next);
							},

							function(a_next) {
								obj.preload_waiting_rels(a_next);
							}
						];
					}(this, proto);

					this.respond('before_load');

					pwf.async.series(jobs, function(ctrl, next) {
						return function(err) {
							ctrl.respond('on_reload', [err]);
							ctrl.respond(next, [err]);
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

							if (!item) {
								err = 'error-object-not-found';
							}

							next(err);
						};
					}(this, next), really);
				},


				'get_attrs_to_preload':function(proto) {
					var
						attrs = this.get_attrs(),
						pre   = this.get('preload'),
						cname = this.get('model'),
						model = pwf.model.get(cname);

					for (var i = 0, len = pre.length; i < len; i++) {
						var
							def,
							name = pre[i],
							list = [];

						if (name.indexOf('.') > 0) {
							var
								names  = name.split('.'),
								cmodel = cname,
								path   = [],
								last;

							for (var j = 0; j < names.length; j++) {
								if (j > 1) {
									path.push(names[j]);
								}

								if (j >= 2) {
									last.preload.push(path.join('.'));
								} else {
									def = pwf.model.get_attr_def(cmodel, names[j]);
									def.preload = [];

									if (def !== null) {
										if (typeof names[j-1] != 'undefined') {
											def.source_attr = names[j-1];
										}
									} else throw new Error('adminer-object:attrs-to-preload:unknown-attr:' + cmodel + '.' + names[j]);

									cmodel = def.model;
									list.push(def);
									last = def;
								}
							}
						} else {
							def = model.get_attr_def(pre[i]);

							if (proto('rel_types').indexOf(def.type) >= 0) {
								list.push(def);
							}
						}

						for (var l = 0; l < list.length; l++) {
							def = list[l];

							if (def !== null && proto('rel_types').indexOf(def.type) >= 0) {
								attrs.push(def);
							}
						}
					}

					return attrs;
				},


				'preload_rels':function(proto, attrs, next) {
					var
						obj     = this.get('item'),
						jobs    = [],
						preload = {},
						url     = pwf.config.get('models.url.browse'),
						cname   = this.get('model');

					if (typeof url != 'string') {
						throw new Error('Please set models.url.browse to URL');
					}

					for (var i = 0; i < attrs.length; i++) {
						var rel = attrs[i];

						if (proto('rel_types').indexOf(rel.type) >= 0) {
							var
								is_natural = rel.cname == cname,
								val = obj.get(rel.name);

							if (typeof preload[rel.model] == 'undefined') {
								preload[rel.model] = [];
							}

							if (is_natural) {
								if (val !== null) {
									if (typeof val == 'object' && typeof val.length == 'number') {
										for (var ival = 0; ival < val.length; ival++) {
											if (typeof val[ival] == 'object' && val[ival] !== null) {
												preload[rel.model].push(val[ival].get('id'));
											} else if (typeof val[ival] == 'number') {
												preload[rel.model].push(val[ival]);
											}
										}
									} else if (typeof val == 'number') {
										preload[rel.model].push(val);
									} else if (typeof val == 'object') {
										preload[rel.model].push(val.get('id'));
									}
								}
							} else {
								proto.storage.waiting_rels.push(rel);
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
										return function(err, response) {
											next(err, response);
										};
									}(obj, model_name, next));
								};
							}(obj, model_name, ids));
						}
					}

					if (jobs.length > 0) {
						pwf.async.parallel(jobs, function(ctrl, obj, next) {
							return function(err) {
								ctrl.respond(next, [err, obj]);
							};
						}(this, obj, next));
					} else {
						this.respond(next, [null]);
					}

					return this;
				},


				'preload_waiting_rels':function(proto, next) {
					var
						rels   = proto.storage.waiting_rels,
						item   = this.get('item'),
						model  = item.model(),
						jobs   = [],
						attrs  = {},
						parent, val, rel;

					while (rel = rels.shift()) {
						if (typeof attrs[rel.source_attr] == 'undefined') {
							attrs[rel.source_attr] = [];
						}

						attrs[rel.source_attr].push(rel);
					}

					for (var attr in attrs) {
						var
							def = model.get_attr_def(attr),
							val = item.get(attr),
							list = attrs[attr];

						if (val !== null) {
							var preload = [];

							if (def.type != 'collection') {
								val = [val];
							}

							for (var i = 0; i < list.length; i++) {
								preload.push(list[i].name);

								for (var j = 0; j < list[i].preload.length; j++) {
									preload.push(list[i].name + '.' + list[i].preload[j]);
								}
							}

							for (var i = 0; i < val.length; i++) {
								jobs.push(function(adminer, obj, preload) {
									return function(next) {
										var opts = {
											'model':obj.cname(),
											'preload':preload.unique(),
											'item':obj
										};

										pwf.create('adminer.abstract.object', opts).load(next);
									};
								}(this, val[i], preload));
							}
						}
					}

					if (jobs.length) {
						pwf.async.parallel(jobs, next);
					} else {
						this.respond(next);
					}
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
