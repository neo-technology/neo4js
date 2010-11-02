/**
 * The monitor service exposes a round-robin data sampler over the web. Through
 * this service, you can access various server metrics and their movement over
 * time.
 * 
 * @class Interface to the monitoring functionality of the REST server.
 * @extends neo4j.Service
 * @param db
 *            should be a neo4j.GraphDatabase object
 */
neo4j.services.MonitorService = function(db) {

    this.__init__(db);
    
};

neo4j.services.MonitorService.prototype = new neo4j.Service();

/**
 * Get monitoring data for a pre-defined (on the server side) time period up
 * until right now.
 * 
 * @param callback
 *            will be called with the monitor data
 * @function
 */
neo4j.services.MonitorService.prototype.getData = neo4j.Service
        .resourceFactory({
            'resource' : 'latest_data',
            'method' : 'GET'
        });

/**
 * Get monitoring data from a given timestamp up until right now.
 * 
 * @param from
 *            {Integer} a UTC timestamp in milliseconds.
 * @param callback
 *            will be called with the monitor data
 * @function
 */
neo4j.services.MonitorService.prototype.getDataFrom = neo4j.Service
        .resourceFactory({
            'resource' : 'data_from',
            'method' : 'GET',
            'urlArgs' : [ 'start' ]
        });

/**
 * Get monitoring data between two timestamps.
 * 
 * @param from
 *            {Integer} a UTC timestamp in milliseconds.
 * @param to
 *            {Integer} a UTC timestamp in milliseconds.
 * @param callback
 *            will be called with the monitor data
 * @function
 */
neo4j.services.MonitorService.prototype.getDataBetween = neo4j.Service
        .resourceFactory({
            'resource' : 'data_period',
            'method' : 'GET',
            'urlArgs' : [ 'start', 'stop' ]
        });
