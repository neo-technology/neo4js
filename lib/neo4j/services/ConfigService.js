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
 * @class Interface to the config functionality of the REST server.
 * @extends neo4j.Service
 * @param db
 *            should be a neo4j.GraphDatabase object
 */
neo4j.services.ConfigService = function (db) {

    neo4j.Service.call(this, db);

};

_.extend(neo4j.services.ConfigService.prototype, neo4j.Service.prototype);

/**
 * Get a list of all available properties.
 *
 * @param callback
 *            will be called with the list of properties
 * @function
 */
neo4j.services.ConfigService.prototype.getProperties = neo4j.Service
    .resourceFactory({
    'resource':'properties',
    'method':'GET',
    'before':function (method, args) {

        var callback = args[0];

        method(function (data) {
            // Convert array of objects to map
            var props = {};
            for (var i in data) {
                props[data[i].key] = data[i];
            }

            callback(props);
        });
    }
});

/**
 * Fetch a specific property
 *
 * @param key
 *            is the property key
 * @param callback
 *            will be called with the property
 */
neo4j.services.ConfigService.prototype.getProperty = function (key, callback) {
    this.getProperties(function (properties) {
        for (var propKey in properties) {
            if (propKey === key) {
                callback(properties[propKey]);
                return;
            }
        }

        callback(null);
    });
};

/**
 * Set several settings at once. This will restart the server and/or the JVM as
 * appropriate.
 *
 * @param settings
 *            should be a string map. Each key should map to a property key, and
 *            the value should be the new value of that property.
 * @param callback
 *            will be called when the foundation is done
 * @function
 */
neo4j.services.ConfigService.prototype.setProperties = neo4j.Service
    .resourceFactory({
    'resource':'properties',
    'method':'POST',
    'before':function (method, args) {

        // Convert map to array of objects
        var props = [];
        var prop;
        for (var key in args[0]) {
            prop = {
                key:key,
                value:args[0][key]
            };
            props.push(prop);
            this.db.trigger("config.property.set", prop);
        }

        method(props, args[1]);
    }
});

/**
 * Set a specific property
 *
 * @param key
 *            is the property key
 * @param value is the value to set the property to
 * @param callback
 *            will be called with the property
 */
neo4j.services.ConfigService.prototype.setProperty = function (key, value, callback) {
    var props = {};
    props[key] = value;
    this.setProperties(props, callback);
};

module.exports = neo4j.services.ConfigService;
