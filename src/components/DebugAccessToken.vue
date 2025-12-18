<template>
  <div class="p-4">
    <button
      @click="logToken"
      class="px-4 py-2 rounded bg-blue-600 text-white"
    >
      mostrar access_token
    </button>
  </div>
</template>

<script setup lang="ts">
const logToken = () => {
  const token = localStorage.getItem('access_token')

  if (!token) {
    console.warn('nenhum access_token encontrado no localstorage')
    return
  }

  console.log('access_token:', token)
}
</script>
