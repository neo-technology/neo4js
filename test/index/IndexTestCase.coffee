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

exports.testCanIndexNode = (test) ->
  test.expect 6
  mock.clear()
  indexName = "my_nodes"
  result = {}
  key = "thekey"
  value = "thevalue"
  nodeId = 1
  nodeUrl = "http://localhost:7474/db/data/node/" + nodeId
  mock.webmock "POST", "http://localhost:7474/db/data/index/node/" + indexName, (req) ->
    result.called = req.data.key is key and req.data.value is value
    result.nodeUrl = req.data.uri
    req.success {}

  mock.webmock "GET", nodeUrl, (req) ->
    result.getNodeCalled = true
    req.success
        outgoing_relationships:"http://localhost:7474/db/data/node/1/relationships/out"
        data:thekey:value
        traverse:"http://localhost:7474/db/data/node/1/traverse/{returnType}"
        all_typed_relationships:"http://localhost:7474/db/data/node/1/relationships/all/{-list|&|types}"
        property:"http://localhost:7474/db/data/node/1/properties/{key}"
        self:"http://localhost:7474/db/data/node/1"
        properties:"http://localhost:7474/db/data/node/1/properties"
        outgoing_typed_relationships:"http://localhost:7474/db/data/node/1/relationships/out/{-list|&|types}"
        incoming_relationships:"http://localhost:7474/db/data/node/1/relationships/in"
        extensions:{}
        create_relationship:"http://localhost:7474/db/data/node/1/relationships"
        all_relationships:"http://localhost:7474/db/data/node/1/relationships/all"
        incoming_typed_relationships:"http://localhost:7474/db/data/node/1/relationships/in/{-list|&|types}"

  db = mock.mockedGraphDatabase()
  index = new neo4j.index.NodeIndex db, indexName
  node = new neo4j.models.Node {self:nodeUrl}, db
  index.index(node, key, value).then -> result.indexObject = true
  index.index(nodeUrl, key, value).then -> result.indexUrl = true
  index.index(nodeId, key, value).then -> result.indexId = true
  index.index(nodeId, key).then -> result.indexIdFetchValue = true

  test.ok result.called, "Server should have been called."
  test.equal nodeUrl, result.nodeUrl, "Server should have been given correct node url"
  test.ok result.indexObject, "Should have indexed a node instance"
  test.ok result.indexUrl, "Should have indexed a node url"
  test.ok result.indexId, "Should have indexed a node id"
  test.ok result.indexIdFetchValue, "Should have indexed a node id, even when having to fetch the remote value"
  test.done()

exports.testCanIndexRelationship = (test) ->
  test.expect 6
  mock.clear()
  indexName = "my_nodes"
  result = {}
  key = "thekey"
  value = "thevalue"
  relId = 1
  relUrl = "http://localhost:7474/db/data/relationship/" + relId
  mock.webmock "POST", "http://localhost:7474/db/data/index/relationship/" + indexName, (req) ->
    result.called = req.data.key is key and req.data.value is value
    result.relUrl = req.data.uri
    req.success {}

  mock.webmock "GET", relUrl,
    start:"http://localhost:7474/db/data/node/0"
    data:thekey:value

    self:"http://localhost:7474/db/data/relationship/1"
    property:"http://localhost:7474/db/data/relationship/1/properties/{key}"
    properties:"http://localhost:7474/db/data/relationship/1/properties"
    type:"KNOWS"
    extensions:{}
    end:"http://localhost:7474/db/data/node/1"

  db = mock.mockedGraphDatabase()
  index = new neo4j.index.RelationshipIndex db, indexName
  rel = new neo4j.models.Relationship { self:relUrl }, db
  index.index(rel, key, value).then -> result.indexObject = true
  index.index(relUrl, key, value).then -> result.indexUrl = true
  index.index(relId, key, value).then -> result.indexId = true
  index.index(relId, key).then -> result.indexIdFetchValue = true

  test.ok result.called, "Server should have been called."
  test.ok result.relUrl is relUrl, "Server should have been called with correct item url."
  test.ok result.indexObject, "Should have indexed a relationship instance"
  test.ok result.indexUrl, "Should have indexed a relationship url"
  test.ok result.indexId, "Should have indexed a relationship id"
  test.ok result.indexIdFetchValue, "Should have indexed a relationship id, even when having to fetch the remote value"
  test.done()

exports.testCanUnindexRelationship = (test) ->
  test.expect 2
  mock.clear()
  indexName = "my_nodes"
  result = {}
  key = "thekey"
  value = "thevalue"
  relId = 1
  relUrl = "http://localhost:7474/db/data/relationship/" + relId
  mock.webmock "DELETE", "http://localhost:7474/db/data/index/relationship/" + indexName + "/" + key + "/" + value + "/" + relId, (req) ->
    result.fullpathCalled = true
    req.success {}

  db = mock.mockedGraphDatabase()
  index = new neo4j.index.RelationshipIndex db, indexName
  rel = new neo4j.models.Relationship { self:relUrl}, db
  index.unindex(rel, key, value).then -> result.unindexObject = true

  test.ok result.fullpathCalled, "Server should have been called."
  test.ok result.unindexObject, "Should have unindexed a relationship instance"
  test.done()

