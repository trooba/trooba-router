'use strict';

const t = require('tap');
const createRouter = require('..');

t.test('the router is an object with methods', t => {
    t.plan(3);

    const router = require('../lib/router')();

    t.is(typeof router.use, 'function');
    t.is(typeof router.lookup, 'function');
    t.is(typeof router.find, 'function');
});

t.test('register a route', t => {
    t.plan(1);
    const router = createRouter();

    router.use('GET /test', () => {
        t.ok('inside the handler');
    });

    router({
        context: {
            operation: 'GET',
            path: '/test'
        }
    });
});

t.test('default route', t => {
    t.plan(1);

    const router = createRouter({
        defaultRoute: () => {
            t.ok('inside the default route');
        }
    });

    router({
        context: {
            operation: 'GET',
            path: '/test'
        }
    });
});

t.test('parametric route', t => {
    t.plan(1);
    const router = createRouter();

    router.use('GET /test/:id', (pipe) => {
        t.is(pipe.context.route.params.id, 'hello');
    });

    router({
        context: {
            operation: 'GET',
            path: '/test/hello'
        }
    });
});

t.test('multiple parametric route', t => {
    t.plan(2);
    const router = createRouter();

    router.use('GET /test/:id', (pipe) => {
        t.is(pipe.context.route.params.id, 'hello');
    });

    router.use('GET /other-test/:id', (pipe) => {
        t.is(pipe.context.route.params.id, 'world');
    });

    router({
        context: {
            operation: 'GET',
            path: '/test/hello'
        }
    });
    router({
        context: {
            operation: 'GET',
            path: '/other-test/world'
        }
    });
});

t.test('multiple parametric route with the same prefix', t => {
    t.plan(2);
    const router = createRouter();

    router.use('GET /test/:id', (pipe) => {
        t.is(pipe.context.route.params.id, 'hello');
    });

    router.use('GET /test/:id/world', (pipe) => {
        t.is(pipe.context.route.params.id, 'world');
    });

    router({
        context: {
            operation: 'GET',
            path: '/test/hello'
        }
    });
    router({
        context: {
            operation: 'GET',
            path: '/test/world/world'
        }
    });
});

t.test('nested parametric route', t => {
    t.plan(2);
    const router = createRouter();

    router.use('GET /test/:hello/test/:world', (pipe) => {
        t.is(pipe.context.route.params.hello, 'hello');
        t.is(pipe.context.route.params.world, 'world');
    });

    router({
        context: {
            operation: 'GET',
            path: '/test/hello/test/world'
        }
    });
});

t.test('nested parametric route with same prefix', t => {
    t.plan(3);
    const router = createRouter();

    router.use('GET /test', (pipe) => {
        t.ok('inside route');
    });

    router.use('GET /test/:hello/test/:world', (pipe) => {
        t.is(pipe.context.route.params.hello, 'hello');
        t.is(pipe.context.route.params.world, 'world');
    });

    router({
        context: {
            operation: 'GET',
            path: '/test'
        }
    });
    router({
        context: {
            operation: 'GET',
            path: '/test/hello/test/world'
        }
    });
});

t.test('long route', t => {
    t.plan(1);
    const router = createRouter();

    router.use('GET /abc/def/ghi/lmn/opq/rst/uvz', (pipe) => {
        t.ok('inside long path');
    });

    router({
        context: {
            operation: 'GET',
            path: '/abc/def/ghi/lmn/opq/rst/uvz'
        }
    });
});

t.test('long parametric route', t => {
    t.plan(3);
    const router = createRouter();

    router.use('GET /abc/:def/ghi/:lmn/opq/:rst/uvz', (pipe) => {
        t.is(pipe.context.route.params.def, 'def');
        t.is(pipe.context.route.params.lmn, 'lmn');
        t.is(pipe.context.route.params.rst, 'rst');
    });

    router({
        context: {
            operation: 'GET',
            path: '/abc/def/ghi/lmn/opq/rst/uvz'
        }
    });
});

t.test('long parametric route with common prefix', t => {
    t.plan(9);
    const router = createRouter();

    router.use('GET /', (pipe) => {
        throw new Error('I shoul not be here');
    });

    router.use('GET /abc', (pipe) => {
        throw new Error('I shoul not be here');
    });

    router.use('GET /abc/:def', (pipe) => {
        t.is(pipe.context.route.params.def, 'def');
    });

    router.use('GET /abc/:def/ghi/:lmn', (pipe) => {
        t.is(pipe.context.route.params.def, 'def');
        t.is(pipe.context.route.params.lmn, 'lmn');
    });

    router.use('GET /abc/:def/ghi/:lmn/opq/:rst', (pipe) => {
        t.is(pipe.context.route.params.def, 'def');
        t.is(pipe.context.route.params.lmn, 'lmn');
        t.is(pipe.context.route.params.rst, 'rst');
    });

    router.use('GET /abc/:def/ghi/:lmn/opq/:rst/uvz', (pipe) => {
        t.is(pipe.context.route.params.def, 'def');
        t.is(pipe.context.route.params.lmn, 'lmn');
        t.is(pipe.context.route.params.rst, 'rst');
    });

    router({
        context: {
            operation: 'GET',
            path: '/abc/def'
        }
    });
    router({
        context: {
            operation: 'GET',
            path: '/abc/def/ghi/lmn'
        }
    });
    router({
        context: {
            operation: 'GET',
            path: '/abc/def/ghi/lmn/opq/rst'
        }
    });
    router({
        context: {
            operation: 'GET',
            path: '/abc/def/ghi/lmn/opq/rst/uvz'
        }
    });
});

