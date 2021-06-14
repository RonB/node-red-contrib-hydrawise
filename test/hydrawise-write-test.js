/**
 * Original Work Copyright 2014 IBM Corp.
 * node-red
 *
 * Copyright (c) 2021 Ronald Brinkerink
 * All rights reserved.
 * node-red-contrib-hydrawise - The MIT License
 *
 **/

'use strict'

var writeNode = require('../src/hydrawise-write.js')
var controllerNode = require('../src/hydrawise-controller.js')
var clientNode = require('../src/hydrawise-client.js')
var zoneNode = require('../src/hydrawise-zone.js')

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

describe('Write node Testing', function () {
  beforeEach(function (done) {
    helper.startServer(function () {
      done()
    })
  })

  afterEach(function (done) {
    helper.unload().then(function () {
      helper.stopServer(function () {
        done()
      })
    }).catch(function () {
      helper.stopServer(function () {
        done()
      })
    })
  })

  describe('Node', function () {
    it('simple write node should be loaded', function (done) {
      helper.load([controllerNode, clientNode, zoneNode, writeNode], [
        {
          id: 'bdc5fbd.9678608',
          type: 'hydrawise-write',
          z: 'ad26e8b.6b24498',
          name: 'hydrawiseWrite',
          objectType: 8,
          zone: 'cf0dca49.2a9ac',
          valueTag: 9,
          valueValue: '',
          propertyId: 8,
          priority: 14,
          controller: 'b289851b.dec6f8',
          server: '1528f96c.56d047',
          multipleWrite: false,
          wires: [
            []
          ]
        },
        {
          id: 'cf0dca49.2a9ac',
          type: 'hydrawise-zone',
          z: '',
          name: 'Room Simulator YABE',
          zoneAddress: '3342490'
        },
        {
          id: 'b289851b.dec6f8',
          type: 'hydrawise-controller',
          z: '',
          name: 'Windows VM',
          host: '192.168.1.94'
        },
        {
          id: '1528f96c.56d047',
          type: 'hydrawise-Client',
          z: '',
          name: '',
          adpuTimeout: '',
          port: '',
          interface: '',
          broadcastAddress: ''
        }
      ], function () {
        var hydrawiseWrite = helper.getNode('bdc5fbd.9678608')
        hydrawiseWrite.should.have.property('name', 'hydrawiseWrite')

        done()
      }, function () {
        helper.log('function callback')
      })
    })
  })

  describe('post', function () {
    it('should fail for invalid node', function (done) {
      helper.request().post('/hydrawise-write/invalid').expect(404).end(done)
    })
  })
})
