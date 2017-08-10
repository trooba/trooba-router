'use strict';

const t = require('tap');
const createRouter = require('..');

t.test('route with matching regex', t => {
    t.plan(1);
    const router = createRouter({
        defaultRoute: () => {
            t.fail('route not matched');
        }
    });

    router.use('GET /test/:id(^\\d+$)', () => {
        t.ok('regex match');
    });

    router({
        context: {
            operation: 'GET',
            path: '/test/12'
        }
    });
});

t.test('route without matching regex', t => {
    t.plan(1);
    const router = createRouter({
        defaultRoute: () => {
            t.ok('route not matched');
        }
    });

    router.use('GET /test/:id(^\\d+$)', () => {
        t.fail('regex match');
    });

    router({
        context: {
            operation: 'GET',
            path: '/test/test'
        }
    });
});

t.test('nested route with matching regex', t => {
    t.plan(1);
    const router = createRouter({
        defaultRoute: () => {
            t.fail('route not matched');
        }
    });

    router.use('GET /test/:id(^\\d+$)/hello', () => {
        t.ok('regex match');
    });

    router({
        context: {
            operation: 'GET',
            path: '/test/12/hello'
        }
    });
});

t.test('mixed nested route with matching regex', t => {
    t.plan(2);
    const router = createRouter({
        defaultRoute: () => {
            t.fail('route not matched');
        }
    });

    router.use('GET /test/:id(^\\d+$)/hello/:world', (pipe) => {
        t.is(pipe.context.route.params.id, '12');
        t.is(pipe.context.route.params.world, 'world');
    });

    router({
        context: {
            operation: 'GET',
            path: '/test/12/hello/world'
        }
    });
});

t.test('mixed nested route with double matching regex', t => {
    t.plan(2);
    const router = createRouter({
        defaultRoute: () => {
            t.fail('route not matched');
        }
    });

    router.use('GET /test/:id(^\\d+$)/hello/:world(^\\d+$)', (pipe) => {
        t.is(pipe.context.route.params.id, '12');
        t.is(pipe.context.route.params.world, '15');
    });

    router({
        context: {
            operation: 'GET',
            path: '/test/12/hello/15'
        }
    });
});

t.test('mixed nested route without double matching regex', t => {
    t.plan(1);
    const router = createRouter({
        defaultRoute: () => {
            t.ok('route not matched');
        }
    });

    router.use('GET /test/:id(^\\d+$)/hello/:world(^\\d+$)', () => {
        t.fail('route mathed');
    });

    router({
        context: {
            operation: 'GET',
            path: '/test/12/hello/test'
        }
    });
});

t.test('route with an extension regex', t => {
    t.plan(1);
    const router = createRouter({
        defaultRoute: () => {
            t.fail('route not matched');
        }
    });

    router.use('GET /test/:file(^\\d+).png', () => {
        t.ok('regex match');
    });

    router({
        context: {
            operation: 'GET',
            path: '/test/12.png'
        }
    });
});

t.test('route with an extension regex - no match', t => {
    t.plan(1);
    const router = createRouter({
        defaultRoute: () => {
            t.ok('route not matched');
        }
    });

    router.use('GET /test/:file(^\\d+).png', () => {
        t.fail('regex match');
    });

    router({
        context: {
            operation: 'GET',
            path: '/test/aa.png'
        }
    });
});
