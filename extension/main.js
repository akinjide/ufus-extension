var services = require('./src')({
  ctx: window
})
var queue = []

function detectConnectionHandler(event) {
  if (event.type == 'offline') {
    return services.badge.warn('network')
  }

  services.badge.default('network')
}

function pong(request, _, respond) {
  if (request && request.mode) {
    switch (request.type) {
      case 'error':
        services.badge.error(request.message.name || 'default')

        break

      case 'info':
        if (request.message && request.message.count > -1) {
          services.badge.default(
            services.badge.count(request.message.count)
          )
        }

        break

      case 'notify':
        Promise.all([
          services.storeSync.get('showNotifications'),
          services.storeSync.get('playNotifications')
        ])
        .then(function(response) {
          if (response) {
            if (response[0].showNotifications) {
              services.notifications.show(request.message)
            }

            if (response && response[1].playNotifications) {
              services.notifications.play()
            }
          }
        })

        break

      case 'copy':
        services.clipboard.copy(request.message)

        break

      /*
       * bg process network request, persist and respond to caller
       */
      case 'process':
        var popup = new services.Popup(window, services.store, services.storeSync, {})
        var assert = queue.indexOf(request.message.long_url) > -1

        if (assert) {
          respond({
            error: new services.Exception('OQUEUEF_ERR', 'processing too many request'),
            data: null
          })
          break
        }

        if (!assert) {
          queue.push(request.message.long_url)
        }

        services.api.request({ long_url: request.message.long_url })
          .then(function(response) {
            pong({ mode: 'ping', type: 'notify', message: response })
            return popup.write(response, 'recents')
          })
          .then(function() {
            queue = []
            respond({ error: null, data: 'OK' })
          })
          .catch(function(error) {
            queue = []
            pong({ mode: 'ping', type: 'error', message: error })
            respond({ error: error, data: null })
          })

        return true
    }
  }
}

// function registerContextMenus() {
//   var contexts = services.contextMenus.contextTypes;

//   for (var i = 0; i < contexts.length; i++) {
//     var context = contexts[i]
//     var title = 'Shorten \'' + context + '\' URL'

//     if (context == contexts[1]) {
//       title = 'Shorten \'%s\' URL'
//     }

//     services.contextMenus.create({
//       'id': services.constants.defaults.storePrefix + '000' + String(i),
//       'title': title,
//       'contexts': [context]
//     })
//   }
// }

function main() {
  if (navigator.onLine) {
    services.badge.default('network')
  } else {
    services.badge.warn('network')
  }
}

function installerHandler(details) {
  if (details.reason == 'install') {
    window.chrome.runtime.openOptionsPage()
  }
}

// function contextMenusHandler(info, tab) {
//   var prefix = services.constants.defaults.storePrefix
//   var message = {}

//   switch (info.menuItemId) {
//     case prefix + '0000':
//       message.long_url = info.pageUrl
//       break

//     case prefix + '0001':
//       message.long_url = info.selectionText
//       break

//     case prefix + '0002':
//       message.long_url = info.linkUrl
//       break

//     case prefix + '0003':
//     case prefix + '0004':
//     case prefix + '0005':
//       message.long_url = info.srcUrl
//       break
//   }

//   pong({ mode: 'ping', type: 'process', message: message }, null, null)
// }

window.addEventListener('online', detectConnectionHandler)
window.addEventListener('offline', detectConnectionHandler)

services.permissions.query('notifications').then(function(granted) {
  if (granted) {
    window.chrome.notifications.onClicked.addListener(function(id) {
      services.clipboard.copy(
        services.store.get(id)
      )

      services.notifications.close(id).then(function() {
        services.notifications.remove(id)
      }).catch(function(error) {
        pong({ mode: 'ping', type: 'error', message: error })
      })
    })

    window.chrome.notifications.onClosed.addListener(function(id) {
      services.notifications.close(id).then(function() {
        services.notifications.remove(id)
      }).catch(function(error) {
        pong({ mode: 'ping', type: 'error', message: error })
      })
    })
  }
}).catch(function(error) {
  pong({ mode: 'ping', type: 'error', message: error })
})

// services.permissions.query('notifications')
//   .then(function(granted) {
//     if (granted) {
//       window.chrome.notifications.onClicked.addListener(function(id) {
//         services.clipboard.copy(
//           services.store.get(id)
//         )

//         services.notifications.close(id).then(function() {
//           services.notifications.remove(id)
//         }).catch(function(error) {
//           pong({ mode: 'ping', type: 'error', message: error })
//         })
//       })

//       window.chrome.notifications.onClosed.addListener(function(id) {
//         services.notifications.close(id).then(function() {
//           services.notifications.remove(id)
//         }).catch(function(error) {
//           pong({ mode: 'ping', type: 'error', message: error })
//         })
//       })
//     }
//   })
//   .then(function() {
//     return services.permissions.query('contextMenus')
//   })
//   .then(function(granted) {
//     console.log(granted)
//     if (granted) {
//       registerContextMenus()
//       window.chrome.contextMenus.onClicked.addListener(contextMenusHandler)
//     }
//   })
//   .catch(function(error) {
//     pong({ mode: 'ping', type: 'error', message: error })
//   })

window.chrome.runtime.onInstalled.addListener(installerHandler)
window.chrome.runtime.onMessage.addListener(pong)

main()
