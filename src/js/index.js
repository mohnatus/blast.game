import 'babel-polyfill';

// import { Game } from './game.js';
import Game from '../components/game.component.vue';

import './../sass/styles.scss';

import Vue from 'vue/dist/vue.js';


new Vue({
    el: "#game",
    components: { Game }
})

// let canvas = document.getElementById('game-field');

// let game = new Game({
//     canvas: canvas
// });

// let restart = document.querySelector('.restart');
// let next = document.querySelector('.next-level');
// restart.addEventListener('click', () => game.restart());
// next.addEventListener('click', () => game.nextLevel());
