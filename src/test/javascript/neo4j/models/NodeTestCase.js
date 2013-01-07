/*
 * Copyright (c) 2010-2013 "Neo Technology,"
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
var NodeTest = function(name) {
    TestCase.call(this, "NodeTest." + name);
};

NodeTest.prototype = new TestCase();

_.extend(NodeTest.prototype, {
    
    testFailsWhenGivenNonNodeUrl : function() {
        var nonNodeUrl = "asd123", result={};
        clearWebmock();
        mockServiceDefinition();
        
        webmock("GET", nonNodeUrl, {
           "management" :"",
           "data" : ""
        });
        
        var node = new neo4j.models.Node({self:nonNodeUrl}, mockedGraphDatabase());
     
        node.fetch().then(null, function(fail) {
            result.error = fail;
        });
        
        this.assertTrue("Error should have been triggered", typeof(result.error) != "undefined");
        this.assertTrue("Error should be InvalidDataException.", result.error instanceof neo4j.exceptions.InvalidDataException);
        
    },

    testTraverseForNodes : function() {
        var rootTraversalUrl = "http://localhost:7474/db/data/node/0/traverse/node", result={};
        clearWebmock();
        mockServiceDefinition();
        
        webmock("POST", rootTraversalUrl, [{
      	  "outgoing_relationships" : "http://localhost:7474/db/data/node/0/relationships/out",
      	  "data" : {},
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
      	}]);
        
        var db = mockedGraphDatabase();
     
        db.getReferenceNode().then(function(node) {
            node.traverse({}).then(function(nodes) {
              result.nodes = nodes;
            });
        });
        
        this.assertTrue("Should have gotten a response", typeof(result.nodes) != "undefined");
        this.assertTrue("Response type should be node", result.nodes[0] instanceof neo4j.models.Node);
    },

    testTraverseForRelationships : function() {
        var rootTraversalUrl = "http://localhost:7474/db/data/node/0/traverse/relationship", result={};
        clearWebmock();
        mockServiceDefinition();
        
        webmock("POST", rootTraversalUrl, [
             {"start" : "http://localhost:7474/db/data/node/0",
              "data" : {
              },
              "self" : "http://localhost:7474/db/data/relationship/1",
              "property" : "http://localhost:7474/db/data/relationship/1/properties/{key}",
              "properties" : "http://localhost:7474/db/data/relationship/1/properties",
              "type" : "KNOWS",
              "extensions" : {
              },
              "end" : "http://localhost:7474/db/data/node/1"
             }
        ]);
        
        var db = mockedGraphDatabase();
     
        db.getReferenceNode().then(function(node) {
            node.traverse({}, neo4j.traverse.RETURN_RELATIONSHIPS).then(function(rels) {
              result.rels = rels;
            });
        });
        
        this.assertTrue("Should have gotten a response", typeof(result.rels) != "undefined");
        this.assertTrue("Response type should be node", result.rels[0] instanceof neo4j.models.Relationship);
    },

    testTraverseForPath : function() {
        var rootTraversalUrl = "http://localhost:7474/db/data/node/0/traverse/path", result={};
        clearWebmock();
        mockServiceDefinition();
        
        webmock("POST", rootTraversalUrl, [ {
          "start" : "http://localhost:7474/db/data/node/0",
          "nodes" : [ "http://localhost:7474/db/data/node/0", "http://localhost:7474/db/data/node/1" ],
          "length" : 1,
          "relationships" : [ "http://localhost:7474/db/data/relationship/1" ],
          "end" : "http://localhost:7474/db/data/node/1"
        } ]);
        
        var db = mockedGraphDatabase();
     
        db.getReferenceNode().then(function(node) {
            node.traverse({}, neo4j.traverse.RETURN_PATHS).then(function(paths) {
              result.paths = paths;
            });
        });
        
        this.assertTrue("Should have gotten a response", typeof(result.paths) != "undefined");
        this.assertTrue("Response type should be node", result.paths[0] instanceof neo4j.models.Path);
    }
});
