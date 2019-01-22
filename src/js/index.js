import 'babel-polyfill';

import { Game } from './game.js';

import './../sass/styles.scss';

let canvas = document.getElementById('game');
let game = new Game({
    canvas: canvas
});
