var services = require('./src')({
  ctx: window
})

document.addEventListener('DOMContentLoaded', function() {
  var activityIndicator = document.getElementById('activity-indicator')

  var Link = new services.Popup(window, services.store, services.storeSync, {
    id: 'link',
    type: 'value',
    eventKey: 'onPaste',
    event: 'paste',
    services: {
      activityIndicator: activityIndicator,
      DOM: {
        stack: {
          nerd: document.getElementById('nerd-stack'),
          normal: document.getElementById('normal-stack')
        },
        recents: document.getElementById('recents')
      }
    },
    onPaste: function(popup, e) {
      popup.services.activityIndicator.style.display = 'block'

      popupActionHandler(popup, e)
        .then(function(response) {
          refreshFrame(popup)
        })
        .catch(function(error) {
          popupBannerAlert(services.constants.ERROR.titles[error.name], popup)
        })
    }
  })

  new services.Popup(window, services.store, services.storeSync, {
    id: 'link-form',
    eventKey: 'onSubmit',
    event: 'submit',
    services: {
      activityIndicator: activityIndicator
    },
    onSubmit: function(popup, e) {
      e.preventDefault()
      popup.services.activityIndicator.style.display = 'block'

      popupActionHandler(Link, e)
        .then(function(response) {
          refreshFrame(Link)
        })
        .catch(function(error) {
          popupBannerAlert(services.constants.ERROR.titles[error.name], Link)
        })
    }
  })

  new services.Popup(window, services.store, services.storeSync, {
    id: 'clear',
    eventKey: 'onClick',
    event: 'click',
    onClick: function(popup, e) {
      popup.store.remove('recents')
      refreshFrame(Link)
    }
  })

  main(Link)
})

function popupActionHandler(popup, event) {
  return popup.storeSync.get('readActiveTab')
    .then(function(response) {
      if (response.readActiveTab) {
        popup.services.activityIndicator.style.display = 'block'
        return services.tabs.query({ active: true })
      }

      return Promise.resolve([])
    })
    .then(function(tab) {
      var URL;

      if ((tab && tab[0]) && !popup.element.value) {
        URL = popup.element.value = tab[0].url
        popup.element.select()
      } else {
        URL = popup.element.value || (event && event.clipboardData.getData('text'))
      }

      return new Promise(function (resolve, reject) {
        if (URL) {
          popup.element.disabled = true
          ping('process', { long_url: URL }, function(response) {
            if (response.error != null) {
              return reject(response.error)
            }

            resolve(response.data)
          })
        }
      })

    })
}

function refreshFrame(popup) {
  var recents = popup.read('recents')

  if (recents && recents[0]) {
    popup.storeSync.get('nerdsStack').then(function(response) {

      if (response.nerdsStack) {
        popup.services.DOM.stack.normal.style.display = 'none'
        popup.services.DOM.stack.nerd.innerHTML = JSON.stringify(recents, null, 2)
        popup.services.DOM.recents.style.display = 'block'
      } else {
        popup.services.DOM.stack.nerd.style.display = 'none'
        popup.services.DOM.stack.normal.innerHTML = null

        recents.forEach(function(obj, index) {
          popup.services.DOM.stack.normal.insertAdjacentHTML(
            'beforeend',
            '<div class="normal-stack-container" title="Click to copy shortened link">' +
              '<span id="requested-at">' + services.lib.datetime(obj.requested_at) + '</span>' +
              '<p id="long-url">' + services.lib.truncate(obj.long_url, 50) + '</p>' +
              '<p id="short-url">' + obj.short_url + '</p>' +
            '</div>'
          )

          if (recents.length == (index + 1)) {
            popup.services.DOM.recents.style.display = 'block'
            registerStackHandler()
          }
        })
      }

    })
  } else {
    popup.services.DOM.recents.style.display = 'none'
  }

  ping('info', { count: recents.length })
  popup.element.value = ''
  popup.element.disabled = false
  popup.services.activityIndicator.style.display = 'none'
}

function registerStackHandler() {
  [].slice.call(document.getElementsByClassName('normal-stack-container')).forEach(
    function(stack, index) {
      stack.style.cursor = 'pointer'
      stack.addEventListener('click', function(e) {
        popupBannerAlert('* <strong>' + stack.lastChild.textContent + '</strong> Copied!')
        ping('copy', stack.lastChild.textContent)
      })
    }
  )
}

function popupBannerAlert(message, popup) {
  var popupAlert = document.getElementById('popup-alert')

  if (popup) {
    popup.element.disabled = false
    popup.services.activityIndicator.style.display = 'none'
  }

  popupAlert.style.display = 'block'
  popupAlert.innerHTML = (message || 'Unknown error')

  setTimeout(function() { popupAlert.style.display = 'none' }, 2500)
}

function ping(type, message, callback) {
  window.chrome.runtime.sendMessage({
    mode: 'ping',
    type: type,
    message: message
  }, function(response) {
    if (window.chrome.runtime.lastError) {
      callback = callback || function() {}
      callback({ error: window.chrome.runtime.lastError })
    }

    if (response) {
      callback(response)
    }
  })
}

function main(popup) {
  refreshFrame(popup)

  popupActionHandler(popup).then(function(response) {
    refreshFrame(popup)
  })
  .catch(function(error) {
    popupBannerAlert(services.constants.ERROR.titles[error.name], popup)
  })
}
