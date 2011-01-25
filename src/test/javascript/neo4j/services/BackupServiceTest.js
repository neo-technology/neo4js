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
module("neo4j.services.BackupServiceTest");

webmock("GET", DB_URL, {});
webmock("GET", MANAGEMENT_URL, {
    services : {
        'backup' : MANAGEMENT_URL + "/backup"
    }
});

webmock("GET", MANAGEMENT_URL + "/backup/", {
    resources : {
        'status' : MANAGEMENT_URL + "/backup/status",
        'trigger_manual' : MANAGEMENT_URL + "/backup/trigger",
        'trigger_manual_foundation' : MANAGEMENT_URL + "/backup/triggerfoundation",
        'jobs' : MANAGEMENT_URL + "/backup/job",
        'job' : MANAGEMENT_URL + "/backup/job/{id}",
        'trigger_job_foundation' : MANAGEMENT_URL + "/backup/job/{id}/triggerfoundation",
    }
});

webmock("POST", MANAGEMENT_URL + "/backup/trigger", {
    
});

asyncTest("Test definition loaded event", function() {

    var db = new neo4j.GraphDatabase(DB_URL, MANAGEMENT_URL);

    stop(500);
    
    expect(3);
    
    db.bind("services.loaded", function(event) {

        ok(true,
                "services.loaded event should be triggered.");
        
        db.manage.backup.bind("service.definition.loaded", function() {
            ok(true, "service definition should be loaded.");
        });
        
        db.manage.backup.loadServiceDefinition(function(){
            ok(true, "Load service definition should call its callback");
            start();
        });

    });

    db.manage.discoverServices();
});

asyncTest("Test trigger manual", function() {

    var da = new neo4j.GraphDatabase(DB_URL, MANAGEMENT_URL);

    stop(500);
    
    expect(1);
    
    da.bind("services.loaded", function(event) {
        
        da.manage.backup.triggerManual(function(){
            ok(true, "Manual should call its callback.");
            start();
        });

    });

    da.manage.discoverServices();
});
