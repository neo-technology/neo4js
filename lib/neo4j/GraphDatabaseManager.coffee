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


log = require("./log")
proxy = require("./proxy")
Promise = require("./Promise")
services = require("./_services")


# * Manage a neo4j REST server with management enabled.
# *
# * @class
# * @param url
# *            the url to the REST management server
# * @returns a new GraphDatabaseManager instance


module.exports = class GraphDatabaseManager
  constructor: (@db) ->
    @backup = new services.BackupService(db)
    @config = new services.ConfigService(db)
    @importing = new services.ImportService(db)
    @exporting = new services.ExportService(db)
    @console = new services.ConsoleService(db)
    @jmx = new services.JmxService(db)
    @lifecycle = new services.LifecycleService(db)
    @monitor = new services.MonitorService(db)

    self = this
    @db.getServiceDefinition().then ->
      self.discoverServices()

  # * Check if services have been loaded. You can also listen for the
  # * services.loaded event.
  # *
  # * @returns {Boolean} true if services are loaded.
  servicesLoaded: ->
    (if (@services) then true else false)

  # * Get a list of available services.
  # *
  # * @throws Error
  # *             if services have not been loaded yet (use {@link #servicesLoaded}
  # *             or the services.loaded event to check).
  availableServices: ->
    if @services
      unless @serviceNames
        @serviceNames = []
        for name of @services
          @serviceNames.push name
      @serviceNames
    else
      throw new Error("Service definition has not been loaded yet.")

  #          * Connect to the server and find out what services are available.
  discoverServices: ->
    manage = this
    myfulfil = undefined
    myfail = undefined

    promise = new Promise (fulfill, fail) ->
      myfulfil = fulfill
      myfail = fail


    @db.getDiscoveryDocument().then (discovery) ->
      manage.db.web.get discovery.management,
        ## success
        proxy(
          (serviceDefinition) ->
            @services = serviceDefinition.services
            for service of serviceDefinition.services
              this[service].makeAvailable serviceDefinition.services[service]  if this[service]
            @db.trigger "services.loaded"
            myfulfil serviceDefinition
          manage
        ),
        ## failure
        proxy(
          (fail) ->
            log "Unable to fetch service descriptions for server " + @url + ". Server management will be unavailable."
            myfail fail
          this
        )
    return promise

