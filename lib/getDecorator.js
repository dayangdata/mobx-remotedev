'use strict';

exports.__esModule = true;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.default = getDecorator;

var _mobx = require('mobx');

var mobx = _interopRequireWildcard(_mobx);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function getDecorator(func) {
  return function (storeOrConfig, config) {
    if ((typeof storeOrConfig === 'undefined' ? 'undefined' : _typeof(storeOrConfig)) === 'object' && !mobx.isObservable(storeOrConfig)) {
      return function (store) {
        return func(store, storeOrConfig);
      };
    }
    return func(storeOrConfig, config);
  };
}