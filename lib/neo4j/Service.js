/*
 * Copyright (c) 2002-2012 "Neo Technology,"
 * Network Engine for Objects in Lund AB [http://neotechnology.com]
 *
 * This file is part of Neo4j.
 *
 * Neo4j is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

var neo4j = {
    proxy:require("./proxy"),
    log:require("./log"),
    cachedFunction:require("./cachedFunction"),
    Events:require("./Events")
};
var _ = require("underscore");
/**
 * Creates event handling system for this service, as well as initializing
 * various properties.
 *
 * Sets the this.db attribute. Also hooks an event listener that waits for the
 * services.loaded event. If services.loaded is triggered, and this service is
 * not initialized, it is assumed that this service is not available.
 *
 * @class parent class that provides common items for services, such as a http
 *        interface.
 */
neo4j.Service = function (db) {

    /**
     * List of commands waiting to be run as soon as the service is initialized.
     */
    this.callsWaiting = [];

    this.loadServiceDefinition = neo4j.cachedFunction(this.loadServiceDefinition, 0);

    /**
     * Event handler. This is unique for each service.
     *
     * @see {@link neo4j.Events}
     */
    this.events = new neo4j.Events();

    /**
     * Convinience access to event bind method.
     */
    this.bind = neo4j.proxy(this.events.bind, this.events);

    /**
     * Convinience access to event trigger method.
     */
    this.trigger = neo4j.proxy(this.events.trigger, this.events);

    /**
     * A reference to the GraphDatabase instance.
     */
    this.db = db;

    this.db.bind("services.loaded", neo4j.proxy(function () {
        if (!this.initialized) {
            this.setNotAvailable();
        }
    }, this));
};

/**
 * Used to generate boilerplate for service methods.
 *
 * @param args
 *            is an argument map
 *
 * @param args.method
 *            is the http method to call the server with
 * @param args.resource
 *            is the resource key, as available in this.resources
 * @param args.urlArgs
 *            (optional) is an array of named arguments that map to placeholders
 *            in the url
 * @param args.after
 *            (optional) will be called with the data from the server and the
 *            callback waiting to have it.
 * @param args.before
 *            (optional) will be called with a method to be called, and the
 *            data passed by the user. If you supply this, you have to do
 *            something like "method.apply(this, args);" in the least, in
 *            order to trigger the call to the server.
 * @param args.errorHandler
 *            (optional) handler for when something goes wrong. Gets an error
 *            object and the callback waiting for a response.
 */
neo4j.Service.resourceFactory = function (args) {

    var urlArgs = args.urlArgs || [];
    var urlArgCount = urlArgs.length;

    var after = args.after ? args.after
        : function (data, callback) {
        callback(data);
    };

    var before = args.before ? args.before : function (method, args) {
        method.apply(this, args);
    };

    var errorHandler = args.errorHandler ? args.errorHandler : function (callback, error) {
        callback({ message:"An error occurred, please see attached error object.", error:error });
    };

    /**
     * This is the core method for accessing resources. It will perform the
     * actual http call and pass the result onwards.
     */
    var resourceFunction = function () {

        var proxiedAfter = neo4j.proxy(after, this);
        var proxiedErrorHandler = neo4j.proxy(errorHandler, this);

        // Figure out what URL to call
        if (urlArgCount > 0) {
            var replace = {};
            for (var i = 0; i < urlArgCount; i++) {
                replace[urlArgs[i]] = arguments[i];
            }

            var url = this.db.web.replace(this.resources[args.resource], replace);

        } else {
            var url = this.resources[args.resource];
        }

        var data = null;
        var callback = function () {
        };

        // Are there any extra args?
        if (arguments.length > urlArgCount) {
            if (typeof (arguments[arguments.length - 1]) === "function") {
                callback = arguments[arguments.length - 1];
            }

            // Are there two extra args?
            if ((arguments.length - 1) > urlArgCount) {
                data = arguments[arguments.length - 2];
            }
        }

        if (data !== null) {
            this.db.web.ajax(args.method, url, data, function (data) {
                proxiedAfter(data, callback);
            }, function (error) {
                proxiedErrorHandler(callback, error);
            });
        } else {
            this.db.web.ajax(args.method, url, function (data) {
                proxiedAfter(data, callback);
            }, function (error) {
                proxiedErrorHandler(callback, error);
            });
        }

    };

    return function () {
        this.serviceMethodPreflight(function () {
            before.call(this, neo4j.proxy(resourceFunction, this), arguments);
        }, arguments);
    };

};

