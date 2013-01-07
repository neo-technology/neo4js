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
var WebTest = function(name) {
    TestCase.call(this, "WebTest." + name);
};

WebTest.prototype = new TestCase();

_.extend(WebTest.prototype, {
    
    testServerUnresponsive : function() {
        var result = {eventTriggered:false, legacyEventTriggered:false};
        clearWebmock();
        
        webmock("POST", "http://localhost:7474/db/data/node", function(req) {
            req.failure(new neo4j.exceptions.ConnectionLostException());
        });
        
        // Legacy behaviour
        neo4j.events.bind("web.connection.failed", function() {
            result.legacyEventTriggered = true;
        });
        
        neo4j.events.bind("web.connection_lost", function() {
            result.eventTriggered = true;
        });
        
        mockWeb.post("http://localhost:7474/db/data/node");
        
        this.assertTrue("Legacy connection failed event should have been triggered.", result.legacyEventTriggered);
        this.assertTrue("Connection lost event should have been triggered.", result.eventTriggered);
        
    }
});
