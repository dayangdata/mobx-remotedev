'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = spy;

var _mobx = require('mobx');

var mobx = _interopRequireWildcard(_mobx);

var _remotedev = require('remotedev');

var _utils = require('./utils');

var _filters = require('./filters');

var _monitorActions = require('./monitorActions');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var isSpyEnabled = false;
var fallbackStoreName = void 0;
var stores = {};
var onlyActions = {};
var filters = {};
var monitors = {};
var scheduled = [];

function configure(name) {
  var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  if (typeof config.onlyActions === 'undefined') {
    onlyActions[name] = mobx._getGlobalState && mobx._getGlobalState().enforceActions;
  } else {
    onlyActions[name] = config.onlyActions;
  }
  if (config.filters) filters[name] = config.filters;
  if (config.global) {
    if (fallbackStoreName) throw Error('You\'ve already defined a global store');
    fallbackStoreName = name;
  }
}

function init(store, config) {
  var name = mobx.getDebugName(store);
  configure(name, config);
  stores[name] = store;

  var devTools = (0, _remotedev.connectViaExtension)(config);
  devTools.subscribe((0, _monitorActions.dispatchMonitorAction)(store, devTools, onlyActions[name]));
  monitors[name] = devTools;
}

function schedule(name, action) {
  var toSend = void 0;
  if (action && !(0, _filters.isFiltered)(action, filters[name])) {
    toSend = function toSend() {
      monitors[name].send(action, mobx.toJS(stores[name]));
    };
  }
  scheduled.push(toSend);
}

function send() {
  if (scheduled.length) {
    var toSend = scheduled.pop();
    if (toSend) toSend();
  }
}

function spy(store, config) {
  init(store, config);
  if (isSpyEnabled) return;
  isSpyEnabled = true;
  var objName = void 0;

  mobx.spy(function (change) {
    if (change.spyReportStart) {
      objName = (0, _utils.getName)(change.object || change.target);
      if (change.type === 'reaction') {
        // TODO: show reactions
        schedule(objName);
        return;
      }
      if (!stores[objName]) objName = fallbackStoreName;
      if (!stores[objName] || stores[objName].__isRemotedevAction) {
        schedule(objName);
        return;
      }
      if (change.fn && change.fn.__isRemotedevAction) {
        schedule(objName);
        return;
      }
      if (change.type === 'action') {
        var action = (0, _utils.createAction)(change.name);
        if (change.arguments && change.arguments.length) action.arguments = change.arguments;
        if (!onlyActions[objName]) {
          schedule(objName, _extends({}, action, { type: '\u250F ' + action.type }));
          send();
          schedule(objName, _extends({}, action, { type: '\u2517 ' + action.type }));
        } else {
          schedule(objName, action);
        }
      } else if (change.type && mobx.isObservable(change.object)) {
        schedule(objName, !onlyActions[objName] && (0, _utils.createAction)(change.type, change));
      }
    } else if (change.spyReportEnd) {
      send();
    }
  });
}