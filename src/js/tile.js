import { statuses } from './statuses.js';

class Tile { // Тайл
    constructor(color) {
      this.color = color; // цвет тайла
      this.position = null; // позиция
      this.status = statuses.default; // статус тайла
    }
}

export { Tile }
