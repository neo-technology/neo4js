/*
 * Copyright (c) 2010-2012 "Neo Technology,"
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
 * @class
 * @param db Should be a GraphDatabase instance.
 * @param name Should be the index name
 */
neo4j.index.Index = function(db, name)
{

    /**
     * A GraphDatabase instance.
     */
    this.db = db;
    
    /**
     * The name of this index.
     */
    this.name = name;
    
    /**
     * Configuration for this index, may be null
     * if config has not been fetched.
     */
    this.config = null;
    
    /**
     * Provider name
     */
    this.provider = "N/A";
    
    _.bindAll(this, 'query', 'exactQuery',
                    'index', 'unindex');

};

_.extend(neo4j.index.Index.prototype,
        
    /** @lends neo4j.index.Index# */          
    {

    getUriFor : function(item) { return ""; }, // To be implemented by subclasses
    getObjectFor : function(itemOrUri) { return ""; }, // To be implemented by subclasses
    getType : function() { return ""; },       // To be implemented by subclasses
    createObjectFromDefinition : function(def) {},
    
    getIdFor : function(itemPromise) { 
        return itemPromise.then(function(item, fulfill) {
            fulfill(item.getId());
        }); 
    },
    
    /**
     * Internal method, does not update
     * the actual configuration used in the DB.
     */
    setConfig : function(config) {
        this.config = config;
    },
    
    /**
     * Check if configuration info has been downloaded
     * for this index. Config info is automatically made
     * available if you get indexes via the getAllXIndexes methods.
     */
    configAvailable : function() {
        return this.config !== null;
    },
    
    getConfig : function() {
        return this.config;
    },
    
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
        var index = this;
        return this.db.getServiceDefinition().then(function(urls, fulfill, fail) {
            index.db.web.get(urls[index.getType()] + "/" + index.name, {query:query}, function(result) {
                var out = [];
                for(var i=0,l=result.length; i<l; i++) {
                    out.push(index.createObjectFromDefinition(result[i]));
                }
                fulfill(out);
            }, fail);
        });
    },

    /**
     * Look for exact matches on the given key/value pair.
     */
    exactQuery : function(key, value) {
        var index = this;
        return this.db.getServiceDefinition().then(function(urls, fulfill, fail) {
            index.db.web.get(urls[index.getType()] + "/" + index.name + "/" + key + "/" + value, function(result) {
                var out = [];
                for(var i=0,l=result.length; i<l; i++) {
                    out.push(index.createObjectFromDefinition(result[i]));
                }
                fulfill(out);
            }, fail);
        });
    },
    
    /**
     * Index a node or a relationship, depending on index type.
     * 
     * @param item An id, url or an instance of node or relationship, depending on the index type.
     * @param key The key to index the value with. (used when searching later on)
     * @param value (optional) The value to be indexed, defaults to the items value of the key property.
     */
    index : function(item, key, value) {
        var itemPromise = neo4j.Promise.wrap(item),
            keyPromise = neo4j.Promise.wrap(key),
            urlPromise = this.getUriFor(itemPromise),
            urlsPromise = this.db.getServiceDefinition(),
            index = this;
        
        if(typeof(value) === "undefined") {
            var valuePromise = this.getObjectFor(itemPromise).then(function(obj, fulfill){
                fulfill(obj.getProperty(key));
            });
        } else {
            var valuePromise = neo4j.Promise.wrap(value);
        }
        
        var allPromises = neo4j.Promise.join.apply(this, [urlPromise, keyPromise, valuePromise, urlsPromise]);
        return allPromises.then(function(values, fulfill, fail) {
            var url = values[0],
                key = values[1],
                value = values[2],
                urls = values[3];
            
            index.db.web.post(urls[index.getType()] + "/" + index.name + "/" + key + "/" + value, url, function(result) {
                fulfill(true);
            }, fail);
        });
    },
    
    /**
     * Remove an indexed item. 
     * 
     * @param item An id, url or an instance of node or relationship, depending on the index type.
     * @param key (Optional) Only remove the item from index entries with this key.
     * @param value (Optional) Allowed if key is provided, only remove the item from index entries with the given key and this value. 
     */
    unindex : function(item, key, value) {
        var itemPromise = neo4j.Promise.wrap(item),
            idPromise = this.getIdFor(itemPromise),
            urlsPromise = this.db.getServiceDefinition(),
            index = this;
        
        var allPromises = neo4j.Promise.join.apply(this, [idPromise, urlsPromise]);
        return allPromises.then(function(values, fulfill, fail) {
            var id = values[0],
                urls = values[1];
            
            var url = urls[index.getType()] + "/" + index.name;
            if(key) {
                url += "/" + key;
            }
            if(value) {
                url+= "/" + value;
            }
            url += "/" + id;
            
            index.db.web.del(url, function(result) {
                fulfill(true);
            }, fail);
        });
    }

});
