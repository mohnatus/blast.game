import { Field } from './field.js';
import { defaultSettings } from './default.js';
import { HTMLBinder } from './html-binder.js';

import '../fonts/marvin.scss';

export class Game {

    constructor(config) { // настройки игры
        this.default = defaultSettings; // настройки игры по умолчанию

        this.stopped = false; // игра окончена

        let binder = new HTMLBinder(
            this, 
            'data-bind', 
            [ 'roundPoints', 'points', 'steps' ]
        );
        binder.bindProp(
            this, 
            'data-progress', 
            'progress', 
            (el, val) => el.style.width = `${val}%`
        );

        this.steps = 15;
        this.points = 0;
        this.roundPoints = 1000;
        this.progress = this.points / this.roundPoints * 100;
      
        // создать игровое поле
        this.field = new Field({
            width: config.width || this.default.width,
            height: config.heigth || this.default.height,
            colors: config.colors || this.default.colors,
            min: config.min || this.default.min,
            canvas: config.canvas,
        });

        this.field.subscribe('burn', count => {
            this.steps--;

            this.points += this.countPoints(count);
            this.progress = this.points >= this.roundPoints ? 100 : this.points / this.roundPoints * 100;

            if (this.points >= this.roundPoints) this.finish();

            if (this.steps <= 0) this.finish();
        })
  
        // заполнить пустое поле случайными тайлами
        this.field.fill();
    }

    countPoints(count) {
        let base = count * 10; // за каждый удаленный тайл 10 очков
        if (count >=5 && count % 2) { // за 5, 7, 9, 11 и далее тайлов
            base += (Math.floor(count / 2) - 1) * 10;
        }
        return base;
    }

    finish() {
        console.log('finish')
    }
}
  