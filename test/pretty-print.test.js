'use strict';

const t = require('tap');
const createRouter = require('../lib/router');

t.test('pretty print - static routes', t => {
    t.plan(2);

    const router = createRouter();
    router.use('GET /test', () => {});
    router.use('GET /test/hello', () => {});
    router.use('GET /hello/world', () => {});

    const tree = router.prettyPrint();

    const expected = `└── /
    ├── test (GET)
    │   └── /hello (GET)
    └── hello/world (GET)
`;

    t.is(typeof tree, 'string');
    t.equal(tree, expected);
});

t.test('pretty print - parametric routes', t => {
    t.plan(2);

    const router = createRouter();
    router.use('GET /test', () => {});
    router.use('GET /test/:hello', () => {});
    router.use('GET /hello/:world', () => {});

    const tree = router.prettyPrint();

    const expected = `└── /
    ├── test (GET)
    │   └── /
    │       └── :hello (GET)
    └── hello/
        └── :world (GET)
`;

    t.is(typeof tree, 'string');
    t.equal(tree, expected);
});

t.test('pretty print - mixed parametric routes', t => {
    t.plan(2);

    const router = createRouter();
    router.use('GET /test', () => {});
    router.use('GET /test/:hello', () => {});
    router.use('POST /test/:hello', () => {});
    router.use('GET /test/:hello/world', () => {});

    const tree = router.prettyPrint();

    const expected = `└── /
    └── test (GET)
        └── /
            └── :hello (GET)
                :hello (POST)
                └── /world (GET)
`;

    t.is(typeof tree, 'string');
    t.equal(tree, expected);
});

t.test('pretty print - wildcard routes', t => {
    t.plan(2);

    const router = createRouter();
    router.use('GET /test', () => {});
    router.use('GET /test/*', () => {});
    router.use('GET /hello/*', () => {});

    const tree = router.prettyPrint();

    const expected = `└── /
    ├── test (GET)
    │   └── /
    │       └── * (GET)
    └── hello/
        └── * (GET)
`;

    t.is(typeof tree, 'string');
    t.equal(tree, expected);
});
