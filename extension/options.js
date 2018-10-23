var services = require('./src')({
  ctx: window
})

document.addEventListener('DOMContentLoaded', function() {
  var showDesktopNotifications = document.getElementById('show-desktop-notifications')
  var readTabs = document.getElementById('read-active-tab')
  // var browserContext = document.getElementById('enable-context-menus')
  var notificationsError = document.getElementById('notifications-error')
  var optionsError = document.getElementById('option-error')

  var StorageOption = new services.Option(window, services.storeSync, {
    id: 'recents-storage-size',
    type: 'value',
    storeKey: 'storageSize',
    onChange: function(option) {
      if (option.element.value == '') {
        option.element.value = services.store.get('storageSize')
      }

      option.write().then(function(response) {
        ping('info', response)
        refresh()
      }).catch(function(error) {
        optionsError.style.display = 'block'
        ping('error', error)
      })
    }
  })

  var ShowNotificationsOption = new services.Option(window, services.storeSync, {
    id: 'show-desktop-notifications',
    type: 'checked',
    storeKey: 'showNotifications',
    onChange: function(option) {
      if (showDesktopNotifications.checked) {
        services.permissions.request('notifications').then(function(granted) {
          if (granted) {
            ping('info', granted)
          }

          return option.write(granted)
        }).catch(function(error) {
          ping('error', error)
          notificationsError.style.display = 'block';
        })
      } else {
        services.permissions.remove('notifications')
          .then(option.write())
          .catch(function(error) {
            optionsError.style.display = 'block'
            ping('error', error)
          })
      }
    }
  })

  var PlayNotificationsOption = new services.Option(window, services.storeSync, {
    id: 'play-notifications-sound',
    type: 'checked',
    storeKey: 'playNotifications',
    onChange: function(option) {
      option.write().then(function(response) {
        ping('info', response)
      }).catch(function(error) {
        optionsError.style.display = 'block'
        ping('error', error)
      })
    }
  })

  var EnableNerdsStackOption = new services.Option(window, services.storeSync, {
    id: 'enable-nerds-stack',
    type: 'checked',
    storeKey: 'nerdsStack',
    onChange: function(option) {
      option.write().then(function(response) {
        ping('info', response)
      }).catch(function(error) {
        optionsError.style.display = 'block'
        ping('error', error)
      })
    }
  })

  var ReadActiveTabOption = new services.Option(window, services.storeSync, {
    id: 'read-active-tab',
    type: 'checked',
    storeKey: 'readActiveTab',
    onChange: function(option) {
      if (readTabs.checked) {
        services.permissions.request('tabs').then(function(granted) {
          if (granted) {
            ping('info', granted)
          }

          return option.write(granted)
        }).catch(function(error) {
          ping('error', error)
        })
      } else {
        option.write().catch(function(error) {
          optionsError.style.display = 'block'
          ping('error', error)
        })
      }
    }
  })

  // var EnableContextMenusOption = new services.Option(window, services.storeSync, {
  //   id: 'enable-context-menus',
  //   type: 'checked',
  //   storeKey: 'browserContextMenus',
  //   onChange: function(option) {
  //     if (browserContext.checked) {
  //       services.permissions.request('contextMenus').then(function(granted) {
  //         if (granted) {
  //           ping('info', granted)
  //         }

  //         return option.write(granted)
  //       }).catch(function(error) {
  //         ping('error', error)
  //       })
  //     } else {
  //       services.permissions.remove('contextMenus')
  //         .then(option.write())
  //         .catch(function(error) {
  //           optionsError.style.display = 'block'
  //           ping('error', error)
  //         })
  //     }
  //   }
  // })

  function ping(type, message) {
    window.chrome.runtime.sendMessage({
      mode: 'ping',
      type: type,
      message: message
    })
  }

  function refresh() {
    StorageOption.read()
    ShowNotificationsOption.read()
    PlayNotificationsOption.read()
    EnableNerdsStackOption.read()
    ReadActiveTabOption.read()
    // EnableContextMenusOption.read()
  }
})
