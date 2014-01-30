var assert = require('assert');
global.pwf = require('pwf.js');

describe('sanity', function() {
	it('tests only sanity of js code', function() {
		assert.doesNotThrow(function() {
			mod = require('../lib/include');
		}, 'An error was thrown during mod inclusion of model lib.');
	});
});
