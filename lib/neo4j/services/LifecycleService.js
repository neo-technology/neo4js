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
        services:{},
        Service:require("../Service")
    };
/**
 * @class Interface to the lifecycle functionality of the REST server.
 * @extends neo4j.Service
 * @param db
 *            should be a neo4j.GraphDatabase object
 */
neo4j.services.LifecycleService = function (db) {

    neo4j.Service.call(this, db);

};

_.extend(neo4j.services.LifecycleService.prototype, neo4j.Service.prototype);

/**
 * Get the current lifecycle status of the server.
 *
 * @param callback
 *            will be called with lifecycle status information
 * @function
 */
neo4j.services.LifecycleService.prototype.getStatus = neo4j.Service
    .resourceFactory({
    'resource':'status',
    'method':'GET'
});

/**
 * Start the REST server.
 *
 * @param callback
 *            will be called with lifecycle status information
 * @function
 */
neo4j.services.LifecycleService.prototype.start = neo4j.Service
    .resourceFactory({
    'resource':'start',
    'method':'POST'
});

/**
 * Stop the REST server.
 *
 * @param callback
 *            will be called with lifecycle status information
 * @function
 */
neo4j.services.LifecycleService.prototype.stop = neo4j.Service
    .resourceFactory({
    'resource':'stop',
    'method':'POST'
});
/**
 * Restart the REST server.
 *
 * @param callback
 *            will be called with lifecycle status information
 * @function
 */
neo4j.services.LifecycleService.prototype.restart = neo4j.Service
    .resourceFactory({
    'resource':'restart',
    'method':'POST'
});

module.exports = neo4j.services.LifecycleService;
