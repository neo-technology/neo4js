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

mock = require("../lib/neo4j/WebMockProvider")
_ = require("underscore")
neo4j = require("../lib/neo4js")

exports.tearDown = (callback)->
  mock.stop()
  callback()

exports.testInstantiateClient = (test) ->
  test.expect 1
  mock.clear()
  serverRoot = "theserverroot"
  mngUrl = "/db/manage/"
  dataUrl = "thedataurl"
  mock.webmock "GET", serverRoot, { management: mngUrl, data: dataUrl }
  mock.webmock "GET", dataUrl, {}
  mock.webmock "GET", mngUrl, {}
  db = new neo4j.GraphDatabase serverRoot, mock.mockWeb
  db.stopHeartbeat()
  promisedDiscovery = db.getDiscoveryDocument()
  test.ok promisedDiscovery instanceof neo4j.Promise, "Result should be a promise."
  test.done()

exports.testCreateNode = (test) ->
  test.expect 4
  mockedUrl = "someurl"
  mock.clear()
  mock.webmock "POST", "http://localhost:7474/db/data/node", self: mockedUrl

  db = mock.mockedGraphDatabase()
  result = {}
  nodePromise = db.node { name: "lisa", age: 12 }
  nodePromise.then((node) -> result.node = node)

  test.ok nodePromise instanceof neo4j.Promise, "GraphDatabase#node method call should return a promise."
  test.ok typeof (result.node) isnt "undefined", "Promise should deliver a result."
  test.ok result.node instanceof neo4j.models.Node, "Promise should be fulfilled, and deliver a node."
  test.equal result.node.getSelf(), mockedUrl, "Node should have recieved a url."
  test.done()

exports.testRemoveNode = (test) ->
  test.expect 2
  result = called: false, promiseFulfilled: false

  mock.clear()
  mock.webmock "GET", "http://localhost:7474/db/data/node/1", self: "http://localhost:7474/db/data/node/1"

  mock.webmock "DELETE", "http://localhost:7474/db/data/node/1", (req) ->
    result.called = true
    req.success true

  db = mock.mockedGraphDatabase()
  promise = db.node("http://localhost:7474/db/data/node/1")
  promise.then((node) -> node.remove().then -> result.promiseFulfilled = true)

  test.equal result.called, true, "Server should have been called."
  test.equal result.promiseFulfilled, true, "Promise should have been fulfilled"
  test.done()

exports.testRemoveNodeWithRelationships = (test) ->
  test.expect 4
  result = { deleteCalled: false, promiseFulfilled: false, deleteCalledAgain: false, deleteRelationshipCalled: false }

  mock.clear()
  mock.webmock "GET", "http://localhost:7474/db/data/node/1",
    self: "http://localhost:7474/db/data/node/1"
    all_relationships: "http://localhost:7474/db/data/node/1/relationships/all"

  mock.webmock "DELETE", "http://localhost:7474/db/data/node/1", (req) ->
    unless result.deleteCalled
      result.deleteCalled = true
      req.failure new neo4j.exceptions.HttpException(409)
    else
      result.deleteCalledAgain = true
      req.success true

  mock.webmock "GET", "http://localhost:7474/db/data/node/1/relationships/all", [
    self: "http://localhost:7474/db/data/relationship/1"
  ]
  mock.webmock "DELETE", "http://localhost:7474/db/data/relationship/1", (req) ->
    result.deleteRelationshipCalled = true
    req.success true

  db = mock.mockedGraphDatabase()
  promise = db.node "http://localhost:7474/db/data/node/1"
  promise.then((node) -> node.remove().then -> result.promiseFulfilled = true)

  test.ok result.deleteCalled, "Delete node should have been called, failing."
  test.ok result.deleteRelationshipCalled, "Delete relationship should have been called."
  test.ok result.deleteCalledAgain, "Delete node should have been called again."
  test.ok result.promiseFulfilled, "Promise should have been fulfilled"
  test.done()

