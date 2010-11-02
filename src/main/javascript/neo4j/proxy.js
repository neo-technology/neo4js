
/**
 * Wrapper around jQuerys proxy object, put in place to
 * allow disconnecting from jquery in the future.
 * 
 * This allows wrapping methods in closures, allowing them
 * to always be run in some pre-determined context.
 */
neo4j.proxy = function(arg1, arg2) {
  
    return jQuery.proxy(arg1, arg2);
    
};