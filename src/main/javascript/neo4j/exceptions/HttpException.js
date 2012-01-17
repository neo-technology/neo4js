/*
 * Copyright (c) 2010-2012 "Neo Technology,"
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
/**
 * Triggered when there is some error in transit or on the server
 * side.
 */
neo4j.exceptions.HttpException = function(status, data, req, message) {
    var message = message || "A server error or a network error occurred. Status code: " + status + ".";
    this.status = status;
    this.data = data || {};
    this.req = req || {};
    Error.call(this, message);
};

neo4j.exceptions.HttpException.prototype = new Error();

/**
 * These are used to generate #isConflict(), #isNotFound() etc.,
 * based on the keys of this map.
 */
neo4j.exceptions.HttpException.RESPONSE_CODES = {
    'Conflict' : 409,
    'NotFound' : 404 
};

/**
 * Generate methods to rapidly check what a given response
 * code means.
 */
(function() {
    var ex = neo4j.exceptions.HttpException.prototype, 
        codes = neo4j.exceptions.HttpException.RESPONSE_CODES;
    _.each(_.keys(codes), function(key) {
        ex['is' + key] = function() {
            return this.status === codes[key];
        };
    });
})();
