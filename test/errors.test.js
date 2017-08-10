'use strict';

const t = require('tap');
const createRoute = require('../lib/router');

t.test('Path should be a string', t => {
    t.plan(1);
    const router = createRoute();

    try {
        router.use(0, () => {});
        t.fail('path should be a string');
    } catch (e) {
        t.is(e.message, 'Path should be a string');
    }
});

t.test('Handler should be a function', t => {
    t.plan(1);
    const router = createRoute();

    try {
        router.use('* /test', 0);
        t.fail('handler should be a function');
    } catch (e) {
        t.is(e.message, 'Handler should be a function');
    }
});

t.test('The default route must be a function', t => {
    t.plan(1);
    try {
        createRoute({
            defaultRoute: '/404'
        });
        t.fail('default route must be a function');
    } catch (e) {
        t.is(e.message, 'The default route must be a function');
    }
});

t.test('Method already declared', t => {
    t.plan(1);
    const router = createRoute();

    router.use('GET /test', () => {});
    try {
        router.use('GET /test', () => {});
        t.fail('method already declared');
    } catch (e) {
        t.is(e.message, `Method 'GET' already declared for route 'test'`);
    }
});

t.test('Method already declared nested route', t => {
    t.plan(1);
    const router = createRoute();

    router.use('GET /test', () => {});
    router.use('GET /test/hello', () => {});
    router.use('GET /test/world', () => {});

    try {
        router.use('GET /test/hello', () => {});
        t.fail('method already delcared in nested route');
    } catch (e) {
        t.is(e.message, `Method 'GET' already declared for route 'hello'`);
    }
});
