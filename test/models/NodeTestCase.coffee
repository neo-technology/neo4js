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
mock = require("../../lib/neo4j/WebMockProvider")
neo4j = require("../../lib/neo4js")

exports.tearDown = (callback)->
  mock.stop()
  callback()

exports.testFailsWhenGivenNonNodeUrl = (test) ->
  test.expect 2
  nonNodeUrl = "asd123"
  result = {}
  mock.clear()
  mock.webmock "GET", nonNodeUrl,
    management:""
    data:""

  node = new neo4j.models.Node { self:nonNodeUrl }, mock.mockedGraphDatabase()
  node.fetch().then(null, (fail) ->
      result.error = fail
  )

  test.ok typeof (result.error) isnt "undefined", "Error should have been triggered"
  test.ok result.error instanceof neo4j.exceptions.InvalidDataException, "Error should be InvalidDataException."
  test.done()

exports.testTraverseForNodes = (test) ->
  test.expect 2
  rootTraversalUrl = "http://localhost:7474/db/data/node/0/traverse/node"
  result = {}
  mock.clear()
  mock.webmock "POST", rootTraversalUrl, [
    outgoing_relationships:"http://localhost:7474/db/data/node/0/relationships/out"
    data:{}
    traverse:"http://localhost:7474/db/data/node/0/traverse/{returnType}"
    all_typed_relationships:"http://localhost:7474/db/data/node/0/relationships/all/{-list|&|types}"
    property:"http://localhost:7474/db/data/node/0/properties/{key}"
    self:"http://localhost:7474/db/data/node/0"
    properties:"http://localhost:7474/db/data/node/0/properties"
    outgoing_typed_relationships:"http://localhost:7474/db/data/node/0/relationships/out/{-list|&|types}"
    incoming_relationships:"http://localhost:7474/db/data/node/0/relationships/in"
    extensions:{}
    create_relationship:"http://localhost:7474/db/data/node/0/relationships"
    all_relationships:"http://localhost:7474/db/data/node/0/relationships/all"
    incoming_typed_relationships:"http://localhost:7474/db/data/node/0/relationships/in/{-list|&|types}"
  ]
  db = mock.mockedGraphDatabase()
  db.getReferenceNode().then((node) ->
      node.traverse({}).then((nodes) ->
          result.nodes = nodes
      )
  )

  test.ok typeof (result.nodes) isnt "undefined", "Should have gotten a response"
  test.ok result.nodes[0] instanceof neo4j.models.Node, "Response type should be node"
  test.done()


exports.testTraverseForRelationships = (test) ->
  test.expect 2
  rootTraversalUrl = "http://localhost:7474/db/data/node/0/traverse/relationship"
  result = {}
  mock.clear()
  mock.webmock "POST", rootTraversalUrl, [
    start:"http://localhost:7474/db/data/node/0"
    data:{}
    self:"http://localhost:7474/db/data/relationship/1"
    property:"http://localhost:7474/db/data/relationship/1/properties/{key}"
    properties:"http://localhost:7474/db/data/relationship/1/properties"
    type:"KNOWS"
    extensions:{}
    end:"http://localhost:7474/db/data/node/1"
  ]
  db = mock.mockedGraphDatabase()
  db.getReferenceNode().then((node) ->
      node.traverse({}, neo4j.traverse.RETURN_RELATIONSHIPS).then((rels) ->
          result.rels = rels
      )
  )

  test.ok typeof (result.rels) isnt "undefined", "Should have gotten a response"
  test.ok result.rels[0] instanceof neo4j.models.Relationship, "Response type should be node"
  test.done()

exports.testTraverseForPath = (test) ->
  test.expect 2
  rootTraversalUrl = "http://localhost:7474/db/data/node/0/traverse/path"
  result = {}
  mock.clear()
  mock.webmock "POST", rootTraversalUrl, [
    start:"http://localhost:7474/db/data/node/0"
    nodes:[ "http://localhost:7474/db/data/node/0", "http://localhost:7474/db/data/node/1" ]
    length:1
    relationships:[ "http://localhost:7474/db/data/relationship/1" ]
    end:"http://localhost:7474/db/data/node/1"
  ]
  db = mock.mockedGraphDatabase()
  db.getReferenceNode().then((node) ->
      node.traverse({}, neo4j.traverse.RETURN_PATHS).then((paths) ->
          result.paths = paths
      )
  )

  test.ok typeof (result.paths) isnt "undefined", "Should have gotten a response"
  test.ok result.paths[0] instanceof neo4j.models.Path, "Response type should be node"
  test.done()
