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
        cypher:{
            QueryResult:require("./QueryResult")
        }
    };
/**
 * Cypher query execution.
 *
 * @class
 * @param db Should be a GraphDatabase instance.
 */
neo4j.cypher.ExecutionEngine = function (db) {

    /**
     * A GraphDatabase instance.
     */
    this.db = db;

};

_.extend(neo4j.cypher.ExecutionEngine.prototype,

    /** @lends neo4j.cypher.ExecutionEngine# */
    {

        execute:function (query) {
            var self = this;
            return this.db.getServiceDefinition().then(function (urls, fulfill, fail) {
                self.db.web.post(urls['cypher'], {query:query}, function (result) {
                    fulfill(new neo4j.cypher.QueryResult(self.db, result));
                }, fail);
            });
        }

    }
);
module.exports = neo4j.cypher.ExecutionEngine;
