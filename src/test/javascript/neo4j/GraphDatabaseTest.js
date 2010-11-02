module("neo4j.GraphDatabaseTest");

test("GraphDatabase has manager attached", function() {
    
    webmock("GET", DB_URL, { });
    webmock("GET", MANAGEMENT_URL, { services:[] });
    
    var db = new neo4j.GraphDatabase(DB_URL, MANAGEMENT_URL);
    equals( db.manage.url, MANAGEMENT_URL, "Creates manager instance with correct url" );
});
