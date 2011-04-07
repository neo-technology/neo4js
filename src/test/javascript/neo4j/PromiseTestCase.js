/*
 * Copyright (c) 2002-2011 "Neo Technology,"
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

var PromiseTest = function(name) {
	
	TestCase.call(this, "PromiseTest." + name);
};

PromiseTest.prototype = new TestCase();

/**
 * Test that eventually fulfulling a promise allows hooking handlers
 * to it, and that the handlers recieve the result as expected.
 */
PromiseTest.prototype.testEventuallyFulfillingPromise = function() {
	
	var ctx = {},
	    expected = 123;
	
	var promise = new neo4j.Promise(function(fulfill) {
		ctx.fulfill = fulfill;
	});
	
	promise.then(function(pResult) {
		ctx.pResult = pResult;
	}, function() {
		ctx.failCall = true;
	});
	
	// Fulfill promise
	ctx.fulfill(expected);
	
	this.assertSame("Result should have been propagated and set by our callback method.", expected, ctx.pResult);
	this.assertUndefined( "Failure callback should not have been called.",  ctx.failCall);
};

/**
 * Test that eventually breaking a promise allows hooking handlers
 * to it, and that the handlers recieve the result as expected.
 */
PromiseTest.prototype.testEventuallyFailingPromise = function() {
	
	var ctx = {},
	    expected = 123;
	
	var promise = new neo4j.Promise(function(fulfill, fail) {
		ctx.fail = fail;
	});
	
	promise.then(function(pResult) {
		ctx.fulfillCall = true;
	}, function(pResult) {
		ctx.pResult = pResult;
	});
	
	// Fulfill promise
	ctx.fail(expected);
	
	this.assertSame("Result should have been propagated and set by our callback method.", expected, ctx.pResult);
	this.assertUndefined( "Fulfill callback should not have been called.",  ctx.fulfillCall);
};

/**
 * Test that fulfulling a promise immediately still allows hooking handlers
 * to it, and that the handlers recieve the result as expected.
 */
PromiseTest.prototype.testDirectlyFulfillingPromise = function() {
	
	var result = {},
	    expected = 123;
	
	var promise = new neo4j.Promise(function(fulfill) {
		fulfill(expected);
	});
	
	promise.then(function(pResult) {
		result.pResult = pResult;
	}, function() {
		result.failCall = true;
	});
	
	this.assertSame("Result should have been propagated and set by our callback method.", expected, result.pResult);
	this.assertUndefined( "Failure callback should not have been called.",  result.failCall);
};

/**
 * Test that breaking a promise immediately still allows hooking handlers
 * to it, and that the handlers recieve the result as expected.
 */
PromiseTest.prototype.testDirectlyFailingPromise = function() {
	
	var result = {},
	    expected = 123;
	
	var promise = new neo4j.Promise(function(fulfill, fail) {
		fail(expected);
	});
	
	promise.then(function(pResult) {
		result.fulfillCall = true;
	}, function(pResult) {
		result.pResult = pResult;
	});
	
	this.assertSame("Failed result should have been propagated and set by our callback method.", expected, result.pResult);
	this.assertUndefined( "Fulfill callback should not have been called.",  result.fulfillCall);
};

/**
 * Test wrapping a value in a promise.
 */
PromiseTest.prototype.testPromiseWrapping = function() {
	
	var value = 12,
	    promiseValue = new neo4j.Promise();
	
	var wrappedValue = neo4j.Promise.wrap(value),
	    wrappedPromiseValue = neo4j.Promise.wrap(promiseValue);
	
	this.assertTrue("Wrapping a raw value should return a promise.", wrappedValue instanceof neo4j.Promise);
	this.assertSame("Wrapping promises should return the original promise.", promiseValue, wrappedPromiseValue);
};

/**
 * Test fulfilling a promise with a result == false. (Regression test.)
 */
PromiseTest.prototype.testFulfillWithFalseResult = function() {
    
    var results = {};
    
    var p = new neo4j.Promise(function(fulfill){
       fulfill(false); 
    });
    
    p.then(function(result) {
        results.result = result;
    });
    
    
    this.assertTrue("The promise should be fulfilled.", typeof(results.result) != "undefined");
    this.assertTrue("The result should be exactly equal to false.", results.result === false);
    
};

/**
 * Test joining several promises into one.
 */
PromiseTest.prototype.testJoinPromises = function() {
    
    var firstPromise = neo4j.Promise.fulfilled(12),
        secondPromise = neo4j.Promise.fulfilled(13),
        results = {};
    
    var joined = neo4j.Promise.join(firstPromise, secondPromise);
    
    joined.then(function(result, fulfill, fail) {
        results.result = result;
    });
    
    this.assertTrue("Joining promises should return a new promise.", joined instanceof neo4j.Promise);
    this.assertTrue("The first argument to handler of joined promise should be a list of results.", _.isArray(results.result));
    
    this.assertEquals("The result argument should be an array of length 2.", results.result.length, 2);
    this.assertEquals("The first item in the results argument should be 12.", results.result[0], 12);
    this.assertEquals("The second item in the results argument should be 13.", results.result[1], 13);
    
};
