'use strict';

const t = require('tap');
const router = require('..');

t.test('should sanitize the url - query', t => {
    t.plan(1);

    router({}, {
        'GET /test': () => {
            t.ok('inside the handler');
        }
    }).create({
        operation: 'GET',
        path: '/test?hello=world'
    });
});

t.test('should sanitize the url - hash', t => {
    t.plan(1);

    router({}, {
        'GET /test': () => {
            t.ok('inside the handler');
        }
    }).create({
        operation: 'GET',
        path: '/test#hello'
    });
});
