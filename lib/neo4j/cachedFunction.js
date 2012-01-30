/*
 * Copyright (c) 2002-2012 "Neo Technology,"
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

var neo4j = {};
/**
 * Used to wrap a tiny cache around a single function. Currently only works for
 * functions that return their result via callbacks.
 *
 * This is extremely simplistic, it does not take into account using different
 * parameters and so on, it simply caches the first response the function makes,
 * and then keeps responding with that answer.
 *
 * @param func
 *            is the function to wrap
 * @param callbackArg
 *            is the position of the callback argument to the wrapped function.
 * @param timeout
 *            (optional) is the time in milliseconds before the cache becomes
 *            invalid, default is infinity (-1).
 */
neo4j.cachedFunction = function (func, callbackArg, timeout) {

    var cachedResult = null,
        cachedResultContext = null,
        isCached = false,
        timeout = timeout || false,
        waitingList = [];

    return function wrap() {
        var callback = arguments[callbackArg];

        if (isCached) {
            callback.apply(cachedResultContext, cachedResult);
        } else {

            waitingList.push(callback);

            if (waitingList.length === 1) {

                arguments[callbackArg] = function () {
                    cachedResultContext = this;
                    cachedResult = arguments;
                    isCached = true;

                    for (var i in waitingList) {
                        waitingList[i].apply(cachedResultContext, cachedResult);
                    }

                    waitingList = [];

                    if (timeout) {
                        setTimeout(function () {
                            isCached = false;
                        }, timeout);
                    }
                };

                func.apply(this, arguments);

            }

        }
    };
}

module.exports = neo4j.cachedFunction;
