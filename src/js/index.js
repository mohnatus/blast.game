import 'babel-polyfill';

import Game from '../components/game.component.vue';

import './../fonts/marvin.scss';
import './../sass/styles.scss';

import Vue from 'vue/dist/vue.js';

new Vue({
    el: "#game",
    components: { Game }
});
