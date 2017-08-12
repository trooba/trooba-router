'use strict';

const t = require('tap');
const router = require('..');

t.test('should sanitize the url - query', t => {
    t.plan(1);

    router({
        context: {
            operation: 'GET',
            path: '/test?hello=world'
        }
    }, {
        'GET /test': () => {
            t.ok('inside the handler');
        }
    });
});

t.test('should sanitize the url - hash', t => {
    t.plan(1);

    router({
        context: {
            operation: 'GET',
            path: '/test#hello'
        }
    }, {
        'GET /test': () => {
            t.ok('inside the handler');
        }
    });
});
