'use strict';

const Router = require('./lib/router');

/*
    The router uses contextual metadata assgined
    to the pipe context to resolve an appropriate handler
*/
module.exports = function pipeRouterFactory(pipe, config) {
    module.exports.match(pipe, config);
    return pipe.context.$route &&
        pipe.context.$route.handler &&
        pipe.context.$route.handler(pipe, config);
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
};

module.exports.execute = function (pipe, config) {
    return pipe.context.$route &&
        pipe.context.$route.handler &&
        pipe.context.$route.handler(pipe, config);
};
