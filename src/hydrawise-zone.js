/*
 The MIT License

 Copyright (c) 2021 Ronald Brinkerink
 All rights reserved.
 node-red-contrib-hydrawise
 */
'use strict'

module.exports = function (RED) {
  function hydrawiseZone (config) {
    RED.nodes.createNode(this, config)
    this.name = config.name
    this.zoneAddress = parseInt(config.zoneAddress) || 0
    /* this.controllerNode = RED.nodes.getNode(config.controller)

    this.controllerNode.controller.getZones()
      .then(zones => {
        this.zone = zones[this.zoneAddress]
      })
      .catch(error => {
        this.send({
          payload: error
        })
      }) */
  }

  RED.nodes.registerType('hydrawise-zone', hydrawiseZone)
}
