/**
 * @class Interface to the lifecycle functionality of the REST server.
 * @extends neo4j.Service
 * @param db
 *            should be a neo4j.GraphDatabase object
 */
neo4j.services.LifecycleService = function(db) {

    this.__init__(db);

};

neo4j.services.LifecycleService.prototype = new neo4j.Service();

/**
 * Get the current lifecycle status of the server.
 * 
 * @param callback
 *            will be called with lifecycle status information
 * @function
 */
neo4j.services.LifecycleService.prototype.getStatus = neo4j.Service
        .resourceFactory({
            'resource' : 'status',
            'method' : 'GET'
        });

/**
 * Start the REST server.
 * 
 * @param callback
 *            will be called with lifecycle status information
 * @function
 */
neo4j.services.LifecycleService.prototype.start = neo4j.Service
        .resourceFactory({
            'resource' : 'start',
            'method' : 'POST'
        });

/**
 * Stop the REST server.
 * 
 * @param callback
 *            will be called with lifecycle status information
 * @function
 */
neo4j.services.LifecycleService.prototype.stop = neo4j.Service
        .resourceFactory({
            'resource' : 'stop',
            'method' : 'POST'
        });
/**
 * Restart the REST server.
 * 
 * @param callback
 *            will be called with lifecycle status information
 * @function
 */
neo4j.services.LifecycleService.prototype.restart = neo4j.Service
        .resourceFactory({
            'resource' : 'restart',
            'method' : 'POST'
        });
