'use strict';

const t = require('tap');
const createRouter = require('..');

t.test('should sanitize the url - query', t => {
    t.plan(1);
    const router = createRouter();

    router.use('GET /test', () => {
        t.ok('inside the handler');
    });

    router({
        context: {
            operation: 'GET',
            path: '/test?hello=world'
        }
    });
});

t.test('should sanitize the url - hash', t => {
    t.plan(1);
    const router = createRouter();

    router.use('GET /test', () => {
        t.ok('inside the handler');
    });

    router({
        context: {
            operation: 'GET',
            path: '/test#hello'
        }
    });
});
