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
var _ = require("underscore");

var window = { location:{} };
var Http = require('http');
var Url = require('url');

var $ = {
    _auth_cache:{},
    ajax:function (args) {
        var url = Url.parse(args.url);
        console.log(args.type + " " + args.url);

        var opts = {
            host:url.hostname,
            port:url.port,
            path:url.path,
            method:args.type
        };

        if (url.auth) {
            var auth = new Buffer(url.auth, "ascii").toString("base64");
            $._auth_cache[url.hostname] = auth;
            opts.headers = { Authorization:"Basic " + auth}
        }
        else if ($._auth_cache[url.hostname]) {  // TODO fix this!!
            opts.headers = { Authorization:"Basic " + $._auth_cache[url.hostname]}
        }

        var request = Http.request(opts, function (response) {
            response.setEncoding('utf8');
            var data;
            response.on('data', function (chunk) {
                data = chunk;
            });
            response.on('end', function () {
                try {
                    if (args.processData) {
                        data = JSON.parse(data);
                    }
                    args.success(data, response.statusCode, {xhr:1});
                } catch (e) {
                    args.error(e);
                }
            });

        });
        request.on('error', args.error);
        if (args.data != undefined && args.data != '') {
            request.write(args.data)
        }
        request.end();
    }
};


