<script setup lang="ts">
import { useSiteSettings } from '@/composables/frontend/useSiteSettings'

const { settings } = useSiteSettings()

interface SocialBar {
  enable?: boolean
  centerImg?: string
  left?: Array<{ link: string; title: string; icon: string }>
  right?: Array<{ link: string; title: string; icon: string }>
}

interface FooterConfig {
  socialBar: SocialBar
  owner: { enable?: boolean; since?: number }
  runtime: { enable?: boolean; work_img?: string; work_description?: string }
  list: { enable?: boolean; project?: Array<{ title: string; links: Array<{ title: string; link: string }> }>; randomFriends?: number }
  bdageitem: { enable?: boolean; list?: Array<{ link: string; shields: string; message: string }> }
  footerBar: { enable?: boolean; linkList?: Array<{ link: string; text: string }>; cc?: { enable?: boolean; link?: string }; subTitle?: { enable?: boolean } }
  custom_text?: string
}

const footer = computed<FooterConfig>(() => (settings.value?.footer ?? {}) as FooterConfig)
const config = useRuntimeConfig()

// Runtime counter
const runtimeText = ref('')
let runtimeTimer: ReturnType<typeof setInterval> | null = null

function calcRuntime(since: number) {
  const start = new Date(since, 0, 1)
  const now = new Date()
  const diff = now.getTime() - start.getTime()
  const days = Math.floor(diff / 86400000)
  const years = Math.floor(days / 365)
  const remainingDays = days % 365
  const hours = now.getHours()
  const minutes = now.getMinutes()
  const seconds = now.getSeconds()
  return `本站已运行 ${years} 年 ${remainingDays} 天 ${String(hours).padStart(2, '0')} 时 ${String(minutes).padStart(2, '0')} 分 ${String(seconds).padStart(2, '0')} 秒`
}

onMounted(() => {
  if (footer.value.runtime?.enable && footer.value.owner?.since) {
    runtimeText.value = calcRuntime(footer.value.owner.since)
    runtimeTimer = setInterval(() => {
      if (footer.value.owner?.since) {
        runtimeText.value = calcRuntime(footer.value.owner.since)
      }
    }, 1000)
  }
})
onUnmounted(() => { if (runtimeTimer) clearInterval(runtimeTimer) })
</script>

