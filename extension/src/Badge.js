module.exports = Badge


function Badge(ctx, constants) {
  this._ctx = ctx
  this._constants = constants
  this._options = null
}

Badge.prototype._render = function(ctx) {
  ctx.chrome.browserAction.setTitle({ title: this._options.title })
  ctx.chrome.browserAction.setBadgeText({ text: this._options.text })
  ctx.chrome.browserAction.setBadgeBackgroundColor({ color: this._options.color })
}

Badge.prototype.warn = function(message) {
  this._options = this._data('WARN', message)
  this._render(this._ctx)
}

Badge.prototype.error = function(message) {
  this._options = this._data('ERROR', message)
  this._render(this._ctx)
}

Badge.prototype._data = function(key, value) {
  return {
    text: (
        this._constants[key].symbols[value]
        || this._constants[key].symbols.default
        || value
    ),
    title: (
        this._constants[key].titles[value]
        || this._constants[key].titles.default
        || this._constants.defaultTitle
        || value
    ),
    color: this._constants[key].color
  }
}

Badge.prototype.default = function(message) {
  this._options = this._data('DEFAULT', message)
  this._render(this._ctx)
}

Badge.prototype.count = function(recents) {
  if (recents == 0) {
    return 'Q';
  }

  if (recents > 9999) {
    return '∞';
  }

  return String(recents);
}
