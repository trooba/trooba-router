'use strict';

/*
  Node type
    static: 0,
    param: 1,
    matchAll: 2,
    regex: 3

  Char codes:
    '/': 47
    ':': 58
    '*': 42
    '?': 63
    '#': 35
*/

const assert = require('assert');
const Node = require('./node');
var errored = false;

function Router(opts) {
    if (!(this instanceof Router)) {
        return new Router(opts);
    }
    opts = opts || {};

    if (opts.defaultRoute) {
        assert.equal(typeof opts.defaultRoute, 'function', 'The default route must be a function');
        this.defaultRoute = opts.defaultRoute;
    }

    this.tree = new Node();

    Object.keys(opts).forEach(path => {
        if (path === 'defaultRoute') {
            return;
        }
        let handler = opts[path];
        if (typeof handler === 'string') {
            handler = require(handler);
        }
        this.use(path, handler);
    });
}

Router.prototype.use = function(path, handler) {
    var self = this;
    assert.equal(typeof path, 'string', 'Path should be a string');
    assert.equal(typeof handler, 'function', 'Handler should be a function');
    var operations;

    // check if operation is provided as part of path
    // GET /path/to/resource
    // GET|POST /path/to/resource
    // * /path/to/resource
    var parts = path.split(/\s+/);
    operations = parts[0].split('|');
    path = parts[1];

    if (!operations) {
        operations = ['*'];
    }

    operations.forEach(insertOperation);

    function insertOperation(operation) {
        const params = [];
        var j = 0;

        for (var i = 0, len = path.length; i < len; i++) {
            // search for parametric or wildcard routes
            // parametric route
            if (path.charCodeAt(i) === 58) {
                j = i + 1;

                self._insert(operation, path.slice(0, i), 0, null, null, null);

                // isolate the parameter name
                while (i < len && path.charCodeAt(i) !== 47) {
                    i++;
                }
                var parameter = path.slice(j, i);
                var isRegex = parameter.indexOf('(') > -1;
                var regex = isRegex ? parameter.slice(parameter.indexOf('('), i) : null;
                if (isRegex) {
                    regex = new RegExp(regex);
                }
                params.push(parameter.slice(0, isRegex ? parameter.indexOf('(') : i));

                path = path.slice(0, j) + path.slice(i);
                i = j;
                len = path.length;

                // if the path is ended
                if (i === len) {
                    return self._insert(operation, path.slice(0, i), regex ? 3 : 1, params, handler, regex);
                }
                self._insert(operation, path.slice(0, i), regex ? 3 : 1, params, null, regex);

                // wildcard route
            } else if (path.charCodeAt(i) === 42) {
                self._insert(operation, path.slice(0, i), 0, null, null);
                params.push('*');
                return self._insert(operation, path.slice(0, len), 2, params, handler);
            }
        }
        // static route
        self._insert(operation, path, 0, params, handler);
    }
};

Router.prototype._insert = function(operation, path, kind, params, handler, regex) {
    var prefix = '';
    var pathLen = 0;
    var prefixLen = 0;
    var len = 0;
    var max = 0;
    var node = null;
    var currentNode = this.tree;

    while (true) {
        prefix = currentNode.prefix;
        prefixLen = prefix.length;
        pathLen = path.length;
        len = 0;

        // search for the longest common prefix
        max = pathLen < prefixLen ? pathLen : prefixLen;
        while (len < max && path[len] === prefix[len]) {
            len++;
        }

        if (len < prefixLen) {
            // split the node in the radix tree and add it to the parent
            node = new Node(prefix.slice(len), currentNode.children, currentNode.kind, currentNode.map, currentNode.regex);

            // reset the parent
            currentNode.children = [node];
            currentNode.numberOfChildren = 1;
            currentNode.prefix = prefix.slice(0, len);
            currentNode.label = currentNode.prefix[0];
            currentNode.map = null;
            currentNode.kind = 0;
            currentNode.regex = null;

            if (len === pathLen) {
                // add the handler to the parent node
                assert(!currentNode.getHandler(operation), `Method '${operation}' already declared for route '${path}'`);
                currentNode.setHandler(operation, handler, params);
                currentNode.kind = kind;
            } else {
                // create a child node and add an handler to it
                node = new Node(path.slice(len), [], kind, null, regex);
                node.setHandler(operation, handler, params);
                // add the child to the parent
                currentNode.add(node);
            }
        } else if (len < pathLen) {
            path = path.slice(len);
            node = currentNode.findByLabel(path[0]);
            if (node) {
                // we must go deeper in the tree
                currentNode = node;
                continue;
            }
            // create a new child node
            node = new Node(path, [], kind, null, regex);
            node.setHandler(operation, handler, params);
            // add the child to the parent
            currentNode.add(node);
        } else if (handler) {
            // the node already exist
            assert(!currentNode.getHandler(operation), `Method '${operation}' already declared for route '${path}'`);
            currentNode.setHandler(operation, handler, params);
        }
        return;
    }
};

