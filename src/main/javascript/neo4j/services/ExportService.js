/**
 * @class Interface to the export functionality of the REST server.
 * @extends neo4j.Service
 * @param db
 *            should be a neo4j.GraphDatabase object
 */
neo4j.services.ExportService = function(db) {

    this.__init__(db);

};

neo4j.services.ExportService.prototype = new neo4j.Service();

/**
 * Export all nodes, properties and relationships.
 * 
 * @param callback
 *            will be called with an object with a single property, "url", the
 *            value of which is a URL where you can download the export.
 * @function
 */
neo4j.services.ExportService.prototype.all = neo4j.Service
    .resourceFactory({
        'resource' : 'export_all',
        'method' : 'POST'
    }
);
