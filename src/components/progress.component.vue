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

<style lang="scss">
  $radius: 15px;
  .progress {
    width: 100%;
    padding: 10px 20px 20px;

    background: linear-gradient(to bottom, #0a264a, #103d79);
    color: white;
    border-radius: 0 0 $radius $radius;

    text-align: center;
    font-size: 24px;

    &-line {
        width: 100%;
        height: 30px;
        margin-top: 5px;

        border-radius: $radius;
        background: linear-gradient(to bottom, #000f24, #032655);
        box-shadow: 0 1px 3px  #3186f9; 
    }

    &-value {
        width: 0%;
        height: 100%;
        border-radius: $radius;
        background: linear-gradient(to bottom,
            #ecffcc 0%, 
            #a2ff00 23%, 
            #1d9b00 68%,
            #60ff00 99%
        );

        transition: width 800ms;
        transition-delay: 400ms;

    }
  }
</style>


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