exports.testCanUnindexNode = (test) ->
  test.expect 2
  mock.clear()
  indexName = "my_nodes"
  result = {}
  key = "thekey"
  value = "thevalue"
  nodeId = 1
  nodeUrl = "http://localhost:7474/db/data/node/" + nodeId
  mock.webmock "DELETE", "http://localhost:7474/db/data/index/node/" + indexName + "/" + key + "/" + value + "/" + nodeId, (req) ->
    result.fullpathCalled = true
    req.success {}

  db = mock.mockedGraphDatabase()
  index = new neo4j.index.NodeIndex db, indexName
  node = new neo4j.models.Node {self:nodeUrl}, db
  index.unindex(node, key, value).then -> result.unindexObject = true

  test.ok result.fullpathCalled, "Server should have been called."
  test.ok result.unindexObject, "Should have unindexed a node instance"
  test.done()

exports.testCanQueryNodeIndex = (test) ->
  test.expect 2
  mock.clear()
  indexName = "my_nodes"
  result = {}
  query = "title:\"The Right Way\" AND text:go"
  mock.webmock "GET", "http://localhost:7474/db/data/index/node/" + indexName, [
    outgoing_relationships:"http://localhost:7474/db/data/node/1/relationships/out"
    data:{}
    traverse:"http://localhost:7474/db/data/node/1/traverse/{returnType}"
    all_typed_relationships:"http://localhost:7474/db/data/node/1/relationships/all/{-list|&|types}"
    property:"http://localhost:7474/db/data/node/1/properties/{key}"
    self:"http://localhost:7474/db/data/node/1"
    properties:"http://localhost:7474/db/data/node/1/properties"
    outgoing_typed_relationships:"http://localhost:7474/db/data/node/1/relationships/out/{-list|&|types}"
    incoming_relationships:"http://localhost:7474/db/data/node/1/relationships/in"
    extensions:{}
    create_relationship:"http://localhost:7474/db/data/node/1/relationships"
    all_relationships:"http://localhost:7474/db/data/node/1/relationships/all"
    incoming_typed_relationships:"http://localhost:7474/db/data/node/1/relationships/in/{-list|&|types}"
  ]
  db = mock.mockedGraphDatabase()
  index = new neo4j.index.NodeIndex db, indexName
  index.query(query).then((nodes) -> result.nodes = nodes)

  test.ok result.nodes and result.nodes.length is 1, "Should have returned one node"
  test.ok result.nodes[0] instanceof neo4j.models.Node, "Should have returned a node instance"
  test.done()

exports.testCanQueryRelationshipIndex = (test) ->
  test.expect 2
  mock.clear()
  indexName = "my_nodes"
  result = {}
  query = "title:\"The Right Way\" AND text:go"
  mock.webmock "GET", "http://localhost:7474/db/data/index/relationship/" + indexName, [
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
  index = new neo4j.index.RelationshipIndex db, indexName
  index.query(query).then((rels) -> result.rels = rels)

  test.ok result.rels.length is 1, "Should have returned one relationship"
  test.ok result.rels[0] instanceof neo4j.models.Relationship, "Should have returned a relationship instance"
  test.done()

exports.testCanExactQueryNodeIndex = (test) ->
  test.expect 2
  mock.clear()
  indexName = "my_nodes"
  result = {}
  key = "somekey"
  value = "somevalue"
  mock.webmock "GET", "http://localhost:7474/db/data/index/node/" + indexName + "/" + key + "/" + value, [
    outgoing_relationships:"http://localhost:7474/db/data/node/1/relationships/out"
    data:{}
    traverse:"http://localhost:7474/db/data/node/1/traverse/{returnType}"
    all_typed_relationships:"http://localhost:7474/db/data/node/1/relationships/all/{-list|&|types}"
    property:"http://localhost:7474/db/data/node/1/properties/{key}"
    self:"http://localhost:7474/db/data/node/1"
    properties:"http://localhost:7474/db/data/node/1/properties"
    outgoing_typed_relationships:"http://localhost:7474/db/data/node/1/relationships/out/{-list|&|types}"
    incoming_relationships:"http://localhost:7474/db/data/node/1/relationships/in"
    extensions:{}
    create_relationship:"http://localhost:7474/db/data/node/1/relationships"
    all_relationships:"http://localhost:7474/db/data/node/1/relationships/all"
    incoming_typed_relationships:"http://localhost:7474/db/data/node/1/relationships/in/{-list|&|types}"
  ]
  db = mock.mockedGraphDatabase()
  index = new neo4j.index.NodeIndex db, indexName
  index.exactQuery(key, value).then((nodes) -> result.nodes = nodes)

  test.ok result.nodes.length is 1, "Should have returned one node"
  test.ok result.nodes[0] instanceof neo4j.models.Node, "Should have returned a node instance"
  test.done()

exports.testCanExactQueryRelationshipIndex = (test) ->
  test.expect 2
  mock.clear()
  indexName = "my_nodes"
  result = {}
  key = "somekey"
  value = "somevalue"
  mock.webmock "GET", "http://localhost:7474/db/data/index/relationship/" + indexName + "/" + key + "/" + value, [
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
  index = new neo4j.index.RelationshipIndex db, indexName
  index.exactQuery(key, value).then((rels) -> result.rels = rels)

  test.ok result.rels.length is 1, "Should have returned one relationship"
  test.ok result.rels[0] instanceof neo4j.models.Relationship, "Should have returned a relationship instance"
  test.done()
