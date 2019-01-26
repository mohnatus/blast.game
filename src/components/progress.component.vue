<template>
  <div class="progress" >
        Прогресс 
        <div class="progress-line">
            <div class="progress-value"
              v-bind:style='{width: width}'
            ></div>
        </div>
    </div>
</template>

<script>
export default {
  props: ['scores', 'target'],
  computed: {
    width: function() {
      return `${Math.min(this.scores / this.target, 1) * 100}%`
    },
  }
}
</script>