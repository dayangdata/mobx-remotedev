'use strict';

var _getDecorator = require('./getDecorator');

var _getDecorator2 = _interopRequireDefault(_getDecorator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

if (process.env.NODE_ENV === 'development') {
  module.exports = require('./dev').default; // eslint-disable-line global-require
} else {
  module.exports = (0, _getDecorator2.default)(function (store) {
    return store;
  });
}