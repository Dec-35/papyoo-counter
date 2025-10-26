<template>
  <div id="app">
    <main class="w-full flex flex-col items-center px-4 pt-5 gap-2 h-full max-w-[600px] mx-auto">
      <img src="@assets/tallLogo.png" alt="" width="300">
      <router-view/>
    </main>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>
