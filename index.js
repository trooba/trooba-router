'use strict';

const Router = require('./lib/router');

/*
    The router uses contextual metadata assgined
    to the pipe context to resolve an appropriate handler
*/
module.exports = function pipeRouterFactory(pipe, config) {

    const store = pipe.store || {};
    const router = store.router = store.router || new Router(config);
    // if this is not a request flow, then return
    if (!pipe.context.operation) {
        return;
    }
    // otherwise continue with the flow
    const routeHandlerMeta = router.lookup(pipe.context);
    pipe.context.route = pipe.context.route || {};
    pipe.context.route.params = routeHandlerMeta.params;

    return routeHandlerMeta.handler(pipe);
};
