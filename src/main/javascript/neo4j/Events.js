/**
 * A simple event-handling system.
 * 
 * @class
 * @param context {object} (optional) context data to be included with event objects
 */
neo4j.Events = function(context) {

    this.uniqueNamespaceCount = 0; // Used to create unique namespaces
    this.handlers = {};
    this.context = context || {};

}

/**
 * Naive implementation to quickly get anonymous event namespaces.
 */
neo4j.Events.prototype.createUniqueNamespace = function() {
    return "uniq#" + (this.uniqueNamespaceCount++);
};

/**
 * Bind an event listener to an event.
 */
neo4j.Events.prototype.bind = function(key, callback) {
    if (typeof (this.handlers[key]) === "undefined")
    {
        this.handlers[key] = [];
    }

    this.handlers[key].push(callback);
};

/**
 * Trigger an event.
 */
neo4j.Events.prototype.trigger = function(key, data) {
    
    if (typeof (this.handlers[key]) !== "undefined")
    {

        var data = data || {};

        var eventHandlers = this.handlers[key];
        var event = $.extend({
            key : key,
            data : data
        }, this.context);

        for ( var i = 0, o = eventHandlers.length; i < o; i++)
        {
            setTimeout((function(handler) {
                return function() {
                    try
                    {
                        handler(event);
                    } catch (e)
                    {
                        neo4j.log("Event handler for event " + key + " threw exception.",e);
                    }
                }
            })(eventHandlers[i]), 0);
        }
    }
};

//
// CREATE A GLOBAL EVENT HANDLER
//

/**
 * Global event handler. Instance of {@link neo4j.Events}.
 */
neo4j.events = new neo4j.Events()
