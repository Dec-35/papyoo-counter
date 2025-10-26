<script>
import GameService from "./service/GameService.js";

export default {
  name: 'App',
  data() {
    return {
      username: null,
      gameDto: null,
      userId: null,
      ws: null,
      scoreInput: '',
      wsConnected: false,
      reconnectAttempts: 0,
    }
  },
  mounted() {
    // initialize userId and username from localStorage
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      this.username = storedUsername;
    }

    let storedId = localStorage.getItem('userId')
    if (!storedId) {
      storedId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`
      localStorage.setItem('userId', storedId)
    }
    this.userId = storedId

    this.setupWebSocket()
    this.getGameState();
  },
  methods: {
    async getGameState() {
      try {
        const data = await GameService.getGameStatus(this.userId)
        // backend returns { game: null } when no game, otherwise the game object directly
        if (data && Object.prototype.hasOwnProperty.call(data, 'game')) {
          this.gameDto = data.game
        } else if (data && data.id) {
          this.gameDto = data
        } else {
          this.gameDto = null
        }
      } catch (e) {
        console.error('Failed to fetch game state', e)
        this.gameDto = null
      }
    },

    async joinGame(){
      if(!this.username || this.username.trim().length === 0) {
        alert("Veuillez entrer un nom valide.");
        return;
      }
      const usernameTrimmed = this.username.trim()
      localStorage.setItem('username', usernameTrimmed);

      try {
        if(!this.isGameRunning) {
          // start a new game
          await GameService.startGame(this.userId, usernameTrimmed)
        } else {
          // join existing game
          await GameService.joinGame(this.userId, usernameTrimmed)
        }
        // fetch updated state
        await this.getGameState()
      } catch (err) {
        console.error(err)
        alert(err.message || 'Erreur lors de la tentative de rejoindre/démarrer la partie')
      }
    },

    async submitScore() {
      const raw = this.scoreInput
      if (raw === null || raw === undefined || raw === '') {
        alert('Entrez un score valide')
        return
      }
      const num = Number(raw)
      if (Number.isNaN(num)) { alert('Score doit être un nombre'); return }

      try {
        await GameService.postScore(this.userId, num)
        this.scoreInput = ''
        await this.getGameState()
      } catch (e) {
        console.error(e)
        alert('Impossible d\'envoyer le score')
      }
    },

    async nextRound(){
      try {
        await GameService.nextRound()
        await this.getGameState()
      } catch (e) {
        console.error(e)
        alert('Impossible de passer au tour suivant')
      }
    },

    setupWebSocket() {
      const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
      const wsUrl = `${protocol}://${window.location.host}/ws`

      try {
        this.ws = new WebSocket(wsUrl)
      } catch (e) {
        console.warn('WebSocket init failed', e)
        return
      }

      this.ws.addEventListener('open', () => {
        this.wsConnected = true
        this.reconnectAttempts = 0
        console.log('WS connected')
      })

      this.ws.addEventListener('message', (ev) => {
        try {
          const msg = JSON.parse(ev.data)
          // On any game:update ping, refresh state
          if (msg && (msg.type === 'game:update' || msg.type === 'connected')) {
            this.getGameState()
          }
        } catch (e) {
          // ignore non-json messages
        }
      })

      this.ws.addEventListener('close', () => {
        this.wsConnected = false
        // attempt reconnect with backoff
        this.reconnectAttempts += 1
        const delay = Math.min(30000, 500 * this.reconnectAttempts)
        setTimeout(() => this.setupWebSocket(), delay)
      })

      this.ws.addEventListener('error', (e) => {
        // log and let close handler handle reconnect
        console.warn('WS error', e)
      })
    },

    async leaveGame() {
      try {
        await GameService.leaveGame(this.userId)
        // clear local player view
        await this.getGameState()
      } catch (e) {
        console.error(e)
        alert('Impossible de quitter la partie')
      }
    },

    async markReady() {
      try {
        await GameService.ready(this.userId)
        await this.getGameState()
      } catch (e) {
        console.error(e)
        alert('Impossible de confirmer la validation')
      }
    }
  },
  computed: {
    isGameRunning(){
      // return true if a game currently running based on gameDto
      return !!(this.gameDto && this.gameDto.status === 'running')
    },

    playerInGame(){
      if (!this.gameDto || !this.gameDto.players) return null
      return this.gameDto.players.find(p => p.id === this.userId) || null
    },

    isReady(){
      if (!this.gameDto || !this.gameDto.pendingRound) return false
      const ready = this.gameDto.pendingRound.ready || []
      return ready.includes(this.userId)
    }
  }
}
</script>