exports.testGetNode = (test) ->
  test.expect 5
  nodeUrl = "someurl"
  mock.clear()
  mock.webmock "GET", nodeUrl, data: { name: "Bob"}, self: nodeUrl

  db = mock.mockedGraphDatabase()
  result = {}
  nodePromise = db.node nodeUrl
  nodePromise.then((node) -> result.node = node)

  test.ok nodePromise instanceof neo4j.Promise, "GraphDatabase#node method call should return a promise."
  test.ok typeof (result.node) isnt "undefined", "Promise should deliver a result."
  test.ok result.node instanceof neo4j.models.Node, "Promise should be fulfilled, and deliver a node."
  test.equal result.node.getSelf(), nodeUrl, "Node url should be as expected."
  test.equal result.node.getProperty("name"), "Bob", "Node should have properties provided by server."
  test.done()

exports.testGetNodeById = (test) ->
  test.expect 5
  nodeUrl = "http://localhost:7474/db/data/node/1"
  mock.clear()
  mock.webmock "GET", nodeUrl, data: {name: "Bob"}, self: nodeUrl

  db = mock.mockedGraphDatabase()
  result = {}
  nodePromise = db.node 1
  nodePromise.then((node) -> result.node = node)

  test.ok nodePromise instanceof neo4j.Promise, "GraphDatabase#node method call should return a promise."
  test.ok typeof (result.node) isnt "undefined", "Promise should deliver a result."
  test.ok result.node instanceof neo4j.models.Node, "Promise should be fulfilled, and deliver a node."
  test.equal result.node.getSelf(), nodeUrl, "Node url should be as expected."
  test.equal result.node.getProperty("name"), "Bob", "Node should have properties provided by server."
  test.done()

exports.testGetRelationship = (test) ->
  test.expect 3
  mock.clear()
  mock.webmock "GET", "http://localhost:7474/db/data/relationship/1",
    start: "http://localhost:7474/db/data/node/0"
    self: "http://localhost:7474/db/data/relationship/1"
    end: "http://localhost:7474/db/data/node/1"

  db = mock.mockedGraphDatabase()
  result = {}
  relPromise = db.rel "http://localhost:7474/db/data/relationship/1"
  relPromise.then((obj) -> result.rel = obj)

  test.ok relPromise instanceof neo4j.Promise, "GraphDatabase#getRelationship method call should return a promise."
  test.ok typeof (result.rel) isnt "undefined", "Relationship promise should deliver a result."
  test.ok result.rel instanceof neo4j.models.Relationship, "Relationship promise should be fulfilled, and deliver a relationship."
  test.done()

exports.testGetRelationshipById = (test) ->
  test.expect 3
  mock.clear()
  mock.webmock "GET", "http://localhost:7474/db/data/relationship/1",
    start: "http://localhost:7474/db/data/node/0"
    self: "http://localhost:7474/db/data/relationship/1"
    end: "http://localhost:7474/db/data/node/1"

  db = mock.mockedGraphDatabase()
  result = {}
  relPromise = db.rel 1
  relPromise.then((obj) -> result.rel = obj)

  test.ok relPromise instanceof neo4j.Promise, "GraphDatabase#getRelationship method call should return a promise."
  test.ok typeof (result.rel) isnt "undefined", "Relationship promise should deliver a result."
  test.ok result.rel instanceof neo4j.models.Relationship, "Relationship promise should be fulfilled, and deliver a relationship."
  test.done()

exports.testRemoveRelationship = (test) ->
  test.expect 2
  result = called: false, promiseFulfilled: false

  mock.clear()
  mock.webmock "GET", "http://localhost:7474/db/data/relationship/1",
    start: "http://localhost:7474/db/data/node/0"
    self: "http://localhost:7474/db/data/relationship/1"
    end: "http://localhost:7474/db/data/node/1"

  mock.webmock "DELETE", "http://localhost:7474/db/data/relationship/1", (req) ->
    result.called = true
    req.success true

  db = mock.mockedGraphDatabase()
  promise = db.rel "http://localhost:7474/db/data/relationship/1"
  promise.then((node) -> node.remove().then -> result.promiseFulfilled = true)

  test.ok result.called, "Server should have been called."
  test.ok result.promiseFulfilled, "Promise should have been fulfilled"
  test.done()

