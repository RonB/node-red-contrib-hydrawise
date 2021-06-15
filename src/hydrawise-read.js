/*
 The MIT License

 Copyright (c) 2021 Ronald Brinkerink
 All rights reserved.
 node-red-contrib-hydrawise
 */
'use strict'

module.exports = function (RED) {
  // const hydrawiseCore = require('./core/hydrawise-core')
  const Hydrawise = require('hydrawise-api').Hydrawise
  function hydrawiseRead (config) {
    RED.nodes.createNode(this, config)

    this.name = config.name
    this.controller = RED.nodes.getNode(config.controller)
    this.zone = RED.nodes.getNode(config.zone)

    const myHydrawise = new Hydrawise({ type: this.controller.type, key: this.controller.key })

    const node = this

    node.status({ fill: 'green', shape: 'dot', text: 'active' })
    node.on('input', function (msg) {
      myHydrawise.getZones()
        .then(zones => {
          msg.payload = zones
          node.send(msg)
        })
        .catch(error => {
          msg.payload = error
          node.send(msg)
        })

      if (!node.connector) {
        node.error(new Error('Client Not Ready To Read'), msg)
      }
      /*
      const options = msg.payload.options || {}

      if (node.multipleRead) {
        hydrawiseCore.internalDebugLog('Multiple Read')

        const defaultRequestArray = [{
          objectId: {
            type: node.objectType,
            zone: parseInt(node.objectzone)
          },
          properties: [{ id: parseInt(node.propertyId) }]
        }]

        try {
          hydrawiseCore.internalDebugLog('readProperty node.controllerIPAddress: ' + node.controllerIPAddress)
          hydrawiseCore.internalDebugLog('readProperty msg.payload.controllerIPAddress: ' + msg.payload.controllerIPAddress)
          hydrawiseCore.internalDebugLog('readPropertyMultiple default requestArray: ' + JSON.stringify(defaultRequestArray))
          hydrawiseCore.internalDebugLog('readPropertyMultiple msg.payload.requestArray: ' + JSON.stringify(msg.payload.requestArray))
          hydrawiseCore.internalDebugLog('readPropertyMultiple node.propertyId: ' + node.propertyId)
          hydrawiseCore.internalDebugLog('readPropertyMultiple msg.payload.propertyId: ' + msg.payload.propertyId)
        } catch (e) {
          hydrawiseCore.internalDebugLog('readPropertyMultiple error: ' + e)
        }

        node.connector.client.readPropertyMultiple(
          msg.payload.controllerIPAddress || node.controllerIPAddress,
          msg.payload.requestArray || defaultRequestArray,
          options,
          function (err, result) {
            if (err) {
              const translatedError = hydrawiseCore.translateErrorMessage(err)
              hydrawiseCore.internalDebugLog(translatedError)
              node.error(translatedError, msg)
            } else {
              msg.input = msg.payload
              msg.payload = result
              node.send(msg)
            }
          })
      } else {
        hydrawiseCore.internalDebugLog('Read')

        const objectId = {
          zone: parseInt(node.zone)
        }

        try {
          hydrawiseCore.internalDebugLog('readProperty node.controllerIPAddress: ' + node.controllerIPAddress)
          hydrawiseCore.internalDebugLog('readProperty msg.payload.controllerIPAddress: ' + msg.payload.controllerIPAddress)
          hydrawiseCore.internalDebugLog('readProperty default objectId: ' + JSON.stringify(objectId))
          hydrawiseCore.internalDebugLog('readProperty msg.payload.objectId: ' + JSON.stringify(msg.payload.objectId))
          hydrawiseCore.internalDebugLog('readProperty node.propertyId: ' + node.propertyId)
          hydrawiseCore.internalDebugLog('readProperty msg.payload.propertyId: ' + msg.payload.propertyId)
        } catch (e) {
          hydrawiseCore.internalDebugLog('readProperty error: ' + e)
        }

        node.connector.client.readProperty(
          msg.payload.controllerIPAddress || node.controllerIPAddress,
          msg.payload.objectId || objectId,
          parseInt(msg.payload.propertyId) || parseInt(node.propertyId),
          options,
          function (err, result) {
            if (err) {
              const translatedError = hydrawiseCore.translateErrorMessage(err)
              hydrawiseCore.internalDebugLog(translatedError)
              node.error(translatedError, msg)
            } else {
              msg.input = msg.payload
              msg.payload = result
              node.send(msg)
            }
          })
      }
      */
    })
  }

  RED.nodes.registerType('hydrawise-read', hydrawiseRead)
}
