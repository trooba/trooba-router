# trooba-router

[![codecov](https://codecov.io/gh/trooba/trooba-router/branch/master/graph/badge.svg)](https://codecov.io/gh/trooba/trooba-router)
[![Build Status](https://travis-ci.org/trooba/trooba-router.svg?branch=master)](https://travis-ci.org/trooba/trooba-router) [![NPM](https://img.shields.io/npm/v/trooba-router.svg)](https://www.npmjs.com/package/trooba-router)
[![Downloads](https://img.shields.io/npm/dm/trooba-router.svg)](http://npm-stat.com/charts.html?package=trooba-router)
[![Known Vulnerabilities](https://snyk.io/test/github/trooba/trooba-router/badge.svg)](https://snyk.io/test/github/trooba/trooba-router)

The module provides a generic router for [Trooba framework](https://trooba.github.io)

It is mostly based on very fast [find-my-way router](https://www.npmjs.com/package/find-my-way) and adjusted to trooba pipeline API.

The router matching is based on the pipeline context information.

* operation (optional) defines operation, which in http case it would be set to one of http methods (GET, POST, PUT, etc.)
* path (required) defines a specific route

The above parameters are expected to be set by a transport to pipe.context to make sure router works correctly.

## Install

```bash
$ npm install trooba-router -S
```

## Usage

### Http server

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

### Routing service calls

One can also use router in non-service pipelines, for example, in service invocation pipelines.
This can make invocation of multiple services starting from the same point and is based on some context to match the route.

```js
const Trooba = require('trooba');
const router = require('trooba-router');

const pipe = Trooba
.use(router, {
    'OP1 /path/to/http': pipe => {
        return Trooba
            .use('handler1')
            .use('handler2')
            .use('http', {
                hostname: 'rest.service'
            })
            .build();
    },
    'OP2 /path/to/soap': pipe => {
        return Trooba
            .use('handler1')
            .use('handler2')
            .use('soap', {
                hostname: 'soap.service'
            })
            .build();
    }
})
.build();
```

### Routing metadata

As a pipeline grows some modules may need to know the target route before it reaches the router pipe point. For example, one would like to attach metadata to the specific route that acts as a route configuration that some middleware/handler may use during their execution.

```js
const Trooba = require('trooba');
const router = require('trooba-router');

Trooba
.use('http')
// will attach route information to pipe.context.$route
// and handler to pipe.context.$route.handler
.use('trooba-router/match', {
    'GET /path/to/resource': {
        handler: pipe => {
            pipe.on('request', request => {
                pipe.respond({
                    status: 200,
                    body: 'hello world'
                });
            })
        },
        securityPolicy: 'authenticate',
        validateRequest: true
    },
    'GET /path/to/pipe': {
        handler: () => {
            return Trooba.use('handler1')
                .use('handler2')
                .use(pipe => {
                    pipe.respond({
                        status: 200,
                        body: 'response from other pipe'
                    });
                })
                .build();
        },
        securityPolicy: 'none'
    }
})
.use('security')
.use('validation')
// will execute route handler attached to pipe.context.$route.handler
.use('trooba-router/execute');
```
