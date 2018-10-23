var constants = {
  ERROR: {
    'color': [166, 41, 41, 255],
    'symbols': {
      'default': '?',
      'CLIENT_ERR': 'X'
    },
    'titles': {
      'default': 'Unknown error',
      'SERVER_ERR': 'Internet connection problem. Connect and try again',
      'CLIENT_ERR': 'OH SNAP! Please check the url and try again',
      'QUOTA_EXCEEDED_ERR': 'Oopsie, You have exceeded the max quota you specified in options',
      'TypeError': 'We hit a snag shortening that URL',
      'OQUEUEF_ERR': 'You have sent too many requests in a given amount of time'
    }
  },
  WARN: {
    'color': [245, 159, 0, 255],
    'symbols': {
      'default': '!',
      'network': 'OFF'
    },
    'titles': {
      'default': 'Unknown warning',
      'network': 'Internet connection problem'
    }
  },
  DEFAULT: {
    'color': [65, 131, 196, 255],
    'symbols': {
      'network': 'ON'
    },
    'titles': {
      'network': 'Connected to internet'
    }
  }
}

exports = constants

var defaults = {
  'rootURI': 'http://api.ufus.cc/v1/shorten',
  'appName': 'Ufus',
  'debounceRate': 150,
  'storePrefix': 'ufus:',
  'storageSize': 10,
  'playNotifications': false,
  'showNotifications': false,
  'nerdsStack': false,
  'readActiveTab': false,
  'browserContextMenus': false
}

exports.defaultTitle = defaults.appName
exports.defaults = defaults

module.exports = exports
