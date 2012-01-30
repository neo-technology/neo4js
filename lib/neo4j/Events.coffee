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
setTimeout = require("./setTimeout").setTimeout
log = require("./log")

###
A simple event-handling system.

@class
@param context {object} (optional) context data to be included with event objects
###
module.exports = class Events
  constructor: (context) ->
    @uniqueNamespaceCount = 0
    @handlers = {}
    @context = context or {}

  ###
  Naive implementation to quickly get anonymous event namespaces.
  ###
  createUniqueNamespace: ->
    "uniq#" + (@uniqueNamespaceCount++)

  ###
  Bind an event listener to an event.
  ###
  bind: (key, callback) ->
    @handlers[key] ?= []
    @handlers[key].push callback

  ###
  Trigger an event.
  ###
  trigger: (key, data) ->
    if @handlers[key]?
      data = data or {}
      eventHandlers = @handlers[key]
      event = _.extend({ key: key, data: data}, @context)

      for handler in eventHandlers
      # TODO maybe proxy this callback??
        setTimeout(
          ->
            try
              handler event
            catch e
              log "Event handler for event " + key + " threw exception.", e
          0
        )
