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

var _ = require('underscore'),
    neo4j = {

        /**
         * This checks if there is there is a setTimeout method available. If not,
         * this will trigger the method directly if timeout is 0, or throw
         * an exception if timeout is greater than that.
         */
        setTimeout:function (expression, timeout) {
            if (typeof(setTimeout) != "undefined") {
                return setTimeout(expression, timeout);
            } else if (timeout === 0) {
                expression();
            } else {
                neo4j.log("No timeout implementation found, unable to do timed tasks.");
            }
        },

        clearTimeout:function (timeoutId) {
            if (typeof(clearTimeout) != "undefined") {
                clearTimeout(intervalId);
            } else {
                neo4j.log("No timeout implementation found, unable to do timed tasks.");
            }
        },

        _intervals:{}
    };

module.exports = neo4j;
