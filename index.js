'use strict';

const Router = require('./lib/router');

/*
    The router uses contextual metadata assgined
    to the pipe context to resolve an appropriate handler
*/
module.exports = function PipeRouterFactory(config) {
    const router = new Router(config);
    function pipeRouter(pipe, config) {
        // for init phase when there is not operation/path
        if (!pipe.context.operation) {
            // if any path provided, configure it
            if (config) {
                Object.keys(config).forEach(path => {
                    let handler = config[path];
                    if (typeof handler === 'string') {
                        handler = require('handler');
                    }
                    router.use(path, handler);
                });
            }
            return;
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