_.extend(neo4j.Service.prototype, {

    /**
     * Keeps track of if the init method has been called.
     */
    initialized:false,

    /**
     * Set to true if the service is available, false if not and null if we are
     * still waiting for the server to tell us.
     */
    available:null,

    /**
     * Contains URLs to the resources the service provides. This is lazily loaded
     * when any of the service methods are called.
     */
    resources:null,

    /**
     * Go through the list of method calls that are waiting for this service to
     * initialize, and run all of them.
     */
    handleWaitingCalls:function () {

        for (var i = 0, l = this.callsWaiting.length; i < l; i++) {
            try {
                this.serviceMethodPreflight(this.callsWaiting[i].method,
                    this.callsWaiting[i].args);
            } catch (e) {
                neo4j.log(e);
            }
        }

    },

    /**
     * Do a GET-request to the root URL for this service, store the result in
     * this.serviceDefinition.
     *
     * Trigger service.definition.loaded-event on the service-local event handler.
     */
    loadServiceDefinition:function (callback) {
        this.get("/", neo4j.proxy(function (data) {
            this.resources = data.resources;
            this.trigger("service.definition.loaded", data);
            callback(data);
        }, this));
    },

    /**
     * Initialize the service, set the base URL for api calls. <br />
     * Example: <br />
     *
     * <pre>
     * var service = new neo4j.Service();
     * service.init(&quot;http://localhost:9988/backup&quot;);
     * </pre>
     *
     * @param url
     *            is the full url to the service (e.g. http://localhost:9988/backup)
     */
    makeAvailable:function (url) {
        this.initialized = true;
        this.available = true;
        this.url = url;
        this.handleWaitingCalls();
    },

    /**
     * Tell this service that it is not available from the current server. This will
     * make the service throw exceptions when someone tries to use it.
     */
    setNotAvailable:function () {
        this.initialized = true;
        this.available = false;
        this.handleWaitingCalls();
    },

    /**
     * Perform a http GET call for a given resource.
     *
     * @param resource
     *            is the resource to fetch (e.g. /myresource)
     * @param data
     *            (optional) object with data
     * @param success
     *            (optional) success callback
     * @param failure
     *            (optional) failure callback
     */
    get:function (resource, data, success, failure) {
        this.db.web.get(this.url + resource, data, success, failure);
    },

    /**
     * Perform a http DELETE call for a given resource.
     *
     * @param resource
     *            is the resource to fetch (e.g. /myresource)
     * @param data
     *            (optional) object with data
     * @param success
     *            (optional) success callback
     * @param failure
     *            (optional) failure callback
     */
    del:function (resource, data, success, failure) {
        this.db.web.del(this.url + resource, data, success, failure);
    },

    /**
     * Perform a http POST call for a given resource.
     *
     * @param resource
     *            is the resource to fetch (e.g. /myresource)
     * @param data
     *            (optional) object with data
     * @param success
     *            (optional) success callback
     * @param failure
     *            (optional) failure callback
     */
    post:function (resource, data, success, failure) {
        this.db.web.post(this.url + resource, data, success, failure);
    },

    /**
     * Perform a http PUT call for a given resource.
     *
     * @param resource
     *            is the resource to fetch (e.g. /myresource)
     * @param data
     *            (optional) object with data
     * @param success
     *            (optional) success callback
     * @param failure
     *            (optional) failure callback
     */
    put:function (resource, data, success, failure) {
        this.db.web.put(this.url + resource, data, success, failure);
    },

    /**
     * This method is called by all service methods before they do their work. It
     * will throw an exception if the service is not yet initialized, and it will
     * throw an exception if the service is not available with the current server.
     *
     * It will also check if a service definition for the given service has been
     * loaded. If that is not the case, this will be done.
     *
     * If all is well, the callback provided will be called with the correct "this"
     * context.
     */
    serviceMethodPreflight:function (callback, args) {

        if (this.available === false) {
            throw new Error(
                "The service you are accessing is not available for this server.");
        } else if (!this.initialized) {
            this.callsWaiting.push({
                'method':callback,
                'args':args
            });
            return;
        }

        args = args || [];

        if (this.resources !== null) {
            callback.apply(this, args);
        } else {
            this.loadServiceDefinition(neo4j.proxy(function () {
                callback.apply(this, args);
            }, this));
        }
    }

});

module.exports = neo4j.Service
