/*
 * Copyright (c) 2010-2012 "Neo Technology,"
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
/**
 * Used to represent a future value, same or similar to "future" and "delay"
 * pattern.
 * 
 * Inspired by Ron Bucktons lightweight Promise implementation.
 *
 * @class
 * @param init A function that will get passed two arguments,
 *             fulfill and fail. Call one to either fulfill
 *             or fail the promise.
 */
neo4j.Promise = function(init) {

	_.bindAll(this, 'then', 'fulfill', 'fail', 'addHandlers', 
	        'addFulfilledHandler', 'addFailedHandler','_callHandlers',
			'_callHandler', '_addHandler');
	
	this._handlers = [];

	if (typeof (init) === "function") {
		init(this.fulfill, this.fail);
	}
};

/**
 * Ensure that a variable is a promise. If the argument passed is already a
 * promise, the argument will be returned as-is. If it is not a promise, the
 * argument will be wrapped in a promise that is instantly fulfilled.
 */
neo4j.Promise.wrap = function(arg) {
	if (arg instanceof neo4j.Promise) {
		return arg;
	} else {
		return neo4j.Promise.fulfilled(arg);
	}
};

/**
 * Create a promise that is instantly fulfilled. Useful for wrapping values to
 * be sent into promise-based code.
 */
neo4j.Promise.fulfilled = function(value) {
	return new neo4j.Promise(function(fulfill) {
		fulfill(value);
	});
};

/**
 * Join several promises together, pass
 * as many promises as you like in as arguments.
 * @return A new promise that will be fulfilled when
 *         all joined promises are fulfilled. 
 */
neo4j.Promise.join = function() {
    var joined = _.toArray(arguments);
    if(joined.length == 1) {
        return joined[0];
    } else {
        return new neo4j.Promise(function(fulfill, fail){
            var results = [];
            
            function waitForNextPromise(promises) {
                if(promises.length > 0) {
                    promises.shift().addFulfilledHandler(function(result){
                        results.push(result);
                        waitForNextPromise(promises);
                    });
                } else {
                    fulfill(results);
                }
            }
            
            // Hook directly into all failed handlers, to allow
            // failing early.
            for(var i=0, l=joined.length; i<l; i++) {
                joined[i].addFailedHandler(fail);
            }
            
            waitForNextPromise(joined);
        });
    }
};

_.extend(neo4j.Promise.prototype, {
  /** @lends neo4j.Promise# */  
  
	/**
	 * Add callbacks to handle when this promise is fulfilled or broken. Returns
	 * a new promise that is controlled by fulfill/fail methods sent to 
	 * the handlers.
	 * 
	 * Example:
	 * 
	 * var p = new neo4j.Promise( [some promising code]);
	 * 
	 * var newPromise = p.then(function(promisedValue, fulfill, fail) {
	 *     fulfill(promisedValue); // Fulfill "newPromise"
	 * });
	 * 
	 * If no fail (or fulfill) handler is provided when calling this, 
	 * the returned promise will forward fulfill and/or fail calls from
	 * the original promise.
	 * 
	 * @param onPromiseFulfilled
	 *            Will be called with the value promised if the promise is
	 *            fulfilled.
	 * @param onPromiseBroken
	 *            Will be called if the promise is broken, optionally with a
	 *            failed result of some kind, depending on the code that fails
	 *            the promise.
	 */
	then : function(onPromiseFulfilled, onPromiseBroken) {
		var parentPromise = this;
		return new neo4j.Promise(function(fulfill, fail) {
			parentPromise.addHandlers(
			    function(result) {
					if (onPromiseFulfilled) {
						onPromiseFulfilled(result, fulfill, fail);
					} else {
						fulfill(result);
					}
				},
				function(result) {
					if (typeof(onPromiseBroken) === "function") {
						onPromiseBroken(result, fulfill, fail);
					} else {
						fail(result);
					}
				}
			);
		});
	},
	
	/**
	 * Used to chain promises together. Contract:
	 * Do not fulfill or fail this promise until the promise added 
	 * here is fulfilled. Fail this promise if the chained promise fails. 
	 */
	chain : function(otherPromise) {
	    var promise = this;
	    this.chainedPromise = otherPromise;
	    otherPromise.then(null, function(result){
	        promise.fail(result);
	    });
	},

	fulfill : function(result) {
	    if(this.chainedPromise) {
    	    var promise = this;
    	    this.chainedPromise.then(function(){
    	       promise._fulfill(result); 
    	    });
	    } else {
	        this._fulfill(result);
	    }
	},

	fail : function(result) {
        if( ! this._complete ) { 
    		this._failedResult = result;
    		this._fulfilled = false;
    		this._complete = true;
    		this._callHandlers();
        }
	},
    
    _fulfill : function(result) {
        if( ! this._complete) { 
            this._fulfilledResult = result;
            this._fulfilled = true;
            this._complete = true;
            this._callHandlers();
        }
    },

	_callHandlers : function() {
		_.each(this._handlers, this._callHandler);
	},

	_callHandler : function(handler) {
		if (this._fulfilled && typeof(handler.fulfilled) === "function") {
			handler.fulfilled(this._fulfilledResult);
		} else if(typeof(handler.failed) === "function") {
			handler.failed(this._failedResult);
		}
	},

	addHandlers : function(fulfilled, failed) {
	    fulfilled = fulfilled || function() {};
	    failed = failed || function() {};
	    this._addHandler({fulfilled:fulfilled, failed:failed});
	},
    
    addFulfilledHandler : function(fulfilled) {
        this.addHandlers(fulfilled);  
    },
	
	addFailedHandler : function(failed) {
	    this.addHandlers(null, failed);  
	},
	
	_addHandler : function(handler) {
		if (this._complete) {
			this._callHandler(handler);
		} else {
			this._handlers.push(handler);
		}
	}

});
