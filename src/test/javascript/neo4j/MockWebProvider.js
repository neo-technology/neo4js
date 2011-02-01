/*
 * Copyright (c) 2002-2011 "Neo Technology,"
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
var mockWebProvider = {

    definitions : {
        'GET': {},
        'POST':{},
        'PUT':{},
        'DELETE':{}
    },
        
    mock : function(method, url, mocker) {
        
        if (! mockWebProvider.definitions[method] ) {
            mockWebProvider.definitions[method] = {};
        }
        
        mockWebProvider.definitions[method][url] = mocker;
    },
    
    clear : function() {
    	mockWebProvider.definitions = {};
    },
    
    /**
     * Add basic service mocking to the mock definitions. Basically
     * a quick way to mock the stuff you need to create a graph database 
     * instance that works with /db/data and /db/manage as base urls.
     */
    mockServiceDefinition : function() {
    	webmock("GET", "/db/data/", {
		  "relationship_index" : "http://localhost:7474/db/data/index/relationship",
		  "node" : "http://localhost:7474/db/data/node",
		  "extensions_info" : "http://localhost:7474/db/data/ext",
		  "node_index" : "http://localhost:7474/db/data/index/node",
		  "reference_node" : "http://localhost:7474/db/data/node/0",
		  "extensions" : {
		  }
		});
        webmock("GET", "/db/manage/", {
		  "services" : {
		    "console" : "http://localhost:7474/db/manage/server/console",
		    "jmx" : "http://localhost:7474/db/manage/server/jmx",
		    "monitor" : "http://localhost:7474/db/manage/server/monitor"
		  }
		});
        webmock("GET", "http://localhost:7474/db/data/node/0", {
    	  "outgoing_relationships" : "http://localhost:7474/db/data/node/0/relationships/out",
    	  "data" : {
    	    "mykey" : "myvalue",
    	    "myint" : "12"
    	  },
    	  "traverse" : "http://localhost:7474/db/data/node/0/traverse/{returnType}",
    	  "all_typed_relationships" : "http://localhost:7474/db/data/node/0/relationships/all/{-list|&|types}",
    	  "property" : "http://localhost:7474/db/data/node/0/properties/{key}",
    	  "self" : "http://localhost:7474/db/data/node/0",
    	  "properties" : "http://localhost:7474/db/data/node/0/properties",
    	  "outgoing_typed_relationships" : "http://localhost:7474/db/data/node/0/relationships/out/{-list|&|types}",
    	  "incoming_relationships" : "http://localhost:7474/db/data/node/0/relationships/in",
    	  "extensions" : {
    	  },
    	  "create_relationship" : "http://localhost:7474/db/data/node/0/relationships",
    	  "all_relationships" : "http://localhost:7474/db/data/node/0/relationships/all",
    	  "incoming_typed_relationships" : "http://localhost:7474/db/data/node/0/relationships/in/{-list|&|types}"
    	});
    },
        
    ajax : function(args) {
        
        neo4j.log(args.method, args.url);
        
        if( typeof(mockWebProvider.definitions[args.method]) != "undefined" && typeof(mockWebProvider.definitions[args.method][args.url]) != "undefined") {
            var mocker = mockWebProvider.definitions[args.method][args.url]; 
            if( typeof(mocker) === "function" ) {
                mocker({method:args.method, url:args.url, data:args.data, success:args.success, failure:args.failure});
            } else {
                args.success(mocker);
            }
        } else {
            args.failure(null);
        }
    }

};

/** 
 * Convinience access.
 */
var webmock = mockWebProvider.mock,
    mockServiceDefinition= mockWebProvider.mockServiceDefinition,
    clearWebmock = mockWebProvider.clear,
    
    mockWeb = new neo4j.Web(mockWebProvider);

function mockedGraphDatabase() {
	return new neo4j.GraphDatabase("/db/data/","/db/manage/", mockWeb);
}