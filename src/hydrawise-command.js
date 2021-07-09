/*
 The MIT License

 Copyright (c) 2021 Ronald Brinkerink
 All rights reserved.
 node-red-contrib-hydrawise
 */
'use strict'

module.exports = function (RED) {
  // const hydrawiseCore = require('./core/hydrawise-core')
  // const Hydrawise = require('hydrawise-api').Hydrawise
  function hydrawiseCommand (config) {
    RED.nodes.createNode(this, config)

    this.name = config.name
    this.controllerNode = RED.nodes.getNode(config.controller)
    this.zoneNode = RED.nodes.getNode(config.zone)
    this.duration = config.duration
    this.command = config.command
    const node = this

    node.status({ fill: 'yellow', shape: 'dot', text: 'waiting' })
    node.on('input', function (msg) {
      // instantiate controller
      const commandNode = this
      this.controllerNode.controller.getZones()
        .then(zones => {
          commandNode.zone = zones[this.zoneNode.zoneAddress]
          // switch commands
          switch (commandNode.command) {
            case 'run':
              commandNode.controllerNode.controller.runZone(this.zone, config.duration || 15)
                .then(response => {
                  node.status({ fill: 'green', shape: 'dot', text: 'running zone' })
                  msg.payload = response
                  msg.zone = this.zone
                  node.send(msg)
                })
                .catch(error => {
                  node.status({ fill: 'red', shape: 'dot', text: 'could not run zone' })
                  msg.payload = error
                  node.send(msg)
                })
              break
            case 'stop':
              commandNode.controllerNode.controller.stopZone(this.zone)
                .then(response => {
                  node.status({ fill: 'green', shape: 'dot', text: 'stopped zone' })
                  msg.payload = response
                  msg.zone = this.zone
                  node.send(msg)
                })
                .catch(error => {
                  node.status({ fill: 'red', shape: 'dot', text: 'could not stop zone' })
                  msg.payload = error
                  node.send(msg)
                })
              break
            case 'info':
              msg.payload = zones
              node.send(msg)
              break
          }
        })
        .catch(error => {
          node.error(new Error('Zone not ready to ' + this.command), this)
          node.status({ fill: 'red', shape: 'dot', text: 'could not execute command ' + this.command })
          msg.payload = { err: error, controller: this.controllerNode }
          node.send(msg)
        })
    })
  }

  RED.nodes.registerType('hydrawise-command', hydrawiseCommand)
}
