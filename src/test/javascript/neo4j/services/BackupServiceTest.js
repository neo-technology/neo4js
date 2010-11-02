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
