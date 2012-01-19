Promise = require './neo4j/Promise'
Http = require 'http'
Url = require 'url'
_ = require 'underscore'

class Web
  get:(url, data, success, failure)->     ## TODO this api is used incorrect by (url, success, failure)
    @ajax("GET", url, data, success, failure)

  post:(url, data, success, failure)->
    @ajax("POST", url, data, success, failure)

  put:(url, data, success, failure)->
    @ajax("PUT", url, data, success, failure)

  del:(url, data, success, failure)->
    @ajax("DELETE", url, data, success, failure)

  replace :(url, replaceMap) ->
    url = url.replace "{" + key + "}", replaceMap[key] for key of replaceMap
    url

  constructor: (provider,events)->
    @events = events
    console.log "create WEB"
    auth_cache = {}
    requestNumber = 0

    addCache = (k, v)-> auth_cache[k] = v
    inCache = (k)-> auth_cache[k]


    @ajax = ()->
      # <!-- TODO use @ajax = (method, url, data, userSuccess, userFailure)->
      args = _.toArray(arguments)
      method = args.shift()
      url = args.shift()

      data = if args.length > 0 && !_.isFunction(args[0]) then args.shift() else undefined

      userSuccess = if args.length > 0 then args.shift() else undefined
      userFailure = if args.length > 0 then args.shift() else undefined
      # --> ends

      requestNumber += 1
      logPrefix = requestNumber + " " + method + " " + url

      new Promise(
        (fulfill, fail) ->
          failure = ->
            console.log logPrefix + " FAILED (" + arguments[0] + ")"
            fail.call this, {error:arguments[0], args:arguments}
            userFailure.apply this, arguments if userFailure
            events.trigger "web.connection_lost", _.toArray(arguments)
            # For backwards compatibility
            events.trigger "web.connection.failed", _.toArray(arguments)


          success = ->
            fulfill.call this, {data:arguments[0], args:arguments}
            userSuccess.apply this, arguments if userSuccess

          try
            # console.log logPrefix + if data then " >" + JSON.stringify(data) else " > (no-data)"

            if method == 'GET' && data
              params = []
              params.push key + "=" + encodeURI data[key] for key of data
              url += "?" + params.join "&"

            parsedUrl = Url.parse url
            opts = host:parsedUrl.hostname, port:parsedUrl.port, path:parsedUrl.path, method:method, headers:'Content-Type':'Application/json'

            if parsedUrl.auth
              auth = new Buffer(parsedUrl.auth, "ascii").toString("base64")
              addCache parsedUrl.hostname, auth
              opts.headers.Authorization = "Basic " + auth
            else if inCache parsedUrl.hostname
              opts.headers.Authorization = "Basic " + inCache parsedUrl.hostname


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
                catch e
                  failure e

            request.on 'error', failure

            request.write JSON.stringify data if data

            request.end()

          catch e
            failure e
      )

module.exports = Web
