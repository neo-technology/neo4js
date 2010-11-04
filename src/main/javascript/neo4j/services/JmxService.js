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
 * @class Interface to the jmx exposing functionality of the REST server.
 * @extends neo4j.Service
 * @param db
 *            should be a neo4j.GraphDatabase object
 */
neo4j.services.JmxService = function(db) {

    this.__init__(db);

    // Kernelinstance get called a lot, cache each result for two seconds
    this.kernelInstance = neo4j.cachedFunction( this.kernelInstance, 0, 2000);
    
};

neo4j.services.JmxService.prototype = new neo4j.Service();

/**
 * Get a list of all jmx domains available
 * 
 * @param callback
 *            will be called with the list of domains
 * @function
 */
neo4j.services.JmxService.prototype.getDomains = neo4j.Service
        .resourceFactory({
            'resource' : 'domains',
            'method' : 'GET'
        });

/**
 * Get a domain and all the beans in it.
 * 
 * @param domain
 *            {String} Name of the domain
 * @param callback
 *            will be called with the domain data
 * @function
 */
neo4j.services.JmxService.prototype.getDomain = neo4j.Service.resourceFactory({
    'resource' : 'domain',
    'method' : 'GET',
    'urlArgs' : [ 'domain' ]
});

/**
 * Get a specific JMX bean.
 * 
 * @param domain
 *            {String} Name of the domain OR the "magic" domain "neo4j". The
 *            latter will automatically trigger a call to
 *            {@link #kernelInstance} and use the result of that to get your
 *            bean. Use something like neo4j:Configuration to get the current
 *            configuration bean.
 * @param objectName
 *            {String} ObjectName of the bean
 * @param callback
 *            will be called with the bean
 * @function
 */
neo4j.services.JmxService.prototype.getBean = neo4j.Service.resourceFactory({
    'resource' : 'bean',
    'method' : 'GET',
    'urlArgs' : [ 'domain', 'objectName' ],
    'wrap' : function(method, args) {
        if (args[0] === "neo4j")
        {
            var me = this;
            this.kernelInstance(function(instanceName) {
                args[0] = "org.neo4j";
                args[1] = escape(instanceName + ",name=" + args[1]);
                method.apply(this, args);
            });
        } else
        {
            args[0] = escape(args[0]);
            args[1] = escape(args[1]);
            method.apply(this, args);
        }
    }
});

/**
 * Search for jmx beans
 * 
 * @param queries
 *            {Array} An array of strings, together they form an OR query
 * @param callback
 *            will be called with the list of beans
 * @function
 */
neo4j.services.JmxService.prototype.query = neo4j.Service.resourceFactory({
    'resource' : 'query',
    'method' : 'POST'
});

/**
 * Since there may be several Neo4j database running in the same JVM, you can
 * use this method to find out which one of them is the one running behind the
 * REST server.
 * 
 * @param callback
 *            will be called with a JMX query that would return all beans for
 *            the current REST kernel, <br/> Example:
 * 
 * <pre>
 *            org.neo4j:instance=kernel#0,name=*
 * </pre>
 * 
 * @function
 */
neo4j.services.JmxService.prototype.kernelInstance = function(callback) {
    this.serviceMethodPreflight(function(callback) {
        var url = this.resources['kernelquery'];
        neo4j.Web.get(url, function(data) {

            // Data looks like : org.neo4j:instance=kernel#0,name=*
            // Split it to be: instance=kernel#0
            var result = data ? data.split(":")[1].split(",")[0] : null;

            callback(result);

        });
    }, [ callback ]);
};
