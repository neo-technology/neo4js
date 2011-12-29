#!/bin/bash -e -x

rm -rf target/npm
mkdir -p target/npm/package

cat src/npm/javascript/header.js \
	src/main/javascript/neo4j/__init__.js \
	src/main/javascript/neo4j/services/__init__.js \
	src/main/javascript/neo4j/exceptions/__init__.js \
	src/main/javascript/neo4j/exceptions/HttpException.js \
	src/main/javascript/neo4j/exceptions/ConnectionLostException.js \
	src/main/javascript/neo4j/exceptions/NotFoundException.js \
	src/main/javascript/neo4j/exceptions/InvalidDataException.js \
	src/main/javascript/neo4j/exceptions/StartNodeSameAsEndNodeException.js \
	src/main/javascript/neo4j/setTimeout.js \
	src/main/javascript/neo4j/setInterval.js \
	src/main/javascript/neo4j/Promise.js \
	src/main/javascript/neo4j/cachedFunction.js \
	src/main/javascript/neo4j/log.js \
	src/main/javascript/neo4j/proxy.js \
	src/main/javascript/neo4j/Events.js \
	src/main/javascript/neo4j/Service.js \
	src/main/javascript/neo4j/GraphDatabaseHeartbeat.js \
	src/main/javascript/neo4j/models/__init__.js \
	src/main/javascript/neo4j/models/JMXBean.js \
	src/main/javascript/neo4j/models/PropertyContainer.js \
	src/main/javascript/neo4j/models/Node.js \
	src/main/javascript/neo4j/models/Relationship.js \
	src/main/javascript/neo4j/models/Path.js \
	src/main/javascript/neo4j/cypher/__init__.js \
	src/main/javascript/neo4j/cypher/ExecutionEngine.js \
	src/main/javascript/neo4j/cypher/ResultRow.js \
	src/main/javascript/neo4j/cypher/QueryResult.js \
	src/main/javascript/neo4j/services/BackupService.js \
	src/main/javascript/neo4j/services/ConfigService.js \
	src/main/javascript/neo4j/services/ImportService.js \
	src/main/javascript/neo4j/services/ExportService.js \
	src/main/javascript/neo4j/services/ConsoleService.js \
	src/main/javascript/neo4j/services/JmxService.js \
	src/main/javascript/neo4j/services/LifecycleService.js \
	src/main/javascript/neo4j/services/MonitorService.js \
	src/main/javascript/neo4j/index/__init__.js \
	src/main/javascript/neo4j/index/Index.js \
	src/main/javascript/neo4j/index/NodeIndex.js \
	src/main/javascript/neo4j/index/RelationshipIndex.js \
	src/main/javascript/neo4j/index/Indexes.js \
	src/main/javascript/neo4j/GraphDatabaseManager.js \
	src/main/javascript/neo4j/GraphDatabase.js \
	src/npm/javascript/footer.js > target/npm/package/node-neo4js.js

cd target/npm
mkdir -p package/src/npm/javascript package/src/main/javascript/neo4j
cp ../../src/npm/javascript/web.coffee package/src/npm/javascript/web.coffee
cp ../../src/main/javascript/neo4j/Promise.js package/src/main/javascript/neo4j
cp ../../package.json package
rm -f ../neo4js.tgz
tar cfz ../neo4js.tgz *
cd ../..

# package.json node-neo4js.js src/npm/javascript/web.coffee

# mkdir -p neo target/npm/package
# cp package.json node-neo4js.js target/npm/package
# mkdir -p target/npm/pacakge/src/main/npm
# cp src/main/npm/javascript target/npm/pacakge/src/main/npm
npm publish --force target/neo4js.tgz
