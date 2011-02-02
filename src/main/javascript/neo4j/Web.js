/*
 * Copyright (c) 2002-2011 "Neo Technology,"
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
    ajax : function(args) {
        
        var timeout = args.timeout || 5000,
            method = args.method,
            url = args.url,
            data = args.data,
            success = args.success,
            failure = args.failure,
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
            try
            {
            	if( req.status === 0 ) {
            	    failure( new neo4j.exceptions.ConnectionLostException() );
            	} else {
                    var error = JSON
                            .parse(req.responseText);
                    failure(new neo4j.exceptions.HttpException(req.status, error, req));
            	}
            } catch (e)
            {
                failure(new neo4j.exceptions.HttpException(-1, {}, req));
            }
	    };

	    var isCrossDomain = this.isCrossDomain;
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
                        if (isCrossDomain(url)
                                && window.XDomainRequest)
                        {
                            // IE8 Cross domain
                            // TODO
                            if (typeof (failure) === "function")
                            {
                                failure(new neo4j.exceptions.HttpException(-1, null, null, "Cross-domain requests are available in IE, but are not yet implemented in neo4js."));
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
    }
};

/**
 * Interface to jQuery AJAX library. This is here to enable a fairly simple
 * expansion to make other AJAX libraries available as underlying
 * implementation, thus dropping dependency on jQuery.
 */
neo4j.Web = function(webProvider) {

    this.webProvider = webProvider || neo4j.jqueryWebProvider;

};

_.extend(neo4j.Web.prototype, {

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
        return this.ajax("GET", url, data, success, failure);
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
        return this.ajax("POST", url, data, success, failure);
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
        return this.ajax("PUT", url, data, success, failure);
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
        return this.ajax("DELETE", url, data, success, failure);
    },

    /**
	 * Perform a http request to the given url.
	 * 
	 * TODO: Refactor to sort out which arg is which at a single point.
	 * 
	 * @param method
	 *            is the HTTP method to use (e.g. PUT, POST, GET, DELETE)
	 * @param url
	 *            is the url to send the request to
	 * @param data
	 *            (optional) javascript object to send as payload. This will
	 *            be converted to JSON.
	 * @param success
	 *            (optional) Callback called with de-serialized JSON
	 *            response data as argument. You can also use the promise
	 *            returned to hook into this callback.
	 * @param failure
	 *            (optional) Callback called with failed request object.
	 *            You can also use the promise returned to hook into this 
	 *            callback.
	 * @return A promise for a http response.
	 */
    ajax : function() {
        
        var args = this._processAjaxArguments(arguments),
            web = this;
        
        args.userFail = this.wrapFailureCallback(args.failure);
        args.userSuccess = args.success;
        
	    return new neo4j.Promise(function(fulfill, fail) {
	        args.failure = function() {
	            fail.apply(this, arguments);
	            args.userFail.apply(this, arguments);
	        };
	        
	        args.success = function() {
                fulfill.apply(this, arguments);
                args.userSuccess.apply(this, arguments);
            };
	        
	        try {
	            web.webProvider.ajax(args);
	        } catch (e) {
	            args.failure(e);
	        }
	    });

    },
    
    /**
     * Check if a given string seems to be a URL.
     */
    looksLikeUrl : function(theUnknownString) {
    	var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
		return regexp.test(theUnknownString);
    },

    /**
	 * Set the provider that should be used to do ajax requests.
	 * 
	 * @see {@link neo4j.Web#ajax} for how the provider is used
	 */
    setWebProvider : function(provider) {
        this.webProvider = provider;
    },

    /**
	 * Take a url with {placeholders} and replace them using a map of
	 * placeholder->string.
	 */
    replace : function(url, replaceMap) {
        var out = {url:url};
        _.each(_.keys(replaceMap), function(key) {
            out.url = out.url.replace("{" + key + "}", replaceMap[key]);
        });
        return out.url;
    },
    
    /**
     * Wraps a failure callback for web requests. This handles web errors like
     * connection failures, and triggers events accordingly.
     */
    wrapFailureCallback : function(cb) {
    	return function(ex) {
    		if( typeof(ex) != "undefined" && ex instanceof neo4j.exceptions.ConnectionLostException ) {
    			neo4j.events.trigger("web.connection.failed", _.toArray(arguments));
    		}

            cb.apply(this, arguments);
    	};
    },
    
    /**
     * Go through the arguments array that the ajax method recieves,
     * and return a map containing appropriate handlers, request method,
     * data and url.
     */
    _processAjaxArguments : function(args) {
        var method, url, data, success, failure,
            args = _.toArray(args);
        
        method = args.shift();
        url = args.shift();
        
        data = args.length > 0 && !_.isFunction(args[0]) ? args.shift() : null;       
        
        success = args.length > 0 ? args.shift() : null;
        failure = args.length > 0 ? args.shift() : null;
        
        success = _.isFunction(success) ? success : function() {};
        failure = _.isFunction(failure) ? failure : function() {};
        
        return {
            method : method, 
            url : url,
            data : data,
            success : success,
            failure : failure
        }
    }

});