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


var _ = require('underscore'),
    neo4j = {
        Promise:require("./Promise"),
        Events:require("./Events"),
        proxy:require("./proxy"),
        Web:require("./Web"),
        Service:require("./Service"),
        GraphDatabaseManager:require("./GraphDatabaseManager"),
        GraphDatabaseHeartbeat:require("./GraphDatabaseHeartbeat"),

        index:require("./_index"),
        cypher:require("./_cypher"),
        services:require("./_services"),
        models:require("./_models"),
        exceptions:require("./_exceptions")
    };

/**
 * Connect to a neo4j REST server.
 *
 * <br />
 * Example:
 *
 * <pre>
 * var db = new neo4j.GraphDatabase(&quot;http://localhost:9999/&quot;);
 * </pre>
 *
 * @class
 * @param url the url to the neo4j server
 * @returns a new GraphDatabase instance
 */
neo4j.GraphDatabase = function (url, webClient) {

    /**
     * The url to the REST server's discovery document
     */
    this.url = url;

    /**
     * Event handler, instance of {@link neo4j.Events}.
     */
    this.events = new neo4j.Events({
        db:this });

    /**
     * Convinience access to event bind method.
     *
     * @see neo4j.Events#bind
     */
    this.bind = neo4j.proxy(this.events.bind, this.events);

    /**
     * Client used to perform http actions. Can be any object that implements
     * the same API as {@link neo4j.Web}.
     */
    this.web = webClient || new neo4j.Web(null, this.events);

    /**
     * Convinience access to event trigger method.
     *
     * @see neo4j.Events#trigger
     */
    this.trigger = neo4j.proxy(this.events.trigger, this.events);

    /**
     * Indexes, instance of {@link neo4j.index.Indexes}.
     */
    this.index = new neo4j.index.Indexes(this);

    /**
     * Cypher ExecutionEngine, instance of {@link neo4j.cypher.ExecutionEngine}.
     */
    this.cypher = new neo4j.cypher.ExecutionEngine(this);

    /**
     * Manager, instance of {@link neo4j.GraphDatabaseManager}.
     */
    this.manage = new neo4j.GraphDatabaseManager(this);

    /**
     * Heartbeat, instance of {@link neo4j.GraphDatabaseHeartbeat}.
     */
    this.heartbeat = new neo4j.GraphDatabaseHeartbeat(this);

    // Rapid access
    this.rel = this.relationship;
    this.referenceNode = this.getReferenceNode;

    _.bindAll(this, 'getServiceDefinition', 'getReferenceNode', 'node',
        'relationship', 'getReferenceNodeUrl', 'getAvailableRelationshipTypes', 'get', 'put', 'post', 'del', 'forceRediscovery');

};

