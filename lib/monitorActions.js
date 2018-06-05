'use strict';

exports.__esModule = true;
exports.isMonitorAction = undefined;
exports.dispatchMonitorAction = dispatchMonitorAction;

var _mobx = require('mobx');

var mobx = _interopRequireWildcard(_mobx);

var _jsan = require('jsan');

var _remotedevUtils = require('remotedev-utils');

var _utils = require('./utils');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var isMonitorAction = exports.isMonitorAction = function isMonitorAction(store) {
  return store.__isRemotedevAction === true;
};

function dispatch(store, _ref) {
  var type = _ref.type,
      args = _ref.arguments;

  if (typeof store[type] === 'function') {
    (0, _utils.silently)(function () {
      store[type].apply(store, args);
    }, store);
  }
}

function dispatchRemotely(devTools, store, payload) {
  try {
    (0, _remotedevUtils.evalMethod)(payload, store);
  } catch (e) {
    devTools.error(e.message);
  }
}

function toggleAction(store, id, strState) {
  var liftedState = (0, _jsan.parse)(strState);
  var idx = liftedState.skippedActionIds.indexOf(id);
  var skipped = idx !== -1;
  var start = liftedState.stagedActionIds.indexOf(id);
  if (start === -1) return liftedState;

  (0, _utils.setValue)(store, liftedState.computedStates[start - 1].state);
  for (var i = skipped ? start : start + 1; i < liftedState.stagedActionIds.length; i++) {
    if (i !== start && liftedState.skippedActionIds.indexOf(liftedState.stagedActionIds[i]) !== -1) continue; // it's already skipped
    dispatch(store, liftedState.actionsById[liftedState.stagedActionIds[i]].action);
    liftedState.computedStates[i].state = mobx.toJS(store);
  }

  if (skipped) {
    liftedState.skippedActionIds.splice(idx, 1);
  } else {
    liftedState.skippedActionIds.push(id);
  }
  return liftedState;
}

function dispatchMonitorAction(store, devTools, onlyActions) {
  var initValue = mobx.toJS(store);
  devTools.init(initValue, (0, _remotedevUtils.getMethods)(store));

  return function (message) {
    if (message.type === 'DISPATCH') {
      switch (message.payload.type) {
        case 'RESET':
          devTools.init((0, _utils.setValue)(store, initValue));
          return;
        case 'COMMIT':
          devTools.init(mobx.toJS(store));
          return;
        case 'ROLLBACK':
          devTools.init((0, _utils.setValue)(store, (0, _jsan.parse)(message.state)));
          return;
        case 'JUMP_TO_STATE':
        case 'JUMP_TO_ACTION':
          (0, _utils.setValue)(store, (0, _jsan.parse)(message.state));
          return;
        case 'TOGGLE_ACTION':
          if (!onlyActions) {
            console.warn('`onlyActions` parameter should be `true` to skip actions: ' + 'https://github.com/zalmoxisus/mobx-remotedev#remotedevstore-config');
            return;
          }
          devTools.send(null, toggleAction(store, message.payload.id, message.state));
          return;
        case 'IMPORT_STATE':
          {
            var nextLiftedState = message.payload.nextLiftedState;
            var computedStates = nextLiftedState.computedStates;

            (0, _utils.setValue)(store, computedStates[computedStates.length - 1].state);
            devTools.send(null, nextLiftedState);
            return;
          }
      }
    } else if (message.type === 'ACTION') {
      dispatchRemotely(devTools, store, message.payload);
    }
  };
}