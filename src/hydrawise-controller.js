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
    this.name = config.name
    this.host = config.host || ''
    this.connectionType = config.connectionType || 'CLOUD'
    this.key = config.key || ''
    this.user = config.user || ''
    this.password = config.password || ''
    // instantiate the controller
    if (this.connectionType === 'CLOUD') {
      this.controller = new Hydrawise({
        type: this.connectionType,
        key: this.key
      })
    } else {
      this.controller = new Hydrawise({
        type: this.connectionType,
        host: this.host,
        user: this.user,
        password: this.password
      })
      this.controller
        .then(c => {
          console.log('Controller created ' + c.name)
        })
        .catch(err => {
          console.error(new Error(err))
        })
    }
  }

  RED.nodes.registerType('hydrawise-controller', hydrawiseController)
}
