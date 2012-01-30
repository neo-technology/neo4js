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
        index:{
            NodeIndex:require("./NodeIndex"),
            RelationshipIndex:require("./RelationshipIndex")
        }
    };
/**
 * Handles node and relationship indexes.
 *
 * @class
 * @param db Should be a GraphDatabase instance.
 */
neo4j.index.Indexes = function (db) {

    /**
     * A GraphDatabase instance.
     */
    this.db = db;

    this._cache = {};

    _.bindAll(this, 'getNodeIndex', 'getRelationshipIndex',
        'createNodeIndex', 'createRelationshipIndex',
        'removeNodeIndex', 'removeRelationshipIndex');

};

_.extend(neo4j.index.Indexes.prototype,
    /** @lends neo4j.index.Indexes# */
    {

        /**
         * List all node indexes in the database.
         *
         * Ex:
         *
         * db.indexes.getAllNodeIndexes().then(function(indexes) {
         *     // Use indexes.
         * });
         *
         * @return A promise object, promising a list of {@link neo4j.index.NodeIndex} instances.
         */
        getAllNodeIndexes:function () {
            return this._listAllIndexes("node_index");
        },


        /**
         * List all relationship indexes in the database.
         *
         * Ex:
         *
         * db.indexes.getAllNodeIndexes().then(function(indexes) {
         *     // Use indexes.
         * });
         *
         * @return A promise object, promising a list of {@link neo4j.index.RelationshipIndex} instances.
         */
        getAllRelationshipIndexes:function () {
            return this._listAllIndexes("relationship_index");
        },

        /**
         * Retrieve a single index by name. The index does not have
         * to exist, it will be created the first time you insert something
         * into it. You can, however, not query a non-existant index.
         *
         * @param name Should be the name of the index.
         * @return {@link neo4j.index.NodeIndex}
         */
        getNodeIndex:function (name) {
            return this._getOrCreateLocalIndexObject("node_index", name);
        },


        /**
         * Retrieve a single index by name. The index does not have
         * to exist, it will be created the first time you insert something
         * into it. You can, however, not query a non-existant index.
         *
         * @param name Should be the name of the index.
         * @return {@link neo4j.index.RelationshipIndex}
         */
        getRelationshipIndex:function (name) {
            return this._getOrCreateLocalIndexObject("relationship_index", name);
        },

        /**
         * Create a new index.
         *
         * @param name A unique index name.
         * @param config Optional configuration map, see neo4j server REST documentation.
         * @return A promise object, promising a {@link neo4j.index.NodeIndex}
         */
        createNodeIndex:function (name, config) {
            return this._createIndex("node_index", name, config);
        },


        /**
         * Create a new index.
         *
         * @param name A unique index name.
         * @param config Optional configuration map, see neo4j server REST documentation.
         * @return A promise object, promising a {@link neo4j.index.RelationshipIndex}
         */
        createRelationshipIndex:function (name, config) {
            return this._createIndex("relationship_index", name, config);
        },

        /**
         * Removes an index.
         *
         * @param name Name of index to remove.
         * @return A promise for the delete operation to complete.
         */
        removeNodeIndex:function (name) {
            return this._removeIndex("node_index", name);
        },


        /**
         * Removes an index.
         *
         * @param name Name of index to remove.
         * @return A promise for the delete operation to complete.
         */
        removeRelationshipIndex:function (name) {
            return this._removeIndex("relationship_index", name);
        },

        _listAllIndexes:function (type) {
            var db = this.db,
                indexes = this;
            return this.db.getServiceDefinition().then(function (urls, fulfill, fail) {
                db.web.get(urls[type], function (indexMap) {
                    var indexList = [],
                        indexNames = indexMap === null ? [] : _(indexMap).keys();

                    for (var i = 0, l = indexNames.length; i < l; i++) {
                        indexList.push(indexes._getOrCreateLocalIndexObject(type, indexNames[i], indexMap[indexNames[i]]));
                    }
                    fulfill(indexList);
                }, fail);
            });
        },

        _createIndex:function (type, name, config) {
            var config = config || {provider:"lucene", type:"exact"},
                db = this.db,
                indexes = this;
            return this.db.getServiceDefinition().then(function (urls, fulfill, fail) {
                db.web.post(urls[type], { name:name, config:config }, function (data) {
                    fulfill(indexes._getOrCreateLocalIndexObject(type, name, config));
                }, fail);
            });
        },

        _removeIndex:function (type, name) {
            var db = this.db;
            return this.db.getServiceDefinition().then(function (urls, fulfill, fail) {
                db.web.del(urls[type] + "/" + name, fulfill, fail);
            });
        },

        _getOrCreateLocalIndexObject:function (type, name, config) {

            var config = config || null;

            if (typeof(this._cache[type]) == "undefined") {
                this._cache[type] = {};
            }

            if (typeof(this._cache[type][name]) == "undefined") {
                if (type === "relationship_index") {
                    var instance = new neo4j.index.RelationshipIndex(this.db, name);
                } else {
                    var instance = new neo4j.index.NodeIndex(this.db, name);
                }
                this._cache[type][name] = instance;
            }

            if (config != null) {
                if (config['provider']) {
                    this._cache[type][name].provider = config['provider'];
                    delete(config['provider']);
                }
                if (config['template']) {
                    delete(config['template']);
                }
                this._cache[type][name].setConfig(config);
            }

            return this._cache[type][name];
        }

    });
module.exports = neo4j.index.Indexes;
