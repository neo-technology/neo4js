/**
 * Web provider using jQuery.
 * 
 * @namespace
 */
neo4j.jqueryWebProvider = {

    /**
     * Ajax call implementation.
     */
    ajax : function(method, url, data, success, failure) {

        if (typeof (data) === "function")
        {
            failure = success;
            success = data;
            data = null;
        }

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
                            $.ajax({
                                url : url,
                                type : method,
                                data : data,
                                processData : false,
                                success : success,
                                contentType : "application/json",
                                error : function(req) {
                                    try
                                    {
                                        if (req.status === 200)
                                        {
                                            // This happens when the
                                            // server returns an
                                            // empty
                                            // response.
                                            return success(null);
                                        }
                                    } catch (e)
                                    {
                                        // We end up here if there
                                        // is no status to read
                                    }

                                    if (typeof (failure) === "function")
                                    {
                                        try
                                        {
                                            var error = JSON
                                                    .parse(req.responseText);
                                            failure(error, req);
                                        } catch (e)
                                        {
                                            failure({}, req);
                                        }
                                    } else
                                    {
                                        neo4j.log(req);
                                    }
                                },
                                dataType : "json",
                                beforeSend : function(xhr) {
                                    // TODO: Add OAuth
                                    // authentication here.
                                    return xhr;
                                }
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
        }

    };

}();