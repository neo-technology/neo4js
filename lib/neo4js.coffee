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

require "coffee-script"

module.exports.cypher = require "./neo4j/_cypher"
module.exports.exceptions = require "./neo4j/_exceptions"
module.exports.index = require "./neo4j/_index"
module.exports.models = require "./neo4j/_models"
module.exports.services = require "./neo4j/_services"
module.exports.cachedFunction = require "./neo4j/cachedFunction"
Events = module.exports.Events = require "./neo4j/Events"
GraphDatabase = module.exports.GraphDatabase = require "./neo4j/GraphDatabase"
module.exports.GraphDatabaseHeartbeat = require "./neo4j/GraphDatabaseHeartbeat"
module.exports.GraphDatabaseManager = require "./neo4j/GraphDatabaseManager"
WebNodeProvider = module.exports.WebNodeProvider = require "./neo4j/WebNodeProvider"
module.exports.WebMockProvider = require "./neo4j/WebMockProvider"
module.exports.log = require "./neo4j/log"
module.exports.Promise = require "./neo4j/Promise"
module.exports.proxy = require "./neo4j/proxy"
module.exports.Service = require "./neo4j/Service"
module.exports.setInterval = require "./neo4j/setInterval"
Web = module.exports.Web = require "./neo4j/Web"
module.exports.traverse = require "./neo4j/models/Traverse"
module.exports.NodeJsGraphDatabase = (url) ->
  events = new Events()
  provider = new WebNodeProvider()
  webClient = new Web(provider, events)
  graph = new GraphDatabase(url, webClient)
  graph.stopHeartbeat()
  graph
