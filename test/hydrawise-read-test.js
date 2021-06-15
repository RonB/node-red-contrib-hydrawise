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

var readNode = require('../src/hydrawise-read.js')
var controllerNode = require('../src/hydrawise-controller.js')
var zoneNode = require('../src/hydrawise-zone.js')

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

describe('Read node Testing', function () {
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
    it('simple read node should be loaded', function (done) {
      helper.load([controllerNode, zoneNode, readNode], [
        {
          id: 'fa0424dc.f9bd',
          type: 'hydrawise-read',
          z: 'ad26e8b.6b24498',
          name: 'hydrawiseRead',
          objectType: '8',
          zone: 'cf0dca49.2a9ac',
          propertyId: '28',
          controller: 'b289851b.dec6f8',
          server: '1528f96c.56d047',
          multipleRead: false,
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
          name: 'BrainsController',
          host: '192.168.93.1'
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
        var hydrawiseRead = helper.getNode('fa0424dc.f9bd')
        hydrawiseRead.should.have.property('name', 'hydrawiseRead')

        done()
      }, function () {
        helper.log('function callback')
      })
    })
  })

  describe('post', function () {
    it('should fail for invalid node', function (done) {
      helper.request().post('/hydrawise-read/invalid').expect(404).end(done)
    })
  })
})
