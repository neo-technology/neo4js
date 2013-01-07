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
var RelationshipTest = function(name) {
    TestCase.call(this, "RelationshipTest." + name);
};

RelationshipTest.prototype = new TestCase();

_.extend(RelationshipTest.prototype, {
    
    testFailsWhenGivenNonRelationshipUrl : function() {
        var nonNodeUrl = "asd123", result={};
        clearWebmock();
        mockServiceDefinition();
        
        webmock("GET", nonNodeUrl, {
           "management" :"",
           "data" : ""
        });
        
        var rel = new neo4j.models.Relationship({self:nonNodeUrl}, mockedGraphDatabase());
     
        rel.fetch().then(null, function(fail) {
            result.error = fail;
        });
        
        this.assertTrue("Error should have been triggered", typeof(result.error) != "undefined");
        this.assertTrue("Error should be InvalidDataException.", result.error instanceof neo4j.exceptions.InvalidDataException);
        
    }
});
