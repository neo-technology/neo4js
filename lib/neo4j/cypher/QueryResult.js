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
            ResultRow:require("./ResultRow")
        }
    };
/**
 * Cypher query execution.
 *
 * @class
 * @param db Should be a GraphDatabase instance.
 * @param rawResult Should be the raw result returned by the server.
 */
neo4j.cypher.QueryResult = function (db, rawResult) {

    /**
     * A GraphDatabase instance.
     */
    this.db = db;

    /**
     * The raw server result
     */
    this.data = rawResult.data;

    /**
     * An aaray of column names
     */
    this.columns = rawResult.columns;

    this.pointer = 0;

    this.columnMap = {};
    for (var i = 0; i < this.columns.length; i++) {
        this.columnMap[this.columns[i]] = i;
    }

};

_.extend(neo4j.cypher.QueryResult.prototype,

    /** @lends neo4j.cypher.QueryResult# */
    {

        size:function () {
            return this.data.length;
        },

        next:function () {
            return new neo4j.cypher.ResultRow(this.db, this.data[this.pointer++], this.columnMap);
        },

        hasNext:function () {
            return this.pointer < this.size();
        },

        reset:function () {
            this.pointer = 0;
        }

    }
);
module.exports = neo4j.cypher.QueryResult;
