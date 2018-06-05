'use strict';

exports.__esModule = true;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _mobx = require('mobx');

var mobx = _interopRequireWildcard(_mobx);

var _spy = require('./spy');

var _spy2 = _interopRequireDefault(_spy);

var _getDecorator = require('./getDecorator');

var _getDecorator2 = _interopRequireDefault(_getDecorator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function dev(_store, config) {
  if ((!config || !config.remote) && (typeof window === 'undefined' || !window.devToolsExtension)) {
    return _store;
  }

  if (mobx.isObservable(_store)) {
    (0, _spy2.default)(_store, config);
  } else if (typeof _store === 'function') {
    /* eslint-disable no-param-reassign */
    if (!config) config = {};
    if (!config.name) config.name = _store.name;
    _store = function (_store2) {
      _inherits(store, _store2);

      function store() {
        _classCallCheck(this, store);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        var _this = _possibleConstructorReturn(this, _store2.call.apply(_store2, [this].concat(args)));

        (0, _spy2.default)(_this, config);
        return _this;
      }

      return store;
    }(_store);
    /* eslint-enable */
  } else {
    console.warn('Passed ' + (typeof _store === 'undefined' ? 'undefined' : _typeof(_store)) + ' to mobx-remotedev, which is not an observable.');
  }

  return _store;
}

exports.default = (0, _getDecorator2.default)(dev);