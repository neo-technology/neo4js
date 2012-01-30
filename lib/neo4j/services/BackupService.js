/*
 * Copyright (c) 2002-2012 "Neo Technology,"
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

var _ = require('underscore'),
    neo4j = {
        services:{},
        Service:require("../Service")
    };
/**
 * @class Interface to the backup functionality of the REST server.
 * @extends neo4j.Service
 * @param db
 *            should be a neo4j.GraphDatabase object
 */
neo4j.services.BackupService = function (db) {

    neo4j.Service.call(this, db);

};

_.extend(neo4j.services.BackupService.prototype, neo4j.Service.prototype);

/**
 * Trigger a manual backup to the manual backup path defined in the server
 * settings.
 *
 * @param callback
 *            will be called when the backup is completed
 * @function
 */
neo4j.services.BackupService.prototype.triggerManual = neo4j.Service
    .resourceFactory({
    'resource':'trigger_manual',
    'method':'POST',
    'errorHandler':function (callback, error) {
        if (error.exception == "NoBackupFoundationException") {
            callback(false);
        }
    }
});

/**
 * Trigger backup foundation on the currently configured manual backup path.
 *
 * @param callback
 *            will be called when the foundation is done
 * @function
 */
neo4j.services.BackupService.prototype.triggerManualFoundation = neo4j.Service
    .resourceFactory({
    'resource':'trigger_manual_foundation',
    'method':'POST'
});

/**
 * Get a list of scheduled backup jobs and their latest logs.
 *
 * @param callback
 *            will be called with the list
 * @function
 */
neo4j.services.BackupService.prototype.getJobs = neo4j.Service
    .resourceFactory({
    'resource':'jobs',
    'method':'GET'
});

/**
 * Get a single job by id
 *
 * @param id
 *            is the id of the job
 * @param callback
 *            will be called with the job
 * @function
 */
neo4j.services.BackupService.prototype.getJob = function (id, callback) {
    this.getJobs(function (jobs) {
        for (var i in jobs.jobList) {
            if (jobs.jobList[i].id == id) {
                callback(jobs.jobList[i]);
                return;
            }
        }

        callback(null);
    });
};

/**
 * Delete a backup job
 *
 * @param id
 *            the id of the job
 * @param callback
 *            will be called when scheduled job is deleted
 * @function
 */
neo4j.services.BackupService.prototype.deleteJob = neo4j.Service
    .resourceFactory({
    'resource':'job',
    'method':'DELETE',
    'urlArgs':[ "id" ]
});

/**
 * Trigger foundation for a given scheduled job.
 *
 * @param id
 *            the id of the job
 * @param callback
 *            will be called when the foundation is done
 * @function
 */
neo4j.services.BackupService.prototype.triggerJobFoundation = neo4j.Service
    .resourceFactory({
    'resource':'trigger_job_foundation',
    'method':'POST',
    'urlArgs':[ "id" ]
});

/**
 * Create or edit a job schedule. If you supply an id in the job object, this
 * will edit that job. If you omit the id, a new job is created.
 *
 * @param job
 *            A job JSON object. <br />
 *            This should look like:
 *
 * <pre>
 * {
 *     'id' : 12,
 *     'name' : &quot;Daily backups&quot;,
 *     'backupPath' : &quot;/var/backup&quot;,
 *     'cronExpression' : &quot;0 0 12 * * ? *&quot;,
 *     'autoFoundation' : true
 * }
 * </pre>
 *
 * @param callback
 *            will be called when the action is complete.
 * @function
 */
neo4j.services.BackupService.prototype.setJob = neo4j.Service.resourceFactory({
    'resource':'jobs',
    'method':'PUT'
});

module.exports = neo4j.services.BackupService;
