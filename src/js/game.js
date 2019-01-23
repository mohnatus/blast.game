import { Field } from './field.js';
import { defaultSettings } from './default.js';
import { HTMLBinder } from './html-binder.js';

export class Game {

    constructor(config) { // настройки игры
        this.default = defaultSettings; // настройки игры по умолчанию

        new HTMLBinder(this, 'data-bind', [
            'roundPoints', 'points', 'steps'
        ]);

        this.steps = 15;
        this.points = 0;
        this.roundPoints = 1000;
      
        // создать игровое поле
        this.field = new Field({
            width: config.width || this.default.width,
            height: config.heigth || this.default.height,
            colors: config.colors || this.default.colors,
            min: config.min || this.default.min,
            canvas: config.canvas,
        });

        this.field.subscribe('burn', count => {
            console.log(`${count} tiles has been burned`)
            this.steps--;

            this.points += this.countPoints(count);

            if (this.points >= this.roundPoints) this.finish();

            if (this.steps <= 0) this.finish();
        })
  
        // заполнить пустое поле случайными тайлами
        this.field.fill();
    }

    countPoints(count) {
        return count * 50;
    }

    finish() {
        console.log('finish')
    }
}
  