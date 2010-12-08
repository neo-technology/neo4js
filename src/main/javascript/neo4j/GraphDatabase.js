/*
 * Copyright (c) 2002-2010 "Neo Technology,"
 * Network Engine for Objects in Lund AB [http://neotechnology.com]
 *
 * This file is part of Neo4j.
 *
 * Neo4j is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * Connect to a neo4j REST server.
 * 
 * <br />
 * Example:
 * 
 * <pre>
 * var db = new neo4j.GraphDatabase(&quot;http://localhost:9999/&quot;,
 *         &quot;http://localhost:9988/&quot;);
 * </pre>
 * 
 * @class
 * @param url
 *            the url to the REST server
 * @param manageUrl
 * 	          the url to the Management endpoint
 * @returns a new GraphDatabase instance
 */
neo4j.GraphDatabase = function(url, manageUrl) {
	
	/**
     * The url to the REST server.
     */
	this.url = url;
	
	/**
     * Url to the management server, may be null.
     */
	this.manageUrl = manageUrl || null;
    
	/**
     * Event handler, instance of {@link neo4j.Events}.
     */
    this.events = new neo4j.Events({ db : this });
    
    /**
     * Convinience access to event bind method.
     * 
     * @see neo4j.Events#bind
     */
    this.bind = neo4j.proxy(this.events.bind, this.events);
    
    /**
     * Convinience access to event trigger method.
     * 
     * @see neo4j.Events#trigger
     */
    this.trigger = neo4j.proxy(this.events.trigger, this.events);

    /**
     * Manager, instance of {@link neo4j.GraphDatabaseManager}.
     */
    this.manage = new neo4j.GraphDatabaseManager(this);
    
    /**
     * Heartbeat, instance of {@link neo4j.GraphDatabaseHeartbeat}.
     */
    this.heartbeat = new neo4j.GraphDatabaseHeartbeat(this);
};

/**
 * Perform a http GET call for a given resource.
 * 
 * @param resource
 *            is the resource to fetch (e.g. /myresource)
 * @param data
 *            (optional) object with data
 * @param success
 *            (optional) success callback
 * @param failure
 *            (optional) failure callback
 */
neo4j.GraphDatabase.prototype.get = function(resource, data, success, failure) {
    neo4j.Web.get(this.url + resource, data, success, failure);
};

/**
 * Perform a http DELETE call for a given resource.
 * 
 * @param resource
 *            is the resource to fetch (e.g. /myresource)
 * @param data
 *            (optional) object with data
 * @param success
 *            (optional) success callback
 * @param failure
 *            (optional) failure callback
 */
neo4j.GraphDatabase.prototype.del = function(resource, data, success, failure) {
    neo4j.Web.del(this.url + resource, data, success, failure);
};

/**
 * Perform a http POST call for a given resource.
 * 
 * @param resource
 *            is the resource to fetch (e.g. /myresource)
 * @param data
 *            (optional) object with data
 * @param success
 *            (optional) success callback
 * @param failure
 *            (optional) failure callback
 */
neo4j.GraphDatabase.prototype.post = function(resource, data, success, failure) {
    neo4j.Web.post(this.url + resource, data, success, failure);
};

/**
 * Perform a http PUT call for a given resource.
 * 
 * @param resource
 *            is the resource to fetch (e.g. /myresource)
 * @param data
 *            (optional) object with data
 * @param success
 *            (optional) success callback
 * @param failure
 *            (optional) failure callback
 */
neo4j.GraphDatabase.prototype.put = function(resource, data, success, failure) {
    neo4j.Web.put(this.url + resource, data, success, failure);
};

/**
 * If the host in the url matches the REST base url, the rest base url will be
 * stripped off. If it matches the management base url, that will be stripped off.
 * 
 * If none of them match, the host will be stripped off.
 * 
 * @param url {String}
 */
neo4j.GraphDatabase.prototype.stripUrlBase = function( url ) {
    if (typeof(url) === "undefined" || url.indexOf("://") == -1 ) {
        return url;
    }
    
    if ( url.indexOf(this.url) === 0 ) {
        return url.substring(this.url.length);
    } else if ( url.indexOf(this.manageUrl) === 0 ) {
        return url.substring(this.manageUrl.length);
    } else {
        return url.substring(url.indexOf("/", 8));
    }
};

/**
 * Serialize this {@link GraphDatabase} instance.
 */
neo4j.GraphDatabase.prototype.toJSONString = function() {
    
    return {
        url : this.url,
        manageUrl : this.manageUrl
    };
    
};