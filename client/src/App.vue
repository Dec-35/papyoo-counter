<template>
  <div id="app">
    <main class="w-full flex flex-col items-center p-4 gap-2 h-full max-w-[600px] mx-auto max-h-dvh h-dvh overflow-hidden">
      <img src="@assets/tallLogo.png" alt="" width="200">
      <router-view/>
    </main>
  </div>
</template>

<script>
export default {
  name: 'App',
}
</script>
