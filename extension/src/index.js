/**
 * Module dependencies
 */

var Store = require('./Store')
var StoreSync = require('./StoreSync')
var Badge = require('./Badge')
var constants = require('./constants')
var Permissions = require('./Permissions')
var Network = require('./Network')
var Tabs = require('./Tabs')
var Option = require('./Option')
var Popup = require('./Popup')
var API = require('./API')
var Exception = require('./Exception')
var Notifications = require('./Notifications')
var Clipboard = require('./Clipboard')
var Lib = require('./Lib')
var ContextMenus = require('./ContextMenus')


/**
 * Expose Services
 * @constructor
 */

module.exports = function Services(options) {
  if (!(this instanceof Services)) return new Services(options)

  this.ctx = options.ctx
  this.constants = constants
  this.Option = Option
  this.Popup = Popup
  this.Exception = Exception
  this.store = new Store(this.ctx, this.constants.defaults.storePrefix, this.constants.defaults)
  this.storeSync = new StoreSync(this.ctx, this.constants.defaults)
  this.badge = new Badge(this.ctx, this.constants)
  this.permissions = new Permissions(this.ctx, this.store)
  this.network = new Network(this.ctx)
  this.tabs = new Tabs(this.ctx, this.store, this.permissions)
  this.api = new API(this.ctx, this.network, this.store)
  this.notifications = new Notifications(this.ctx, this.store)
  this.clipboard = new Clipboard(this.ctx)
  this.lib = new Lib()
  this.contextMenus = new ContextMenus(this.ctx)
}