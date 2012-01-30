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
neo4j = require("../lib/neo4js")

exports.testServerUnresponsive = (test)->
  test.expect 3

  result = { lost:false, failed:false }

  mock.clear()
  mock.webmock "POST", "http://localhost:7474/db/data/node", (req) ->
    req.failure new neo4j.exceptions.ConnectionLostException()

  event1 = new neo4j.Promise()
  event2 = new neo4j.Promise()

  mock.events.bind "web.connection_lost", ->
    result.lost = true
    event1.fulfill()

  mock.events.bind "web.connection.failed", ->
    result.failed = true
    event2.fulfill()

  neo4j.Promise.join(event1, event2).then(
    (success)->
      test.ok result.lost, "Legacy connection failed event should have been triggered."
      test.ok result.failed, "Connection lost event should have been triggered."
      test.equals success.length, 2, "Expect Both Events Triggered"
      test.done()
  )

  mock.mockWeb.post "http://localhost:7474/db/data/node"
