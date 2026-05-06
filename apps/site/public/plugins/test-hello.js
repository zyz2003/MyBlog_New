// Test Hello Plugin - client-side script
(function () {
  if (document.getElementById('plugin-test-hello')) return

  var el = document.createElement('div')
  el.id = 'plugin-test-hello'
  el.style.cssText = 'position:fixed;bottom:16px;right:16px;background:#3B82F6;color:#fff;padding:10px 16px;border-radius:8px;font-size:14px;box-shadow:0 4px 12px rgba(0,0,0,0.15);z-index:9999;cursor:pointer;font-family:system-ui,sans-serif;'
  el.textContent = 'Hello from plugin!'
  el.title = 'Click to close'
  el.onclick = function () { el.remove() }

  document.body.appendChild(el)
})()
