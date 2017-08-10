# trooba-router

The module provide generic router for [Trooba framework](https://trooba.github.io)

The router matching is based on the context information such as request method and URL path for http servers.
Since this is a generic router we would like to make it flexible by allowing to inject different matchers.
To provide basic functionality the module defines the following parameters

* operation (optional) defines operation, which in http would be set to one of http methods (GET, POST, PUT, etc.)
* path (required) defines a specific route

The above parameters should be set to pipe.context to make sure router works correctly.

## Install

```bash
$ npm install trooba-router -S
```

## Usage

```js
const Trooba = require('trooba');
const router = require('trooba-router');

Trooba
.use('http')
.use('trooba-router', {
    'GET /path/to/resource': pipe => {
        pipe.on('request', request => {
            pipe.respond({
                status: 200,
                body: 'hello world'
            });
        })
    },
    'GET /path/to/pipe': () => {
        return Trooba.use('handler1')
            .use('handler2')
            .use(pipe => {
                pipe.respond({
                    status: 200,
                    body: 'response from other pipe'
                });
            })
            .build();
    }
})
```

Or one can build routes first and then pass them to the main pipe

```js
const Trooba = require('trooba');
const router = require('trooba-router');

router.use('GET /path/to/resource', pipe => {
    pipe.on('request', request => {
        pipe.respond({
            status: 200,
            body: 'hello world'
        });
    })
});
router.use('GET /path/to/pipe', pipe => {
    return Trooba.use('handler1')
        .use('handler2')
        .use(pipe => {
            pipe.respond({
                status: 200,
                body: 'response from other pipe'
            });
        })
        .build();
})

const pipe = Trooba
.use('http')
.use(router)
.build();
```

One can also use router in non-service pipelines, for example, in service invocation pipelines.
This can make invocation of multiple services starting from the same point and is based on some context to match the route.

```js
const Trooba = require('trooba');
const router = require('trooba-router');

router.use('GET /path/to/external', pipe => {
    pipe.on('request', request => {
        pipe.respond({
            status: 200,
            body: 'hello world'
        });
    })
});
router.use('PUT /path/to/pipe', pipe => {
    return Trooba.use('handler1')
        .use('handler2')
        .use(pipe => {
            pipe.respond({
                status: 200,
                body: 'response from other pipe'
            });
        })
        .build();
})

const pipe = Trooba
.use('http')
.use(router)
.build();
```
