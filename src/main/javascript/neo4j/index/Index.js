/*
 * Copyright (c) 2002-2011 "Neo Technology,"
 * Network Engine for Objects in Lund AB [http://neotechnology.com]
 *
 * This file is part of Neo4j.
 *
 * Neo4j is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * Abstract parent class for NodeIndex and RelationshipIndex.
 * 
 * @param db Should be a GraphDatabase instance.
 * @param name Should be the index name
 */
neo4j.index.Index = function(db, name)
{

    /**
     * A GraphDatabase instance.
     */
    this.db = db;
    
    this.name = name;
    
    _.bindAll(this, 'query', 'exactQuery',
                    'index', 'unindex');

};

_.extend(neo4j.index.Index.prototype, {

    /**
     * Perform an index query. How to write the query depends on what index
     * provider you are using, which you (on purpose or indirectly) decided when you created your index. 
     * The default one is Lucene, in which case you should use Lucene 
     * query syntax here.
     * 
     * For Lucene query syntax, see: http://lucene.apache.org/java/3_1_0/queryparsersyntax.html
     * 
     * @param query A query string
     * @return A list of nodes or relationships, depending on index type.
     */
    query : function(query) {
        
    },

    /**
     * Look for exact matches on the given key/value pair.
     */
    exactQuery : function(key, value) {
    
    },
    
    /**
     * Index a node or a relationship, depending on index type.
     * 
     * @param item An id, url or an instance of node or relationship, depending on the index type.
     * @param key The key to index the value with.
     * @param value The value to be indexed.
     */
    index : function(item, key, value) {
        
    },
    
    /**
     * Remove an indexed item. 
     * 
     * @param item An id, url or an instance of node or relationship, depending on the index type.
     * @param key (Optional) Only remove the item from index entries with this key.
     * @param value (Optional) Allowed if key is provided, only remove the item from index entries with the given key and this value. 
     */
    unindex : function(item, key, value) {
    
    }

});
