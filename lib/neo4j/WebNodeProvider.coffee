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
Http = require 'http'
Url = require 'url'
_ = require 'underscore'

module.exports = class WebNodeProvider
  constructor: ->
    @auth_cache = {}
    @requestNumber = 0

  addAuthHeader: (k, v)-> @auth_cache[k] = v
  getAuthHeader: (k)-> @auth_cache[k]

  ajax: (args)->
    failure = args.failure
    success = args.success
    data = args.data
    method = args.method
    url = args.url
    try
      console.log method + " " + url + " " + if data then " >" + JSON.stringify(data) else ""

      if method == 'GET' && data
        params = []
        params.push key + "=" + encodeURI data[key] for key of data
        url += "?" + params.join "&"

      parsedUrl = Url.parse url
      opts = host: parsedUrl.hostname, port: parsedUrl.port, path: parsedUrl.path, method: method, headers: 'Content-Type': 'Application/json'

      if parsedUrl.auth
        auth = new Buffer(parsedUrl.auth, "ascii").toString("base64")
        @addAuthHeader parsedUrl.hostname, auth
        opts.headers.Authorization = "Basic " + auth
      else if authHeader = @getAuthHeader parsedUrl.hostname
        opts.headers.Authorization = "Basic " + authHeader

      request = Http.request opts, (response) ->
        response.setEncoding('utf8')
        data = ''
        response.on 'data', (chunk)-> data = data + chunk

        response.on 'end', ->
          try
          # console.log logPrefix + " < " + data.replace /[\n\t ]+/g, " "
          # if (method == 'GET')
            data = JSON.parse data if (data != "")

            success data, response.statusCode
          ## todo throw exception
          catch e
            console.log e.stack

            failure e

      request.on 'error', (e)->
        console.log e
        failure e

      request.write JSON.stringify data if data

      request.end()

    catch e
      failure e

