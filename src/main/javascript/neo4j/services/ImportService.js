/**
 * Allows importing a graphml file from a URL. The server also supports html
 * file uploads.
 * 
 * To use that, create a form like so:
 * 
 * <pre>
 * &lt;form action=&quot;[GET PATH VIA {@link #getUploadPath}]&quot; method=&quot;POST&quot; enctype=&quot;multipart/form-data&quot;&gt;
 *    &lt;input type=&quot;hidden&quot; name=&quot;redirect&quot; value=&quot;[REDIRECT TO HERE AFTER IMPORT]&quot; /&gt;
 *    &lt;input type=&quot;file&quot; name=&quot;file&quot; /&gt;
 *    &lt;input type=&quot;submit&quot; value=&quot;Import&quot; /&gt;
 * &lt;/form&gt;
 * </pre>
 * 
 * You can get the URL you should post the form to via {@link #getUploadPath}.
 * 
 * @class Interface to the import functionality of the REST server.
 * @extends neo4j.Service
 * @param db
 *            should be a neo4j.GraphDatabase object
 */
neo4j.services.ImportService = function(db) {

    this.__init__(db);

};

neo4j.services.ImportService.prototype = new neo4j.Service();

/**
 * Import graphml data from a url.
 * 
 * @param url
 *            is the url to load the graphml file from
 * @param callback
 *            will be called when the import is complete
 * @function
 */
neo4j.services.ImportService.prototype.fromUrl = neo4j.Service
    .resourceFactory({
        'resource' : 'import_from_url',
        'method' : 'POST',
        'wrap': function(method, args) {
            method({'url' : args[0]}, args[1]);
        }
    }
);

/**
 * Get the URL to post file uploads to. See the class constructor for info on
 * how the upload form should look.
 * 
 * @param callback
 *            will be called with the url as parameter
 */
neo4j.services.ImportService.prototype.getUploadUrl = function(cb) {
    this.serviceMethodPreflight(function(cb) {
        cb(this.resources['import_from_file']);
    }, arguments); // End preflight
};