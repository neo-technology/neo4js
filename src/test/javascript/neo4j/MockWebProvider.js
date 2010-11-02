var mockWebProvider = {

    definitions : {
        'GET': {},
        'POST':{},
        'PUT':{},
        'DELETE':{}
    },
        
    mock : function(method, url, mocker) {
        
        if (! mockWebProvider.definitions[method] ) {
            mockWebProvider.definitions[method] = {};
        }
        
        mockWebProvider.definitions[method][url] = mocker;
    },
        
    ajax : function(method, url, data, success, failure) {

        neo4j.log(method, url);
        
        if (typeof (data) === "function")
        {
            failure = success;
            success = data;
            data = null;
        }
        
        if( typeof(failure) !== "function" ) {
            failure = function() {};
        } 
        
        var mocker = mockWebProvider.definitions[method][url]; 
        if( typeof(mocker) === "function" ) {
            mocker({method:method, url:url, data:data, success:success, failure:failure});
        } else  if( mocker ) {
            success(mocker);
        } else {
            failure(null);
        }
    }

};

/** 
 * Convinience access.
 */
var webmock = mockWebProvider.mock;

/**
 * Automatically set as default.
 */
neo4j.Web.setWebProvider(mockWebProvider);