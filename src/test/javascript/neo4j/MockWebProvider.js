/*
 * Copyright (c) 2002-2011 "Neo Technology,"
 * Network Engine for Objects in Lund AB [http://neotechnology.com]
 *
 * This file is part of Neo4j.
 *
 * Neo4j is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
var mockWebProvider = {

    definitions : {
        'GET': {},
        'POST':{},
        'PUT':{},
        'DELETE':{}
    },
        
    mock : function(method, url, mocker) {
        
        if (! mockWebProvider.definitions[method] ) {
            mockWebProvider.definitions[method] = {};
        }
        
        mockWebProvider.definitions[method][url] = mocker;
    },
        
    ajax : function(method, url, data, success, failure) {

        neo4j.log(method, url);
        
        if (typeof (data) === "function")
        {
            failure = success;
            success = data;
            data = null;
        }
        
        if( typeof(failure) !== "function" ) {
            failure = function() {};
        } 
        
        var mocker = mockWebProvider.definitions[method][url]; 
        if( typeof(mocker) === "function" ) {
            mocker({method:method, url:url, data:data, success:success, failure:failure});
        } else  if( mocker ) {
            success(mocker);
        } else {
            failure(null);
        }
    }

};

/** 
 * Convinience access.
 */
var webmock = mockWebProvider.mock;

/**
 * Automatically set as default.
 */
neo4j.Web.setWebProvider(mockWebProvider);