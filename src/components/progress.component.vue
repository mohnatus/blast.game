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
  props: ['points', 'target'],
  computed: {
    width: function() {
      return `${this.points / this.target * 100}%`
    },
  }
}
</script>