exports.testGetNodeOrRelationship = (test) ->
  test.expect 6
  mock.clear()
  mock.webmock "GET", "http://localhost:7474/db/data/node/1",
    data: name: "Bob"
    self: "http://localhost:7474/db/data/node/1"

  mock.webmock "GET", "http://localhost:7474/db/data/relationship/1",
    start: "http://localhost:7474/db/data/node/0"
    self: "http://localhost:7474/db/data/relationship/1"
    end: "http://localhost:7474/db/data/node/1"

  db = mock.mockedGraphDatabase()
  result = {}

  nodePromise = db.getNodeOrRelationship "http://localhost:7474/db/data/node/1"
  nodePromise.then((obj) -> result.node = obj)

  relPromise = db.getNodeOrRelationship "http://localhost:7474/db/data/relationship/1"
  relPromise.then((obj) -> result.rel = obj)

  test.ok nodePromise instanceof neo4j.Promise, "GraphDatabase#getNodeOrRelationship method call should return a promise."
  test.ok relPromise instanceof neo4j.Promise, "GraphDatabase#getNodeOrRelationship method call should return a promise."
  test.ok typeof (result.node) isnt "undefined", "Node promise should deliver a result."
  test.ok typeof (result.rel) isnt "undefined", "Relationship promise should deliver a result."
  test.ok result.node instanceof neo4j.models.Node, "Node promise should be fulfilled, and deliver a node."
  test.ok result.rel instanceof neo4j.models.Relationship, "Relationship promise should be fulfilled, and deliver a relationship."
  test.done()

exports.testSetProperties = (test) ->
  test.expect 7
  nodeUrl = "someurl"
  result = {}
  data = name: "Orvar", age: 12

  mock.clear()
  mock.webmock "GET", nodeUrl,
    self: nodeUrl
    properties: "http://localhost:7474/db/data/node/1/properties"

  mock.webmock "PUT", "http://localhost:7474/db/data/node/1/properties", (req) ->
    result.serverCalled = true
    test.equal data["name"], req.data["name"], "Properties sent to server should be same as the ones we set."
    test.equal data["age"], req.data["age"], "Properties sent to server should be same as the ones we set."
    req.success()

  db = mock.mockedGraphDatabase()
  nodePromise = db.node nodeUrl
  nodePromise.then((node) ->
      result.node = node
      node.setProperties data
      node.save().then((savedNode) -> result.savedNode = savedNode)
  )

  test.ok result.serverCalled, "Server should have been called."
  test.ok typeof (result.savedNode) isnt "undefined", "Node should have been saved."
  test.ok result.savedNode instanceof neo4j.models.Node, "Node should have been saved."
  test.equal data["name"], result.savedNode.getProperty("name"), "Saved node should have correct properties."
  test.equal data["age"], result.savedNode.getProperty("age"), "Saved node should have correct properties."
  test.done()

exports.testGetRelationships = (test) ->
  test.expect 3
  mock.clear()
  mock.webmock "GET", "http://localhost:7474/db/data/node/0/relationships/all", [
    self: "http://localhost:7474/db/data/relationship/1"
  ]
  db = mock.mockedGraphDatabase()
  result = {}
  nodePromise = db.referenceNode()
  nodePromise.then((node) ->
      promise = node.getRelationships neo4j.models.Node.BOTH
      promise.then((relationships) ->
          result.relationships = relationships
      )
  )
  test.ok _.isArray(result.relationships), "Relationships result should be an array."
  test.equal 1, result.relationships.length, "There should be one relationship."
  test.ok result.relationships[0] instanceof neo4j.models.Relationship, "The one result should be a relationship."
  test.done()

exports.testGetTypedRelationships = (test) ->
  test.expect 3
  mock.clear()
  mock.webmock "GET", "http://localhost:7474/db/data/node/0/relationships/all/KNOWS&LIKES", [
    self: "http://localhost:7474/db/data/relationship/1"
  ]
  db = mock.mockedGraphDatabase()
  result = {}
  nodePromise = db.referenceNode()
  nodePromise.then((node) ->
      promise = node.getRelationships neo4j.models.Node.BOTH, [ "KNOWS", "LIKES" ]
      promise.then((relationships) ->
          result.relationships = relationships
      )
  )
  test.ok _.isArray(result.relationships), "Relationships result should be an array."
  test.equal 1, result.relationships.length, "There should be one relationship."
  test.ok result.relationships[0] instanceof neo4j.models.Relationship, "The one result should be a relationship."
  test.done()

