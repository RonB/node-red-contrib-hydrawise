/*
 The MIT License

 Copyright (c) 2021 Ronald Brinkerink
 All rights reserved.
 node-red-contrib-hydrawise
 */
'use strict'
module.exports = function (RED) {
  function hydrawiseCommand (config) {
    RED.nodes.createNode(this, config)

    this.name = config.name
    this.controllerNode = RED.nodes.getNode(config.controller)
    this.zone = config.zone
    this.duration = config.duration
    this.command = config.command
    const node = this

    if (this.controllerNode) {
      this.controllerNode.addListener('hydrawise_status', (status) => {
        // Check if controller is available.
        let fill = 'grey'
        if (status.status === 'init') fill = 'yellow'
        if (status.status === 'error') fill = 'red'
        if (status.status === 'ready') fill = 'green'
        node.status({ fill: fill, shape: 'dot', text: status.text })
      })
    } else {
      node.status({ fill: 'red', shape: 'dot', text: 'Controller not configured.' })
    };

    node.on('input', function (msg) {
      // execute command on controller
      if (this.controllerNode.status.status === 'ready') {
        switch (this.command) {
          case 'info':
            msg.payload = {
              customer: this.controllerNode.details,
              controller: this.controllerNode.controller
            }
            node.send(msg)
            break
          case 'run':
          case 'stop':
          case 'suspend':
            this.zone = this.controllerNode.controller.zones[this.zone.split(':')[0] - 1]
            this.zone[this.command](config.duration || 1800)
              .then(response => {
                node.status({ fill: 'green', shape: 'dot', text: 'Succesfull ' + this.command + ' ' + this.zone.name })
                msg.payload = response
                msg.zone = this.zone
                node.send(msg)
              })
              .catch(error => {
                node.status({ fill: 'red', shape: 'dot', text: 'Error trying command ' + this.command + ' ' + this.zone.name })
                msg.payload = { err: error, controller: this.controller, zone: this.zone }
                node.send(msg)
              })
            break
          case 'stopAllZones':
            this.controller[this.command]()
              .then(response => {
                node.status({ fill: 'green', shape: 'dot', text: 'Succesfull ' + this.command })
                msg.payload = response
                msg.zone = this.zone
                node.send(msg)
              })
              .catch(err => {
                node.status({ fill: 'red', shape: 'dot', text: 'Error trying command ' + this.command })
                msg.payload = { error: err, controller: this.controller }
                node.send(msg)
              })
            break
          case 'runAllZones':
          case 'suspendAllZones':

            this.controller[this.command](config.duration || '')
              .then(response => {
                node.status({ fill: 'green', shape: 'dot', text: 'Succesfull ' + this.command })
                msg.payload = response
                msg.zone = this.zone
                node.send(msg)
              })
              .catch(err => {
                node.status({ fill: 'red', shape: 'dot', text: 'Error trying command ' + this.command })
                msg.payload = { error: err, controller: this.controller }
                node.send(msg)
              })
            break
        }
      }
    })
  }

  RED.nodes.registerType('hydrawise-command', hydrawiseCommand)
}
