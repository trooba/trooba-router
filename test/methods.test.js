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

    router({}, {
        'GET /test': () => {
            t.ok('inside the handler');
        }
    }).create({
        operation: 'GET',
        path: '/test'
    });
});

t.test('default route', t => {
    t.plan(1);

    router({}, {
        defaultRoute: () => {
            t.ok('inside the default route');
        }
    }).create({
        operation: 'GET',
        path: '/test'
    });
});

t.test('parametric route', t => {
    t.plan(1);

    router({}, {
        'GET /test/:id': (pipe) => {
            t.is(pipe.context.$route.params.id, 'hello');
        }
    }).create({
        operation: 'GET',
        path: '/test/hello'
    });
});

t.test('multiple parametric route', t => {
    t.plan(2);
    const store = {};

    router({
        store: store
    }, {
        'GET /test/:id': (pipe) => {
            t.is(pipe.context.$route.params.id, 'hello');
        },
        'GET /other-test/:id': (pipe) => {
            t.is(pipe.context.$route.params.id, 'world');
        }
    }).create({
        operation: 'GET',
        path: '/test/hello'
    });

    router({
        store: store
    }).create({
        operation: 'GET',
        path: '/other-test/world'
    });
});

t.test('multiple parametric route with the same prefix', t => {
    t.plan(2);

    const config = {
        'GET /test/:id': (pipe) => {
            t.is(pipe.context.$route.params.id, 'hello');
        },
        'GET /test/:id/world': (pipe) => {
            t.is(pipe.context.$route.params.id, 'world');
        }
    };

    router({}, config).create({
        operation: 'GET',
        path: '/test/hello'
    });

    router({}, config).create({
        operation: 'GET',
        path: '/test/world/world'
    });
});

t.test('nested parametric route', t => {
    t.plan(2);

    router({}, {
        'GET /test/:hello/test/:world': (pipe) => {
            t.is(pipe.context.$route.params.hello, 'hello');
            t.is(pipe.context.$route.params.world, 'world');
        }
    }).create({
        operation: 'GET',
        path: '/test/hello/test/world'
    });
});

t.test('nested parametric route with same prefix', t => {
    t.plan(3);

    const config = {
        'GET /test': (pipe) => {
            t.ok('inside route');
        },
        'GET /test/:hello/test/:world': (pipe) => {
            t.is(pipe.context.$route.params.hello, 'hello');
            t.is(pipe.context.$route.params.world, 'world');
        }
    };

    router({}, config).create({
        operation: 'GET',
        path: '/test'
    });

    router({}, config).create({
        operation: 'GET',
        path: '/test/hello/test/world'
    });
});

t.test('long route', t => {
    t.plan(1);

    router({}, {
        'GET /abc/def/ghi/lmn/opq/rst/uvz': (pipe) => {
            t.ok('inside long path');
        }
    }).create({
        operation: 'GET',
        path: '/abc/def/ghi/lmn/opq/rst/uvz'
    });
});

t.test('long parametric route', t => {
    t.plan(3);

    router({}, {
        'GET /abc/:def/ghi/:lmn/opq/:rst/uvz': (pipe) => {
            t.is(pipe.context.$route.params.def, 'def');
            t.is(pipe.context.$route.params.lmn, 'lmn');
            t.is(pipe.context.$route.params.rst, 'rst');
        }
    }).create({
        operation: 'GET',
        path: '/abc/def/ghi/lmn/opq/rst/uvz'
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
            t.is(pipe.context.$route.params.def, 'def');
        },
        'GET /abc/:def/ghi/:lmn': (pipe) => {
            t.is(pipe.context.$route.params.def, 'def');
            t.is(pipe.context.$route.params.lmn, 'lmn');
        },
        'GET /abc/:def/ghi/:lmn/opq/:rst': (pipe) => {
            t.is(pipe.context.$route.params.def, 'def');
            t.is(pipe.context.$route.params.lmn, 'lmn');
            t.is(pipe.context.$route.params.rst, 'rst');
        },
        'GET /abc/:def/ghi/:lmn/opq/:rst/uvz': (pipe) => {
            t.is(pipe.context.$route.params.def, 'def');
            t.is(pipe.context.$route.params.lmn, 'lmn');
            t.is(pipe.context.$route.params.rst, 'rst');
        }
    };

    router({}, config).create({
        operation: 'GET',
        path: '/abc/def'
    });

    router({}, config).create({
        operation: 'GET',
        path: '/abc/def/ghi/lmn'
    });

    router({}, config).create({
        operation: 'GET',
        path: '/abc/def/ghi/lmn/opq/rst'
    });

    router({}, config).create({
        operation: 'GET',
        path: '/abc/def/ghi/lmn/opq/rst/uvz'
    });
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

    router({}, config).create({
        operation: 'GET',
        path: '/f'
    });
    router({}, config).create({
        operation: 'GET',
        path: '/ff'
    });
    router({}, config).create({
        operation: 'GET',
        path: '/ffa'
    });
    router({}, config).create({
        operation: 'GET',
        path: '/ffb'
    });
});

t.test('wildcard', t => {
    t.plan(1);

    router({}, {
        'GET /test/*': (pipe) => {
            t.is(pipe.context.$route.params['*'], 'hello');
        }
    }).create({
        operation: 'GET',
        path: '/test/hello'
    });
});

t.test('catch all wildcard', t => {
    t.plan(1);

    router({}, {
        'GET *': (pipe) => {
            t.is(pipe.context.$route.params['*'], '/test/hello');
        }
    }).create({
        operation: 'GET',
        path: '/test/hello'
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

    router({}, {
        'GET /test/hello': () => {
            t.pass('inside correct handler');
        },
        'GET /test/:id': () => {
            t.fail('wrong handler');
        }
    }).create({
        operation: 'GET',
        path: '/test/hello'
    });
});

t.test('static routes should be inserted before parametric / 2', t => {
    t.plan(1);

    router({}, {
        'GET /test/:id': () => {
            t.fail('wrong handler');
        },
        'GET /test/hello': () => {
            t.pass('inside correct handler');
        }
    }).create({
        operation: 'GET',
        path: '/test/hello'
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

    router({}, config).create({
        operation: 'GET',
        path: '/test'
    });

    router({}, config).create({
        operation: 'GET',
        path: '/test/hello'
    });
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

    router({}, config).create({
        operation: 'GET',
        path: '/test/id'
    });

    router({}, config).create({
        operation: 'GET',
        path: '/id'
    });
});
