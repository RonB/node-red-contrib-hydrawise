/*
 The MIT License

 Copyright (c) 2021 Ronald Brinkerink
 All rights reserved.
 node-red-contrib-hydrawise
 */
'use strict'

module.exports = function (RED) {
  function hydrawisecontroller (config) {
    RED.nodes.createNode(this, config)
    this.name = config.name
    this.host = config.host || ''
    this.type = config.type || 'CLOUD'
    this.host = config.host || ''
  }

  RED.nodes.registerType('hydrawise-controller', hydrawisecontroller)
}
