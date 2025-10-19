<script>
import playerService from "./service/playerService.js";

export default {
  name: 'App',
  data() {
    return {
      message: '',
      players: [],
      suggestions: [],
      newPlayerName: ''
    }
  },
  mounted() {
    this.fetchPlayers();
  },
  methods: {
    fetchPlayers() {
      playerService.getPlayers().then((players) => {
        this.players = players;
      })
    },
    async createPlayer() {
      if (this.newPlayerName.trim() === '') return;
      await playerService.addPlayer(this.newPlayerName);
      this.newPlayerName = '';
      this.fetchPlayers();
    },
    async enablePlayer(id) {
      await playerService.enablePlayer(id);
      this.fetchPlayers();
      this.suggestions = [];
      this.newPlayerName = '';
    },
    getSuggestions(value) {
      playerService.getSuggestions(value).then((suggestions) => {
        this.suggestions = suggestions;
      })
    },
    async disablePlayer(id) {
      await playerService.disablePlayer(id);
      this.fetchPlayers();
    }
  },
  watch: {
    newPlayerName(value) {
      if(value.trim() === '') {
        this.suggestions = [];
        return;
      }
      this.getSuggestions(value);
    }
  }
}
</script>

<template>
  <main>
    <h1>Papayoo counter</h1>
    <h3 class="">Players</h3>
    <div class="flex flex-col gap-2 mb-2">
      <div v-for="player in players" class="bg-gray-500 flex justify-between items-center px-2 rounded py-1 text-white" :key="player.id">
        <p>{{ player.username }}</p>
        <button @click="disablePlayer(player.id)">x</button>
      </div>
    </div>
    <div class="flex gap-4">
      <div class="relative">
        <input type="text" v-model="newPlayerName" @keydown.enter="createPlayer">
        <div v-if="suggestions.length > 0" class="absolute top flex flex-col gap-1 w-full mt-1 bg-white p-1 rounded-md">
            <div class="bg-gray-200 text-black px-2 py-1 w-full text-left rounded-sm hover:bg-gray-300 cursor-pointer" v-for="suggestion in suggestions" @click="enablePlayer(suggestion.id)">{{ suggestion.username }}</div>
        </div>
      </div>
      <button @click="createPlayer">Add player</button>
    </div>
  </main>
</template>

<style>
main {
  font-family: Arial, sans-serif;
  text-align: center;
  padding: 2rem;
}
button {
  padding: 0.5rem 1rem;
  font-size: 1rem;
  cursor: pointer;
}

input {
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid white;
}
</style>
