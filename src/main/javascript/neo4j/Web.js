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

/**
 * Web provider using jQuery.
 * 
 * @namespace
 */
neo4j.jqueryWebProvider = {

    /**
	 * Ajax call implementation.
	 */
    ajax : function(method, url, data, success, failure, timeout) {

        if (typeof (data) === "function")
        {
            failure = success;
            success = data;
            data = null;
        }
        
        var timeout = timeout || 5000,
            error = function(req) {
            try {
                if (req.status === 200)
                {
                    // This happens when the
                    // server returns an
                    // empty
                    // response.
                    return success(null);
                }
            } catch (e) {
                // We end up here if there
                // is no status to read
            }
            
            if (typeof (failure) === "function")
            {
            	
                try
                {
                	if( req.status === 0 ) {
                		failure( {'connectionLost':true}, req );
                	} else {
	                    var error = JSON
	                            .parse(req.responseText);
	                    failure(error, req);
                	}
                } catch (e)
                {
                    failure({}, req);
                }
            } else
            {
                neo4j.log(req);
            }
	    };

        setTimeout(
                (function(method, url, data, success, failure) {

                    if (data === null || data === "null")
                    {
                        data = "";
                    } else
                    {
                        data = JSON.stringify(data);
                    }

                    return function() {
                        if (neo4j.Web.isCrossDomain(url)
                                && window.XDomainRequest)
                        {
                            // IE8 Cross domain
                            // TODO
                            if (typeof (failure) === "function")
                            {
                                failure("Cross-domain requests are available in IE, but are not yet implemented in neo4js.");
                            }
                        } else
                        {
                        	var finished = false,
                        	    xhr = $.ajax({
	                                url : url,
	                                type : method,
	                                data : data,
	                                timeout: timeout,
	                                cache: false,
	                                processData : false,
	                                success : function(data, status, xhr) {
	                                	if ( xhr.status === 0 ) {
	                                		error(xhr);
	                                	} else {
	                                		success.apply(this, arguments);
	                                	}
	                                },
	                                contentType : "application/json",
	                                error : error,
	                                dataType : "json"
	                            });
                        	
                        }
                    };
                })(method, url, data, success, failure), 0); // End timeout
    }
};

/**
 * Interface to jQuery AJAX library. This is here to enable a fairly simple
 * expansion to make other AJAX libraries available as underlying
 * implementation, thus dropping dependency on jQuery.
 * 
 * @namespace
 */
neo4j.Web = function() {

    var webProvider = neo4j.jqueryWebProvider;

    /** @scope neo4j.Web */
    return {

        /**
		 * Perform a GET http request to the given url.
		 * 
		 * @param url
		 *            is the url to send the request to
		 * @param data
		 *            (optional) javascript object to send as payload. This will
		 *            be converted to JSON.
		 * @param success
		 *            (optional) callback called with de-serialized JSON
		 *            response data as argument
		 * @param failure
		 *            (optional) callback called with failed request object
		 */
        get : function(url, data, success, failure) {
            return neo4j.Web.ajax("GET", url, data, success, failure);
        },

        /**
		 * Perform a POST http request to the given url.
		 * 
		 * @param url
		 *            is the url to send the request to
		 * @param data
		 *            (optional) javascript object to send as payload. This will
		 *            be converted to JSON.
		 * @param success
		 *            (optional) callback called with de-serialized JSON
		 *            response data as argument
		 * @param failure
		 *            (optional) callback called with failed request object
		 */
        post : function(url, data, success, failure) {
            return neo4j.Web.ajax("POST", url, data, success, failure);
        },

        /**
		 * Perform a PUT http request to the given url.
		 * 
		 * @param url
		 *            is the url to send the request to
		 * @param data
		 *            (optional) javascript object to send as payload. This will
		 *            be converted to JSON.
		 * @param success
		 *            (optional) callback called with de-serialized JSON
		 *            response data as argument
		 * @param failure
		 *            (optional) callback called with failed request object
		 */
        put : function(url, data, success, failure) {
            return neo4j.Web.ajax("PUT", url, data, success, failure);
        },

        /**
		 * Perform a DELETE http request to the given url.
		 * 
		 * @param url
		 *            is the url to send the request to
		 * @param data
		 *            (optional) javascript object to send as payload. This will
		 *            be converted to JSON.
		 * @param success
		 *            (optional) callback called with de-serialized JSON
		 *            response data as argument
		 * @param failure
		 *            (optional) callback called with failed request object
		 */
        del : function(url, data, success, failure) {
            return neo4j.Web.ajax("DELETE", url, data, success, failure);
        },

        /**
		 * Perform a http request to the given url.
		 * 
		 * @param method
		 *            is the HTTP method to use (e.g. PUT, POST, GET, DELETE)
		 * @param url
		 *            is the url to send the request to
		 * @param data
		 *            (optional) javascript object to send as payload. This will
		 *            be converted to JSON.
		 * @param success
		 *            (optional) callback called with de-serialized JSON
		 *            response data as argument
		 * @param failure
		 *            (optional) callback called with failed request object
		 */
        ajax : function(method, url, data, success, failure) {

        	if(typeof(data) === "function" && success) {
        		// No data, data param is success callback, success callback is failure callback.
        		success = neo4j.Web.wrapFailureCallback(success);
        	} else if (typeof(failure) === "function" ) {
        		failure = neo4j.Web.wrapFailureCallback(failure);
        	}
        	
            return webProvider.ajax(method, url, data, success, failure);

        },

        /**
		 * Check if a url is cross-domain from the current window.location url.
		 */
        isCrossDomain : function(url) {
            if (url)
            {
                var httpIndex = url.indexOf("://");
                if (httpIndex === -1 || httpIndex > 7)
                {
                    return false;
                } else
                {
                    return url.substring(httpIndex + 3).split("/", 1)[0] !== window.location.host;
                }
            } else
            {
                return false;
            }
        },

        /**
		 * Set the provider that should be used to do ajax requests.
		 * 
		 * @see {@link neo4j.Web.ajax} for how the provider is used
		 */
        setWebProvider : function(provider) {
            webProvider = provider;
        },

        /**
		 * Take a url with {placeholders} and replace them using a map of
		 * placeholder->string.
		 */
        replace : function(url, replace) {
            for ( var placeholder in replace)
            {
                url = url
                        .replace("{" + placeholder + "}", replace[placeholder]);
            }

            return url;
        },
        
        /**
         * Wraps a failure callback for web requests. This handles web errors like
         * connection failures, and triggers events accordingly.
         */
        wrapFailureCallback : function(cb) {
        	return function(error, xhr) {
        		if( error && error.connectionLost ) {
        			neo4j.events.trigger("web.connection.failed", [xhr]);
        			cb.apply(this, arguments);
        		} else if(typeof(cb) === "function") {
        			cb.apply(this, arguments);
        		}
        	};
        }

    };

}();