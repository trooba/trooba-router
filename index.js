'use strict';

const Router = require('./lib/router');

/*
    The router uses contextual metadata assgined
    to the pipe context to resolve an appropriate handler
*/
module.exports = function PipeRouterFactory(config) {
    const router = new Router(config);
    let routedInited = false;
    function pipeRouter(pipe, config) {
        // for init phase when there is not operation/path
        if (!routedInited) {
            // if any path provided, configure it
            if (config) {
                Object.keys(config).forEach(path => {
                    let handler = config[path];
                    if (typeof handler === 'string') {
                        handler = require(handler);
                    }
                    router.use(path, handler);
                });
            }
            routedInited = true;
            // if this is not a request flow, then return
            if (!pipe.context.operation) {
                return;
            }
            // otherwise continue with the flow
        }

        const routeHandlerMeta = router.lookup(pipe.context);
        pipe.context.route = pipe.context.route || {};
        pipe.context.route.params = routeHandlerMeta.params;
        return routeHandlerMeta.handler(pipe);
    }
    pipeRouter.use = (path, handler) => router.use(path, handler);
    pipeRouter.prettyPrint = () => router.prettyPrint();
    return pipeRouter;
};
