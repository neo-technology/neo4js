Neo4j server client for JavaScript
=================================

The beginnings of a neo4j server client for client-side javascript.

Quick example
-------------

Neo4js makes heavy use of promises (also known as futures), methods that make calls to the database usually return a promise
for a result of some kind.

For instance:

    var nodePromise = graph.node("http://localhost:75");
    nodePromise.then(function(node) {
        // Do something with the node.
    });

    // Or just
    graph.node(0).

Example usage:
    
    var graph = new neo4j.GraphDatabase("http://localhost:7474");
    
    var lisaPromise = graph.node({ "name" : "Lisa" });
    var bobPromise = graph.node({ "name" : "Bob" });
    
    var lovePromise = graph.rel(lisaPromise, "LOVES", bobPromise, { "reason" : "All the bling he got." });

    // Wait for the promise of a relationship to be fulfilled.
    lovePromise.then(function(relationship) {

      // Get the end node of the LOVES relationship
      relationship.getEndNode().then(function(bob) {

        // Once you have a node or relationship object, all properties are immediately available:
        var name = bob.getProperty("name");

        // Change a property like this
        bob.setProperty("name", "Steven");
        bob.save().then(function(steven) {
          // Bob is now saved.
        });

      });

    });

Build production version
------------

    git clone http://github.com/jakewins/neo4js.git
    cd neo4js
    mvn package
	
This will create target/classes/neo4js.js

To use, check out the API documentation for neo4j.GraphDatabase.
Note that neo4js.js requires jQuery to run.
	
API Documentation
-----------------

    mvn site

Documentation is then found in target/site/jsdocs
 
