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
        models:{}
    };
/**
 * Contains methods shared by nodes and relationships.
 */
neo4j.models.PropertyContainer = function () {
    _.bindAll(this, 'getSelf', 'exists', 'getProperty', 'setProperty', 'getProperties', 'setProperties');
    this._data = this._data || {};

};

_.extend(neo4j.models.PropertyContainer.prototype, {
    /**
     * Get the identifier (url) for this object. Will return null if
     * the object is not yet saved.
     */
    getSelf:function () {
        return typeof(this._self) != "undefined" ? this._self : null;
    },

    /**
     * Get the numeric id for this object. Returns null if
     * the object is not yet saved.
     */
    getId:function () {
        var url = this.getSelf();
        return url == null ? null : url.substr(url.lastIndexOf("/") + 1);
    },

    /**
     * @return true if this object has a url.
     */
    exists:function () {
        return this.getSelf() !== null;
    },

    /**
     * Check if a property exists.
     */
    hasProperty:function (key) {
        return key in this._data;
    },

    /**
     * Get a property by key.
     */
    getProperty:function (key) {
        return this._data[key] || null;
    },

    /**
     * Set a property.
     */
    setProperty:function (key, value) {
        this._data[key] = value;
    },

    /**
     * Get all properties.
     * @return Map of all properties
     */
    getProperties:function () {
        return this._data;
    },

    /**
     * Set several properties at once.
     */
    setProperties:function (properties) {
        this._data = _.extend(this._data, properties);
    },

    /**
     * Remove a property.
     */
    removeProperty:function (key) {
        delete(this._data[key]);
    }

});
module.exports = neo4j.models.PropertyContainer;
