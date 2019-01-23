import { Point } from './point.js';
import { Tile } from './tile.js';
import { Canvas } from './canvas.js';

export class Field { // Игровое поле

    constructor(config) { // создание поля нужного размера
        this.cols = config.width; // количество колонок
        this.rows = config.height; // количество рядов
    
        this.colors = config.colors; // возможные цвета тайлов

        this.min = config.min;
    
        this.map = [];  // карта поля
    
        this.canvas = new Canvas(config.canvas); // канва для отрисовки
        this.canvas.subscribe('click', (data) => this.onClick(data));
    
        for (let y = 0; y < this.rows; y++) {
            this.map[y] = [];
    
            for (let x = 0; x < this.cols; x++) {
                this.map[y].push(null);
            }
        }

        console.log(this.map)
    }
    
    forEachCell(callback) { // перебор клеток поля
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
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
        console.log('fill', this.map)
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

        if (neighbors.length >= this.min) {
            this.canvas.burn(neighbors, () => {
                neighbors.forEach(point => {
                    this.map[point.y][point.x] = null;
                })
                this.canvas.draw(this.map);
                this.move();
            });
        }
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
                position.x > this.cols - 1 ||
                position.y > this.rows - 1
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

    move() {
        // все тайлы поднимаются вверх на свободные места
        let cols = [];
        this.forEachCell(point => {
            if (!cols[point.x]) cols[point.x] = [];
            cols[point.x][point.y] = this.map[point.y][point.x];
        })

        cols = cols.map((col, x) => {
            col = col.filter(cell => {
                if (!cell) return false;
                cell.from = cell.position;
                return cell;
            });
            for (let i = 0; i < this.rows; i++) {
                if (!col[i]) {
                    col[i] = null;
                    continue;
                }
                col[i].position = new Point(x, i);
            }
            return col;
        })

        cols.forEach((col, x) => {
            col.forEach((cell, y) => {
                this.map[y][x] = cell;
            })
        })

        this.canvas.move(this.map, () => this.canvas.fill())

    }
}