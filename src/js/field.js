import { Point } from './point.js';
import { Tile } from './tile.js';
import { Canvas } from './canvas.js';

export class Field { // Игровое поле

    constructor(config) { // создание поля нужного размера
        this.width = config.width; // количество рядов
        this.height = config.height; // количество колонок
    
        this.colors = config.colors; // возможные цвета тайлов
    
        this.map = [];  // карта поля
    
        this.canvas = new Canvas(config.canvas); // канва для отрисовки
        this.canvas.subscribe('click', (data) => this.onClick(data));
    
        for (let y = 0; y < this.height; y++) {
            this.map[y] = [];
    
            for (let x = 0; x < this.width; x++) {
                this.map[y].push(null);
            }
        }

        console.log(this.map)
    }
    
    forEachCell(callback) { // перебор клеток поля
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                callback(new Point(x, y));
            }
        }
    } 
    
    fill() { // заполнение пустых клеток
        this.forEachCell(point => {
            let cell = this.map[point.y][point.x];

            if (!cell) { // если клетка пустая
                let tile = this.getTile(); // создать новый тайл
                tile.position = point;
                this.map[point.y][point.x] = tile;
            }
        })

        this.canvas.draw(this.map);
    }
    
      // выбрать случайным образом цвет тайла
    getColor() {
        let index = Math.floor(Math.random() * this.colors.length);
        return this.colors[index];
    }
    
    // создать тайл нужного/случайного цвета
    getTile(color) {
        return new Tile(color || this.getColor());
    }

    onClick(position) {
        let neighbors = this.getNeighbors(position);
        console.log(neighbors);
        //this.burn(position)
    }

    getNeighbors(position) {
        
        let tile = this.map[position.y][position.x];
        if (!tile) return false;

        let color = tile.color;

        let neighbors = [];

        let check = (position) => {
            if ( // если клетка за пределами диапазона
                position.x < 0 ||
                position.y < 0 ||
                position.x > this.width - 1 ||
                position.y > this.height - 1
            ) return; // пропустить ее

            let currentTile = this.map[position.y][position.x]; // тайл с текущей позиции
            if (
                !currentTile || // если клетка пустая
                currentTile.checked || // или уже проверенная
                currentTile.color !== color // или цвет не совпадает
            ) return; // пропустить ее

            neighbors.push(position); // добавить клетку в массив
            currentTile.checked = true; // пометить тайл как проверенный

            check(new Point(position.x - 1, position.y));
            check(new Point(position.x + 1, position.y));
            check(new Point(position.x, position.y - 1))
            check(new Point(position.x, position.y + 1))
        }
        
        check(position);

        return neighbors;
    }
}