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
        setInterval:require("./setInterval").setInterval,
        clearInterval:require("./setInterval").clearInterval,
        proxy:require("./proxy")
    };
/**
 * Allows "taking the pulse" on a graph database, calling registered listeners
 * at regular intervals with monitoring data.
 */
neo4j.GraphDatabaseHeartbeat = function (db) {

    this.db = db;

    /**
     * Quick access to the databases monitor service.
     */
    this.monitor = db.manage.monitor;

    this.listeners = {};
    this.idCounter = 0;
    this.listenerCounter = 0;

    /**
     * These correspond to the granularities available on the server side.
     */
    this.timespan = {
        year:60 * 60 * 24 * 365,
        month:60 * 60 * 24 * 31,
        week:60 * 60 * 24 * 7,
        day:60 * 60 * 24,
        hours:60 * 60 * 6,
        minutes:60 * 35
    };

    /**
     * This is where the monitoring data begins.
     */
    this.startTimestamp = Math.round((new Date()).getTime() / 1000) - this.timespan.year;

    /**
     * This is where the monitoring data ends.
     */
    this.endTimestamp = this.startTimestamp + 1;

    /**
     * List of timestamps, indexes correspond to indexes in data arrays. The is
     * appended as more data is fetched.
     */
    this.timestamps = [];

    /**
     * Sets of data arrays fetched from the server. These are appended to as
     * more data is fetched.
     */
    this.data = {};

    /**
     * Set to true while the server is being polled, used to make sure only one
     * poll is triggered at any given moment.
     */
    this.isPolling = false;

    // Bind these tightly to this object
    this.processMonitorData = neo4j.proxy(this.processMonitorData, this);
    this.beat = neo4j.proxy(this.beat, this);
    this.waitForPulse = neo4j.proxy(this.waitForPulse, this);

    // Start a pulse
    this.interval = neo4j.setInterval(this.beat, 2000);
};

/**
 * Stop Pulse
 */
neo4j.GraphDatabaseHeartbeat.prototype.stop = function () {
    neo4j.clearInterval(this.interval);
};

/**
 * Register a method to be called at regular intervals with monitor data.
 */
neo4j.GraphDatabaseHeartbeat.prototype.addListener = function (listener) {

    this.listenerCounter++;
    this.listeners[this.idCounter++] = listener;

    return this.idCounter;

};

/**
 * Remove a listener.
 *
 * @param listener
 *            {Integer, Function} either the id returned by {@link #addListener}
 *            or the listener method itself.
 */
neo4j.GraphDatabaseHeartbeat.prototype.removeListener = function (listener) {

    var listenerWasRemoved = false;
    if (typeof (listener) === "function") {
        for (var key in this.listeners) {
            if (this.listeners[key] === listener) {
                delete this.listeners[key];
                listenerWasRemoved;
                break;
            }
        }
    } else {
        if (this.listeners[listener]) {
            delete this.listeners[listener];
            listenerWasRemoved = true;
        }
    }

    if (listenerWasRemoved) {
        this.listenerCounter--;
    }

};

/**
 * Get heartbeat saved data.
 */
neo4j.GraphDatabaseHeartbeat.prototype.getCachedData = function () {
    return {
        timestamps:this.timestamps,
        data:this.data,
        endTimestamp:this.endTimestamp,
        startTimestamp:this.startTimestamp
    };
};

/**
 * Trigger a heart beat.
 */
neo4j.GraphDatabaseHeartbeat.prototype.beat = function () {
    if (this.listenerCounter > 0 && !this.isPolling && this.monitor.available) {
        this.isPolling = true;
        this.monitor.getDataFrom(this.endTimestamp, this.processMonitorData);
    }
};

/**
 * Process monitor data, send any new data out to listeners.
 */
neo4j.GraphDatabaseHeartbeat.prototype.processMonitorData = function (data) {
    this.isPolling = false;

    if (data && !data.error) {

        var boundaries = this.findDataBoundaries(data);

        // If there is new data
        if (boundaries.dataEnd >= 0) {
            this.endTimestamp = data.timestamps[boundaries.dataEnd];

            // Append the new timestamps
            var newTimestamps = data.timestamps.splice(boundaries.dataStart,
                boundaries.dataEnd - boundaries.dataStart);
            this.timestamps = this.timestamps.concat(newTimestamps);

            // Append the new data
            var newData = {};
            for (var key in data.data) {
                newData[key] = data.data[key].splice(boundaries.dataStart,
                    boundaries.dataEnd - boundaries.dataStart);

                if (typeof (this.data[key]) === "undefined") {
                    this.data[key] = [];
                }

                this.data[key] = this.data[key].concat(newData[key]);
            }

            // Update listeners
            var listenerData = {
                server:this.server,
                newData:{
                    data:newData,
                    timestamps:newTimestamps,
                    end_time:this.endTimestamp,
                    start_time:data.start_time
                },
                allData:this.getCachedData()
            };

            this.callListeners(listenerData);

        } else {
            // No new data
            this.adjustRequestedTimespan();
        }
    }
};

