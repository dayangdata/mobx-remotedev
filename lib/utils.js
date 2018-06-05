'use strict';

exports.__esModule = true;
exports.setValue = exports.silently = undefined;
exports.createAction = createAction;
exports.getName = getName;

var _mobx = require('mobx');

var mobx = _interopRequireWildcard(_mobx);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var getPayload = function getPayload(change) {
  var added = change.added,
      addedCount = change.addedCount,
      index = change.index,
      removed = change.removed,
      removedCount = change.removedCount;

  return {
    index: index,
    added: added && mobx.toJS(added),
    addedCount: addedCount,
    removed: removed && mobx.toJS(removed),
    removedCount: removedCount
  };
};

function createAction(name, change) {
  if (!change) {
    // is action
    return { type: name };
  }

  var action = void 0;
  if (typeof change.newValue !== 'undefined') {
    var _action;

    var key = typeof change.index !== 'undefined' ? change.index : change.name;
    action = (_action = {}, _action[key] = mobx.toJS(change.newValue), _action);
  } else {
    action = getPayload(change);
  }
  action.type = '\u2503 ' + name;

  return action;
}

function getName(obj) {
  if (!obj || !mobx.isObservable(obj)) return '';
  var r = mobx.getDebugName(obj);
  var end = r.indexOf('.');
  if (end === -1) end = undefined;
  return r.substr(0, end);
}

/* eslint-disable no-param-reassign */
var silently = exports.silently = function silently(fn, store) {
  store.__isRemotedevAction = true;
  fn();
  delete store.__isRemotedevAction;
};

function setValueAction(store, state) {
  silently(function () {
    if (store.importState) {
      store.importState(state);
    } else {
      Object.keys(state).forEach(function (key) {
        store[key] = state[key];
      });
    }
  }, store);
  return state;
}
setValueAction.__isRemotedevAction = true;
var setValue = exports.setValue = mobx.action('@@remotedev', setValueAction);
/* eslint-enable */