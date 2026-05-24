<script setup lang="ts">
const { chatTools } = useSiteSettings()

const visible = ref(true)
const mounted = ref(false)

function injectInlineScript(content: string, id: string) {
  if (document.getElementById(id)) {
    return
  }
  const script = document.createElement('script')
  script.id = id
  script.innerHTML = content
  document.body.appendChild(script)
}

async function loadExternalScript(src: string, id: string) {
  if (document.getElementById(id)) {
    return
  }
  await new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.id = id
    script.src = src
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Failed to load ${id}`))
    document.body.appendChild(script)
  })
}

async function initChatServices() {
  if (!import.meta.client) {
    return
  }

  if (chatTools.value.chatra.enable && chatTools.value.chatra.id) {
    injectInlineScript(`(function(d, w, c) {
      w.ChatraID = '${chatTools.value.chatra.id}';
      var s = d.createElement('script');
      w[c] = w[c] || function() { (w[c].q = w[c].q || []).push(arguments); };
      s.async = true; s.src = 'https://call.chatra.io/chatra.js';
      if (d.head) d.head.appendChild(s);
    })(document, window, 'Chatra');`, 'chatra-inline')
  }

  if (chatTools.value.tidio.enable && chatTools.value.tidio.publicKey) {
    injectInlineScript(`window.tidioChatApi = window.tidioChatApi || {}; window.tidioChatApi.project = '${chatTools.value.tidio.publicKey}';`, 'tidio-inline')
    await loadExternalScript('//code.tidio.co/external.js', 'tidio-script').catch(() => {})
  }

  if (chatTools.value.daovoice.enable && chatTools.value.daovoice.appId) {
    injectInlineScript(`(function(i,s,o,g,r,a,m){i['DaoVoiceObject']=r;i[r]=i[r]||function(){(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)})(window,document,'script','https://widget.daovoice.io/widget/${chatTools.value.daovoice.appId}.js','daovoice');`, 'daovoice-inline')
  }

  if (chatTools.value.crisp.enable && chatTools.value.crisp.websiteId) {
    injectInlineScript(`window.$crisp=[];window.CRISP_WEBSITE_ID='${chatTools.value.crisp.websiteId}';`, 'crisp-inline')
    await loadExternalScript('https://client.crisp.chat/l.js', 'crisp-script').catch(() => {})
  }
}

function openChat() {
  const win = window as Window & {
    $crisp?: unknown[]
    Chatra?: { openChat?: () => void }
    tidioChatApi?: { open?: () => void }
    daovoice?: (...args: unknown[]) => void
  }

  if (chatTools.value.crisp.enable && win.$crisp) {
    win.$crisp.push(['do', 'chat:open'])
    return
  }
  if (chatTools.value.chatra.enable && win.Chatra?.openChat) {
    win.Chatra.openChat()
    return
  }
  if (chatTools.value.tidio.enable && win.tidioChatApi?.open) {
    win.tidioChatApi.open()
    return
  }
  if (chatTools.value.daovoice.enable && win.daovoice) {
    win.daovoice('open')
  }
}

onMounted(() => {
  mounted.value = true
  initChatServices()
  if (chatTools.value.chatHideShow) {
    let lastTop = window.scrollY
    window.addEventListener('scroll', () => {
      const currentTop = window.scrollY
      visible.value = currentTop <= lastTop || currentTop < 120
      lastTop = currentTop
    }, { passive: true })
  }
})
</script>

<template>
  <button
    v-if="mounted && chatTools.chatBtn && (chatTools.chatra.enable || chatTools.tidio.enable || chatTools.daovoice.enable || chatTools.crisp.enable)"
    v-show="visible"
    type="button"
    class="fixed right-6 bottom-28 z-[70] inline-flex h-12 w-12 items-center justify-center rounded-full border border-[var(--style-border-always)] bg-[var(--anzhiyu-card-bg)] text-[var(--anzhiyu-main)] shadow-[var(--anzhiyu-shadow-main)] transition hover:-translate-y-1"
    @click="openChat"
  >
    <i class="anzhiyufont anzhiyu-icon-comment-dots text-lg" />
  </button>
</template>