/**
 * Used to wait for an offline server to come online.
 *
 * @param callback
 *            {function} Function that will be called when the server is online.
 */
neo4j.GraphDatabaseHeartbeat.prototype.waitForPulse = function (callback) {

    if (!this.pulsePromise) {
        var heartbeat = this,
            getMethod = this.db.get;
        this.pulsePromise = new neo4j.Promise(function (fulfill) {
            var args = { interval:null };

            args.interval = neo4j.setInterval(function () {
                getMethod("", function (data) {
                    if (data !== null) {
                        neo4j.clearInterval(args.interval);
                        heartbeat.pulsePromise = null;
                        fulfill(true);
                    }
                });
            }, 4000);
        });
    }

    this.pulsePromise.addFulfilledHandler(callback);

    return this.pulsePromise;

};

/**
 * This is used to offset a problem with monitor data granularity. This should
 * be the servers concern, but that is not yet implemented.
 *
 * The monitor data has a concept of granularity - if you ask for a wide enough
 * timespan, you won't get any data back. This is because the data available is
 * to "fine grained" to be visible in your wide time span (e.g. there is data
 * for the last hour, but you asked for data from a full year, the data from
 * a single hour is not considered reliable when looking at such a large time
 * span).
 *
 * This creates a problem since there might be data for a full year, and we'd
 * like to show that. So what we do is, we ask for a year. If we get an empty
 * result, this method will make the timespan we ask for smaller and smaller,
 * until we get start getting data back from the server.
 *
 * @return {object} An object with a dataStart and a dataEnd key.
 */
neo4j.GraphDatabaseHeartbeat.prototype.adjustRequestedTimespan = function (data) {
    var now = Math.round((new Date()).getTime() / 1000);
    var timespan = now - this.endTimestamp;

    if (timespan >= this.timespan.year) {
        this.endTimestamp = now - this.timespan.month;
        this.beat();
    } else if (timespan >= this.timespan.month) {
        this.endTimestamp = now - this.timespan.week;
        this.beat();
    } else if (timespan >= this.timespan.week) {
        this.endTimestamp = now - this.timespan.day;
        this.beat();
    } else if (timespan >= this.timespan.day) {
        this.endTimestamp = now - this.timespan.hours;
        this.beat();
    } else if (timespan >= this.timespan.day) {
        this.endTimestamp = now - this.timespan.minutes;
        this.beat();
    }
};

/**
 * Find the first and last index that contains a number in a given array. This
 * is used because the monitor service returns "pads" its result with NaN data
 * if it is asked for data it does not have.
 *
 * @param data
 *            {object} Should be the data object returned by the monitor
 *            services methods.
 * @return {object} An object with a dataStart and a dataEnd key.
 */
neo4j.GraphDatabaseHeartbeat.prototype.findDataBoundaries = function (data) {

    var firstKey = this.getFirstKey(data);

    var lastIndexWithData = -1, firstIndexWithData = -1;

    if (firstKey) {

        // Find the last timestamp that has any data associated with it
        for (lastIndexWithData = data.timestamps.length - 1; lastIndexWithData >= 0; lastIndexWithData--) {
            if (typeof (data.data[firstKey][lastIndexWithData]) === "number") {
                break;
            }
        }

        // Find the first timestamp that has any data associated with it
        for (firstIndexWithData = 0; firstIndexWithData <= lastIndexWithData; firstIndexWithData++) {
            if (typeof (data.data[firstKey][firstIndexWithData]) === "number") {
                break;
            }
        }
    }

    return {
        dataStart:firstIndexWithData,
        dataEnd:lastIndexWithData
    };

};

/**
 * Call all listeners with some data.
 */
neo4j.GraphDatabaseHeartbeat.prototype.callListeners = function (data) {
    for (var i in this.listeners) {
        setTimeout(function (listener) {
            return function () {
                listener(data);
            }
        }(this.listeners[i]), 0);
    }
};

/**
 * Return the first key encountered in some object, or null if none is
 * available.
 */
neo4j.GraphDatabaseHeartbeat.prototype.getFirstKey = function (object) {
    if (typeof (object) === "object") {
        for (var key in object.data) {
            break;
        }
    }

    return key ? key : null;
};

module.exports = neo4j.GraphDatabaseHeartbeat;
