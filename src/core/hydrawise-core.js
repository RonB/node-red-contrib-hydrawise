/*
 The MIT License

 Copyright (c) 2021 Ronald Brinkerink
 All rights reserved.
 node-red-contrib-hydrawise
 */
'use strict'

const de = de || { RonB: { hydrawise: { core: {} } } } // eslint-disable-line no-use-before-define
de.RonB.hydrawise.core.internalDebugLog = de.RonB.hydrawise.core.internalDebugLog || require('debug')('hydrawise:nodered:core') // eslint-disable-line no-use-before-define
de.RonB.hydrawise.core.detailDebugLog = de.RonB.hydrawise.core.detailDebugLog || require('debug')('hydrawise:nodered:core:details') // eslint-disable-line no-use-before-define
de.RonB.hydrawise.core.specialDebugLog = de.RonB.hydrawise.core.specialDebugLog || require('debug')('hydrawise:nodered:core:special') // eslint-disable-line no-use-before-define
de.RonB.hydrawise.core.errorCodeList = de.RonB.hydrawise.core.errorCodeList || [] // eslint-disable-line no-use-before-define
de.RonB.hydrawise.core.errorClassList = de.RonB.hydrawise.core.errorClassList || [] // eslint-disable-line no-use-before-define

de.RonB.hydrawise.core.initCodeLists = function () {
  const hydrawise = require('node-hydrawise')
  const _ = require('underscore')

  const errorCodeList = hydrawise.enum.ErrorCode
  const invertedErrorCodeList = _.toArray(_.invert(errorCodeList))
  de.RonB.hydrawise.core.errorCodeList = []

  let listCodeEntry
  for (listCodeEntry of invertedErrorCodeList) {
    de.RonB.hydrawise.core.errorCodeList.push({ typeValue: errorCodeList[listCodeEntry], label: listCodeEntry })
  }
  _.sortBy(de.RonB.hydrawise.core.errorCodeList, 'typeValue')

  const errorClassList = hydrawise.enum.ErrorClass
  const invertedErrorClassList = _.toArray(_.invert(errorClassList))
  de.RonB.hydrawise.core.errorClassList = []

  let listClassEntry
  for (listClassEntry of invertedErrorClassList) {
    de.RonB.hydrawise.core.errorClassList.push({ typeValue: errorClassList[listClassEntry], label: listClassEntry })
  }
  _.sortBy(de.RonB.hydrawise.core.errorClassList, 'typeValue')

  de.RonB.hydrawise.core.internalDebugLog('List init done with ' +
    de.RonB.hydrawise.core.errorClassList.length + ' class errors and ' +
    de.RonB.hydrawise.core.errorCodeList.length + ' code errors')
}

de.RonB.hydrawise.core.translateErrorMessage = function (err) {
  const message = err.message
  const messageParts = message.split('-')
  if (messageParts.length === 3) {
    const errorClassMessage = messageParts[1].split(':')
    const errorCodeMessage = messageParts[2].split(':')

    de.RonB.hydrawise.core.internalDebugLog(errorClassMessage)
    de.RonB.hydrawise.core.internalDebugLog(errorCodeMessage)

    errorClassMessage[1] = de.RonB.hydrawise.core.errorClassToString(errorClassMessage[1])
    errorCodeMessage[1] = de.RonB.hydrawise.core.errorCodeToString(errorCodeMessage[1])

    err.message = message + ' ' + errorClassMessage.join(':') + ' ' + errorCodeMessage.join(':')
  }
  return err
}

de.RonB.hydrawise.core.errorCodeToString = function (errorCodeId) {
  if (de.RonB.hydrawise.core.errorCodeList.length < 1) {
    de.RonB.hydrawise.core.initCodeLists()
  }
  let listEntry, entry
  for (listEntry of de.RonB.hydrawise.core.errorCodeList) {
    if (parseInt(listEntry.typeValue) === parseInt(errorCodeId)) {
      de.RonB.hydrawise.core.detailDebugLog(listEntry.typeValue + ' --> ' + listEntry.label)
      entry = listEntry
    }
  }
  return (entry) ? entry.label : errorCodeId
}

de.RonB.hydrawise.core.errorClassToString = function (errorClassId) {
  if (de.RonB.hydrawise.core.errorClassList.length < 1) {
    de.RonB.hydrawise.core.initCodeLists()
  }
  let listEntry, entry
  for (listEntry of de.RonB.hydrawise.core.errorClassList) {
    if (parseInt(listEntry.typeValue) === parseInt(errorClassId)) {
      de.RonB.hydrawise.core.detailDebugLog(listEntry.typeValue + ' --> ' + listEntry.label)
      entry = listEntry
    }
  }
  return (entry) ? entry.label : errorClassId
}

module.exports = de.RonB.hydrawise.core
