<template>
  <canvas id="game-field" v-bind:width="width"></canvas>
</template>

<script>
export default {
  props: ['width']
}
</script>