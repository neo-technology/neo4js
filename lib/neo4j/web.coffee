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


Promise = require './Promise'
ConnectionLostException = require './exceptions/ConnectionLostException'
_ = require 'underscore'

class Web
  get: (url, data, success, failure)->     ## TODO this api is used incorrect by (url, success, failure)
    @ajax("GET", url, data, success, failure)

  post: (url, data, success, failure)->
    @ajax("POST", url, data, success, failure)

  put: (url, data, success, failure)->
    @ajax("PUT", url, data, success, failure)

  del: (url, data, success, failure)->
    @ajax("DELETE", url, data, success, failure)

  replace: (url, replaceMap) ->
    url = url.replace "{" + key + "}", replaceMap[key] for key of replaceMap
    url

  constructor: (@provider, @events)->

  ajax: ()->
    args = @_processAjaxArguments(arguments)
    userFail = @wrapFailureCallback(args.failure)
    userSuccess = args.success

    provider = @provider
    new Promise((fulfill, fail) ->
        args.failure = ->
          fail.call this,
            error: arguments[0]
            args: arguments

          userFail.apply this, arguments

        args.success = ->
          fulfill.call this,
            data: arguments[0]
            args: arguments

          userSuccess.apply this, arguments

        try
          provider.ajax args
        catch e
          args.failure e
    )

  _processAjaxArguments: (args) ->
    args = _.toArray(args)

    method = args.shift()
    url = args.shift()

    data = undefined
    data = args.shift() if args.length > 0 && typeof(args[0]) != 'function'

    success = ()->
    success = args.shift() if args.length > 0 && typeof(args[0]) == 'function'

    failure = ()->
    failure = args.shift() if args.length > 0 && typeof(args[0]) == 'function'

    { method: method, url: url, data: data, success: success, failure: failure }

  wrapFailureCallback: (cb) ->
    events = @events
    (ex) ->
      if typeof (ex) isnt "undefined" and ex instanceof ConnectionLostException
        events.trigger "web.connection_lost", _.toArray(arguments)
        events.trigger "web.connection.failed", _.toArray(arguments)
      cb.apply this, arguments

module.exports = Web
