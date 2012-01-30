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
        Promise:require("../Promise"),
        models:{
            PropertyContainer:require("./PropertyContainer")
        },
        exceptions:require("../_exceptions")
    };
/**
 * Represents a database relationship.
 *
 *
 * @class
 * @extends neo4j.models.PropertyContainer
 *
 * @param arg Should be an object matching that returned by neo4j server
 * when fetching or creating relationships. If you are fetching a relationship,
 * only the "self" parameter is required. Call #fetch() to load the rest of the
 * data.
 *
 * If you are creating a relationship, the attributes "start", "end" and "type"
 * are required. Start and end can either be urls or Node objects. Call #save()
 * to create the relationship.
 */
neo4j.models.Relationship = function (arg, db) {

    neo4j.models.PropertyContainer.call(this);

    this.db = db;
    this._init(arg);

    _.bindAll(this, 'save', 'fetch', '_init');

};

_.extend(neo4j.models.Relationship.prototype, neo4j.models.PropertyContainer.prototype,

    /** @lends neo4j.models.Relationship# */
    {

        /**
         * Save this relationship. Creates the relationship if it does not have a url.
         *
         * @return A {@link neo4j.Promise} for a saved relationship.
         */
        save:function () {
            var rel = this, web = this.db.web;
            if (!this.exists()) {
                return this.getStartNode().then(function (node, fulfill, fail) {
                    var req = web.post(node.getCreateRelationshipUrl(), {
                        to:rel._endUrl,
                        type:rel.getType(),
                        data:rel.getProperties()});

                    req.then(function (response) {
                        rel._init(response.data);
                        fulfill(rel);
                    }, function (response) {
                        if (response.error
                            && response.error.data
                            && response.error.data.exception) {
                            var ex = response.error.data.exception;
                            if (ex.indexOf("EndNodeNotFoundException") > -1
                                || (ex.indexOf("BadInputException") > -1 && ex.indexOf(rel._endUrl) > -1)) {
                                return fail(new neo4j.exceptions.NotFoundException(rel._endUrl));
                            } else if (ex.indexOf("StartNodeSameAsEndNodeException") > -1) {
                                return fail(new neo4j.exceptions.StartNodeSameAsEndNodeException(rel._endUrl));
                            }
                        }

                        fail(response);
                    });
                });
            } else {
                return new neo4j.Promise(function (fulfill, fail) {
                    web.put(rel._urls.properties, rel.getProperties()).then(function () {
                        fulfill(rel);
                    }, fail);
                });
            }
        },

        /**
         * Fetch data for this relationship. Use to populate a relationship that only has a _self
         * url, or to refresh the data.
         *
         * @return A {@link neo4j.Promise} of a populated relationship.
         */
        fetch:function () {
            var rel = this, web = this.db.web;
            return new neo4j.Promise(function (fulfill, fail) {
                web.get(rel._self).then(function (response) {
                    if (response.data && response.data.self && response.data.start && response.data.end) {
                        rel._init(response.data);
                        fulfill(rel);
                    } else {
                        fail(new neo4j.exceptions.InvalidDataException());
                    }
                }, fail);
            });
        },

        /**
         * Remove this relationship.
         * @return A promise that will be fulfilled when the relationship
         *         is removed.
         */
        remove:function () {
            var rel = this, web = this.db.web;
            return new neo4j.Promise(function (fulfill, fail) {
                web.del(rel.getSelf()).then(function () {
                    fulfill(true);
                }, fail);
            });
        },

        /**
         * Get the type of this relationship.
         */
        getType:function () {
            return this._type || null;
        },

        /**
         * Get a promise for the node this relationship originates from.
         */
        getStartNode:function () {
            return this._getNode("_startNode", "_startUrl");
        },

        /**
         * Fetches the url for the start node. Use this to avoid extra calls
         * to the server if you only need this url.
         */
        getStartNodeUrl:function () {
            return this._startUrl;
        },

        /**
         * Check if a node is the start node for this relationship.
         * @param String url or a node object
         * @return boolean
         */
        isStartNode:function (node) {
            if (node instanceof neo4j.models.Node) {
                return this._startUrl === node.getSelf();
            } else {
                return this._startUrl === node;
            }
        },

        /**
         * Get a promise for the node this relationship ends at.
         */
        getEndNode:function () {
            return this._getNode("_endNode", "_endUrl");
        },

        /**
         * Fetches the url for the end node. Use this to avoid extra calls
         * to the server if you only need this url.
         */
        getEndNodeUrl:function () {
            return this._endUrl;
        },

        /**
         * Check if a node is the end node for this relationship.
         * @param String url or a node object
         * @return boolean
         */
        isEndNode:function (node) {
            if (node instanceof neo4j.models.Node) {
                return this._endUrl === node.getSelf();
            } else {
                return this._endUrl === node;
            }
        },

        /**
         * If provided the end node (or end node url) return promise
         * for start node. If provided start node, return promise for end node.
         */
        getOtherNode:function (node) {
            if (this.isStartNode(node)) {
                return this.getEndNode();
            } else {
                return this.getStartNode();
            }
        },

        /**
         * If provided the end node (or end node url) return url
         * for start node. If provided start node, return url for end node.
         */
        getOtherNodeUrl:function (node) {
            if (this.isStartNode(node)) {
                return this.getEndNodeUrl();
            } else {
                return this.getStartNodeUrl();
            }
        },

        /**
         * Get a promise for a node, given a property where the node should
         * be cached, and a property where we can find the url of the node
         * if it is not cached.
         */
        _getNode:function (nodeAttribute, urlAttribute) {
            if (typeof(this[nodeAttribute]) != "undefined") {
                return neo4j.Promise.fulfilled(this[nodeAttribute]);
            } else {
                var rel = this;
                return this.db.node(this[urlAttribute]).then(function (node, fulfill) {
                    rel[nodeAttribute] = node;
                    fulfill(node);
                });
            }
        },

        /**
         * Used to initialize a relationship object from json data recieved from a neo4j
         * server.
         */
        _init:function (definition) {
            neo4j.models.Node = require("./Node");
            this._self = definition.self || null;
            this._data = definition.data || {};
            this._type = definition.type || null;

            this._urls = {
                'properties':definition.properties || ""
            };

            if (typeof(definition.start) != "undefined") {
                if (definition.start instanceof neo4j.models.Node) {
                    this._startNode = definition.start;
                    this._startUrl = definition.start.getSelf();
                } else {
                    this._startUrl = definition.start;
                }
            }

            if (typeof(definition.end) != "undefined") {
                if (definition.end instanceof neo4j.models.Node) {
                    this._endNode = definition.end;
                    this._endUrl = definition.end.getSelf();
                } else {
                    this._endUrl = definition.end;
                }
            }
        }
    });
module.exports = neo4j.models.Relationship;
