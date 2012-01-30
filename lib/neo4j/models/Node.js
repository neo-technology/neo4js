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
            PropertyContainer:require("./PropertyContainer"),
            Relationship:require("./Relationship"),
            Path:require("./Path")
        },
        exceptions:require("../_exceptions")
    };
/**
 * Represents a database node.
 *
 * @class
 * @extends neo4j.models.PropertyContainer
 * @param arg
 *            Is either a node url or, to create a new node, a map.
 */
neo4j.models.Node = function (arg, db) {

    neo4j.models.PropertyContainer.call(this);

    this.db = db;
    this._init(arg);

    _.bindAll(this, 'save', 'fetch', 'getRelationships', '_init');

};

neo4j.models.Node.IN = "in";
neo4j.models.Node.OUT = "out";
neo4j.models.Node.ALL = "all";

// Defined here until we break out a proper traversal subsystem
neo4j.traverse = require("./Traverse");

_.extend(neo4j.models.Node.prototype, neo4j.models.PropertyContainer.prototype,

    /** @lends neo4j.models.Node# */
    {

        /**
         * Save this node. Creates the node if it does not have a url.
         *
         * @return A {@link neo4j.Promise} for a saved node.
         */
        save:function () {
            var node = this, web = this.db.web;
            if (!this.exists()) {
                return new neo4j.Promise(function (fulfill, fail) {
                    node.db.getServiceDefinition().then(function (dbDefinition) {
                        web.post(dbDefinition.node, node._data).then(function (response) {
                            node._init(response.data);
                            fulfill(node);
                        }, fail);
                    }, fail);
                });
            } else {
                return new neo4j.Promise(function (fulfill, fail) {
                    web.put(node._urls.properties, node.getProperties(), function () {
                        fulfill(node);
                    }, fail);
                });
            }
        },

        /**
         * Fetch data for this node. Use to populate a node that only has a _self
         * url, or to refresh the data in the node.
         *
         * @return A {@link neo4j.Promise} of a populated node.
         */
        fetch:function () {
            var node = this, web = this.db.web;
            return new neo4j.Promise(function (fulfill, fail) {
                web.get(node._self).then(function (response) {
                    if (response.data && response.data.self) {
                        node._init(response.data);
                        fulfill(node);
                    } else {
                        fail(new neo4j.exceptions.InvalidDataException());
                    }
                }, function (err) {
                    fail(new neo4j.exceptions.NotFoundException(node._self));
                });
            });
        },

        /**
         * Remove this node.
         * @return A promise that will be fulfilled when the node is deleted.
         */
        remove:function () {
            var node = this, web = this.db.web, hasDeletedRelationships = false,
                db = this.db, nodeUrl = node.getSelf();

            return new neo4j.Promise(function (fulfill, fail) {
                web.del(node.getSelf()).then(function () {
                    db.getReferenceNodeUrl().then(function (url) {
                        if (url == nodeUrl) {
                            db.forceRediscovery();
                        }
                        fulfill(true);
                    }, fail);
                }, function (response) {
                    if (response.error.isConflict() && !hasDeletedRelationships) {
                        // Need to remove relationships
                        node.getRelationships().then(function (rels) {
                            _.each(rels, function (rel) {
                                rel.remove();
                            });

                            // Ensure we don't end up in recursive loop
                            hasDeletedRelationships = true;
                            node.remove().then(function () {
                                fulfill(true);
                            }, fail);
                        }, fail);
                    }
                });
            });
        },

        getCreateRelationshipUrl:function () {
            if (this.exists()) {
                return this._urls.create_relationship;
            } else {
                throw new Error("You can't get the create relationship url until you have saved the node!");
            }
        },

        /**
         * Perform a traversal starting from this node.
         * @param traversal should be a map conforming to http://components.neo4j.org/neo4j-server/snapshot/rest.html#Traverse
         * @param returnType (optional) One of:
         *                   neo4j.traverse.RETURN_NODES (default)
         *                   neo4j.traverse.RETURN_RELATIONSHIPS
         *                   neo4j.traverse.RETURN_PATHS
         * @return A promise for an array of whatever type you asked for.
         */
        traverse:function (traversal, returnType) {
            returnType = returnType || neo4j.traverse.RETURN_NODES
            var url = this.db.web.replace(this._urls['traverse'], {'returnType':returnType}),
                node = this,
                modelClass;

            switch (returnType) {
                case neo4j.traverse.RETURN_RELATIONSHIPS:
                    modelClass = neo4j.models.Relationship;
                    break;
                case neo4j.traverse.RETURN_PATHS:
                    modelClass = neo4j.models.Path;
                    break;
                default:
                    modelClass = neo4j.models.Node;
                    break;
            }

            return new neo4j.Promise(function (fulfill, fail) {
                node.db.web.post(url, traversal).then(function (response) {
                    var instances = _.map(response.data, function (r) {
                        return new modelClass(r, node.db);
                    });
                    fulfill(instances);
                }, fail);
            });
        },

        /**
         * Get relationships in some given direction for this node.
         * @param dir (optional) One of {@link neo4j.models.Node.IN}, {@link neo4j.models.Node.OUT}, {@link neo4j.models.Node.ALL}.
         * @param types (optional) A single string or an array of strings.
         * @return A promise for an array of relationships.
         */
        getRelationships:function (dir, types) {
            var dir = dir || neo4j.models.Node.ALL,
                types = types || null,
                node = this,
                url;

            var hasTypes = types ? true : false;

            if (_.isArray(types)) {
                types = types.join("&");
            }

            switch (dir) {
                case neo4j.models.Node.IN:
                    url = hasTypes ? this._urls['incoming_typed_relationships'] :
                        this._urls['incoming_relationships'];
                    break;
                case neo4j.models.Node.OUT:
                    url = hasTypes ? this._urls['outgoing_typed_relationships'] :
                        this._urls['outgoing_relationships'];
                    break;
                default:
                    url = hasTypes ? this._urls['all_typed_relationships'] :
                        this._urls['all_relationships'];
                    break;
            }

            if (hasTypes) {
                url = this.db.web.replace(url, {'-list|&|types':types});
            }

            return new neo4j.Promise(function (fulfill, fail) {
                node.db.web.get(url).then(function (response) {
                    var instances = _.map(
                        response.data,
                        function (r) {
                            return new neo4j.models.Relationship(r, node.db);
                        });
                    fulfill(instances);
                }, fail);
            });
        },

        /**
         * Used to initialize a node object from json data recieved from a neo4j
         * server.
         */
        _init:function (definition) {
            this._self = definition.self || null;
            this._data = definition.data || {};

            this._urls = {
                'properties':definition.properties || "",
                'traverse':definition.traverse || "",
                'create_relationship':definition.create_relationship || "",
                'all_relationships':definition.all_relationships || "",
                'all_typed_relationships':definition.all_typed_relationships || "",
                'incoming_relationships':definition.incoming_relationships || "",
                'incoming_typed_relationships':definition.incoming_typed_relationships || "",
                'outgoing_relationships':definition.outgoing_relationships || "",
                'outgoing_typed_relationships':definition.outgoing_typed_relationships || ""
            };

        }

    });
module.exports = neo4j.models.Node;
