/*
 * Copyright (c) 2010-2013 "Neo Technology,"
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
 * Represents a server-side JMX Bean.
 * 
 * Each bean has an attribute map, containing the actual
 * JMX data, and a property map, which contains data parsed
 * from the JMX Bean name.
 * 
 * Each bean also has a domain attribute, which is a string
 * representation of the JMX domain.
 */
neo4j.models.JMXBean = function(data) {
	
	this.parse(data);
	
};

/**
 * Parse server-provided JSON data and use it to populate this model.
 */
neo4j.models.JMXBean.prototype.parse = function(bean) {
	
	var parsedNameMap = this.parseName(bean.name);
	
	this.domain = parsedNameMap.domain;
	delete(parsedNameMap.domain); // We don't want this in the properties map.
	
	this.properties = parsedNameMap;
	this.attributes = bean.attributes;
	this.description = bean.description;
	this.jmxName = bean.name;
	
};

/**
 * Get a name for this bean. This will check if there is a name property
 * in the beanname (ie. some.domain:type=MemoryManager,name=CodeCacheManager ),
 * and return that. If none is available, it will return the first property,
 * and as a last resort, it will return the raw jmx name.
 */
neo4j.models.JMXBean.prototype.getName = function(bean) {
	if ( this.properties['name'] ) {
		return this.properties['name'];
	} else {
		for(var name in this.properties) {
			return this.properties[name];
		}
	}
	
	return this.jmxName;
};

/**
 * Parse jmx beanname ( something like some.domain:type=MemoryManager,name=CodeCacheManager ).
 */
neo4j.models.JMXBean.prototype.parseName = function(name) {
	
	var parts = name.split(":"),
	    part, domain,
	    parsed = {};
	
	domain = parts[0];
	parts = parts[1].split(",");
	
	for(var i = 0, l=parts.length; i<l; i++) {
		part = parts[i].split("=");
		parsed[part[0]] = part[1];
	}
	
	parsed.domain = domain;
	
	return parsed;
	
};

/**
 * Get an attribute by name.
 * 
 * @return an attribute object, or null if none is found.
 */
neo4j.models.JMXBean.prototype.getAttribute = function(name) {
	var search = name.toLowerCase();
	for( var i=0,l=this.attributes.length; i<l; i++ ) {
		if( this.attributes[i].name.toLowerCase() === search ) {
			return this.attributes[i];
		}
	}
	
	return null;
};
