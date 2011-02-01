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

module("neo4j.GraphDatabaseManagerTest");

asyncTest("Test services loaded event", function() {

    webmock("GET", DB_URL, {});
    webmock("GET", MANAGEMENT_URL, {
        services : {
            'backup' : MANAGEMENT_URL + "/backup"
        }
    });

    var db = new neo4j.GraphDatabase(DB_URL, MANAGEMENT_URL, mockProvider);

    stop(100);

    db.bind("services.loaded", function(event) {

        equals(true, true, "services.loaded event should be triggered.");
        start();

    });

    db.manage.discoverServices();
});

asyncTest(
        "Make sure proper services are loaded",
        function() {

            webmock("GET", DB_URL, {});
            webmock("GET", MANAGEMENT_URL, {
                services : {
                    'backup' : MANAGEMENT_URL + "/backup"
                }
            });

            var db = new neo4j.GraphDatabase(DB_URL, MANAGEMENT_URL, mockProvider);

            expect(2);
            stop(100);

            db
                    .bind(

                            "services.loaded",
                            function(event) {
                                equals(typeof (db.manage.backup), "object",
                                        "Backup service should be attached.");

                                try
                                {
                                    db.manage.backup.triggerManual();

                                    ok(true,
                                            "Triggering any of the offered service methods should not throw exceptions.");
                                } catch (e)
                                {
                                    console.log(e);
                                }
                                start();
                            });

            db.manage.discoverServices();

        });