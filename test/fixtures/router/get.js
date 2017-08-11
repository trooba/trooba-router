'use strict';

module.exports = pipe => {
    pipe.on('request', request => {
        pipe.respond({
            status: 200,
            body: JSON.stringify({
                hello: 'world'
            })
        });
    });
};
