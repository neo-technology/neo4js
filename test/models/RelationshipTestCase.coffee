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

exports.testFailsWhenGivenNonRelationshipUrl = (test) ->
  test.expect 2
  nonNodeUrl = "asd123"
  result = {}
  mock.clear()
  mock.webmock "GET", nonNodeUrl,
    management:""
    data:""

  rel = new neo4j.models.Relationship { self:nonNodeUrl }, mock.mockedGraphDatabase()
  rel.fetch().then null, (fail) ->
    result.error = fail

  test.ok typeof result.error isnt "undefined", "Error should have been triggered"
  test.ok result.error instanceof neo4j.exceptions.InvalidDataException, "Error should be InvalidDataException."
  test.done()
