import 'babel-polyfill';

import Game from '../components/game.component.vue';

import './../fonts/marvin.scss';
import './../sass/styles.scss';

import Vue from 'vue/dist/vue.js';

new Vue({
    el: "#game",
    template: `<Game v-bind:startLevel="startLevel" />`,
    components: { Game },
    data: function() {
        return {
            startLevel: localStorage.getItem('blast-level') || 1,
        }
    }
});