<template>
  <main class="w-full flex flex-col items-center px-4 pt-5 gap-2 h-full max-w-[600px] mx-auto">
    <img src="@assets/tallLogo.png" alt="" width="300">
    <div class="grow w-80 flex flex-col justify-center gap-2">
      <h3 class="mt-5 font-[jaro] text-lg w-full">Qui joue ?</h3>
      <input type="text" v-model="username"
             placeholder="Entrez votre nom..." class="w-full rounded-full! px-4! z-20 relative mb-4">

      <button class="btn-main w-full py-2.5!" @click="joinGame" @keydown.enter="joinGame">
        {{ isGameRunning ? 'Rejoindre la partie' : 'Démarrer une partie' }}
        <i class="fa fa-play-circle ml-2"/>
      </button>

      <div v-if="gameDto" class="mt-4 bg-white p-3 rounded shadow w-full">
        <div class="flex justify-between items-center mb-2">
          <strong>Partie en cours (tour {{ gameDto.currentRound }})</strong>
          <span class="text-sm">Status: {{ gameDto.status }}</span>
        </div>
        <ul class="mb-3">
          <li v-for="p in gameDto.players" :key="p.id" class="flex justify-between">
            <span>{{ p.username }} <small v-if="p.id===userId">(Vous)</small></span>
            <span>
              Total: {{ p.totalScore || 0 }}
              <span v-if="p.submittedScore !== null && typeof p.submittedScore !== 'undefined'"> — Soumis: {{ p.submittedScore }}</span>
            </span>
          </li>
        </ul>

        <div v-if="playerInGame">
          <!-- Always allow score input when player is in game and no pendingRound exists -->
          <div v-if="!gameDto.pendingRound" class="flex gap-2 items-center">
            <input type="number" v-model="scoreInput" placeholder="Entrez votre score" class="flex-1" />
            <button @click="submitScore" class="btn-main">Soumettre</button>
            <button @click="leaveGame" class="btn-secondary">Leave</button>
          </div>

          <!-- When a pendingRound exists, show the summary and allow players to confirm (ready) -->
          <div v-else class="mt-3 border p-2 rounded">
            <strong>Round {{ gameDto.pendingRound.roundNumber }} — Vérifier les scores</strong>
            <ul class="mt-2">
              <li v-for="s in gameDto.pendingRound.scores" :key="s.id" class="flex justify-between">
                <span>{{ s.username }} <small v-if="s.id===userId">(Vous)</small></span>
                <span>{{ s.score }}</span>
              </li>
            </ul>
            <div class="mt-2 flex gap-2">
              <button @click="markReady" :disabled="isReady" class="btn-main">{{ isReady ? 'Ready ✓' : 'Ready' }}</button>
              <button @click="leaveGame" class="btn-secondary">Leave</button>
            </div>
            <div class="text-sm mt-2">
              <span>Validés: {{ (gameDto.pendingRound.ready || []).length }} / {{ gameDto.players.length }}</span>
            </div>
          </div>
         </div>

         <div v-else class="text-sm mt-2">Vous n'êtes pas encore dans cette partie.</div>
       </div>

     </div>
     <button class="btn-secondary w-80 mb-20">
       Leaderboard
       <i class="fa fa-medal ml-2"/>
     </button>
   </main>
 </template>

 <style>

 button {
   padding: 0.5rem 1rem;
   font-size: 1rem;
   cursor: pointer;
 }

 </style>
