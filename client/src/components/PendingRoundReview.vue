<template>
  <div class="mt-3 text-center border py-8 rounded">
    <div v-if="playerScore">
      Votre score : <b>{{ playerScore.score }}</b>
      <span v-if="playerScore.autoFilled" class="text-sm text-gray-500">(auto-calculé)</span>
    </div>

    <div class="mt-2 flex gap-2 justify-center">
      <!-- If the current user's score was auto-filled, show validation/rejection buttons -->
      <template v-if="playerScore && playerScore.autoFilled && !isReady">
        <button
          @click="$emit('ready')"
          class="btn-main">
          Valider le score
        </button>
        <button
          @click="$emit('reject')"
          class="btn-danger">
          Rejeter
        </button>
      </template>

      <!-- If the user submitted manually or is ready -->
      <div v-else class="text-sm">
        En attente des autres joueurs ({{ pending.ready.length }}/{{ playersCount }} prêts)
      </div>
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
    },
    playerScore() {
      if (!this.pending || !this.pending.scores) return null
      return this.pending.scores.find(s => s.id === this.userId) || null
    }
  }
}
</script>

<style scoped>
ul { margin: 0; padding: 0; list-style: none; }
.btn-danger {
  background-color: #ef4444;
  color: white;
  font-weight: bold;
  padding: 0.5rem 1rem;
  border: none;
  cursor: pointer;
}
.btn-danger:hover {
  background-color: #dc2626;
}
</style>
