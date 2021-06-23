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

var controllerNode = require('node-red-contrib-hydrawise-master/src/hydrawise-controller')
var zoneNode = require('node-red-contrib-hydrawise-master/src/hydrawise-zone')

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

describe('Zone node Testing', function () {
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
    it('Hydrawise zone should be read', function (done) {
      helper.load([controllerNode, zoneNode], [
         {
          id: 'cf0dca49.2a9ac',
          type: 'hydrawise-zone',
          name: 'First Zone',
          zoneAddress: '0'
        },
        {
          id: 'b289851b.dec6f8',
          type: 'hydrawise-controller',
          name: 'BrainsController',
          connectionType: 'CLOUD',
          key: '0681-7E46-7E46-68A8'
        },
        {
          id: 'b289851b.dec6f9',
          type: 'hydrawise-command',
          name: 'RunZoneZero',
          command: 'run'
        }
      ], function () {
        
        done()
      }, function () {
        helper.log('function callback')
      })
    })
  })

  describe('post', function () {
    it('should fail for invalid node', function (done) {
      helper.request().post('/hydrawise-run/invalid').expect(404).end(done)
    })
  })
})