exports.testGetIncomingTypedRelationships = (test) ->
  test.expect 3
  mock.clear()
  mock.webmock "GET", "http://localhost:7474/db/data/node/0/relationships/in/KNOWS&LIKES", [
    self: "http://localhost:7474/db/data/relationship/1"
  ]
  db = mock.mockedGraphDatabase()
  result = {}
  nodePromise = db.referenceNode()
  nodePromise.then((node) ->
      promise = node.getRelationships neo4j.models.Node.IN, [ "KNOWS", "LIKES" ]
      promise.then((relationships) ->
          result.relationships = relationships
      )
  )

  test.ok _.isArray(result.relationships), "Relationships result should be an array."
  test.equal 1, result.relationships.length, "There should be one relationship."
  test.ok result.relationships[0] instanceof neo4j.models.Relationship, "The one result should be a relationship."
  test.done()

exports.testGetOutgoingTypedRelationships = (test) ->
  test.expect 3
  mock.clear()
  mock.webmock "GET", "http://localhost:7474/db/data/node/0/relationships/out/KNOWS&LIKES", [
    self: "http://localhost:7474/db/data/relationship/1"
  ]
  db = mock.mockedGraphDatabase()
  result = {}
  nodePromise = db.referenceNode()
  nodePromise.then((node) ->
      promise = node.getRelationships neo4j.models.Node.OUT, [ "KNOWS", "LIKES" ]
      promise.then((relationships) ->
          result.relationships = relationships
      )
  )

  test.ok _.isArray(result.relationships), "Relationships result should be an array."
  test.equal 1, result.relationships.length, "There should be one relationship."
  test.ok result.relationships[0] instanceof neo4j.models.Relationship, "The one result should be a relationship."
  test.done()

exports.testGetReferenceNode = (test) ->
  test.expect 5
  mock.clear()
  db = mock.mockedGraphDatabase()
  result = {}
  nodePromise = db.referenceNode()
  nodePromise.then((node) -> result.node = node)

  test.ok nodePromise instanceof neo4j.Promise, "GraphDatabase#referenceNode method call should return a promise."
  test.ok typeof (result.node) isnt "undefined", "Promise should deliver a result."
  test.ok result.node instanceof neo4j.models.Node, "Promise should be fulfilled, and deliver a node."
  test.equal result.node.getSelf(), "http://localhost:7474/db/data/node/0", "Node url should be reference url."
  test.equal result.node.getProperty("mykey"), "myvalue", "Node should have properties provided by server."
  test.done()

exports.testGetNonExistantReferenceNode = (test) ->
  test.expect 2
  mock.clear()
  mock.webmock "GET", "http://localhost:7474/db/data/node/0", (res)-> res.failed()
  db = mock.mockedGraphDatabase()
  result = {}
  nodePromise = db.referenceNode()
  nodePromise.then(null, (node) -> result.called = true)

  test.ok typeof (result.called) isnt "undefined", "Promise should deliver a result."
  test.ok result.called is true, "Promise should fail."
  test.done()

exports.testCreateRelationship = (test) ->
  test.expect 8
  mock.clear()
  db = mock.mockedGraphDatabase()
  result = {}
  mock.webmock "GET", "http://localhost:7474/db/data/node/1", self: "http://localhost:7474/db/data/node/1"
  mock.webmock "POST", "http://localhost:7474/db/data/node/0/relationships", self: "http://localhost:7474/db/data/relationship/1"

  relPromise = db.rel db.referenceNode(), "KNOWS", db.node("http://localhost:7474/db/data/node/1")
  relPromise.then((relationship) -> result.relationship = relationship)

  test.ok typeof (relPromise) isnt "undefined", "GraphDatabase#rel method should return a value."
  test.ok relPromise instanceof neo4j.Promise, "GraphDatabase#rel method should return a promise."
  test.ok typeof (result.relationship) isnt "undefined", "Promise should be fulfilled."
  test.ok result.relationship instanceof neo4j.models.Relationship, "Promise should return a Relationship."
  relPromise = db.rel "http://localhost:7474/db/data/node/0", "KNOWS", "http://localhost:7474/db/data/node/1"
  relPromise.then((relationship) -> result.relationship = relationship)

  test.ok typeof (relPromise) isnt "undefined", "GraphDatabase#rel method should return a value."
  test.ok relPromise instanceof neo4j.Promise, "GraphDatabase#rel method should return a promise."
  test.ok typeof (result.relationship) isnt "undefined", "Promise should be fulfilled."
  test.ok result.relationship instanceof neo4j.models.Relationship, "Promise should return a Relationship."
  test.done()

