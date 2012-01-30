/*
 * Copyright (c) 2002-2012 "Neo Technology,"
 * Network Engine for Objects in Lund AB [http://neotechnology.com]
 *
 * This file is part of Neo4j.
 *
 * Neo4j is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

var _ = require('underscore'),
    neo4j = {
        services:{},
        Service:require("../Service")
    };
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
neo4j.services.ImportService = function (db) {

    neo4j.Service.call(this, db);

};

_.extend(neo4j.services.ImportService.prototype, neo4j.Service.prototype);

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
        'resource':'import_from_url',
        'method':'POST',
        'before':function (method, args) {
            method({'url':args[0]}, args[1]);
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
neo4j.services.ImportService.prototype.getUploadUrl = function (cb) {
    this.serviceMethodPreflight(function (cb) {
        cb(this.resources['import_from_file']);
    }, arguments); // End preflight
};

module.exports = neo4j.services.ImportService;
