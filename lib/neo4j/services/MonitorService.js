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
 * The monitor service exposes a round-robin data sampler over the web. Through
 * this service, you can access various server metrics and their movement over
 * time.
 *
 * @class Interface to the monitoring functionality of the REST server.
 * @extends neo4j.Service
 * @param db
 *            should be a neo4j.GraphDatabase object
 */
neo4j.services.MonitorService = function (db) {

    neo4j.Service.call(this, db);

};

_.extend(neo4j.services.MonitorService.prototype, neo4j.Service.prototype);

/**
 * Get monitoring data for a pre-defined (on the server side) time period up
 * until right now.
 *
 * @param callback
 *            will be called with the monitor data
 * @function
 */
neo4j.services.MonitorService.prototype.getData = neo4j.Service
    .resourceFactory({
    'resource':'latest_data',
    'method':'GET'
});

/**
 * Get monitoring data from a given timestamp up until right now.
 *
 * @param from
 *            {Integer} a UTC timestamp in milliseconds.
 * @param callback
 *            will be called with the monitor data
 * @function
 */
neo4j.services.MonitorService.prototype.getDataFrom = neo4j.Service
    .resourceFactory({
    'resource':'data_from',
    'method':'GET',
    'urlArgs':[ 'start' ]
});

/**
 * Get monitoring data between two timestamps.
 *
 * @param from
 *            {Integer} a UTC timestamp in milliseconds.
 * @param to
 *            {Integer} a UTC timestamp in milliseconds.
 * @param callback
 *            will be called with the monitor data
 * @function
 */
neo4j.services.MonitorService.prototype.getDataBetween = neo4j.Service
    .resourceFactory({
    'resource':'data_period',
    'method':'GET',
    'urlArgs':[ 'start', 'stop' ]
});

module.exports = neo4j.services.MonitorService;