exports.testCreateRelationshipToNonExistantNode = (test) ->
  test.expect 4
  mock.clear()
  db = mock.mockedGraphDatabase()
  result = {}
  mock.webmock "POST", "http://localhost:7474/db/data/node/0/relationships", (req) ->
    req.failure new neo4j.exceptions.HttpException(400,
      message: "For input string: \"jibberish\""
      exception: "org.neo4j.server.rest.repr.BadInputException: For input string: \"jibberish\""
      stacktrace: [ "org.neo4j.server.rest.web.RestfulGraphDatabase.extractNodeId(RestfulGraphDatabase.java:105)",
        ".....", "org.mortbay.thread.QueuedThreadPool$PoolThread.run(QueuedThreadPool.java:582)" ], req)

  relPromise = db.rel db.referenceNode(), "KNOWS", "jibberish"
  relPromise.then(null, (error) -> result.error = error)

  test.ok typeof (relPromise) isnt "undefined", "GraphDatabase#rel method should return a value."
  test.ok relPromise instanceof neo4j.Promise, "GraphDatabase#rel method should return a promise."
  test.ok typeof (result.error) isnt "undefined", "Promise should fail"
  test.ok result.error instanceof neo4j.exceptions.HttpException, "Error should be HttpException"
  test.done()

exports.testCreateRelationshipFromNonExistantNode = (test) ->
  test.expect 4
  mock.clear()
  mock.webmock "GET", "jibberish", (res)-> res.failed()
  db = mock.mockedGraphDatabase()
  result = {}
  relPromise = db.rel "jibberish", "KNOWS", db.referenceNode()
  relPromise.then(null, (error) -> result.error = error)

  test.ok typeof (relPromise) isnt "undefined", "GraphDatabase#rel method should return a value."
  test.ok relPromise instanceof neo4j.Promise, "GraphDatabase#rel method should return a promise."
  test.ok typeof (result.error) isnt "undefined", "Promise should fail"
  test.ok result.error instanceof neo4j.exceptions.NotFoundException, "Error should be NotFoundException"
  test.done()

exports.testGetAvailableRelationshipTypes = (test) ->
  test.expect 5
  mock.clear()
  db = mock.mockedGraphDatabase()
  result = {}
  types = [ "one", "two" ]
  mock.webmock "GET", "http://localhost:7474/db/data/relationships/types", types
  typesPromise = db.getAvailableRelationshipTypes()
  test.ok typeof (typesPromise) isnt "undefined", "GraphDatabase#getAvailableRelationshipTypes method should return a value."
  test.ok typesPromise instanceof neo4j.Promise, "GraphDatabase#getAvailableRelationshipTypes method should return a promise."
  typesPromise.then((returnedTypes) -> result.types = returnedTypes)

  test.ok typeof (result.types) isnt "undefined", "Promise should be fulfilled, and return types."
  test.ok _.isArray(types), "Types should be an array."
  test.equal result.types, types, "Types should match the mocked ones."
  test.done()

exports.testCypherQuery = (test) ->
  test.expect 9
  mock.clear()
  db = mock.mockedGraphDatabase()
  result = {}

  mock.webmock "POST", "http://localhost:7474/db/data/cypher", { data: [
    [ "know", { data: {} } , { data: {}, type: "KNOWS" } ],
    [ "know", null, ]
  ], columns: [ "TYPE(r)", "n", "y" ] }

  resultPromise = db.query("BLAH BLAH BLHA")
  test.ok typeof (resultPromise) isnt "undefined", "GraphDatabase#query method should return a value."
  test.ok resultPromise instanceof neo4j.Promise, "GraphDatabase#query method should return a promise."
  resultPromise.then((cypherResult) -> result.cypherResult = cypherResult)

  test.ok typeof (result.cypherResult) isnt "undefined", "Promise should be fulfilled"
  test.ok result.cypherResult instanceof neo4j.cypher.QueryResult, "cypher result should be of type QueryResult"
  qr = result.cypherResult
  test.equal 2, qr.size(), "query result should have two rows"
  firstRow = qr.next()
  secondRow = qr.next()
  test.ok firstRow.get("TYPE(r)") is "know", "should contain correct result"
  test.ok firstRow.get("n") instanceof neo4j.models.Node, "should contain correct result"
  test.ok firstRow.get("y") instanceof neo4j.models.Relationship, "should contain correct result"
  test.ok !secondRow.get("n")?, "should contain correct result"
  test.done()
