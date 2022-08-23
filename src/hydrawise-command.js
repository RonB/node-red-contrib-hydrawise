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

    if (config.zone) {
      this.zone = Number(config.zone.split(':')[0])
    }
    this.duration = config.duration || 0
    this.command = config.command || ''

    const node = this

    if (this.controllerNode) {
      this.controllerNode.addListener('hydrawise_status', (status) => {
        // status update of controller received
        let fill = 'grey'
        if (status.status === 'init') fill = 'yellow'
        if (status.status === 'error') fill = 'red'
        if (status.status === 'ready') fill = 'green'
        node.status({ fill: fill, shape: 'dot', text: status.text })
      })
    } else {
      node.status({
        fill: 'red',
        shape: 'dot',
        text: 'Controller not specified.'
      })
    }

    // Execute a command on the controller
    node.on('input', function (msg) {
      // check if controller is ready
      if (this.controllerNode.status.status !== 'ready') {
        msg.payload = {
          error: 'Controller not ready.'
        }
        node.send(msg)
        return
      }

      // check if there are input overrides
      if (msg.payload && msg.payload.command) {
        this.command = msg.payload.command
      }
      let zone

      // execute command on controller
      switch (this.command) {
        case 'info':
          this.controllerNode
            .getDetails()
            .then((zones) => {
              msg.payload = {
                customer: this.controllerNode.details,
                controller: this.controllerNode.controller
              }
              node.send(msg)
            })
            .catch((err) => {
              msg.payload = {
                error: err.stack
              }
              node.send(msg)
            })
          break
        case 'run':
        case 'stop':
        case 'suspend':
          this.zone = msg.payload.zone || this.zone
          this.duration = msg.payload.duration || this.duration
          zone = this.controllerNode.controller.zones[this.zone - 1]
          if (!zone) {
            node.status({
              fill: 'red',
              shape: 'dot',
              text: 'Zone ' + this.zone + ' not found.'
            })
            msg.payload = {
              err: 'Zone index ' + this.zone + ' invalid.'
            }
            node.send(msg)
          } else {
            zone[this.command](this.duration || 1800)
              .then((response) => {
                node.status({
                  fill: 'green',
                  shape: 'dot',
                  text: 'Succesfull ' + this.command + ' ' + zone.name
                })
                msg.payload = response
                node.send(msg)
              })
              .catch((err) => {
                node.status({
                  fill: 'red',
                  shape: 'dot',
                  text:
                    'Error trying command ' +
                    this.command +
                    ' ' +
                    this.zone.name
                })
                msg.payload = { error: err }
                node.send(msg)
              })
          }
          break
        case 'stopAllZones':
          this.controllerNode.controller[this.command]()
            .then((response) => {
              node.status({
                fill: 'green',
                shape: 'dot',
                text: 'Succesfull ' + this.command
              })
              msg.payload = response
              msg.zone = this.zone
              node.send(msg)
            })
            .catch((err) => {
              node.status({
                fill: 'red',
                shape: 'dot',
                text: 'Error trying command ' + this.command
              })
              msg.payload = { error: err }
              node.send(msg)
            })
          break
        case 'runAllZones':
        case 'suspendAllZones':
          this.controllerNode.controller[this.command](config.duration || '')
            .then((response) => {
              node.status({
                fill: 'green',
                shape: 'dot',
                text: 'Succesfull ' + this.command
              })
              msg.payload = response
              node.send(msg)
            })
            .catch((err) => {
              node.status({
                fill: 'red',
                shape: 'dot',
                text: 'Error trying command ' + this.command
              })
              msg.payload = { error: err, controller: this.controller }
              node.send(msg)
            })
          break
      }
    })
  }

  RED.nodes.registerType('hydrawise-command', hydrawiseCommand)
}
