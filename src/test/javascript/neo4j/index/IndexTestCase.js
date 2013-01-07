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
var IndexTest = function(name) {
    TestCase.call(this, "IndexTest." + name);
};

IndexTest.prototype = new TestCase();

_.extend(IndexTest.prototype, {
    
    testCanIndexNode : function() {
        clearWebmock();
        mockServiceDefinition();
        
        var indexName = "my_nodes", result = {}, key="thekey", value="thevalue",
            nodeId = 1,
            nodeUrl = "http://localhost:7474/db/data/node/" + nodeId;
        
        webmock("POST", "http://localhost:7474/db/data/index/node/" + indexName + "/" + key + "/" + value, function(req) {
            result.called = true;
            result.nodeUrl = req.data;
            req.success({});
        });
        
        webmock("GET", nodeUrl, function(req) {
            result.getNodeCalled = true;
            req.success({
                "outgoing_relationships" : "http://localhost:7474/db/data/node/1/relationships/out",
                "data" : {
                    "thekey" : value
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
        });
        
        var db = mockedGraphDatabase();
        
        var index = new neo4j.index.NodeIndex(db, indexName),
            node = new neo4j.models.Node({self:nodeUrl}, db);

        index.index(node, key, value).then(function(){
            result.indexObject = true;
        });
        
        index.index(nodeUrl, key, value).then(function(){
            result.indexUrl = true;
        });
        
        index.index(nodeId, key, value).then(function(){
            result.indexId = true;
        });
        
        index.index(nodeId, key).then(function(){
            result.indexIdFetchValue = true;
        });
        
        this.assertTrue("Server should have been called.", result.called);
        this.assertTrue("Server should have been given correct node url", result.nodeUrl == nodeUrl);
        this.assertTrue("Should have indexed a node instance", result.indexObject);
        this.assertTrue("Should have indexed a node url", result.indexUrl);
        this.assertTrue("Should have indexed a node id", result.indexId);
        this.assertTrue("Should have indexed a node id, even when having to fetch the remote value", result.indexIdFetchValue);
    },
    
    testCanIndexRelationship : function() {
        clearWebmock();
        mockServiceDefinition();
        
        var indexName = "my_nodes", result = {}, key="thekey", value="thevalue",
            relId = 1,
            relUrl = "http://localhost:7474/db/data/relationship/" + relId;
        
        webmock("POST", "http://localhost:7474/db/data/index/relationship/" + indexName + "/" + key + "/" + value, function(req) {
            result.called = true;
            result.relUrl = req.data;
            req.success({});
        });
        
        webmock("GET", relUrl, {
            "start" : "http://localhost:7474/db/data/node/0",
            "data" : {
                "thekey" : value
            },
            "self" : "http://localhost:7474/db/data/relationship/1",
            "property" : "http://localhost:7474/db/data/relationship/1/properties/{key}",
            "properties" : "http://localhost:7474/db/data/relationship/1/properties",
            "type" : "KNOWS",
            "extensions" : {
            },
            "end" : "http://localhost:7474/db/data/node/1"
          });
        
        var db = mockedGraphDatabase();
        
        var index = new neo4j.index.RelationshipIndex(db, indexName),
            rel = new neo4j.models.Relationship({self:relUrl}, db);

        index.index(rel, key, value).then(function(){
            result.indexObject = true;
        });
        
        index.index(relUrl, key, value).then(function(){
            result.indexUrl = true;
        });
        
        index.index(relId, key, value).then(function(){
            result.indexId = true;
        });

        index.index(relId, key).then(function(){
            result.indexIdFetchValue = true;
        });
        
        this.assertTrue("Server should have been called.", result.called);
        this.assertTrue("Server should have been called with correct item url.", result.relUrl == relUrl);
        this.assertTrue("Should have indexed a relationship instance", result.indexObject);
        this.assertTrue("Should have indexed a relationship url", result.indexUrl);
        this.assertTrue("Should have indexed a relationship id", result.indexId);
        this.assertTrue("Should have indexed a relationship id, even when having to fetch the remote value", result.indexIdFetchValue);
    },
    
    testCanUnindexRelationship : function() {
        clearWebmock();
        mockServiceDefinition();
        
        var indexName = "my_nodes", result = {}, key="thekey", value="thevalue",
            relId = 1,
            relUrl = "http://localhost:7474/db/data/relationship/" + relId;
        
        webmock("DELETE", "http://localhost:7474/db/data/index/relationship/" + indexName + "/" + key + "/" + value + "/" + relId, function(req) {
            result.fullpathCalled = true;
            req.success({});
        });
        
        var db = mockedGraphDatabase();
        
        var index = new neo4j.index.RelationshipIndex(db, indexName),
            rel = new neo4j.models.Relationship({self:relUrl}, db);

        index.unindex(rel, key, value).then(function(){
            result.unindexObject = true;
        });
        
        this.assertTrue("Server should have been called.", result.fullpathCalled);
        this.assertTrue("Should have unindexed a relationship instance", result.unindexObject);
    },
    
    testCanUnindexNode : function() {
        clearWebmock();
        mockServiceDefinition();
        
        var indexName = "my_nodes", result = {}, key="thekey", value="thevalue",
            nodeId = 1,
            nodeUrl = "http://localhost:7474/db/data/node/" + nodeId;
        
        webmock("DELETE", "http://localhost:7474/db/data/index/node/" + indexName + "/" + key + "/" + value + "/" + nodeId, function(req) {
            result.fullpathCalled = true;
            req.success({});
        });
        
        var db = mockedGraphDatabase();
        
        var index = new neo4j.index.NodeIndex(db, indexName),
            node = new neo4j.models.Node({self:nodeUrl}, db);

        index.unindex(node, key, value).then(function(){
            result.unindexObject = true;
        });
        
        this.assertTrue("Server should have been called.", result.fullpathCalled);
        this.assertTrue("Should have unindexed a node instance", result.unindexObject);
    },
    
    testCanQueryNodeIndex : function() {
        clearWebmock();
        mockServiceDefinition();
        
        var indexName = "my_nodes", result = {}
            query = "title:\"The Right Way\" AND text:go";
        
        webmock("GET", "http://localhost:7474/db/data/index/node/" + indexName, [
            {
                "outgoing_relationships" : "http://localhost:7474/db/data/node/1/relationships/out",
                "data" : {},
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
           }
        ]);
        
        var db = mockedGraphDatabase();
        
        var index = new neo4j.index.NodeIndex(db, indexName);

        index.query(query).then(function(nodes){
            result.nodes = nodes;
        });

        this.assertTrue("Should have returned one node", result.nodes.length == 1);
        this.assertTrue("Should have returned a node instance", result.nodes[0] instanceof neo4j.models.Node);
    },
    
    testCanQueryRelationshipIndex : function() {
        clearWebmock();
        mockServiceDefinition();
        
        var indexName = "my_nodes", result = {}
            query = "title:\"The Right Way\" AND text:go";
        
        webmock("GET", "http://localhost:7474/db/data/index/relationship/" + indexName, [
             {"start" : "http://localhost:7474/db/data/node/0",
             "data" : { },
             "self" : "http://localhost:7474/db/data/relationship/1",
             "property" : "http://localhost:7474/db/data/relationship/1/properties/{key}",
             "properties" : "http://localhost:7474/db/data/relationship/1/properties",
             "type" : "KNOWS",
             "extensions" : { },
             "end" : "http://localhost:7474/db/data/node/1" }
        ]);
        
        var db = mockedGraphDatabase();
        
        var index = new neo4j.index.RelationshipIndex(db, indexName);

        index.query(query).then(function(rels){
            result.rels = rels;
        });

        this.assertTrue("Should have returned one relationship", result.rels.length == 1);
        this.assertTrue("Should have returned a relationship instance", result.rels[0] instanceof neo4j.models.Relationship);
    },
    
    testCanExactQueryNodeIndex : function() {
        clearWebmock();
        mockServiceDefinition();
        
        var indexName = "my_nodes", result = {}, key="somekey", value="somevalue";
        
        webmock("GET", "http://localhost:7474/db/data/index/node/" + indexName + "/" + key + "/" + value, [
             {
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
           }
        ]);
        
        var db = mockedGraphDatabase();
        var index = new neo4j.index.NodeIndex(db, indexName);

        index.exactQuery(key, value).then(function(nodes){
            result.nodes = nodes;
        });

        this.assertTrue("Should have returned one node", result.nodes.length == 1);
        this.assertTrue("Should have returned a node instance", result.nodes[0] instanceof neo4j.models.Node);
    },
    
    testCanExactQueryRelationshipIndex : function() {
        clearWebmock();
        mockServiceDefinition();
        
        var indexName = "my_nodes", result = {}, key="somekey", value="somevalue";
        
        webmock("GET", "http://localhost:7474/db/data/index/relationship/" + indexName + "/" + key + "/" + value, [
             {"start" : "http://localhost:7474/db/data/node/0",
             "data" : { },
             "self" : "http://localhost:7474/db/data/relationship/1",
             "property" : "http://localhost:7474/db/data/relationship/1/properties/{key}",
             "properties" : "http://localhost:7474/db/data/relationship/1/properties",
             "type" : "KNOWS",
             "extensions" : { },
             "end" : "http://localhost:7474/db/data/node/1" }
        ]);
        
        var db = mockedGraphDatabase();
        
        var index = new neo4j.index.RelationshipIndex(db, indexName);

        index.exactQuery(key, value).then(function(rels){
            result.rels = rels;
        });

        this.assertTrue("Should have returned one relationship", result.rels.length == 1);
        this.assertTrue("Should have returned a relationship instance", result.rels[0] instanceof neo4j.models.Relationship);
    }
});
