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

neo4j = require("../../lib/neo4j")

exports.testHasProperty = (test) ->
  test.expect 2
  pc = new neo4j.models.PropertyContainer()
  test.ok !pc.hasProperty("someprop"), "Property should not exist."
  pc.setProperty "someprop"
  test.ok pc.hasProperty("someprop"), "Property should exist."
  test.done()
