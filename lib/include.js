if (typeof pwf == 'undefined' || !pwf.get_module_status('module', 'async')) {
	require('pwf-async-compat');
}

if (typeof pwf == 'undefined' || !pwf.get_module_status('module', 'schema')) {
	require('pwf-models-schema');
}

if (typeof pwf == 'undefined' || !pwf.get_module_status('module', 'locales')) {
	require('pwf-locales');
}

if (typeof pwf == 'undefined' || !pwf.get_module_status('class', 'form')) {
	require('pwf-form');
}

if (typeof pwf == 'undefined' || !pwf.get_module_status('class', ['input.date'])) {
	require('pwf-input-date');
}

if (typeof pwf == 'undefined' || !pwf.get_module_status('class', 'input.file')) {
	require('pwf-input-file');
}

if (typeof pwf == 'undefined' || !pwf.get_module_status('class', 'input.collection')) {
	require('pwf-input-collection');
}

require('./adminer/abstract/common');
require('./adminer/abstract/filters');
require('./adminer/abstract/object');
require('./adminer/destroyer');
require('./adminer/editor');
require('./adminer/list');
require('./adminer/map');
require('./adminer/obvious');
require('./adminer');