<template>
  <footer id="footer" class="relative" :style="{
    background: 'linear-gradient(180deg, var(--anzhiyu-card-bg-none, transparent) 0%, var(--anzhiyu-card-bg) 25%)',
    backgroundAttachment: 'scroll',
    backgroundPosition: 'bottom',
    backgroundSize: 'cover',
  }">
    <div id="footer-wrap" class="relative text-center" :class="footer.footerBar?.enable ? 'pt-10 pb-0 px-5' : 'py-10 px-5'" style="color: var(--light-grey)">
      <!-- Social bar -->
      <div v-if="footer.socialBar?.enable" id="footer_deal" class="flex justify-center items-center">
        <!-- Left social links -->
        <a
          v-for="(item, i) in footer.socialBar.left ?? []"
          :key="'l'+i"
          :href="item.link"
          :title="item.title"
          class="deal_link"
        >
          <i v-if="item.icon?.startsWith('anzhiyu')" class="anzhiyufont" :class="item.icon" />
          <i v-else-if="item.icon?.startsWith('fa')" class="" :class="item.icon" />
          <svg v-else-if="item.icon?.startsWith('icon')" class="icon" aria-hidden="true"><use :xlink:href="'#'+item.icon" /></svg>
        </a>

        <!-- Center mini logo -->
        <img
          v-if="footer.socialBar.centerImg"
          class="footer_mini_logo"
          :src="footer.socialBar.centerImg"
          title="回到顶部"
          alt="回到顶部"
          size="50px"
          @click="window.scrollTo({ top: 0, behavior: 'smooth' })"
        />

        <!-- Right social links -->
        <a
          v-for="(item, i) in footer.socialBar.right ?? []"
          :key="'r'+i"
          :href="item.link"
          :title="item.title"
          class="deal_link"
        >
          <i v-if="item.icon?.startsWith('anzhiyu')" class="anzhiyufont" :class="item.icon" />
          <i v-else-if="item.icon?.startsWith('fa')" class="" :class="item.icon" />
          <svg v-else-if="item.icon?.startsWith('icon')" class="icon" aria-hidden="true"><use :xlink:href="'#'+item.icon" /></svg>
        </a>
      </div>

      <!-- Copyright (non-footerBar) -->
      <div v-if="footer.owner?.enable && !footer.footerBar?.enable" class="copyright text-sm mt-4">
        &copy;{{ footer.owner.since ? `${footer.owner.since} - ` : '' }}{{ new Date().getFullYear() }} By {{ config.public.siteName }}
      </div>

      <!-- Runtime counter -->
      <div v-if="footer.runtime?.enable" id="workboard" class="mt-4">
        <img v-if="footer.runtime.work_img" :src="footer.runtime.work_img" :alt="footer.runtime.work_description" :title="footer.runtime.work_description" class="workSituationImg boardsign mx-auto" />
        <div id="runtimeTextTip" class="text-sm mt-2">{{ runtimeText }}</div>
      </div>

      <!-- Custom text -->
      <div v-if="footer.custom_text" class="footer_custom_text text-sm mt-2" v-html="footer.custom_text" />

      <!-- Link groups -->
      <div v-if="footer.list?.enable" id="anzhiyu-footer" class="flex flex-row flex-wrap justify-between max-w-[1200px] mx-auto mt-4 px-8">
        <div v-for="(group, gi) in footer.list.project ?? []" :key="gi" class="footer-group min-w-[120px]">
          <div class="footer-title text-left font-semibold my-4">{{ group.title }}</div>
          <div class="footer-links flex flex-col">
            <a
              v-for="(link, li) in group.links"
              :key="li"
              :href="link.link"
              :title="link.title"
              class="footer-item text-sm leading-4 my-2 overflow-hidden text-ellipsis max-w-[120px] whitespace-nowrap cursor-pointer no-underline"
            >{{ link.title }}</a>
          </div>
        </div>

        <!-- Friend links section -->
        <div v-if="footer.list.randomFriends && footer.list.randomFriends > 0" class="footer-group min-w-[120px]">
          <div class="footer-title-group flex items-center">
            <div class="footer-title text-left font-semibold my-4">友情链接</div>
            <a class="random-friends-btn ml-2 leading-8 cursor-pointer" title="刷新友链" href="javascript:addFriendLinksInFooter();">
              <i class="anzhiyufont anzhiyu-icon-arrow-rotate-right text-base opacity-60" />
            </a>
          </div>
          <div id="friend-links-in-footer" class="footer-links flex flex-col" />
        </div>
      </div>

      <!-- Badges -->
      <p v-if="footer.bdageitem?.enable" id="ghbdages" class="mt-4">
        <a
          v-for="(badge, bi) in footer.bdageitem.list ?? []"
          :key="bi"
          class="github-badge inline-block mx-1"
          target="_blank"
          :href="badge.link"
          :data-title="badge.message"
          :title="badge.message"
        >
          <img :src="badge.shields" :alt="badge.message" />
        </a>
      </p>
    </div>

    <!-- Footer bar -->
    <div
      v-if="footer.footerBar?.enable"
      id="footer-bar"
      class="py-4 px-4 mt-4 flex overflow-hidden z-[1002] transition-all"
      style="color: var(--anzhiyu-fontcolor); background: var(--anzhiyu-secondbg)"
    >
      <div class="footer-bar-links flex justify-between max-w-[1400px] w-full mx-auto flex-wrap items-center leading-none">
        <div class="footer-bar-left flex flex-wrap items-center min-h-[32px]">
          <div id="footer-bar-tips" v-if="footer.owner?.enable">
            <div class="copyright text-sm">
              &copy;{{ footer.owner.since ? `${footer.owner.since} - ` : '' }}{{ new Date().getFullYear() }} By
              <a class="footer-bar-link font-bold text-sm whitespace-nowrap mr-4 no-underline" href="/" :title="config.public.siteName" target="_blank">{{ config.public.siteName }}</a>
            </div>
          </div>
          <div id="footer-type-tips" />
        </div>

        <div class="footer-bar-right flex flex-row flex-wrap items-center">
          <a
            v-for="(link, li) in footer.footerBar.linkList ?? []"
            :key="li"
            class="footer-bar-link font-bold text-sm whitespace-nowrap mr-4 mt-2 mb-2 no-underline"
            :href="link.link"
            :title="link.text"
          >{{ link.text }}</a>

          <!-- CC license -->
          <a
            v-if="footer.footerBar.cc?.enable"
            class="footer-bar-link cc font-bold text-sm mr-4 mt-2 mb-2 no-underline"
            :href="footer.footerBar.cc.link ?? '#'"
            title="CC 协议"
          >
            <i class="anzhiyufont anzhiyu-icon-copyright-line mr-1" />
            <i class="anzhiyufont anzhiyu-icon-creative-commons-by-line mr-1" />
            <i class="anzhiyufont anzhiyu-icon-creative-commons-nc-line mr-1" />
            <i class="anzhiyufont anzhiyu-icon-creative-commons-nd-line" />
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>
