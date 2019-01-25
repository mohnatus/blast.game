<template>
  <div class="finish">
    <div class="status">{{ message }}</div>
    <div class="finish-button">
        <button class="restart">Restart</button>
        <button class="next-level">Next Level</button>
    </div>
  </div>
</template>

<script>
export default {
  props: ['status'],
  computed: {
    message: function() {
      return "hello" + this.status;
    }
  }
}
</script>