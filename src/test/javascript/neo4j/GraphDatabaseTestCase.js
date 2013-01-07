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
var GraphDatabaseTest = function(name) {
	TestCase.call(this, "GraphDatabaseTest." + name);
};

GraphDatabaseTest.prototype = new TestCase();

_.extend(GraphDatabaseTest.prototype, {
	
    testInstantiateClient : function() {
        clearWebmock();
        var serverRoot = "theserverroot",
            mngUrl = "/db/manage/",
            dataUrl = "thedataurl";
        
        mockServiceDefinition();
        
        webmock("GET", serverRoot, {
           "management" : mngUrl,
           "data" : dataUrl
        });
        
        var db = new neo4j.GraphDatabase(serverRoot, mockWeb);
        
        var promisedDiscovery = db.getDiscoveryDocument();
        
        this.assertTrue("Result should be a promise.", promisedDiscovery instanceof neo4j.Promise);
        
    },
    
    testCreateNode : function() {
        var mockedUrl = "someurl";
    
        clearWebmock();
        mockServiceDefinition();
        
        webmock("POST", "http://localhost:7474/db/data/node", {
          "outgoing_relationships" : "http://localhost:7474/db/data/node/1/relationships/out",
          "data" : {
          },
          "traverse" : "http://localhost:7474/db/data/node/1/traverse/{returnType}",
          "all_typed_relationships" : "http://localhost:7474/db/data/node/1/relationships/all/{-list|&|types}",
          "property" : "http://localhost:7474/db/data/node/1/properties/{key}",
          "self" : mockedUrl,
          "properties" : "http://localhost:7474/db/data/node/1/properties",
          "outgoing_typed_relationships" : "http://localhost:7474/db/data/node/1/relationships/out/{-list|&|types}",
          "incoming_relationships" : "http://localhost:7474/db/data/node/1/relationships/in",
          "extensions" : {
          },
          "create_relationship" : "http://localhost:7474/db/data/node/1/relationships",
          "all_relationships" : "http://localhost:7474/db/data/node/1/relationships/all",
          "incoming_typed_relationships" : "http://localhost:7474/db/data/node/1/relationships/in/{-list|&|types}"
        });
        
        var db = mockedGraphDatabase(),
            result = {};
        
        var nodePromise = db.node({name:"lisa", age:12});
        
        nodePromise.then(function(node){
        	result.node = node;
        });
        
        this.assertTrue("GraphDatabase#node method call should return a promise.", nodePromise instanceof neo4j.Promise);
        this.assertTrue("Promise should deliver a result.", typeof(result.node) != "undefined");
        this.assertTrue("Promise should be fulfilled, and deliver a node.", result.node instanceof neo4j.models.Node);
        
        this.assertEquals("Node should have recieved a url.", mockedUrl, result.node.getSelf());
    },
    
    testRemoveNode : function() {
    
        var result = {called:false, promiseFulfilled:false};
        
        clearWebmock();
        mockServiceDefinition();
        
        webmock("GET", "http://localhost:7474/db/data/node/1", {
          "outgoing_relationships" : "http://localhost:7474/db/data/node/1/relationships/out",
          "data" : { },
          "traverse" : "http://localhost:7474/db/data/node/1/traverse/{returnType}",
          "all_typed_relationships" : "http://localhost:7474/db/data/node/1/relationships/all/{-list|&|types}",
          "property" : "http://localhost:7474/db/data/node/1/properties/{key}",
          "self" : "http://localhost:7474/db/data/node/1",
          "properties" : "http://localhost:7474/db/data/node/1/properties",
          "outgoing_typed_relationships" : "http://localhost:7474/db/data/node/1/relationships/out/{-list|&|types}",
          "incoming_relationships" : "http://localhost:7474/db/data/node/1/relationships/in",
          "extensions" : { },
          "create_relationship" : "http://localhost:7474/db/data/node/1/relationships",
          "all_relationships" : "http://localhost:7474/db/data/node/1/relationships/all",
          "incoming_typed_relationships" : "http://localhost:7474/db/data/node/1/relationships/in/{-list|&|types}"
        });
        
        webmock("DELETE", "http://localhost:7474/db/data/node/1", function(req) {
            result.called = true;
            req.success(true);
        });
        
        var db = mockedGraphDatabase();
        
        var promise = db.node("http://localhost:7474/db/data/node/1");
        
        promise.then(function(node){
            node.remove().then(function() {
                result.promiseFulfilled = true;
            });
        });
        
        this.assertEquals("Server should have been called.", result.called, true);
        this.assertEquals("Promise should have been fulfilled", result.promiseFulfilled, true);
    },
    
    testRemoveNodeWithRelationships : function() {
    
        var result = {
                deleteCalled:false, 
                promiseFulfilled:false,
                deleteCalledAgain:false,
                deleteRelationshipCalled:false};
        
        clearWebmock();
        mockServiceDefinition();
        
        webmock("GET", "http://localhost:7474/db/data/node/1", {
          "outgoing_relationships" : "http://localhost:7474/db/data/node/1/relationships/out",
          "data" : { },
          "traverse" : "http://localhost:7474/db/data/node/1/traverse/{returnType}",
          "all_typed_relationships" : "http://localhost:7474/db/data/node/1/relationships/all/{-list|&|types}",
          "property" : "http://localhost:7474/db/data/node/1/properties/{key}",
          "self" : "http://localhost:7474/db/data/node/1",
          "properties" : "http://localhost:7474/db/data/node/1/properties",
          "outgoing_typed_relationships" : "http://localhost:7474/db/data/node/1/relationships/out/{-list|&|types}",
          "incoming_relationships" : "http://localhost:7474/db/data/node/1/relationships/in",
          "extensions" : { },
          "create_relationship" : "http://localhost:7474/db/data/node/1/relationships",
          "all_relationships" : "http://localhost:7474/db/data/node/1/relationships/all",
          "incoming_typed_relationships" : "http://localhost:7474/db/data/node/1/relationships/in/{-list|&|types}"
        });
        
        webmock("DELETE", "http://localhost:7474/db/data/node/1", function(req) {
            if(!result.deleteCalled) {
                result.deleteCalled = true;
                req.failure(new neo4j.exceptions.HttpException(409));
            } else {
                result.deleteCalledAgain = true;
                req.success(true);
            }
        });
        
        webmock("GET", "http://localhost:7474/db/data/node/1/relationships/all",[
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
        
        webmock("DELETE", "http://localhost:7474/db/data/relationship/1", function(req) {
            result.deleteRelationshipCalled = true;
            req.success(true);
        });
        
        var db = mockedGraphDatabase();
        
        var promise = db.node("http://localhost:7474/db/data/node/1");
        
        promise.then(function(node){
            node.remove().then(function() {
                result.promiseFulfilled = true;
            });
        });
        
        this.assertEquals("Delete node should have been called, failing.", true, result.deleteCalled);
        this.assertEquals("Delete relationship should have been called.", true, result.deleteRelationshipCalled);
        this.assertEquals("Delete node should have been called again.", true, result.deleteCalledAgain);
        this.assertEquals("Promise should have been fulfilled", true, result.promiseFulfilled);
    },
    
    testGetNode : function() {
    	var nodeUrl = "someurl";
    
        clearWebmock();
        mockServiceDefinition();
        
        webmock("GET", nodeUrl, {
          "outgoing_relationships" : "http://localhost:7474/db/data/node/1/relationships/out",
          "data" : {
          "name" : "Bob"
          },
          "traverse" : "http://localhost:7474/db/data/node/1/traverse/{returnType}",
          "all_typed_relationships" : "http://localhost:7474/db/data/node/1/relationships/all/{-list|&|types}",
          "property" : "http://localhost:7474/db/data/node/1/properties/{key}",
          "self" : nodeUrl,
          "properties" : "http://localhost:7474/db/data/node/1/properties",
          "outgoing_typed_relationships" : "http://localhost:7474/db/data/node/1/relationships/out/{-list|&|types}",
          "incoming_relationships" : "http://localhost:7474/db/data/node/1/relationships/in",
          "extensions" : {
          },
          "create_relationship" : "http://localhost:7474/db/data/node/1/relationships",
          "all_relationships" : "http://localhost:7474/db/data/node/1/relationships/all",
          "incoming_typed_relationships" : "http://localhost:7474/db/data/node/1/relationships/in/{-list|&|types}"
        });
        
        var db = mockedGraphDatabase(),
            result = {};
        
        var nodePromise = db.node(nodeUrl);
        
        nodePromise.then(function(node){
        	result.node = node;
        });
        
        this.assertTrue("GraphDatabase#node method call should return a promise.", nodePromise instanceof neo4j.Promise);
        this.assertTrue("Promise should deliver a result.", typeof(result.node) != "undefined");
        this.assertTrue("Promise should be fulfilled, and deliver a node.", result.node instanceof neo4j.models.Node);
        
        this.assertEquals("Node url should be as expected.", nodeUrl, result.node.getSelf());
        this.assertEquals("Node should have properties provided by server.", "Bob", result.node.getProperty("name"));
    },
    
    testGetNodeById : function() {
        var nodeUrl = "http://localhost:7474/db/data/node/1";
    
        clearWebmock();
        mockServiceDefinition();
        
        webmock("GET", nodeUrl, {
          "outgoing_relationships" : "http://localhost:7474/db/data/node/1/relationships/out",
          "data" : {
          "name" : "Bob"
          },
          "traverse" : "http://localhost:7474/db/data/node/1/traverse/{returnType}",
          "all_typed_relationships" : "http://localhost:7474/db/data/node/1/relationships/all/{-list|&|types}",
          "property" : "http://localhost:7474/db/data/node/1/properties/{key}",
          "self" : nodeUrl,
          "properties" : "http://localhost:7474/db/data/node/1/properties",
          "outgoing_typed_relationships" : "http://localhost:7474/db/data/node/1/relationships/out/{-list|&|types}",
          "incoming_relationships" : "http://localhost:7474/db/data/node/1/relationships/in",
          "extensions" : {
          },
          "create_relationship" : "http://localhost:7474/db/data/node/1/relationships",
          "all_relationships" : "http://localhost:7474/db/data/node/1/relationships/all",
          "incoming_typed_relationships" : "http://localhost:7474/db/data/node/1/relationships/in/{-list|&|types}"
        });
        
        var db = mockedGraphDatabase(),
            result = {};
        
        var nodePromise = db.node(1);
        
        nodePromise.then(function(node){
            result.node = node;
        });
        
        this.assertTrue("GraphDatabase#node method call should return a promise.", nodePromise instanceof neo4j.Promise);
        this.assertTrue("Promise should deliver a result.", typeof(result.node) != "undefined");
        this.assertTrue("Promise should be fulfilled, and deliver a node.", result.node instanceof neo4j.models.Node);
        
        this.assertEquals("Node url should be as expected.", nodeUrl, result.node.getSelf());
        this.assertEquals("Node should have properties provided by server.", "Bob", result.node.getProperty("name"));
    },
    
    testGetRelationship : function() {
    
        clearWebmock();
        mockServiceDefinition();
        
        webmock("GET", "http://localhost:7474/db/data/relationship/1", {
            "start" : "http://localhost:7474/db/data/node/0",
            "data" : {
            },
            "self" : "http://localhost:7474/db/data/relationship/1",
            "property" : "http://localhost:7474/db/data/relationship/1/properties/{key}",
            "properties" : "http://localhost:7474/db/data/relationship/1/properties",
            "type" : "KNOWS",
            "extensions" : {
            },
            "end" : "http://localhost:7474/db/data/node/1"
          });
        
        var db = mockedGraphDatabase(),
            result = {};
        
        var relPromise = db.rel("http://localhost:7474/db/data/relationship/1");
        
        relPromise.then(function(obj){
            result.rel = obj;
        });
        
        this.assertTrue("GraphDatabase#getRelationship method call should return a promise.", relPromise instanceof neo4j.Promise);
        this.assertTrue("Relationship promise should deliver a result.", typeof(result.rel) != "undefined");
        this.assertTrue("Relationship promise should be fulfilled, and deliver a relationship.", result.rel instanceof neo4j.models.Relationship);
    },
    
    testGetRelationshipById : function() {
        
        clearWebmock();
        mockServiceDefinition();
        
        webmock("GET", "http://localhost:7474/db/data/relationship/1", {
            "start" : "http://localhost:7474/db/data/node/0",
            "data" : {
            },
            "self" : "http://localhost:7474/db/data/relationship/1",
            "property" : "http://localhost:7474/db/data/relationship/1/properties/{key}",
            "properties" : "http://localhost:7474/db/data/relationship/1/properties",
            "type" : "KNOWS",
            "extensions" : {
            },
            "end" : "http://localhost:7474/db/data/node/1"
          });
        
        var db = mockedGraphDatabase(),
            result = {};
        
        var relPromise = db.rel(1);
        
        relPromise.then(function(obj){
            result.rel = obj;
        });
        
        this.assertTrue("GraphDatabase#getRelationship method call should return a promise.", relPromise instanceof neo4j.Promise);
        this.assertTrue("Relationship promise should deliver a result.", typeof(result.rel) != "undefined");
        this.assertTrue("Relationship promise should be fulfilled, and deliver a relationship.", result.rel instanceof neo4j.models.Relationship);
    },
    
    testRemoveRelationship : function() {
    
        var result = {called:false, promiseFulfilled:false};
        
        clearWebmock();
        mockServiceDefinition();
        
        webmock("GET", "http://localhost:7474/db/data/relationship/1", {
            "start" : "http://localhost:7474/db/data/node/0",
            "data" : {
            },
            "self" : "http://localhost:7474/db/data/relationship/1",
            "property" : "http://localhost:7474/db/data/relationship/1/properties/{key}",
            "properties" : "http://localhost:7474/db/data/relationship/1/properties",
            "type" : "KNOWS",
            "extensions" : {
            },
            "end" : "http://localhost:7474/db/data/node/1"
          });
        
        webmock("DELETE", "http://localhost:7474/db/data/relationship/1", function(req) {
            result.called = true;
            req.success(true);
        });
        
        var db = mockedGraphDatabase();
        
        var promise = db.rel("http://localhost:7474/db/data/relationship/1");
        
        promise.then(function(node){
            node.remove().then(function() {
                result.promiseFulfilled = true;
            });
        });
        
        this.assertEquals("Server should have been called.", true, result.called);
        this.assertEquals("Promise should have been fulfilled", true, result.promiseFulfilled);
    },
    
    testGetNodeOrRelationship : function() {
    
        clearWebmock();
        mockServiceDefinition();
        
        webmock("GET", "http://localhost:7474/db/data/node/1", {
          "outgoing_relationships" : "http://localhost:7474/db/data/node/1/relationships/out",
          "data" : {
          "name" : "Bob"
          },
          "traverse" : "http://localhost:7474/db/data/node/1/traverse/{returnType}",
          "all_typed_relationships" : "http://localhost:7474/db/data/node/1/relationships/all/{-list|&|types}",
          "property" : "http://localhost:7474/db/data/node/1/properties/{key}",
          "self" : "http://localhost:7474/db/data/node/1",
          "properties" : "http://localhost:7474/db/data/node/1/properties",
          "outgoing_typed_relationships" : "http://localhost:7474/db/data/node/1/relationships/out/{-list|&|types}",
          "incoming_relationships" : "http://localhost:7474/db/data/node/1/relationships/in",
          "extensions" : {
          },
          "create_relationship" : "http://localhost:7474/db/data/node/1/relationships",
          "all_relationships" : "http://localhost:7474/db/data/node/1/relationships/all",
          "incoming_typed_relationships" : "http://localhost:7474/db/data/node/1/relationships/in/{-list|&|types}"
        });
        
        webmock("GET", "http://localhost:7474/db/data/relationship/1", {
            "start" : "http://localhost:7474/db/data/node/0",
            "data" : {
            },
            "self" : "http://localhost:7474/db/data/relationship/1",
            "property" : "http://localhost:7474/db/data/relationship/1/properties/{key}",
            "properties" : "http://localhost:7474/db/data/relationship/1/properties",
            "type" : "KNOWS",
            "extensions" : {
            },
            "end" : "http://localhost:7474/db/data/node/1"
          });
        
        var db = mockedGraphDatabase(),
            result = {};
        
        var relPromise = db.getNodeOrRelationship("http://localhost:7474/db/data/relationship/1");
        var nodePromise = db.getNodeOrRelationship("http://localhost:7474/db/data/node/1");
        
        nodePromise.then(function(obj){
            result.node = obj;
        });
        
        relPromise.then(function(obj){
            result.rel = obj;
        });
        
        this.assertTrue("GraphDatabase#getNodeOrRelationship method call should return a promise.", nodePromise instanceof neo4j.Promise);
        this.assertTrue("GraphDatabase#getNodeOrRelationship method call should return a promise.", relPromise instanceof neo4j.Promise);
        
        this.assertTrue("Node promise should deliver a result.", typeof(result.node) != "undefined");
        this.assertTrue("Relationship promise should deliver a result.", typeof(result.rel) != "undefined");
        
        this.assertTrue("Node promise should be fulfilled, and deliver a node.", result.node instanceof neo4j.models.Node);
        this.assertTrue("Relationship promise should be fulfilled, and deliver a relationship.", result.rel instanceof neo4j.models.Relationship);
    },
    
    testSetProperties : function() {
        var nodeUrl = "someurl",
            result = {},
            data = {
                "name" : "Orvar",
                "age" : 12
        };
        
        clearWebmock();
        mockServiceDefinition();
        
        webmock("GET", nodeUrl, {
          "outgoing_relationships" : "http://localhost:7474/db/data/node/1/relationships/out",
          "data" : {
          },
          "traverse" : "http://localhost:7474/db/data/node/1/traverse/{returnType}",
          "all_typed_relationships" : "http://localhost:7474/db/data/node/1/relationships/all/{-list|&|types}",
          "property" : "http://localhost:7474/db/data/node/1/properties/{key}",
          "self" : nodeUrl,
          "properties" : "http://localhost:7474/db/data/node/1/properties",
          "outgoing_typed_relationships" : "http://localhost:7474/db/data/node/1/relationships/out/{-list|&|types}",
          "incoming_relationships" : "http://localhost:7474/db/data/node/1/relationships/in",
          "extensions" : {
          },
          "create_relationship" : "http://localhost:7474/db/data/node/1/relationships",
          "all_relationships" : "http://localhost:7474/db/data/node/1/relationships/all",
          "incoming_typed_relationships" : "http://localhost:7474/db/data/node/1/relationships/in/{-list|&|types}"
        });
        
        var test = this;
        webmock("PUT", "http://localhost:7474/db/data/node/1/properties", function(req){
           result.serverCalled = true;
           test.assertEquals("Properties sent to server should be same as the ones we set.", req.data['name'], data['name']);
           test.assertEquals("Properties sent to server should be same as the ones we set.", req.data['age'], data['age']);
           req.success();
        });
        
        
        var db = mockedGraphDatabase();
        var nodePromise = db.node(nodeUrl);
        
        nodePromise.then(function(node){
            result.node = node;
            node.setProperties(data);
            node.save().then(function(savedNode){
                result.savedNode = savedNode;
            });
        });
        
        this.assertTrue("Server should have been called.", result.serverCalled);
        this.assertTrue("Node should have been saved.", typeof(result.savedNode) != "undefined");
        this.assertTrue("Node should have been saved.", result.savedNode instanceof neo4j.models.Node);
        this.assertEquals("Saved node should have correct properties.", result.savedNode.getProperty('name'), data['name']);
        this.assertEquals("Saved node should have correct properties.", result.savedNode.getProperty('age'), data['age']);
    },
    
    testGetRelationships : function() {
        clearWebmock();
        mockServiceDefinition();
        
        webmock("GET", "http://localhost:7474/db/data/node/0/relationships/all",[
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
        
        var db = mockedGraphDatabase(),
            result = {};
        
        var nodePromise = db.referenceNode();
        
        nodePromise.then(function(node){
            var promise = node.getRelationships(neo4j.models.Node.BOTH);
            promise.then(function(relationships) {
                result.relationships = relationships;
            });
        });
        
        this.assertTrue("Relationships result should be an array.", _.isArray(result.relationships));
        this.assertEquals("There should be one relationship.", result.relationships.length, 1);
        this.assertTrue("The one result should be a relationship.", result.relationships[0] instanceof neo4j.models.Relationship);
    },
    
    testGetTypedRelationships : function() {
        clearWebmock();
        mockServiceDefinition();
        
        webmock("GET", "http://localhost:7474/db/data/node/0/relationships/all/KNOWS&LIKES",[
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
        
        var db = mockedGraphDatabase(),
            result = {};
        
        var nodePromise = db.referenceNode();
        
        nodePromise.then(function(node){
            var promise = node.getRelationships(neo4j.models.Node.BOTH, ['KNOWS', 'LIKES']);
            promise.then(function(relationships) {
                result.relationships = relationships;
            });
        });
        
        this.assertTrue("Relationships result should be an array.", _.isArray(result.relationships));
        this.assertEquals("There should be one relationship.", result.relationships.length, 1);
        this.assertTrue("The one result should be a relationship.", result.relationships[0] instanceof neo4j.models.Relationship);
    },
    
    testGetIncomingTypedRelationships : function() {
        clearWebmock();
        mockServiceDefinition();
        
        webmock("GET", "http://localhost:7474/db/data/node/0/relationships/in/KNOWS&LIKES",[
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
        
        var db = mockedGraphDatabase(),
            result = {};
        
        var nodePromise = db.referenceNode();
        
        nodePromise.then(function(node){
            var promise = node.getRelationships(neo4j.models.Node.IN, ['KNOWS', 'LIKES']);
            promise.then(function(relationships) {
                result.relationships = relationships;
            });
        });
        
        this.assertTrue("Relationships result should be an array.", _.isArray(result.relationships));
        this.assertEquals("There should be one relationship.", result.relationships.length, 1);
        this.assertTrue("The one result should be a relationship.", result.relationships[0] instanceof neo4j.models.Relationship);
    },

    testGetOutgoingTypedRelationships : function() {
        clearWebmock();
        mockServiceDefinition();
        
        webmock("GET", "http://localhost:7474/db/data/node/0/relationships/out/KNOWS&LIKES",[
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
        
        var db = mockedGraphDatabase(),
            result = {};
        
        var nodePromise = db.referenceNode();
        
        nodePromise.then(function(node){
            var promise = node.getRelationships(neo4j.models.Node.OUT, ['KNOWS', 'LIKES']);
            promise.then(function(relationships) {
                result.relationships = relationships;
            });
        });
        
        this.assertTrue("Relationships result should be an array.", _.isArray(result.relationships));
        this.assertEquals("There should be one relationship.", result.relationships.length, 1);
        this.assertTrue("The one result should be a relationship.", result.relationships[0] instanceof neo4j.models.Relationship);
    },
    
    testGetReferenceNode : function() {
        clearWebmock();
        mockServiceDefinition();
        
        var db = mockedGraphDatabase(),
            result = {};
        
        var nodePromise = db.referenceNode();
        
        nodePromise.then(function(node){
            result.node = node;
        });
        
        this.assertTrue("GraphDatabase#referenceNode method call should return a promise.", nodePromise instanceof neo4j.Promise);
        this.assertTrue("Promise should deliver a result.", typeof(result.node) != "undefined");
        this.assertTrue("Promise should be fulfilled, and deliver a node.", result.node instanceof neo4j.models.Node);
        
        this.assertEquals("Node url should be reference url.", "http://localhost:7474/db/data/node/0", result.node.getSelf());
        this.assertEquals("Node should have properties provided by server.", "myvalue", result.node.getProperty("mykey"));
    },
    
    testGetNonExistantReferenceNode : function() {
        clearWebmock();
        mockServiceDefinition();
        
        webmock("GET", "http://localhost:7474/db/data/", {
            "relationship_index" : "http://localhost:7474/db/data/index/relationship",
            "relationship_types" : "http://localhost:7474/db/data/relationships/types",
            "node" : "http://localhost:7474/db/data/node",
            "extensions_info" : "http://localhost:7474/db/data/ext",
            "node_index" : "http://localhost:7474/db/data/index/node",
            "extensions" : {
            }
        });
        
        var db = mockedGraphDatabase(),
            result = {};
        
        var nodePromise = db.referenceNode();
        
        nodePromise.then(null, function(node){
            result.called = true;
        });
        
        this.assertTrue("Promise should deliver a result.", typeof(result.called) != "undefined");
        this.assertTrue("Promise should fail.", result.called == true);
    },
    
    testCreateRelationship : function() {
        clearWebmock();
        mockServiceDefinition();
        
        var db = mockedGraphDatabase(),
            result = {};
        
        webmock("GET", "http://localhost:7474/db/data/node/1", {
            "outgoing_relationships" : "http://localhost:7474/db/data/node/1/relationships/out",
            "data" : {
            },
            "traverse" : "http://localhost:7474/db/data/node/1/traverse/{returnType}",
            "all_typed_relationships" : "http://localhost:7474/db/data/node/1/relationships/all/{-list|&|types}",
            "property" : "http://localhost:7474/db/data/node/1/properties/{key}",
            "self" : "http://localhost:7474/db/data/node/1",
            "properties" : "http://localhost:7474/db/data/node/1/properties",
            "outgoing_typed_relationships" : "http://localhost:7474/db/data/node/1/relationships/out/{-list|&|types}",
            "incoming_relationships" : "http://localhost:7474/db/data/node/1/relationships/in",
            "extensions" : {
            },
            "create_relationship" : "http://localhost:7474/db/data/node/1/relationships",
            "all_relationships" : "http://localhost:7474/db/data/node/1/relationships/all",
            "incoming_typed_relationships" : "http://localhost:7474/db/data/node/1/relationships/in/{-list|&|types}"
          });
       
        webmock("POST", "http://localhost:7474/db/data/node/0/relationships", {
          "start" : "http://localhost:7474/db/data/node/0",
          "data" : {
          },
          "self" : "http://localhost:7474/db/data/relationship/1",
          "property" : "http://localhost:7474/db/data/relationship/1/properties/{key}",
          "properties" : "http://localhost:7474/db/data/relationship/1/properties",
          "type" : "KNOWS",
          "extensions" : {
          },
          "end" : "http://localhost:7474/db/data/node/1"
        });
        
        var relPromise = db.rel(db.referenceNode(), "KNOWS", db.node("http://localhost:7474/db/data/node/1"));
        
        relPromise.then(function(relationship){
            result.relationship = relationship;
        });
       
        this.assertTrue("GraphDatabase#rel method should return a value.", typeof(relPromise) != "undefined");
        this.assertTrue("GraphDatabase#rel method should return a promise.", relPromise instanceof neo4j.Promise);
        
        this.assertTrue("Promise should be fulfilled.", typeof(result.relationship) != "undefined");
        this.assertTrue("Promise should return a Relationship.", result.relationship instanceof neo4j.models.Relationship);
        
        // Test using only urls
        relPromise = db.rel("http://localhost:7474/db/data/node/0", "KNOWS", "http://localhost:7474/db/data/node/1");
        
        relPromise.then(function(relationship){
            result.relationship = relationship;
        });
        
        this.assertTrue("GraphDatabase#rel method should return a value.", typeof(relPromise) != "undefined");
        this.assertTrue("GraphDatabase#rel method should return a promise.", relPromise instanceof neo4j.Promise);
        
        this.assertTrue("Promise should be fulfilled.", typeof(result.relationship) != "undefined");
        this.assertTrue("Promise should return a Relationship.", result.relationship instanceof neo4j.models.Relationship);
    },
    
    testCreateRelationshipToNonExistantNode : function() {
        clearWebmock();
        mockServiceDefinition();
        
        var db = mockedGraphDatabase(),
            result = {};
        
        webmock("POST", "http://localhost:7474/db/data/node/0/relationships", function(req){
            req.failure(new neo4j.exceptions.HttpException(400, {
                "message" : "For input string: \"jibberish\"",
                "exception" : "org.neo4j.server.rest.repr.BadInputException: For input string: \"jibberish\"",
                "stacktrace" : [ "org.neo4j.server.rest.web.RestfulGraphDatabase.extractNodeId(RestfulGraphDatabase.java:105)", "org.neo4j.server.rest.web.RestfulGraphDatabase.createRelationship(RestfulGraphDatabase.java:253)", "sun.reflect.NativeMethodAccessorImpl.invoke0(Native Method)", "sun.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:39)", "sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:25)", "java.lang.reflect.Method.invoke(Method.java:597)", "com.sun.jersey.server.impl.model.method.dispatch.AbstractResourceMethodDispatchProvider$ResponseOutInvoker._dispatch(AbstractResourceMethodDispatchProvider.java:184)", "com.sun.jersey.server.impl.model.method.dispatch.ResourceJavaMethodDispatcher.dispatch(ResourceJavaMethodDispatcher.java:67)", "com.sun.jersey.server.impl.uri.rules.HttpMethodRule.accept(HttpMethodRule.java:276)", "com.sun.jersey.server.impl.uri.rules.RightHandPathRule.accept(RightHandPathRule.java:133)", "com.sun.jersey.server.impl.uri.rules.ResourceClassRule.accept(ResourceClassRule.java:83)", "com.sun.jersey.server.impl.uri.rules.RightHandPathRule.accept(RightHandPathRule.java:133)", "com.sun.jersey.server.impl.uri.rules.RootResourceClassesRule.accept(RootResourceClassesRule.java:71)", "com.sun.jersey.server.impl.application.WebApplicationImpl._handleRequest(WebApplicationImpl.java:1171)", "com.sun.jersey.server.impl.application.WebApplicationImpl._handleRequest(WebApplicationImpl.java:1103)", "com.sun.jersey.server.impl.application.WebApplicationImpl.handleRequest(WebApplicationImpl.java:1053)", "com.sun.jersey.server.impl.application.WebApplicationImpl.handleRequest(WebApplicationImpl.java:1043)", "com.sun.jersey.spi.container.servlet.WebComponent.service(WebComponent.java:406)", "com.sun.jersey.spi.container.servlet.ServletContainer.service(ServletContainer.java:477)", "com.sun.jersey.spi.container.servlet.ServletContainer.service(ServletContainer.java:662)", "javax.servlet.http.HttpServlet.service(HttpServlet.java:820)", "org.mortbay.jetty.servlet.ServletHolder.handle(ServletHolder.java:511)", "org.mortbay.jetty.servlet.ServletHandler.handle(ServletHandler.java:390)", "org.mortbay.jetty.servlet.SessionHandler.handle(SessionHandler.java:182)", "org.mortbay.jetty.handler.ContextHandler.handle(ContextHandler.java:765)", "org.mortbay.jetty.handler.HandlerCollection.handle(HandlerCollection.java:114)", "org.mortbay.jetty.handler.HandlerWrapper.handle(HandlerWrapper.java:152)", "org.mortbay.jetty.Server.handle(Server.java:326)", "org.mortbay.jetty.HttpConnection.handleRequest(HttpConnection.java:542)", "org.mortbay.jetty.HttpConnection$RequestHandler.content(HttpConnection.java:943)", "org.mortbay.jetty.HttpParser.parseNext(HttpParser.java:756)", "org.mortbay.jetty.HttpParser.parseAvailable(HttpParser.java:218)", "org.mortbay.jetty.HttpConnection.handle(HttpConnection.java:404)", "org.mortbay.jetty.bio.SocketConnector$Connection.run(SocketConnector.java:228)", "org.mortbay.thread.QueuedThreadPool$PoolThread.run(QueuedThreadPool.java:582)" ]
            }, req));
        });
        
        var relPromise = db.rel(db.referenceNode(), "KNOWS", "jibberish");
        
        relPromise.then(null, function(error){
            result.error = error;
        });
       
        this.assertTrue("GraphDatabase#rel method should return a value.", typeof(relPromise) != "undefined");
        this.assertTrue("GraphDatabase#rel method should return a promise.", relPromise instanceof neo4j.Promise);
        
        this.assertTrue("Promise should fail", typeof(result.error) != "undefined");
        this.assertTrue("Error should be NotFoundException", result.error instanceof neo4j.exceptions.NotFoundException);
    },
    
    testCreateRelationshipFromNonExistantNode : function() {
        clearWebmock();
        mockServiceDefinition();
        
        var db = mockedGraphDatabase(),
            result = {};
        
        var relPromise = db.rel("jibberish", "KNOWS", db.referenceNode());
        
        relPromise.then(null, function(error){
            result.error = error;
        });
       
        this.assertTrue("GraphDatabase#rel method should return a value.", typeof(relPromise) != "undefined");
        this.assertTrue("GraphDatabase#rel method should return a promise.", relPromise instanceof neo4j.Promise);
        
        this.assertTrue("Promise should fail", typeof(result.error) != "undefined");
        this.assertTrue("Error should be NotFoundException", result.error instanceof neo4j.exceptions.NotFoundException);
    },
    
    testGetAvailableRelationshipTypes : function() {
        clearWebmock();
        mockServiceDefinition();
        
        var db = mockedGraphDatabase(),
            result = {},
            types = ['one', 'two'];
        
        webmock("GET", "http://localhost:7474/db/data/relationships/types", types);
        
        var typesPromise = db.getAvailableRelationshipTypes();
        
        this.assertTrue("GraphDatabase#getAvailableRelationshipTypes method should return a value.", typeof(typesPromise) != "undefined");
        this.assertTrue("GraphDatabase#getAvailableRelationshipTypes method should return a promise.", typesPromise instanceof neo4j.Promise);
     
        typesPromise.then(function(returnedTypes) {
           result.types = returnedTypes; 
        });
        
        this.assertTrue("Promise should be fulfilled, and return types.", typeof(result.types) != "undefined");
        this.assertTrue("Types should be an array.", _.isArray(types));
        
        for(var i=0, l=types.length; i<l; i++) {
            this.assertEquals("Types should match the mocked ones.", types[i], result.types[i]);
        }
    },
    
    testCypherQuery : function() {
        clearWebmock();
        mockServiceDefinition();
        
        var db = mockedGraphDatabase(),
            result = {},
            response = {
          "data" : [ [ "know", {// Node representation
                "outgoing_relationships" : "http://localhost:7474/db/data/node/1/relationships/out",
                "data" : {
                },
                "traverse" : "http://localhost:7474/db/data/node/1/traverse/{returnType}",
                "all_typed_relationships" : "http://localhost:7474/db/data/node/1/relationships/all/{-list|&|types}",
                "property" : "http://localhost:7474/db/data/node/1/properties/{key}",
                "self" : "http://localhost:7474/db/data/node/1",
                "properties" : "http://localhost:7474/db/data/node/1/properties",
                "outgoing_typed_relationships" : "http://localhost:7474/db/data/node/1/relationships/out/{-list|&|types}",
                "incoming_relationships" : "http://localhost:7474/db/data/node/1/relationships/in",
                "extensions" : {
                },
                "create_relationship" : "http://localhost:7474/db/data/node/1/relationships",
                "all_relationships" : "http://localhost:7474/db/data/node/1/relationships/all",
                "incoming_typed_relationships" : "http://localhost:7474/db/data/node/1/relationships/in/{-list|&|types}"
              }, {// Relationship representation
              "start" : "http://localhost:7474/db/data/node/0",
              "data" : {
              },
              "self" : "http://localhost:7474/db/data/relationship/1",
              "property" : "http://localhost:7474/db/data/relationship/1/properties/{key}",
              "properties" : "http://localhost:7474/db/data/relationship/1/properties",
              "type" : "KNOWS",
              "extensions" : {
              },
              "end" : "http://localhost:7474/db/data/node/1"
            } ], 
            [ "know", null, { // Path representation
            "start" : "http://localhost:7474/db/data/node/7",
            "nodes" : [ "http://localhost:7474/db/data/node/7", "http://localhost:7474/db/data/node/6" ],
            "length" : 1,
            "relationships" : [ "http://localhost:7474/db/data/relationship/3" ],
            "end" : "http://localhost:7474/db/data/node/6"
          } ] ],
          "columns" : [ "TYPE(r)", "n", "y" ]
        };
        
        webmock("POST", "http://localhost:7474/db/data/cypher", response);
        
        var resultPromise = db.query("BLAH BLAH BLHA");
        
        this.assertTrue("GraphDatabase#query method should return a value.", typeof(resultPromise) != "undefined");
        this.assertTrue("GraphDatabase#query method should return a promise.", resultPromise instanceof neo4j.Promise);
     
        resultPromise.then(function(cypherResult) {
           result.cypherResult = cypherResult; 
        });
        
        this.assertTrue("Promise should be fulfilled", typeof(result.cypherResult) != "undefined");
        this.assertTrue("cypher result should be of type QueryResult", result.cypherResult instanceof neo4j.cypher.QueryResult);
        
        var qr = result.cypherResult;
        
        this.assertEquals("query result should have two rows", qr.size(), 2);
        
        var firstRow = qr.next(),
            secondRow = qr.next();
        
        this.assertTrue("should contain correct result", firstRow.get("TYPE(r)") == "know");
        this.assertTrue("should contain correct result", firstRow.get("n") instanceof neo4j.models.Node);
        this.assertTrue("should contain correct result", firstRow.get("y") instanceof neo4j.models.Relationship);
        this.assertTrue("should contain correct result", secondRow.get("n") == null);
        
    }
});
