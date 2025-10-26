<template>
  <ul>
    <li v-for="p in sortedPlayers" :key="p.id" class="flex justify-between py-1">
      <span>{{ p.username }} <small v-if="p.id===userId">(Vous)</small></span>
      <span>
        Total: {{ p.totalScore || 0 }}
        <span v-if="p.submittedScore !== null && typeof p.submittedScore !== 'undefined'"> — {{ isPlayerScoreAutoFilled(p.id) ? "Calculé" : "Soumis"}}: {{ p.submittedScore }}</span>
      </span>
    </li>
  </ul>
</template>

<script>
export default {
  name: 'PlayerList',
  props: {
    players: {
      type: Array,
      default: () => []
    },
    pending: {
      type: Object,
      default: () => ({})
    },
    userId: {
      type: String,
      default: null
    }
  },
  computed: {
    sortedPlayers() {
      console.log(this.pending)
      return this.players.slice().sort((a, b) => a.totalScore - b.totalScore)
    }
  },
  methods: {
    isPlayerScoreAutoFilled(playerId) {
      if (!this.pending || !this.pending.scores) return false
      const scoreEntry = this.pending.scores.find(s => s.id === playerId)
      return scoreEntry ? !!scoreEntry.autoFilled : false
    }
  }
}
</script>

<style scoped>
ul { margin: 0; padding: 0; list-style: none; }
li { display: flex; justify-content: space-between; }
</style>

