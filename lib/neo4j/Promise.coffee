###
Copyright (c) 2002-2012 "Neo Technology,"
Network Engine for Objects in Lund AB [http://neotechnology.com]

This file is part of Neo4j.

Neo4j is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
###

_ = require('underscore')
###
 * Used to represent a future value, same or similar to "future" and "delay"
 * pattern.
 *
 * Inspired by Ron Bucktons lightweight Promise implementation.
 *
 * @class
 * @param init A function that will get passed two arguments,
 *             fulfill and fail. Call one to either fulfill
 *             or fail the promise.
###
class Promise
  constructor:(init)->
    @_handlers = []

    self = this
    fulfill = @fulfill
    fail = @fail

    if (typeof(init) == "function")
      init(
        (result)-> fulfill.call self, result
        (result)-> fail.call self, result
      )

  ###
  # _.extend(neo4j.Promise.prototype, {
  #    * @lends neo4j.Promise# *
  #
  #    *
  #     * Add callbacks to handle when this promise is fulfilled or broken. Returns
  #     * a new promise that is controlled by fulfill/fail methods sent to
  #     * the handlers.
  #     *
  #     * Example:
  #     *
  #     * var p = new neo4j.Promise( [some promising code]);
  #     *
  #     * var newPromise = p.then(function(promisedValue, fulfill, fail) {
  #     *     fulfill(promisedValue); // Fulfill "newPromise"
  #     * });
  #     *
  #     * If no fail (or fulfill) handler is provided when calling this,
  #     * the returned promise will forward fulfill and/or fail calls from
  #     * the original promise.
  #     *
  #     * @param onPromiseFulfilled
  #     *            Will be called with the value promised if the promise is
  #     *            fulfilled.
  #     * @param onPromiseBroken
  #     *            Will be called if the promise is broken, optionally with a
  #     *            failed result of some kind, depending on the code that fails
  #     *            the promise.
  #     *
  ###
  then:(onPromiseFulfilled, onPromiseBroken)->
    parentPromise = this
    return new Promise((fulfill, fail) ->
        parentPromise.addHandlers(
          (result) ->
            if (onPromiseFulfilled) then onPromiseFulfilled(result, fulfill, fail) else fulfill(result)
          (result) ->
            if (typeof(onPromiseBroken) == "function") then onPromiseBroken(result, fulfill, fail) else fail(result)

        )
    )


  ###
  #      Used to chain promises together. Contract:
  #      Do not fulfill or fail this promise until the promise added
  #      here is fulfilled. Fail this promise if the chained promise fails.
  ###
  chain:(otherPromise) ->
    promise = this
    @chainedPromise = otherPromise
    otherPromise.then null, (result) ->
      promise.fail result

  fulfill:(result) ->
    if @chainedPromise
      promise = this
      @chainedPromise.then ->
        promise._fulfill result
    else
      @_fulfill result

  fail:(result) ->
    unless @_complete
      @_failedResult = result
      @_fulfilled = false
      @_complete = true
      @_callHandlers()

  _fulfill:(result) ->
    unless @_complete
      @_fulfilledResult = result
      @_fulfilled = true
      @_complete = true
      @_callHandlers()

  _callHandlers:->
    @_callHandler handler for handler in @_handlers

  _callHandler:(handler) ->
    if @_fulfilled and typeof handler.fulfilled is "function"
      handler.fulfilled @_fulfilledResult
    else handler.failed @_failedResult  if typeof handler.failed is "function"

  addHandlers:(fulfilled, failed) ->
    fulfilled = fulfilled || () ->
    failed = failed || () ->

    if @_complete
      @_callHandler fulfilled:fulfilled, failed:failed
    else
      @_handlers.push fulfilled:fulfilled, failed:failed


  addFulfilledHandler:(fulfilled) ->
    @addHandlers fulfilled

  addFailedHandler:(failed) ->
    @addHandlers null, failed


###
*
* Ensure that a variable is a promise. If the argument passed is already a
* promise, the argument will be returned as-is. If it is not a promise, the
* argument will be wrapped in a promise that is instantly fulfilled.
*
###
Promise.wrap = (arg)->
  if (arg instanceof Promise) then arg else Promise.fulfilled arg

###
* Create a promise that is instantly fulfilled. Useful for wrapping values to
* be sent into promise-based code.
###
Promise.fulfilled = (value) ->
  new Promise(
    (fulfill)-> fulfill value
  )

###
*
* Join several promises together, pass
* as many promises as you like in as arguments.
* @return A new promise that will be fulfilled when
*         all joined promises are fulfilled.
*
###
Promise.join = ()->
  joined = _.toArray(arguments)
  if joined.length is 1
    return joined[0]

  new Promise((fulfill, fail) ->
      waitForNextPromise = (promises) ->
        return fulfill results if promises.length == 0
        promises.shift().addFulfilledHandler(
          (result) ->
            results.push result
            waitForNextPromise promises
        )
      results = []
      promise.addFailedHandler fail for promise in joined
      waitForNextPromise joined
  )


module.exports = Promise
