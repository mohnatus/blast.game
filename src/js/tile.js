let statuses = {
    'burning': 1, // сгорающий
    'empty': 2, // сгоревший
    'default': 3 // обычный
};

class Tile { // Тайл
    constructor(color) {
      this.color = color; // цвет тайла
      this.position = null; // позиция
      this.status = statuses.default; // статус тайла
    }
}

Tile.statuses = statuses;

export { Tile }
