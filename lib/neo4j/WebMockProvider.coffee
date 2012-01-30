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

Events = require "./Events"
Web = require "./Web"
GraphDatabase = require "./GraphDatabase"

class MockWebProvider

  constructor:->
    @definitions = {}

  mock:(method, url, mocker)->
    @definitions[method] ?= {}
    @definitions[method][url] = mocker

  ###
    Add basic service mocking to the mock definitions. Basically
    a quick way to mock the stuff you need to create a graph database
    instance that works with /db/data and /db/manage as base urls.
  ###
  clear:->
    @definitions = {}

    manage = "http://localhost:7474/db/manage/"
    data = "http://localhost:7474/db/data/"
    node0 = data + "node/0"

    @mock "GET", "http://localhost/",
      data:data
      management:manage

    @mock "GET", data,
      relationship_index:data + "index/relationship"
      relationship_types:data + "relationships/types"
      node:data + "node"
      extensions_info:data + "ext"
      node_index:data + "index/node"
      cypher:data + "cypher"
      batch:data + "batch"
      reference_node:node0
      extensions:{}

    @mock "GET", manage,
      services:console:manage + "server/console"
      jmx:manage + "server/jmx"
      monitor:manage + "server/monitor"

    @mock "GET", node0,
      outgoing_relationships:node0 + "/relationships/out"
      data:mykey:"myvalue"
      myint:"12"

      traverse:node0 + "/traverse/{returnType}"
      all_typed_relationships:node0 + "/relationships/all/{-list|&|types}"
      property:node0 + "/properties/{key}"
      self:node0 + ""
      properties:node0 + "/properties"
      outgoing_typed_relationships:node0 + "/relationships/out/{-list|&|types}"
      incoming_relationships:node0 + "/relationships/in"
      extensions:{}
      create_relationship:node0 + "/relationships"
      all_relationships:node0 + "/relationships/all"
      incoming_typed_relationships:node0 + "/relationships/in/{-list|&|types}"

  ajax:(args)->
    unless @definitions[args.method]? and (mocker = @definitions[args.method][args.url])?
      error = new Error("No such endpoint defined: " + args.method + " - " + args.url)
      console.log error.stack
      throw error

    if typeof mocker is "function"
      mocker { method:args.method, url:args.url, data:args.data, success:args.success, failure:args.failure }
    else
      args.success mocker

events = new Events()
mockWebProvider = new MockWebProvider()
mockWeb = new Web(mockWebProvider, events)
db = null

exports.webmock = (method, url, mocker)-> mockWebProvider.mock(method, url, mocker)
exports.clear = -> mockWebProvider.clear()
exports.mockedGraphDatabase = ->
  db = new GraphDatabase("http://localhost/", mockWeb) unless db
  return db

exports.events = events
exports.mockWeb = mockWeb
exports.stop = -> db.stopHeartbeat() if db
