/*
 The MIT License

 Copyright (c) 2021 Ronald Brinkerink
 All rights reserved.
 node-red-contrib-hydrawise
 */
'use strict'
const Hydrawise = require('hydrawise-api').Hydrawise
module.exports = function (RED) {
  function hydrawiseController (config) {
    RED.nodes.createNode(this, config)

    // the status of the hydrawise api will be emitted to all command nodes
    this.status = {
      status: 'init',
      text: 'Initializing'
    }
    // initial status
    this.emit('hydrawise_status', this.status)

    // instantiate the controller
    let params = {}
    if (config.connectionType === 'CLOUD') {
      params = {
        type: config.connectionType,
        key: config.key
      }
    } else {
      params = {
        type: config.connectionType,
        host: config.host,
        user: config.user || 'admin',
        password: config.password
      }
    }

    // instantiate hydrawise api
    this.hydrawise = new Hydrawise(params)

    // first get the customer details
    this.hydrawise.getCustomerDetails()
      .then(details => {
        this.name = details.current_controller
        this.details = details
        this.status = {
          status: this.status,
          text: 'Customer details available.'
        }
        this.emit('hydrawise_status', this.status)
        // now retrieve the controllers
        this.hydrawise.getControllers()
          .then(controllers => {
            this.controllers = controllers
            // for now only the first controller will be supported
            this.controller = controllers[0]
            this.status = {
              status: 'init',
              text: 'Controller ' + this.controller.name + ' available.'
            }
            this.emit('hydrawise_status', this.status)
            // now get all the zones
            this.controller.getZones()
              .then(zones => {
                this.controller.zones = zones
                this.status = {
                  status: 'ready',
                  text: 'Zones ' + this.controller.name + ' available.'
                }
                this.emit('hydrawise_status', this.status)
              })
              .catch(err => {
                this.controller.zones = []
                this.status = {
                  status: 'error',
                  text: 'Controller available but zones not available. ' + err.stack
                }
                this.emit('hydrawise_status', this.status)
              })
          })
      })
      .catch(err => {
        this.details = {}
        this.status = {
          status: 'error',
          text: 'Controller not ready. ' + err.stack
        }
        this.emit('hydrawise_status', this.status)
      })
  }

  // endpoints for Nodered config
  RED.httpAdmin.get('/getControllers', RED.auth.needsPermission('serial.read'), function (req, res) {
    // instantiate hydrawise api
    const hydrawise = new Hydrawise(req.query)
    // get controllers for this hydrawise connection
    hydrawise.getControllers()
      .then(controllers => {
        res.json(controllers)
      })
      .catch(err => {
        res.json({
          error: 'Controller not ready. Check your settings.' + err.message
        })
      })
  })

  RED.httpAdmin.get('/getZones', RED.auth.needsPermission('serial.read'), function (req, res) {
    const node = RED.nodes.getNode(req.query.controllerNode)
    if (node.controller.zones) {
      res.json(node.controller.zones.map(zone => { return { zone: zone.zone, name: zone.name } }))
    } else {
      res.json({
        error: 'Zones not ready.'
      })
    };
  })

  RED.nodes.registerType('hydrawise-controller', hydrawiseController)
}
