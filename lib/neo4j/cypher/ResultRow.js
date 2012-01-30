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
        models:require("../_models"),
        cypher:{}
    };
/**
 * QueryResult row.
 *
 * @class
 * @param db Should be a GraphDatabase instance.
 * @param row Should be an array of raw values for this row.
 * @param columnMap Should be a lookup table for column -> row index
 */
neo4j.cypher.ResultRow = function (db, row, columnMap) {

    /**
     * A GraphDatabase instance.
     */
    this.db = db;

    /**
     * The raw server result
     */
    this.row = row;

    /**
     * A lookup table for columns
     */
    this.columnMap = columnMap;

    this.pointer = 0;

};

_.extend(neo4j.cypher.ResultRow.prototype,

    /** @lends neo4j.cypher.ResultRow# */
    {

        size:function () {
            return this.row.length;
        },

        getByIndex:function (index) {
            return this._convertValue(this.row[index]);
        },

        get:function (name) {
            return this.getByIndex(this.columnMap[name]);
        },

        next:function () {
            return this.getByIndex(this.pointer++);
        },

        hasNext:function () {
            return this.pointer < this.size();
        },

        reset:function () {
            this.pointer = 0;
        },

        _convertValue:function (value) {
            if (value === null) {
                return null;
            } else if (typeof(value.data) !== "undefined") {
                if (typeof(value.type) !== "undefined") { // Relationship
                    return new neo4j.models.Relationship(value, this.db);
                } else if (typeof(value.length) !== "undefined") { // Path
                    // TODO
                    return JSON.stringify(value);
                } else { // Node
                    return new neo4j.models.Node(value, this.db);
                }
            } else {
                return value;
            }
        }

    }
);
module.exports = neo4j.cypher.ResultRow;
