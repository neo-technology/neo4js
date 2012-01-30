fs = require 'fs'
spawn = require('child_process').spawn
reporters = require('nodeunit').reporters
colors = require 'colors'
testDirectories = ['test', 'test/models', 'test/index']

build = (options, callback) ->
  coffee = spawn 'coffee', options
  coffee.stdout.on 'data', (data) -> console.log data.toString()
  coffee.stderr.on 'data', (data) -> console.log data.toString().red
  coffee.on 'exit', (status)->
    if status
      console.log "failed".red + " exit-code:#{status}"
    else
      callback?(status)

task 'build', 'Compile Coffeescript', ->
#  build ['--bare', '--compile', '--output', 'lib', 'src'], -> console.log "success".green

task 'dev', 'Continuous compilation', ->
#  build ['--watch', '--bare', '--compile', '--output', 'lib', 'src']

task 'test', 'Run tests', ->
#  build ['--bare', '--compile', '--output', 'lib', 'src'], ->
    console_org = console.log
    console.log = ->
    reporters.junit.run testDirectories, output :__dirname + "/target/surefire-reports", ->
      console.log = console_org
      reporters.default.run testDirectories, null, ->
        console.log "-finished-".green

stitch = require('stitch')

task 'stitch', ->
  package = stitch.createPackage paths:[__dirname + '/lib', __dirname + '/lib/neo4j', __dirname + '/lib/neo4j/cypher',
    __dirname + '/lib/neo4j/exceptions', __dirname + '/lib/neo4j/index', __dirname + '/lib/neo4j/models',
    __dirname + '/lib/neo4j/services'], dependencies:["underscore"]


  console.log package.compile((err, source)->
      fs.writeFile('package.js', source, (err) ->
          if (err)
            throw err
          console.log('Compiled package.js')
      )

  )