t.test('common prefix', t => {
    t.plan(4);
    const router = createRouter();

    router.use('GET /f', (pipe) => {
        t.ok('inside route');
    });

    router.use('GET /ff', (pipe) => {
        t.ok('inside route');
    });

    router.use('GET /ffa', (pipe) => {
        t.ok('inside route');
    });

    router.use('GET /ffb', (pipe) => {
        t.ok('inside route');
    });

    router({
        context: {
            operation: 'GET',
            path: '/f'
        }
    });
    router({
        context: {
            operation: 'GET',
            path: '/ff'
        }
    });
    router({
        context: {
            operation: 'GET',
            path: '/ffa'
        }
    });
    router({
        context: {
            operation: 'GET',
            path: '/ffb'
        }
    });
});

t.test('wildcard', t => {
    t.plan(1);
    const router = createRouter();

    router.use('GET /test/*', (pipe) => {
        t.is(pipe.context.route.params['*'], 'hello');
    });

    router({
        context: {
            operation: 'GET',
            path: '/test/hello'
        }
    });
});

t.test('catch all wildcard', t => {
    t.plan(1);
    const router = createRouter();

    router.use('GET *', (pipe) => {
        t.is(pipe.context.route.params['*'], '/test/hello');
    });

    router({
        context: {
            operation: 'GET',
            path: '/test/hello'
        }
    });
});

t.test('find should return the route', t => {
    t.plan(1);
    const router = require('../lib/router')();
    const fn = () => {};

    router.use('GET /test', fn);

    t.deepEqual(
        router.find('GET', '/test'), {
            handler: fn,
            params: {}
        }
    );
});

t.test('find should return the route with params', t => {
    t.plan(1);
    const router = require('../lib/router')();
    const fn = () => {};

    router.use('GET /test/:id', fn);

    t.deepEqual(
        router.find('GET', '/test/hello'), {
            handler: fn,
            params: {
                id: 'hello'
            }
        }
    );
});

t.test('find should return a null handler if the route does not exist', t => {
    t.plan(1);
    const router = require('../lib/router')();

    t.deepEqual(
        router.find('GET', '/test'),
        null
    );
});

t.test('should decode the uri - parametric', t => {
    t.plan(1);
    const router = require('../lib/router')();
    const fn = () => {};

    router.use('GET /test/:id', fn);

    t.deepEqual(
        router.find('GET', '/test/he%2Fllo'), {
            handler: fn,
            params: {
                id: 'he/llo'
            }
        }
    );
});

t.test('should decode the uri - wildcard', t => {
    t.plan(1);
    const router = require('../lib/router')();
    const fn = () => {};

    router.use('GET /test/*', fn);

    t.deepEqual(
        router.find('GET', '/test/he%2Fllo'), {
            handler: fn,
            params: {
                '*': 'he/llo'
            }
        }
    );
});

t.test('safe decodeURIComponent', t => {
    t.plan(1);
    const router = require('../lib/router')();
    const fn = () => {};

    router.use('GET /test/:id', fn);

    t.deepEqual(
        router.find('GET', '/test/hel%"Flo'),
        null
    );
});

t.test('safe decodeURIComponent - nested route', t => {
    t.plan(1);
    const router = require('../lib/router')();
    const fn = () => {};

    router.use('GET /test/hello/world/:id/blah', fn);

    t.deepEqual(
        router.find('GET', '/test/hello/world/hel%"Flo/blah'),
        null
    );
});

t.test('safe decodeURIComponent - wildcard', t => {
    t.plan(1);
    const router = require('../lib/router')();
    const fn = () => {};

    router.use('GET /test/*', fn);

    t.deepEqual(
        router.find('GET', '/test/hel%"Flo'),
        null
    );
});

t.test('static routes should be inserted before parametric / 1', t => {
    t.plan(1);
    const router = createRouter();

    router.use('GET /test/hello', () => {
        t.pass('inside correct handler');
    });

    router.use('GET /test/:id', () => {
        t.fail('wrong handler');
    });

    router({
        context: {
            operation: 'GET',
            path: '/test/hello'
        }
    });
});

t.test('static routes should be inserted before parametric / 2', t => {
    t.plan(1);
    const router = createRouter();

    router.use('GET /test/:id', () => {
        t.fail('wrong handler');
    });

    router.use('GET /test/hello', () => {
        t.pass('inside correct handler');
    });

    router({
        context: {
            operation: 'GET',
            path: '/test/hello'
        }
    });
});

t.test('static routes should be inserted before parametric / 3', t => {
    t.plan(2);
    const router = createRouter();

    router.use('GET /:id', () => {
        t.fail('wrong handler');
    });

    router.use('GET /test', () => {
        t.ok('inside correct handler');
    });

    router.use('GET /test/:id', () => {
        t.fail('wrong handler');
    });

    router.use('GET /test/hello', () => {
        t.ok('inside correct handler');
    });

    router({
        context: {
            operation: 'GET',
            path: '/test'
        }
    });
    router({
        context: {
            operation: 'GET',
            path: '/test/hello'
        }
    });
});

t.test('static routes should be inserted before parametric / 4', t => {
    t.plan(2);
    const router = createRouter();

    router.use('GET /:id', () => {
        t.ok('inside correct handler');
    });

    router.use('GET /test', () => {
        t.fail('wrong handler');
    });

    router.use('GET /test/:id', () => {
        t.ok('inside correct handler');
    });

    router.use('GET /test/hello', () => {
        t.fail('wrong handler');
    });

    router({
        context: {
            operation: 'GET',
            path: '/test/id'
        }
    });
    router({
        context: {
            operation: 'GET',
            path: '/id'
        }
    });
});
