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
        models:{}
    };
/**
 * Represents a path through the graph.
 */
neo4j.models.Path = function (arg, db) {

    this.db = db;
    this._init(arg);

    _.bindAll(this, '_init');

};

_.extend(neo4j.models.Path.prototype, {

    /**
     * Used to initialize a path object from json data recieved from a neo4j
     * server.
     */
    _init:function (definition) {
        this._start = definition.start;
        this._end = definition.end;
        this._length = definition.length;

        this._nodeUrls = definition.nodes;
        this._relationshipUrls = definition.relationships;
    }
});
module.exports = neo4j.models.Path;
