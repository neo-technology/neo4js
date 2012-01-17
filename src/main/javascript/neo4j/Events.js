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
 * A simple event-handling system.
 * 
 * @class
 * @param context {object} (optional) context data to be included with event objects
 */
neo4j.Events = function(context) {

    this.uniqueNamespaceCount = 0; // Used to create unique namespaces
    this.handlers = {};
    this.context = context || {};

}

/**
 * Naive implementation to quickly get anonymous event namespaces.
 */
neo4j.Events.prototype.createUniqueNamespace = function() {
    return "uniq#" + (this.uniqueNamespaceCount++);
};

/**
 * Bind an event listener to an event.
 */
neo4j.Events.prototype.bind = function(key, callback) {
    if (typeof (this.handlers[key]) === "undefined")
    {
        this.handlers[key] = [];
    }

    this.handlers[key].push(callback);
};

/**
 * Trigger an event.
 */
neo4j.Events.prototype.trigger = function(key, data) {
    
    if (typeof (this.handlers[key]) !== "undefined")
    {

        var data = data || {};

        var eventHandlers = this.handlers[key];
        var event = _.extend({
            key : key,
            data : data
        }, this.context);

        for ( var i = 0, o = eventHandlers.length; i < o; i++)
        {
            neo4j.setTimeout((function(handler) {
                return function() {
                    try
                    {
                        handler(event);
                    } catch (e)
                    {
                        neo4j.log("Event handler for event " + key + " threw exception.",e);
                    }
                }
            })(eventHandlers[i]), 0);
        }
    }
};

//
// CREATE A GLOBAL EVENT HANDLER
//

/**
 * Global event handler. Instance of {@link neo4j.Events}.
 */
neo4j.events = new neo4j.Events()
