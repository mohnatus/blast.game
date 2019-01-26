<template>
  <div class="finish">
    <div class="status" v-html="state.message"></div>
    <div class="finish-buttons">
        <button class="restart" 
          v-on:click="$emit('restart')">Попробовать снова</button>
        <button class="next-level" 
          v-if="state.next"
          v-on:click="$emit('next')">Следующий уровень</button>
        <button class="next-level" 
          v-if="state.new"
          v-on:click="$emit('new')">Начать сначала</button>
    </div>
  </div>
</template>

<script>
export default {
  props: ['status', 'scores', 'target', 'maxLevel', 'level' ],
  data: function() {
    return {
      states: {
        'finish': {
          'message': 'Супер!<br>Вы прошли игру!',
          'next': false,
          'restart': false,
          'new': true
        },
        'success': {
          'message': 'Уровень пройден!',
          'next': true,
          'restart': true,
          'new': false,
        },
        'fail': {
          'message': 'Вы проиграли :(',
          'next': false,
          'restart': true,
          'new': false,
        }
      }
    }
  },
  computed: {
    state: function() {
      if (this.scores < this.target) return this.states['fail'];
      if (this.maxLevel <= this.level) return this.states['finish'];
      return this.states['success'];
    }
  }
}
</script>