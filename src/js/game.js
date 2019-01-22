import { Field } from './field.js';
import { defaultSettings } from './default.js';

export class Game {

    constructor(config) { // настройки игры
        this.default = defaultSettings; // настройки игры по умолчанию
      
        // создать игровое поле
        this.field = new Field({
            width: config.width || this.default.width,
            height: config.heigth || this.default.height,
            colors: config.colors || this.default.colors,
            min: config.min || this.default.min,
            canvas: config.canvas,
        });
  
        // заполнить пустое поле случайными тайлами
        this.field.fill();
    }

}
  