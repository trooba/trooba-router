'use strict';

const Assert = require('assert');
const Http = require('http');
const t = require('tap');
const Trooba = require('trooba');
const request = require('request');
const router = require('..');

t.test('basic router with http server', t => {
    t.plan(5);

    const app = createApp(router, {
        'GET /test': pipe => {
            t.ok(pipe.context.$route.params);
            pipe.on('request', request => {
                pipe.respond({
                    status: 200,
                    body: JSON.stringify({
                        hello: 'world'
                    })
                });
            });
        }
    });

    const server = app.listen((err) => {
        t.error(err);
        server.unref();

        request({
            method: 'GET',
            uri: 'http://localhost:' + server.address().port + '/test'
        }, (err, response, body) => {
            t.error(err);
            t.strictEqual(response.statusCode, 200);
            t.deepEqual(JSON.parse(body), {
                hello: 'world'
            });
        });
    });
});

t.test('router with params with http server', t => {
    t.plan(5);

    const app = createApp(router, {
        'GET /test/:id': pipe => {
            t.is(pipe.context.$route.params.id, 'hello');
            pipe.respond({
                status: 200,
                body: JSON.stringify({
                    hello: 'world'
                })
            });
        }
    });
    const server = app.listen((err) => {
        t.error(err);
        server.unref();

        request({
            method: 'GET',
            uri: 'http://localhost:' + server.address().port + '/test/hello'
        }, (err, response, body) => {
            t.error(err);
            t.strictEqual(response.statusCode, 200);
            t.deepEqual(JSON.parse(body), {
                hello: 'world'
            });
        });
    });
});

t.test('default route', t => {
    t.plan(3);

    const app = createApp(router, {
        defaultRoute: pipe => {
            pipe.on('request', () => {
                pipe.respond({
                    status: 404
                });
            });
        }
    });

    const server = app.listen((err) => {
        t.error(err);
        server.unref();

        request({
            method: 'GET',
            uri: 'http://localhost:' + server.address().port
        }, (err, response, body) => {
            t.error(err);
            t.strictEqual(response.statusCode, 404);
        });
    });
});

function createApp(router, config) {
    return Trooba
        .use(httpServerTransport, {
            port: 0
        })
        // controller
        .use(router, config)
        .build()
        .create('server:default');
}

function httpServerTransport(pipe, config) {
    Assert.ok(config.port !== undefined, 'Port must be provided as part of transport config');

    pipe.set('server:default', function serverFactory(pipe) {
        return {
            listen(callback) {
                const server =  Http.createServer((req, res) => {
                    // here for the demo's sake we are not going to generalize
                    // request and response and handle them as is
                    pipe
                    .create({
                        operation: req.method,
                        path: req.url,
                    })
                    .request(req, (err, response) => {
                        if (err) {
                            res.writeHead(500);
                            res.end(err.message);
                            return;
                        }
                        res.writeHead(response.status, response.headers);
                        res.end(response.body);
                    });
                });

                return server.listen(config.port, callback);
            }
        };
    });
}
