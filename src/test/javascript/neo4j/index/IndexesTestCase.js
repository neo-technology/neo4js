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
var IndexesTest = function(name) {
    TestCase.call(this, "IndexesTest." + name);
};

IndexesTest.prototype = new TestCase();

_.extend(IndexesTest.prototype, {
    
    testCanCreateNodeIndex : function() {

        clearWebmock();
        mockServiceDefinition();
        
        var indexName = "my_nodes", result = {};
        
        webmock("POST", "http://localhost:7474/db/data/index/node", function(req) {
            result.called = true;
            req.success({});
        });
        
        var db = mockedGraphDatabase();
        
        var indexes = new neo4j.index.Indexes(db);
        
        indexes.createNodeIndex(indexName).then(function(index) {
            result.index = index;
        });
        
        this.assertTrue("Server should have been called.", result.called);
        this.assertTrue("Should have gotten an index back", typeof(result.index) != "undefined");
        this.assertTrue("Should result in a node index", result.index instanceof neo4j.index.NodeIndex);
        
    },
    
    testCanCreateRelationshipIndex : function() {

        clearWebmock();
        mockServiceDefinition();
        
        var indexName = "my_rels", result = {};
        
        webmock("POST", "http://localhost:7474/db/data/index/relationship", function(req) {
            result.called = true;
            req.success({});
        });
        
        var db = mockedGraphDatabase();
        
        var indexes = new neo4j.index.Indexes(db);
        
        indexes.createRelationshipIndex(indexName).then(function(index) {
            result.index = index;
        });
        
        this.assertTrue("Server should have been called.", result.called);
        this.assertTrue("Should have gotten an index back", typeof(result.index) != "undefined");
        this.assertTrue("Should result in a relationship index", result.index instanceof neo4j.index.RelationshipIndex);
        
    },

    testCanListNodeIndexes : function() {
        var result = {};
        
        clearWebmock();
        mockServiceDefinition();
        
        webmock("GET", "http://localhost:7474/db/data/index/node", function(req) {
            result.serverCalled=true;
            req.success({
                "my_nodes" : {
                    "template" : "http://localhost:7474/db/data/index/node/my_nodes/{key}/{value}",
                    "provider" : "lucene",
                    "type" : "exact"
                },
                "more_nodes" : {
                    "template" : "http://localhost:7474/db/data/index/node/more_nodes/{key}/{value}",
                    "provider" : "lucene",
                    "type" : "fulltext"
                }
            });
        });
        
        var db = mockedGraphDatabase(),
            indexes = new neo4j.index.Indexes(db);
        
        indexes.getAllNodeIndexes().then(function(nodeIndexes){
            result.nodeIndexes = nodeIndexes;
        });
        
        this.assertTrue("Server should have been called.", result.serverCalled);
        this.assertTrue("Should have gotten a result", typeof(result.nodeIndexes) != "undefined");
        this.assertTrue("Should result in two indexes", result.nodeIndexes.length == 2);
        
        for(var i=0,l=result.nodeIndexes.length;i<l;i++) {
            this.assertTrue("Each index returned should be a node index", result.nodeIndexes[i] instanceof neo4j.index.NodeIndex );  
        }
        
    },

    testCanListRelationshipIndexes : function() {
        var result = {};
        
        clearWebmock();
        mockServiceDefinition();
        
        webmock("GET", "http://localhost:7474/db/data/index/relationship", function(req) {
            result.serverCalled=true;
            req.success({
                "my_nodes" : {
                    "template" : "http://localhost:7474/db/data/index/relationship/my_nodes/{key}/{value}",
                    "provider" : "lucene",
                    "type" : "exact"
                },
                "more_nodes" : {
                    "template" : "http://localhost:7474/db/data/index/relationship/more_nodes/{key}/{value}",
                    "provider" : "lucene",
                    "type" : "fulltext"
                }
            });
        });
        
        var db = mockedGraphDatabase(),
            indexes = new neo4j.index.Indexes(db);
        
        indexes.getAllRelationshipIndexes().then(function(relIndexes){
            result.relIndexes = relIndexes;
        });
        
        this.assertTrue("Server should have been called.", result.serverCalled);
        this.assertTrue("Should have gotten a result", typeof(result.relIndexes) != "undefined");
        this.assertTrue("Should result in two indexes", result.relIndexes.length == 2);
        
        for(var i=0,l=result.relIndexes.length;i<l;i++) {
            this.assertTrue("Each index returned should be a relationship index", result.relIndexes[i] instanceof neo4j.index.RelationshipIndex );  
        }
        
    },

    testCanGetNodeIndex : function() {

        clearWebmock();
        mockServiceDefinition();
        
        var db = mockedGraphDatabase(),
            indexes = new neo4j.index.Indexes(db);
        
        var index = indexes.getNodeIndex("someindex");
        
        this.assertTrue("Should have gotten an index back", typeof(index) != "undefined");
        this.assertTrue("Should result in a node index", index instanceof neo4j.index.NodeIndex);
        
    },

    testCanGetRelationshipIndex : function() {

        clearWebmock();
        mockServiceDefinition();
        
        var db = mockedGraphDatabase(),
            indexes = new neo4j.index.Indexes(db);
        
        var index = indexes.getRelationshipIndex("someindex");
        
        this.assertTrue("Should have gotten an index back", typeof(index) != "undefined");
        this.assertTrue("Should result in a relationship index", index instanceof neo4j.index.RelationshipIndex);
        
    },

    testCanDeleteNodeIndex : function() {

        clearWebmock();
        mockServiceDefinition();
        
        var indexName = "my_nodes", result = {};
        
        webmock("DELETE", "http://localhost:7474/db/data/index/node/" + indexName, function(req) {
            result.called = true;
            req.success({});
        });
        
        var db = mockedGraphDatabase();
        var indexes = new neo4j.index.Indexes(db);
        
        indexes.removeNodeIndex(indexName).then(function(index) {
            result.result = true;
        });
        
        this.assertTrue("Server should have been called.", result.called);
        this.assertTrue("Promise should have been fulfilled", typeof(result.result) != "undefined");
        
    },

    testCanDeleteRelationshipIndex : function() {

        clearWebmock();
        mockServiceDefinition();
        
        var indexName = "my_nodes", result = {};
        
        webmock("DELETE", "http://localhost:7474/db/data/index/relationship/" + indexName, function(req) {
            result.called = true;
            req.success({});
        });
        
        var db = mockedGraphDatabase();
        var indexes = new neo4j.index.Indexes(db);
        
        indexes.removeRelationshipIndex(indexName).then(function(index) {
            result.result = true;
        });
        
        this.assertTrue("Server should have been called.", result.called);
        this.assertTrue("Promise should have been fulfilled", typeof(result.result) != "undefined");
        
    }
});
