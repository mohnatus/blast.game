<template>
  <div class="finish">
    <div class="status">{{ message }}</div>
    <div class="finish-button">
        <button class="restart" 
          v-on:click="$emit('restart')">Restart</button>
        <button class="next-level" 
          v-if="next"
          v-on:click="$emit('next')">Next Level</button>
    </div>
  </div>
</template>

<script>
export default {
  props: ['status', 'scores', 'target', 'maxLevel', 'level' ],
  computed: {
    message: function() {
      return this.scores >= this.target ? "Success" : "Fail"
    },
    next: function() {
      console.log(this.scores, this.target, this.maxLevel, this.level)
      return this.scores >= this.target && this.maxLevel >= this.level;
    }
  }
}
</script>