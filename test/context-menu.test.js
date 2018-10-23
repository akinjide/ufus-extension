import test from 'ava'
import sinon from 'sinon'
import pImmediate from 'p-immediate'
import Exception from '../extension/src/Exception'
import ContextMenus from '../extension/src/ContextMenus'

test.beforeEach(t => {
  t.context.contextMenus = new ContextMenus(window)

  window.chrome.contextMenus.create.yieldsAsync()
  window.chrome.contextMenus.update.yieldsAsync()
  window.chrome.contextMenus.remove.yieldsAsync()
  window.chrome.runtime.lastError = null
})

test('#create resolves and attach context', async t => {
  const services = t.context
  const options = {
    'id': '0000',
    'title': 'title',
    'contexts': ['page']
  }

  await services.contextMenus.create(options)

  t.true(window.chrome.contextMenus.create.called)
  t.true(window.chrome.contextMenus.create.calledWith(options))
})

test('#create rejects request to attach context if runtime lastError is not null', async t => {
  const services = t.context

  await pImmediate()

  window.chrome.runtime.lastError = new Exception('LRUNTIME_ERR', 'contextMenus.create: Cannot create item with duplicate id')
  await t.throws(services.contextMenus.create('0000'))
})

test('#update resolves and update attached context', async t => {
  const services = t.context
  const options = {
      id: '0000',
      params: {
        'title': 'title'
      }
  }

  await services.contextMenus.update(options.id, options.params)

  t.true(window.chrome.contextMenus.update.calledOnce)
  t.true(window.chrome.contextMenus.update.called)
  t.true(window.chrome.contextMenus.update.calledWith(options.id, Object.assign(options.params, { visible: true })))
})

test('#remove resolves and delete context', async t => {
  const services = t.context
  const id = '000'

  await services.contextMenus.remove(id)

  t.true(window.chrome.contextMenus.remove.called)
  t.true(window.chrome.contextMenus.remove.calledWith(id))
})