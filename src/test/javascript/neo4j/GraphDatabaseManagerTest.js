module("neo4j.GraphDatabaseManagerTest");

asyncTest("Test services loaded event", function() {

    webmock("GET", DB_URL, {});
    webmock("GET", MANAGEMENT_URL, {
        services : {
            'backup' : MANAGEMENT_URL + "/backup"
        }
    });

    var db = new neo4j.GraphDatabase(DB_URL, MANAGEMENT_URL);

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

            var db = new neo4j.GraphDatabase(DB_URL, MANAGEMENT_URL);

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