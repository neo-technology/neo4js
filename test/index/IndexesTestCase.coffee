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

exports.testCanCreateNodeIndex = (test) ->
  test.expect 3
  mock.clear()
  indexName = "my_nodes"
  result = {}
  mock.webmock "POST", "http://localhost:7474/db/data/index/node", (req) ->
    result.called = true
    req.success {}

  db = mock.mockedGraphDatabase()
  indexes = new neo4j.index.Indexes(db)
  indexes.createNodeIndex(indexName).then((index) ->
      result.index = index
  )

  test.ok result.called, "Server should have been called."
  test.ok typeof (result.index) isnt "undefined", "Should have gotten an index back"
  test.ok result.index instanceof neo4j.index.NodeIndex, "Should result in a node index"
  test.done()

exports.testCanCreateRelationshipIndex = (test) ->
  test.expect 3
  mock.clear()
  indexName = "my_rels"
  result = {}
  mock.webmock "POST", "http://localhost:7474/db/data/index/relationship", (req) ->
    result.called = true
    req.success {}

  db = mock.mockedGraphDatabase()
  indexes = new neo4j.index.Indexes(db)
  indexes.createRelationshipIndex(indexName).then((index) ->
      result.index = index
  )

  test.ok result.called, "Server should have been called."
  test.ok typeof (result.index) isnt "undefined", "Should have gotten an index back"
  test.ok result.index instanceof neo4j.index.RelationshipIndex, "Should result in a relationship index"
  test.done()

exports.testCanListNodeIndexes = (test) ->
  test.expect 5
  base = "http://localhost:7474/db/data/index/node"
  result = {}
  mock.clear()
  mock.webmock "GET", base, (req) ->
    result.serverCalled = true
    req.success
        my_nodes:template:base + "/my_nodes/{key}/{value}", provider:"lucene", type:"exact"
        more_nodes:template:base + "/more_nodes/{key}/{value}", provider:"lucene", type:"fulltext"

  db = mock.mockedGraphDatabase()
  indexes = new neo4j.index.Indexes(db)
  indexes.getAllNodeIndexes().then((nodeIndexes) ->
      result.nodeIndexes = nodeIndexes
  )

  test.ok result.serverCalled, "Server should have been called."
  test.ok typeof (result.nodeIndexes) isnt "undefined", "Should have gotten a result"
  test.ok result.nodeIndexes.length is 2, "Should result in two indexes"
  i = 0
  l = result.nodeIndexes.length

  while i < l
    test.ok result.nodeIndexes[i] instanceof neo4j.index.NodeIndex, "Each index returned should be a node index"
    i++
  test.done()

exports.testCanListRelationshipIndexes = (test) ->
  test.expect 5
  base = "http://localhost:7474/db/data/index/relationship"
  result = {}
  mock.clear()
  mock.webmock "GET", base, (req) ->
    result.serverCalled = true
    req.success
        my_nodes:template:base + "/my_nodes/{key}/{value}", provider:"lucene", type:"exact"
        more_nodes:template:base + "/more_nodes/{key}/{value}", provider:"lucene", type:"fulltext"

  db = mock.mockedGraphDatabase()
  indexes = new neo4j.index.Indexes(db)
  indexes.getAllRelationshipIndexes().then((relIndexes) ->
      result.relIndexes = relIndexes
  )

  test.ok result.serverCalled, "Server should have been called."
  test.ok typeof (result.relIndexes) isnt "undefined", "Should have gotten a result"
  test.ok result.relIndexes.length is 2, "Should result in two indexes"
  i = 0
  l = result.relIndexes.length

  while i < l
    test.ok result.relIndexes[i] instanceof neo4j.index.RelationshipIndex, "Each index returned should be a relationship index"
    i++
  test.done()

exports.testCanGetNodeIndex = (test) ->
  test.expect 2
  mock.clear()
  db = mock.mockedGraphDatabase()
  indexes = new neo4j.index.Indexes(db)
  index = indexes.getNodeIndex("someindex")
  test.ok typeof (index) isnt "undefined", "Should have gotten an index back"
  test.ok index instanceof neo4j.index.NodeIndex, "Should result in a node index"
  test.done()

exports.testCanGetRelationshipIndex = (test) ->
  test.expect 2
  mock.clear()
  db = mock.mockedGraphDatabase()
  indexes = new neo4j.index.Indexes(db)
  index = indexes.getRelationshipIndex("someindex")
  test.ok typeof (index) isnt "undefined", "Should have gotten an index back"
  test.ok index instanceof neo4j.index.RelationshipIndex, "Should result in a relationship index"
  test.done()

exports.testCanDeleteNodeIndex = (test) ->
  test.expect 2
  mock.clear()
  indexName = "my_nodes"
  result = {}
  mock.webmock "DELETE", "http://localhost:7474/db/data/index/node/" + indexName, (req) ->
    result.called = true
    req.success {}

  db = mock.mockedGraphDatabase()
  indexes = new neo4j.index.Indexes(db)
  indexes.removeNodeIndex(indexName).then((index) ->
      result.result = true
  )

  test.ok result.called, "Server should have been called."
  test.ok typeof (result.result) isnt "undefined", "Promise should have been fulfilled"
  test.done()

exports.testCanDeleteRelationshipIndex = (test) ->
  test.expect 2
  mock.clear()
  indexName = "my_nodes"
  result = {}
  mock.webmock "DELETE", "http://localhost:7474/db/data/index/relationship/" + indexName, (req) ->
    result.called = true
    req.success {}

  db = mock.mockedGraphDatabase()
  indexes = new neo4j.index.Indexes(db)
  indexes.removeRelationshipIndex(indexName).then((index) ->
      result.result = true
  )

  test.ok result.called, "Server should have been called."
  test.ok typeof (result.result) isnt "undefined", "Promise should have been fulfilled"
  test.done()