_.extend(neo4j.GraphDatabase.prototype,
    /** @lends neo4j.GraphDatabase# */
    {

        /**
         * Used to manipulate nodes.
         *
         * @param arg
         *            Is either a node url or a map of attributes to create a new
         *            node. It can also be a promise of either one.
         */
        node:function (arg) {
            var db = this,
                promisedArg = neo4j.Promise.wrap(arg);
            return promisedArg.then(
                function (arg, fulfill, fail) {
                    if (typeof (arg) === "object") {
                        // Create a new node
                        var node = new neo4j.models.Node({data:arg }, db);
                        node.save().then(function (savedNode) {
                            fulfill(savedNode);
                        }, fail);
                    } else {
                        // Fetch a node
                        var urlPromise = db.promiseNodeOrNodeUrl(arg);
                        urlPromise.then(function (url) {
                            var node = new neo4j.models.Node({ self:url }, db);
                            node.fetch().then(function (fetchedNode) {
                                fulfill(fetchedNode);
                            }, function () {
                                fail(new neo4j.exceptions.NotFoundException(url));
                            });
                        });
                    }
                });
        },

        /**
         * Used to get a relationship by url, or to create a new relationship.
         *
         * @param arg1
         *            Should be a relationship url (self), or a start node if you
         *            are creating a new relationship, or a promise for either one.
         * @param type
         *            The type of relationship to create, if you are creating a
         *            relationship. A promise for a type is also ok.
         * @param toNode
         *            End node if you are creating a relationship, or promise for one.
         * @param data
         *            Map of properties if you are creating a relationship, or
         *            a promise of one. Optional if you don't want to specify
         *            any properties.
         */
        relationship:function (fromNode, type, toNode, data) {
            var db = this;
            if (typeof(type) == "undefined") {
                // Fetch relationship
                var urlPromise = this.promiseRelationshipOrRelationshipUrl(fromNode);

                return urlPromise.then(function (url, fulfill, fail) {
                    var relationship = new neo4j.models.Relationship({self:url}, db);
                    relationship.fetch().then(function (fetchedRelationship) {
                        fulfill(fetchedRelationship);
                    }, function () {
                        fail(new neo4j.exceptions.NotFoundException(url));
                    });
                });
            } else {
                // Create relationship
                var dataPromise = neo4j.Promise.wrap(data || {}),
                    typePromise = neo4j.Promise.wrap(type),
                    fromNodePromise = this.promiseNodeOrNodeUrl(fromNode),
                    toNodePromise = this.promiseNodeOrNodeUrl(toNode);

                var all = neo4j.Promise.join(fromNodePromise, toNodePromise, typePromise, dataPromise);
                return all.then(function (results, fulfill, fail) {
                    var relationship = new neo4j.models.Relationship({
                        start:results[0],
                        end:results[1],
                        type:results[2],
                        data:results[3]
                    }, db);
                    relationship.save().then(function (savedRelationship) {
                        fulfill(savedRelationship);
                    }, function (e) {
                        if (e.error && e.error instanceof neo4j.exceptions.HttpException) {
                            fail(e.error);
                        }
                        else {
                            fail(e);
                        }
                    });
                });
            }
        },

        /**
         * Execute a cypher query against this database.
         * @param query A cypher query string.
         * @return A promise for a neo4j.cypher.QueryResult
         */
        query:function (query) {
            return this.cypher.execute(query);
        },

        /**
         * Given a url for either a node or a relationship,
         * load the appropriate object.
         * @param url A url for either a node or a relationship
         * @return A promise for a node or a relationship.
         */
        getNodeOrRelationship:function (url) {
            var db = this;
            return this.isNodeUrl(url).then(function (isNodeUrl, fulfill, fail) {
                if (isNodeUrl) {
                    db.node(url).then(function (node) {
                        fulfill(node);
                    }, fail);
                } else {
                    db.rel(url).then(function (rel) {
                        fulfill(rel);
                    }, fail);
                }
            });
        },

        /**
         * @return A promise for the reference node.
         */
        getReferenceNode:function () {
            return this.node(this.getReferenceNodeUrl());
        },

        /**
         * @return A promise for an array of strings, each string a relationship
         * type in use in the database.
         */
        getAvailableRelationshipTypes:function () {
            var db = this;
            return this.getServiceDefinition().then(function (service, fulfill, fail) {
                db.web.get(service.relationship_types, function (types) {
                    fulfill(types);
                }, fail);
            });
        },

        /**
         * @return A promise for the reference node url.
         */
        getReferenceNodeUrl:function () {
            return this.getServiceDefinition().then(function (serviceDefinition, fulfill, fail) {
                if (typeof(serviceDefinition.reference_node) !== "undefined") {
                    fulfill(serviceDefinition.reference_node);
                } else {
                    fail();
                }
            }, function (error) {
                //TODO
                console.log(error);
            });
        },

        nodeUri:function (id) {
            if (typeof(id.getSelf) != "undefined") {
                return neo4j.Promise.wrap(id.getSelf());
            }

            return this.getServiceDefinition().then(function (def, fulfill) {
                if (/^[0-9]+$/i.test(id)) {
                    fulfill(def.node + "/" + id);
                } else {
                    fulfill(id);
                }
            });
        },

        relUri:function (id) {
            if (typeof(id.getSelf) != "undefined") {
                return neo4j.Promise.wrap(id.getSelf());
            }

            return this.getDiscoveryDocument().then(function (urls, fulfill) {
                if (/^[0-9]+$/i.test(id)) {
                    // There is currently no way to discover relationship url
                    fulfill(urls['data'] + "relationship/" + id);
                } else {
                    fulfill(id);
                }
            });
        },

        /**
         * @return A promise for a map of services, as they are returned
         *         from a GET call to the server data root.
         */
        getServiceDefinition:function () {
            if (typeof (this._serviceDefinitionPromise) === "undefined") {
                var db = this;
                this._serviceDefinitionPromise = this.getDiscoveryDocument().then(function (discovery, fulfill, fail) {
                    db.web.get(discovery.data, fulfill, fail);
                });
            }

            return this._serviceDefinitionPromise;
        },

        getDiscoveryDocument:function () {
            if (typeof (this._discoveryDocumentPromise) === "undefined") {
                var db = this;
                this._discoveryDocumentPromise = new neo4j.Promise(function (fulfill, fail) {
                    db.web.get(db.url, fulfill, fail);
                });
            }

            return this._discoveryDocumentPromise
        },

        /**
         * Perform a http GET call for a given resource.
         * @deprecated Use #web instead.
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
            this.web.get(this.url + resource, data, success, failure);
        },

        /**
         * Perform a http DELETE call for a given resource.
         * @deprecated Use #web instead.
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
            this.web.del(this.url + resource, data, success, failure);
        },

        /**
         * Perform a http POST call for a given resource.
         * @deprecated Use #web instead.
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
            this.web.post(this.url + resource, data, success, failure);
        },

        /**
         * Perform a http PUT call for a given resource.
         * @deprecated Use #web instead.
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
            this.web.put(this.url + resource, data, success, failure);
        },

        /**
         * If the host in the url matches the REST base url, the rest base url will
         * be stripped off. If it matches the management base url, that will be
         * stripped off.
         *
         * If none of them match, the host will be stripped off.
         *
         * @param url
         *            {String}
         */
        stripUrlBase:function (url) {
            if (typeof (url) === "undefined" || url.indexOf("://") == -1) {
                return url;
            }

            if (url.indexOf(this.url) === 0) {
                return url.substring(this.url.length);
            } else if (url.indexOf(this.manageUrl) === 0) {
                return url.substring(this.manageUrl.length);
            } else {
                return url.substring(url.indexOf("/", 8));
            }
        },

        /**
         * Determine if a given url is a node url.
         * @return A promise for a boolean response.
         */
        isNodeUrl:function (url) {
            return this.getServiceDefinition().then(function (urls, fulfill) {
                fulfill(url.indexOf(urls['node']) === 0);
            });
        },

        promiseNodeOrNodeUrl:function (unknown) {
            if (typeof(unknown) === "object" || this.isUrl(unknown)) {
                return neo4j.Promise.wrap(unknown);
            } else {
                return this.nodeUri(unknown);
            }
        },

        promiseRelationshipOrRelationshipUrl:function (unknown) {
            if (typeof(unknown) === "object" || this.isUrl(unknown)) {
                return neo4j.Promise.wrap(unknown);
            } else {
                return this.relUri(unknown);
            }
        },

        /**
         * Naive check to see if input contains ://
         */
        isUrl:function (variableToCheck) {
            if (typeof(variableToCheck) === "object") return false;

            variableToCheck += "";
            return variableToCheck.indexOf("://") !== -1;
        },

        /**
         * Serialize this {@link GraphDatabase} instance.
         */
        toJSONString:function () {
            return { url:this.url };
        },

        /**
         * A call to this method will force a rediscovery of the
         * server the next time something requests info about the
         * server discovery document.
         */
        forceRediscovery:function () {
            delete this._discoveryDocumentPromise;
            delete this._serviceDefinitionPromise;
        },


        /**
         * Stop heartbeat
         */
        stopHeartbeat:function () {
            this.heartbeat.stop();
        }


    })
;

module.exports = neo4j.GraphDatabase;
