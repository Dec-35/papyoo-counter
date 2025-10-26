<template>
  <div class="mt-3 border p-2 rounded">
    <strong>Round {{ pending.roundNumber }} — Vérification des scores</strong>
    <ul class="mt-2">
      <li v-for="s in pending.scores" :key="s.id" class="flex justify-between py-1">
        <span>{{ s.username }} <small v-if="s.id===userId">(Vous)</small></span>
        <span>{{ s.score }}</span>
      </li>
    </ul>
    <div class="mt-2 flex gap-2">
      <button @click="$emit('ready')" :disabled="isReady" class="btn-main">Valider<i v-if="isReady" class="fa fa-check ml-2"/></button>
    </div>
    <div class="text-sm mt-2">
      <span>Validés: {{ (pending.ready || []).length }} / {{ playersCount }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PendingRoundReview',
  props: {
    pending: { type: Object, required: true },
    userId: { type: String, default: null },
    playersCount: { type: Number, default: 0 }
  },
  computed: {
    isReady() {
      if (!this.pending) return false
      return (this.pending.ready || []).includes(this.userId)
    }
  }
}
</script>

<style scoped>
ul { margin: 0; padding: 0; list-style: none; }
</style>

