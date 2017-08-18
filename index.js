'use strict';

const Trooba = require('trooba');
const Router = require('./lib/router');

/*
    The router uses contextual metadata assgined
    to the pipe context to resolve an appropriate handler
*/
module.exports = function pipeRouterFactory(pipe, config) {
    pipe.store = pipe.store || {};
    pipe.store.routePipe = pipe.store.routePipe ||
        Trooba
        .use(module.exports.match, config)
        .use(module.exports.execute, config)
        .build();

    return pipe.store.routePipe;
};

module.exports.match = function (pipe, config) {
    const store = pipe.store || {};
    const router = store.router = store.router || new Router(config);
    // if this is not a request flow, then return
    if (!pipe.context.operation) {
        return;
    }
    // otherwise continue with the flow
    pipe.context.$route = pipe.context.$route || router.lookup(pipe.context);

    if (pipe.context.$route.params) {
        pipe.on('request', (request, next) => {
            // merge params into request
            // it is possible to override existing parameters
            // but it is a trade-off to make it more generic
            // we can later group it into array
            Object.assign(request, pipe.context.$route.params);
            next();
        });
    }
};

module.exports.execute = function (pipe, config) {
    return pipe.context.$route &&
        pipe.context.$route.handler &&
        pipe.context.$route.handler(pipe, config);
};
