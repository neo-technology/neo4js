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

Promise = require("../lib/neo4j/Promise")

###
Test that eventually fulfulling a promise allows hooking handlers
to it, and that the handlers recieve the result as expected.
###
exports.testEventuallyFulfillingPromise = (test) ->
  test.expect 2
  ctx = {}
  expected = 123

  promise = new Promise((fulfill) -> ctx.fulfill = fulfill)
  promise.then(
    (pResult) ->
      ctx.pResult = pResult
    ->
      ctx.failCall = true
  )

  # Fulfill promise
  ctx.fulfill expected

  test.equal ctx.pResult, expected, "Result should have been propagated and set by our callback method."
  test.equal ctx.failCall, undefined, "Failure callback should not have been called."
  test.done()


###
Test that eventually breaking a promise allows hooking handlers
to it, and that the handlers recieve the result as expected.
###
exports.testEventuallyFailingPromise = (test) ->
  test.expect 2
  ctx = {}
  expected = 123

  promise = new Promise((fulfill, fail) -> ctx.fail = fail)
  promise.then(
    (pResult) ->
      ctx.fulfillCall = true
    (pResult) ->
      ctx.pResult = pResult
  )

  # Fulfill promise
  ctx.fail expected

  test.equal ctx.pResult, expected, "Result should have been propagated and set by our callback method."
  test.equal ctx.fulfillCall, undefined, "Fulfill callback should not have been called."
  test.done()


###
Test that fulfulling a promise immediately still allows hooking handlers
to it, and that the handlers recieve the result as expected.
###
exports.testDirectlyFulfillingPromise = (test) ->
  test.expect 2
  result = {}
  expected = 123

  promise = new Promise((fulfill) -> fulfill expected)
  promise.then(
    (pResult) ->
      result.pResult = pResult
    ->
      result.failCall = true
  )

  test.equal result.pResult, expected, "Result should have been propagated and set by our callback method."
  test.equal result.failCall, undefined, "Failure callback should not have been called."
  test.done()


###
Test that breaking a promise immediately still allows hooking handlers
to it, and that the handlers recieve the result as expected.
###
exports.testDirectlyFailingPromise = (test) ->
  test.expect 2
  result = {}
  expected = 123
  promise = new Promise((fulfill, fail) -> fail expected)

  promise.then(
    (pResult) ->
      result.fulfillCall = true
    (pResult) ->
      result.pResult = pResult
  )

  test.equal result.pResult, expected, "Failed result should have been propagated and set by our callback method."
  test.equal result.fulfillCall, undefined, "Fulfill callback should not have been called."
  test.done()


###
Test wrapping a value in a promise.
###
exports.testPromiseWrapping = (test) ->
  test.expect 2
  value = 12
  promiseValue = new Promise()
  wrappedValue = Promise.wrap(value)
  wrappedPromiseValue = Promise.wrap(promiseValue)

  test.ok wrappedValue instanceof Promise, "Wrapping a raw value should return a promise."
  test.equal wrappedPromiseValue, promiseValue, "Wrapping promises should return the original promise."
  test.done()


###
Test fulfilling a promise with a result == false. (Regression test.)
###
exports.testFulfillWithFalseResult = (test) ->
  test.expect 1
  results = {}
  promise = new Promise((fulfill) -> fulfill false)
  promise.then((result) ->
      results.result = result
  )
  test.equal results.result, false, "The result should be exactly equal to false."
  test.done()


###
Test joining several promises into one.
###
exports.testJoinPromises = (test) ->
  test.expect 2
  firstPromise = Promise.fulfilled(12)
  secondPromise = Promise.fulfilled(13)
  results = {}
  joined = Promise.join(firstPromise, secondPromise)
  joined.then((result, fulfill, fail) ->
      results.result = result
  )
  test.ok joined instanceof Promise, "Joining promises should return a new promise."
  test.deepEqual results.result, [12, 13], "The result argument should be an array."
  test.done()

###
Test joining several promises into one, while one is failing
###
exports.testJoinFailedPromises = (test) ->
  test.expect 3
  expected = 123
  firstPromise = Promise.fulfilled(12)
  secondPromise = new Promise((fulfill, fail)-> fail expected)
  results = {}
  joined = Promise.join(firstPromise, secondPromise)
  joined.then(
    (result, fulfill, fail) ->
      results.fulfillCall = true
    (failed) ->
      results.pResult = expected
  )
  test.ok joined instanceof Promise, "Joining promises should return a new promise."
  test.equal results.fulfillCall, undefined, "Fulfill callback should not have been called."
  test.equal results.pResult, expected, "Failed result should have been propagated and set by our callback method."
  test.done()



