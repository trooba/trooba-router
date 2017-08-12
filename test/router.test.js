'use strict';

const t = require('tap');
const Trooba = require('trooba');
const router = require('..');

t.test('basic router with trooba config', t => {
    t.plan(8);

    const pipe = Trooba
    .use(router, {
        'GET /test': pipe => {
            t.ok(pipe.context.route.params);
            pipe.on('request', request => {
                pipe.respond({
                    status: 200,
                    body: JSON.stringify({
                        hello: 'world'
                    })
                });
            });
        },
        'PUT /test/:id': pipe => {
            t.ok(pipe.context.route.params);
            pipe.on('request', request => {
                pipe.respond({
                    status: 200,
                    body: JSON.stringify({
                        hello: pipe.context.route.params.id
                    })
                });
            });
        }
    })
    .build(); // simulate service creation

    pipe.create({
        path: '/test',
        operation: 'GET'
    }).request({}, (err, response) => {
        t.error(err);
        t.strictEqual(response.status, 200);
        t.deepEqual(JSON.parse(response.body), {
            hello: 'world'
        });
    });

    pipe.create({
        path: '/test/123',
        operation: 'PUT'
    }).request({}, (err, response) => {
        t.error(err);
        t.strictEqual(response.status, 200);
        t.deepEqual(JSON.parse(response.body), {
            hello: '123'
        });
    });
});

t.test('basic router with trooba config and handlers as modules', t => {
    t.plan(6);

    const pipe = Trooba
    .use(router, {
        'GET /test': require.resolve('./fixtures/router/get'),
        'PUT /test/:id': require.resolve('./fixtures/router/put')
    })
    .build(); // simulate service creation

    pipe.create({
        path: '/test',
        operation: 'GET'
    }).request({}, (err, response) => {
        t.error(err);
        t.strictEqual(response.status, 200);
        t.deepEqual(JSON.parse(response.body), {
            hello: 'world'
        });
    });

    pipe.create({
        path: '/test/123',
        operation: 'PUT'
    }).request({}, (err, response) => {
        t.error(err);
        t.strictEqual(response.status, 200);
        t.deepEqual(JSON.parse(response.body), {
            hello: '123'
        });
    });
});

t.test('router should share storage', t => {
    t.plan(1);

    const store = {};

    router({
        store: store,
        context: {}
    }, {
        'GET /test': pipe => {
            t.ok(pipe.context.route.params);
        }
    });

    router({
        store: store,
        context: {
            operation: 'GET',
            path: '/test'
        }
    });
});
