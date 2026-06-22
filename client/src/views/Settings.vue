<template>
  <div class="w-full max-w-[500px] mx-auto">
    <h1 class="text-2xl font-bold mb-6">Paramètres</h1>

    <div class="rounded-lg bg-white border border-gray-300 shadow-sm overflow-hidden">
      <div class="p-4 border-b border-gray-200">
        <div class="text-sm font-semibold text-gray-800 mb-1">Mon identifiant (UUID)</div>
        <div class="flex items-center gap-2">
          <code class="flex-1 text-xs bg-gray-100 rounded px-2 py-1.5 text-gray-700 break-all select-all">{{ currentUserId || '—' }}</code>
          <button
            type="button"
            class="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 transition-colors"
            :title="uuidCopied ? 'Copié !' : 'Copier'"
            @click="copyUuid"
          >
            <i :class="uuidCopied ? 'fa fa-check text-green-500' : 'fa fa-copy text-sm'"></i>
          </button>
        </div>
        <div class="text-xs text-gray-400 mt-1">Partage cet identifiant pour que quelqu'un puisse te retrouver sur le classement.</div>
      </div>

      <div class="p-4">
        <div class="text-sm font-semibold text-gray-800 mb-1">Fusionner un ancien compte</div>
        <div class="text-xs text-gray-500 mb-3">
          Tu as joué depuis un autre appareil ou navigateur ? Colle l'UUID de l'ancien compte — toutes ses parties seront rattachées à celui-ci.
        </div>
        <div class="flex gap-2">
          <input
            v-model="mergeFromId"
            type="text"
            placeholder="UUID de l'ancien compte..."
            class="flex-1 text-sm px-3 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-gray-400"
            :disabled="merging"
            @keydown.enter="mergeAccount"
          />
          <button
            type="button"
            class="px-3 py-2 text-sm font-medium rounded-lg bg-gray-900 text-white hover:bg-gray-700 disabled:opacity-40 transition-colors"
            :disabled="!mergeFromId.trim() || merging"
            @click="mergeAccount"
          >
            <i v-if="merging" class="fa fa-spinner fa-spin mr-1"></i>
            Fusionner
          </button>
        </div>
        <div v-if="mergeError" class="text-xs text-red-600 mt-2">{{ mergeError }}</div>
        <div v-if="mergeSuccess" class="text-xs text-green-700 mt-2">{{ mergeSuccess }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import StatsService from '../service/stats.js'

export default {
  name: 'Settings',
  data() {
    return {
      mergeFromId: '',
      merging: false,
      mergeError: null,
      mergeSuccess: null,
      uuidCopied: false,
    }
  },
  computed: {
    currentUserId() {
      return this.$root.userId || localStorage.getItem('userId') || null
    }
  },
  methods: {
    async copyUuid() {
      const id = this.currentUserId
      if (!id) return
      try {
        await navigator.clipboard.writeText(id)
      } catch {
        const el = document.createElement('input')
        el.value = id
        document.body.appendChild(el)
        el.select()
        document.execCommand('copy')
        document.body.removeChild(el)
      }
      this.uuidCopied = true
      setTimeout(() => { this.uuidCopied = false }, 2000)
    },
    async mergeAccount() {
      this.mergeError = null
      this.mergeSuccess = null
      const fromId = this.mergeFromId.trim()
      if (!fromId) return
      const toId = this.currentUserId
      if (!toId) { this.mergeError = 'Aucun compte actif trouvé.'; return }
      if (fromId === toId) { this.mergeError = 'UUID identique au compte actuel.'; return }
      this.merging = true
      try {
        const res = await StatsService.mergePlayer(fromId, toId)
        this.mergeSuccess = `${res.merged} partie(s) fusionnée(s) avec succès.`
        this.mergeFromId = ''
      } catch (e) {
        this.mergeError = e.message
      } finally {
        this.merging = false
      }
    }
  }
}
</script>
