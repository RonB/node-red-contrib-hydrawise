/*
 The MIT License

 Copyright (c) 2021 Ronald Brinkerink
 All rights reserved.
 node-red-contrib-hydrawise
 */
'use strict'

module.exports = function (RED) {
  
  function hydrawisezone (config) {
    RED.nodes.createNode(this, config)
    this.name = config.name
    this.zoneAddress = parseInt(config.zoneAddress) || 0
  }

  RED.nodes.registerType('hydrawise-zone', hydrawisezone)
}
