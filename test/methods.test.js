'use strict';

const t = require('tap');
const router = require('..');

t.test('the router is an object with methods', t => {
    t.plan(3);

    const router = require('../lib/router')();

    t.is(typeof router.use, 'function');
    t.is(typeof router.lookup, 'function');
    t.is(typeof router.find, 'function');
});

t.test('register a route', t => {
    t.plan(1);

    router({
        context: {
            operation: 'GET',
            path: '/test'
        }
    }, {
        'GET /test': () => {
            t.ok('inside the handler');
        }
    });
});

t.test('default route', t => {
    t.plan(1);

    router({
        context: {
            operation: 'GET',
            path: '/test'
        }
    }, {
        defaultRoute: () => {
            t.ok('inside the default route');
        }
    });
});

t.test('parametric route', t => {
    t.plan(1);

    router({
        context: {
            operation: 'GET',
            path: '/test/hello'
        }
    }, {
        'GET /test/:id': (pipe) => {
            t.is(pipe.context.route.params.id, 'hello');
        }
    });
});

t.test('multiple parametric route', t => {
    t.plan(2);
    const store = {};

    router({
        context: {
            operation: 'GET',
            path: '/test/hello'
        },
        store: store
    }, {
        'GET /test/:id': (pipe) => {
            t.is(pipe.context.route.params.id, 'hello');
        },
        'GET /other-test/:id': (pipe) => {
            t.is(pipe.context.route.params.id, 'world');
        }
    });

    router({
        context: {
            operation: 'GET',
            path: '/other-test/world'
        },
        store: store
    });
});

t.test('multiple parametric route with the same prefix', t => {
    t.plan(2);

    const config = {
        'GET /test/:id': (pipe) => {
            t.is(pipe.context.route.params.id, 'hello');
        },
        'GET /test/:id/world': (pipe) => {
            t.is(pipe.context.route.params.id, 'world');
        }
    };

    router({
        context: {
            operation: 'GET',
            path: '/test/hello'
        }
    }, config);

    router({
        context: {
            operation: 'GET',
            path: '/test/world/world'
        }
    }, config);
});

t.test('nested parametric route', t => {
    t.plan(2);

    router({
        context: {
            operation: 'GET',
            path: '/test/hello/test/world'
        }
    }, {
        'GET /test/:hello/test/:world': (pipe) => {
            t.is(pipe.context.route.params.hello, 'hello');
            t.is(pipe.context.route.params.world, 'world');
        }
    });
});

t.test('nested parametric route with same prefix', t => {
    t.plan(3);

    const config = {
        'GET /test': (pipe) => {
            t.ok('inside route');
        },
        'GET /test/:hello/test/:world': (pipe) => {
            t.is(pipe.context.route.params.hello, 'hello');
            t.is(pipe.context.route.params.world, 'world');
        }
    };

    router({
        context: {
            operation: 'GET',
            path: '/test'
        }
    }, config);

    router({
        context: {
            operation: 'GET',
            path: '/test/hello/test/world'
        }
    }, config);
});

t.test('long route', t => {
    t.plan(1);

    router({
        context: {
            operation: 'GET',
            path: '/abc/def/ghi/lmn/opq/rst/uvz'
        }
    }, {
        'GET /abc/def/ghi/lmn/opq/rst/uvz': (pipe) => {
            t.ok('inside long path');
        }
    });
});

t.test('long parametric route', t => {
    t.plan(3);

    router({
        context: {
            operation: 'GET',
            path: '/abc/def/ghi/lmn/opq/rst/uvz'
        }
    }, {
        'GET /abc/:def/ghi/:lmn/opq/:rst/uvz': (pipe) => {
            t.is(pipe.context.route.params.def, 'def');
            t.is(pipe.context.route.params.lmn, 'lmn');
            t.is(pipe.context.route.params.rst, 'rst');
        }
    });
});

