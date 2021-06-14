/*
 The MIT License

 Copyright (c) 2021 Ronald Brinkerink
 All rights reserved.
 node-red-contrib-hydrawise
 */
'use strict'

module.exports = function (RED) {
  const hydrawiseCore = require('./core/hydrawise-core')
  const hydrawise = require('node-hydrawise')
  const _ = require('underscore')

  function hydrawiseWrite (config) {
    RED.nodes.createNode(this, config)

    this.name = config.name
    this.objectType = parseInt(config.objectType)
    this.valueTag = parseInt(config.valueTag)
    this.valueValue = config.valueValue
    this.propertyId = parseInt(config.propertyId)
    this.priority = parseInt(config.priority)

    this.multipleWrite = config.multipleWrite

    this.zone = RED.nodes.getNode(config.zone)
    this.objectzone = parseInt(this.zone.zoneAddress) || 0

    this.controller = RED.nodes.getNode(config.controller)
    this.controllerIPAddress = this.controller.host || '127.0.0.1' // IPv6 it is :: - but configure Node-RED too

    this.connector = RED.nodes.getNode(config.server)

    const node = this

    node.status({ fill: 'green', shape: 'dot', text: 'active' })

    node.on('input', function (msg) {
      if (!node.connector) {
        node.error(new Error('Client Not Ready To Write'), msg)
        return
      }

      node.priority = (node.priority < 1 ? 16 : node.priority)
      node.priority = (node.priority > 16 ? 16 : node.priority)

      const options = msg.payload.options || { priority: node.priority }

      if (node.multipleWrite) {
        hydrawiseCore.internalDebugLog('Multiple Write')

        if (!msg.payload.values || !msg.payload.values[0].values) {
          node.error(new Error('msg.payload.values missing or invalid array for multiple write'), msg)
          return
        }

        msg.payload.values.forEach(function (item) {
          if (!item.objectId) {
            item.objectId = {
              type: node.objectType,
              zone: parseInt(node.objectzone)
            }
          }
        })

        try {
          hydrawiseCore.internalDebugLog('writeProperty node.controllerIPAddress: ' + node.controllerIPAddress)
          hydrawiseCore.internalDebugLog('writeProperty msg.payload.controllerIPAddress: ' + msg.payload.controllerIPAddress)
          hydrawiseCore.internalDebugLog('writePropertyMultiple msg.payload.values: ' + JSON.stringify(msg.payload.values))
        } catch (e) {
          hydrawiseCore.internalDebugLog('writePropertyMultiple error: ' + e)
        }

        node.connector.client.writePropertyMultiple(
          msg.payload.controllerIPAddress || node.controllerIPAddress,
          msg.payload.values,
          options,
          function (err, value) {
            if (err) {
              const translatedError = hydrawiseCore.translateErrorMessage(err)
              hydrawiseCore.internalDebugLog(translatedError)
              node.error(translatedError, msg)
            } else {
              msg.input = msg.payload
              msg.payload = value
              node.send(msg)
            }
          })
      } else {
        hydrawiseCore.internalDebugLog('Write')

        if (msg.payload.values && !msg.payload.values[0]) {
          node.error(new Error('invalid msg.payload.values array for write'), msg)
          return
        }

        const objectId = {
          type: parseInt(node.objectType),
          zone: parseInt(node.objectzone)
        }

        const defaultValues = [{
          type: parseInt(node.valueTag),
          value: node.valueValue
        }]

        try {
          hydrawiseCore.internalDebugLog('writeProperty node.controllerIPAddress: ' + node.controllerIPAddress)
          hydrawiseCore.internalDebugLog('writeProperty msg.payload.controllerIPAddress: ' + msg.payload.controllerIPAddress)
          hydrawiseCore.internalDebugLog('writeProperty default objectId: ' + JSON.stringify(objectId))
          hydrawiseCore.internalDebugLog('writeProperty default values: ' + JSON.stringify(defaultValues))
          hydrawiseCore.internalDebugLog('writeProperty msg.payload.values: ' + JSON.stringify(msg.payload.values))
          hydrawiseCore.internalDebugLog('writeProperty node.propertyId: ' + node.propertyId)
        } catch (e) {
          hydrawiseCore.internalDebugLog('writeProperty error: ' + e)
        }

        node.connector.client.writeProperty(
          msg.payload.controllerIPAddress || node.controllerIPAddress,
          msg.payload.objectId || objectId,
          parseInt(msg.payload.propertyId) || parseInt(node.propertyId),
          msg.payload.values || defaultValues,
          options,
          function (err, value) {
            if (err) {
              const translatedError = hydrawiseCore.translateErrorMessage(err)
              hydrawiseCore.internalDebugLog(translatedError)
              node.error(translatedError, msg)
            } else {
              msg.input = msg.payload
              msg.payload = value
              node.send(msg)
            }
          })
      }
    })
  }

  RED.nodes.registerType('hydrawise-write', hydrawiseWrite)

  RED.httpAdmin.get('/hydrawise/ApplicationTags', RED.auth.needsPermission('hydrawise.CMD.write'), function (req, res) {
    const typeList = hydrawise.enum.ApplicationTag
    const invertedTypeList = _.toArray(_.invert(typeList))
    const resultTypeList = []

    let typelistEntry
    for (typelistEntry of invertedTypeList) {
      resultTypeList.push({ typeValue: typeList[typelistEntry], label: typelistEntry })
    }

    res.json(resultTypeList)
  })

  RED.httpAdmin.get('/hydrawise/PropertyIds', RED.auth.needsPermission('hydrawise.CMD.write'), function (req, res) {
    const typeList = hydrawise.enum.PropertyIdentifier
    const invertedTypeList = _.toArray(_.invert(typeList))
    const resultTypeList = []

    let typelistEntry
    for (typelistEntry of invertedTypeList) {
      resultTypeList.push({ typeValue: typeList[typelistEntry], label: typelistEntry })
    }

    res.json(resultTypeList)
  })

  RED.httpAdmin.get('/hydrawise/ObjectTypes', RED.auth.needsPermission('hydrawise.CMD.write'), function (req, res) {
    const typeList = hydrawise.enum.ObjectType
    const invertedTypeList = _.toArray(_.invert(typeList))
    const resultTypeList = []

    let typelistEntry
    for (typelistEntry of invertedTypeList) {
      resultTypeList.push({ typeValue: typeList[typelistEntry], label: typelistEntry })
    }

    res.json(resultTypeList)
  })
}
