/*
 * Copyright (c) 2002-2011 "Neo Technology,"
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
            req.success(true);
        });
        
        var db = mockedGraphDatabase();
        
        var indexes = new neo4j.index.Indexes(db);
        
        indexes.createNodeIndex(indexName);
        
        this.assertEqual("Server should have been called.", true, result.called);
        //this.assertTrue("Error should be InvalidDataException.", result.error instanceof neo4j.exceptions.InvalidDataException);
        
    }
});
