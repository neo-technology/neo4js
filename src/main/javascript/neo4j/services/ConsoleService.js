/**
 * @class Interface to the console functionality of the REST server.
 * @extends neo4j.Service
 * @param db
 *            should be a neo4j.GraphDatabase object
 */
neo4j.services.ConsoleService = function(db) {

    this.__init__(db);

};

neo4j.services.ConsoleService.prototype = new neo4j.Service();

/**
 * Execute a command
 * 
 * @param cmd
 *            string command to execute.
 * @param callback
 *            will be called with the result
 * @function
 */
neo4j.services.ConsoleService.prototype.exec = neo4j.Service
    .resourceFactory({
        'resource' : 'exec',
        'method' : 'POST',
        'wrap': function(method, args) {
            method({'command' : args[0]}, args[1]);
        }
    }
);