t.test('long parametric route with common prefix', t => {
    t.plan(9);

    const config = {
        'GET /': (pipe) => {
            throw new Error('I shoul not be here');
        },
        'GET /abc': (pipe) => {
            throw new Error('I shoul not be here');
        },
        'GET /abc/:def': (pipe) => {
            t.is(pipe.context.route.params.def, 'def');
        },
        'GET /abc/:def/ghi/:lmn': (pipe) => {
            t.is(pipe.context.route.params.def, 'def');
            t.is(pipe.context.route.params.lmn, 'lmn');
        },
        'GET /abc/:def/ghi/:lmn/opq/:rst': (pipe) => {
            t.is(pipe.context.route.params.def, 'def');
            t.is(pipe.context.route.params.lmn, 'lmn');
            t.is(pipe.context.route.params.rst, 'rst');
        },
        'GET /abc/:def/ghi/:lmn/opq/:rst/uvz': (pipe) => {
            t.is(pipe.context.route.params.def, 'def');
            t.is(pipe.context.route.params.lmn, 'lmn');
            t.is(pipe.context.route.params.rst, 'rst');
        }
    };

    router({
        context: {
            operation: 'GET',
            path: '/abc/def'
        }
    }, config);

    router({
        context: {
            operation: 'GET',
            path: '/abc/def/ghi/lmn'
        }
    }, config);

    router({
        context: {
            operation: 'GET',
            path: '/abc/def/ghi/lmn/opq/rst'
        }
    }, config);

    router({
        context: {
            operation: 'GET',
            path: '/abc/def/ghi/lmn/opq/rst/uvz'
        }
    }, config);
});

t.test('common prefix', t => {
    t.plan(4);

    const config = {
        'GET /f': (pipe) => {
            t.ok('inside route');
        },
        'GET /ff': (pipe) => {
            t.ok('inside route');
        },
        'GET /ffa': (pipe) => {
            t.ok('inside route');
        },
        'GET /ffb': (pipe) => {
            t.ok('inside route');
        }
    };

    router({
        context: {
            operation: 'GET',
            path: '/f'
        }
    }, config);
    router({
        context: {
            operation: 'GET',
            path: '/ff'
        }
    }, config);
    router({
        context: {
            operation: 'GET',
            path: '/ffa'
        }
    }, config);
    router({
        context: {
            operation: 'GET',
            path: '/ffb'
        }
    }, config);
});

t.test('wildcard', t => {
    t.plan(1);

    router({
        context: {
            operation: 'GET',
            path: '/test/hello'
        }
    }, {
        'GET /test/*': (pipe) => {
            t.is(pipe.context.route.params['*'], 'hello');
        }
    });
});

t.test('catch all wildcard', t => {
    t.plan(1);

    router({
        context: {
            operation: 'GET',
            path: '/test/hello'
        }
    }, {
        'GET *': (pipe) => {
            t.is(pipe.context.route.params['*'], '/test/hello');
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

    router({
        context: {
            operation: 'GET',
            path: '/test/hello'
        }
    }, {
        'GET /test/hello': () => {
            t.pass('inside correct handler');
        },
        'GET /test/:id': () => {
            t.fail('wrong handler');
        }
    });
});

t.test('static routes should be inserted before parametric / 2', t => {
    t.plan(1);

    router({
        context: {
            operation: 'GET',
            path: '/test/hello'
        }
    }, {
        'GET /test/:id': () => {
            t.fail('wrong handler');
        },
        'GET /test/hello': () => {
            t.pass('inside correct handler');
        }
    });
});

t.test('static routes should be inserted before parametric / 3', t => {
    t.plan(2);

    const config = {
        'GET /:id': () => {
            t.fail('wrong handler');
        },
        'GET /test': () => {
            t.ok('inside correct handler');
        },
        'GET /test/:id': () => {
            t.fail('wrong handler');
        },
        'GET /test/hello': () => {
            t.ok('inside correct handler');
        }
    };

    router({
        context: {
            operation: 'GET',
            path: '/test'
        }
    }, config);

    router({
        context: {
            operation: 'GET',
            path: '/test/hello'
        }
    }, config);
});

t.test('static routes should be inserted before parametric / 4', t => {
    t.plan(2);

    const config = {
        'GET /:id': () => {
            t.ok('inside correct handler');
        },
        'GET /test': () => {
            t.fail('wrong handler');
        },
        'GET /test/:id': () => {
            t.ok('inside correct handler');
        },
        'GET /test/hello': () => {
            t.fail('wrong handler');
        }
    };

    router({
        context: {
            operation: 'GET',
            path: '/test/id'
        }
    }, config);

    router({
        context: {
            operation: 'GET',
            path: '/id'
        }
    }, config);
});
