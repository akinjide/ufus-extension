var Exception = require('./Exception')

module.exports = ContextMenus


function ContextMenus(ctx) {
  this._ctx = ctx
  this.defaults = {
    visible: true
  }
  this.contextTypes = [
    "page",
    "selection",
    "link",
    "image",
    "video",
    "audio"
  ]
}

ContextMenus.prototype.create = function(options) {
  var self = this

  return new Promise(function(resolve, reject) {
    if (self._ctx.chrome.runtime.lastError) {
      return reject(new Exception('LRUNTIME_ERR', self._ctx.chrome.runtime.lastError))
    }

    self._ctx.chrome.contextMenus.create(options, resolve)
  })
}

ContextMenus.prototype.remove = function(id) {
  var self = this

  return new Promise(function(resolve, reject) {
    if (self._ctx.chrome.runtime.lastError) {
      return reject(new Exception('LRUNTIME_ERR', self._ctx.chrome.runtime.lastError))
    }

    self._ctx.chrome.contextMenus.remove(id, resolve)
  })
}

ContextMenus.prototype.update = function(id, options) {
  var self = this

  return new Promise(function(resolve, reject) {
    if (self._ctx.chrome.runtime.lastError) {
      return reject(new Exception('LRUNTIME_ERR', self._ctx.chrome.runtime.lastError))
    }

    self._ctx.chrome.contextMenus.update(id, Object.assign({}, self.defaults, options), resolve)
  })
}