Router.prototype.lookup = function(context) {
    assert.ok(context.path, 'Cannot find path in the context');
    assert.ok(context.operation, 'Cannot find operation in the context');
    const handlerMeta = this.find(context.operation,
        sanitizePath(context.path));
    return handlerMeta || {
        handler: this.defaultRoute
    };
};

Router.prototype.find = function(operation, path) {
    var currentNode = this.tree;
    var node = null;
    var kind = 0;
    var decoded = null;
    var pindex = 0;
    var params = [];
    var pathLen = 0;
    var prefix = '';
    var prefixLen = 0;
    var len = 0;
    var i = 0;

    while (true) {
        pathLen = path.length;
        prefix = currentNode.prefix;
        prefixLen = prefix.length;
        len = 0;

        // found the route
        if (pathLen === 0 || path === prefix) {
            var handle = currentNode.getHandler(operation);

            if (!handle) {
                return null;
            }

            var paramNames = handle.params;
            var paramsObj = {};

            for (i = 0; i < paramNames.length; i++) {
                paramsObj[paramNames[i]] = params[i];
            }

            return {
                handler: handle.handler,
                params: paramsObj
            };
        }

        // search for the longest common prefix
        i = pathLen < prefixLen ? pathLen : prefixLen;
        while (len < i && path[len] === prefix[len]) {
            len++;
        }

        if (len === prefixLen) {
            path = path.slice(len);
            pathLen = path.length;
        }

        node = currentNode.find(path[0]);
        if (!node) {
            return null;
        }
        kind = node.kind;

        // static route
        if (kind === 0) {
            currentNode = node;
            continue;
        }

        // parametric route
        if (kind === 1) {
            currentNode = node;
            i = 0;
            while (i < pathLen && path.charCodeAt(i) !== 47) {
                i++;
            }
            decoded = fastDecode(path.slice(0, i));
            if (errored) {
                return null;
            }
            params[pindex++] = decoded;
            path = path.slice(i);
            continue;
        }

        // wildcard route
        if (kind === 2) {
            decoded = fastDecode(path);
            if (errored) {
                return null;
            }
            params[pindex] = decoded;
            currentNode = node;
            path = '';
            continue;
        }

        // parametric(regex) route
        if (kind === 3) {
            currentNode = node;
            i = 0;
            while (i < pathLen && path.charCodeAt(i) !== 47) {
                i++;
            }
            decoded = fastDecode(path.slice(0, i));
            if (errored) {
                return null;
            }
            if (!node.regex.test(decoded)) {
                return;
            }
            params[pindex++] = decoded;
            path = path.slice(i);
            continue;
        }

        // route not found
        if (len !== prefixLen) {
            return null;
        }
    }
};

Router.prototype.prettyPrint = function() {
    return this.tree.prettyPrint('', true);
};

module.exports = Router;

function sanitizePath(url) {
    for (var i = 0, len = url.length; i < len; i++) {
        var charCode = url.charCodeAt(i);
        if (charCode === 63 || charCode === 35) {
            return url.slice(0, i);
        }
    }
    return url;
}

function fastDecode(path) {
    errored = false;
    try {
        return decodeURIComponent(path);
    } catch (err) {
        errored = true;
    }
}
