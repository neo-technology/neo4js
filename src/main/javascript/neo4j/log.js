/**
 * Thin wrapper around console.log, making sure it exists.
 * @param anything, all will be passed to console.log
 */
neo4j.log = function() {
    if(window.console && typeof(window.console.log) === "function") {
        console.log.apply(this, arguments);
    }
};