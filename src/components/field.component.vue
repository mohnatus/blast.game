<template>
  <game-canvas ref="canvas"
    v-on:ready="$emit('ready')"
    v-on:tile-click="onClick" />
</template>

<script>
import Canvas from './canvas.component.vue';

import { Point } from '../js/point.js'; // модель точки/позиции на поле
import { Tile } from '../js/tile.js'; // модель тайла

import { levels } from '../js/levels.js'; // настройки уровней
import { statuses, actions } from '../js/statuses.js'; // доступные статусы тайлов

export default {
    components: { 
      'game-canvas': Canvas
    },

    props: ['gameActive', 'bonus'],
    
    data: function() {
        return {
        map: [], // матрица поля
        colors: [], // цвета тайлов
        bombRadius: 1, // радиус действия бомбы

        superCount: 5, // количество тайлов для появления супертайла

        active: false, // поле неактивно, пока идут анимации
        }
    },

    methods: {
        // инициализировать поле с новыми настройками
        update: function(settings) {
            this.rows = settings.rows;
            this.cols = settings.cols;
            this.min = settings.min;

            this.colors = settings.colors; // отобрать цвета для уровня

            this.bombRadius = settings.bombRadius || 1; 
            this.superCount = settings.superCount || this.superCount;

            this.map = []; // собрать матрицу игрового поля
            for (let y = 0; y < this.rows; y++) {
                this.map[y] = [];
                for (let x = 0; x < this.cols; x++) {
                    this.map[y].push(null);
                }
            }

            this.$refs.canvas.update(settings)
        },

        // начать уровень
        start: function() {
            // заполнить поле
            this.fill();
        },

        // заполнение пустых клеток
        fill: function() { 
            this.forEachCell(point => {
                let cell = this.map[point.y][point.x];

                if (!cell) { // если клетка пустая
                    let tile = this.getTile(); // создать новый тайл
                    tile.position = point;
                    tile.status = statuses.default;
                    this.map[point.y][point.x] = tile;
                }
            });

            if (this.check()) {
                this.$refs.canvas.draw(this.map, () => this.active = true);
            }
                
            else this.mix();
        },

        // проверить, есть ли доступные комбинации
        check: function() {
            let counter = 0;
            let availableGroups = false;

            let check = (position, color) => {
                if (counter >= this.min) return true;
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

                counter++; // увеличить счетчик
                
                currentTile.checked = true; // пометить тайл как проверенный

                check(new Point(position.x - 1, position.y), color);
                check(new Point(position.x + 1, position.y), color);
                check(new Point(position.x, position.y - 1), color);
                check(new Point(position.x, position.y + 1), color);
            }

            stop: for (let y = 0; y < this.rows; y++) {
                for (let x = 0; x < this.cols; x++) {

                    let tile = this.map[y][x];
                    
                    if (tile.status == statuses.super) return true;

                    counter = 0;
                    check(tile.position, tile.color)
                    if (counter >= this.min) {
                        availableGroups = true;
                        break stop;
                    }
                    //if (check(tile.position, tile.color)) { return true};

                }
            }

            this.clearChecked();

            return availableGroups;
        },

        // перебор клеток поля
        forEachCell: function(callback) { 
            for (let y = 0; y < this.rows; y++) {
                for (let x = 0; x < this.cols; x++) {
                    callback(new Point(x, y));
                }
            }
        }, 
            
        // выбрать случайным образом цвет тайла
        getColor: function() {
            let index = Math.floor(Math.random() * this.colors.length);
            return this.colors[index];
        },
        
        // создать тайл нужного/случайного цвета
        getTile: function(color) {
            return new Tile(color || this.getColor());
        },

        // клик по тайлу
        onClick: function(position) {
            if (!this.active || !this.gameActive) return;

            this.active = false; // деактивировать поле, пока выбираются тайлы для удаления

            let targets = [];
            // тайл, по которому кликнули
            let tile = this.map[position.y][position.x];
            if (!tile) {
                this.active = true;
                return;
            }

            // супертайл
            if (tile.status == statuses.super) {
                let row = this.getRow(position);
                tile.action = actions.default;
                this.targetChecked = true;
                targets = [...targets, ...row];
            }

            if (this.bonus == 'bomb') {
                let radius = this.getRadius(position, this.bombRadius, actions.bomb);
                targets = [...targets, ...radius];
            }

            // если обычный тайл и нет бомбы, собрать соседей
            if (!targets.length) {
                targets = this.getNeighbors(position, actions.default);

                // если группа меньше минимальной 
                if (targets.length < this.min) {
                    this.active = true;
                    return;
                };

                if (targets.length >= this.superCount) {
                    tile.status = statuses.super;
                    tile.action = actions.super;
                }
            } 

            this.clearChecked();

            targets.forEach(cell => {
                if (cell.x == position.x && cell.y == position.y) return;
                let tile = this.map[cell.y][cell.x];
                
                if (tile.status == statuses.super) {
                    if (tile.action == actions.super)
                        tile.action = actions.default;
                    let row = this.getRow(tile.position);
                    targets = [...targets, ...row];
                }
            })

            // удалить группу тайлов из матрицы
            this.$refs.canvas.delete(this.map, targets, () => {
                if (this.bonus) this.$emit('bonusApplied');
                // удалить тайлы из матрицы после удаления с поля
                targets.forEach(point => {
                    let tile = this.map[point.y][point.x];
                    if (!tile) return;
                    if (tile.action !== actions.super)
                        this.map[point.y][point.x] = null;
                })
                // отправить событие в игру
                this.$emit('delete', targets.length);
                // перерисовать поле с пустыми клетками
                this.$refs.canvas.draw(this.map);
                // передвинуть тайлы
                this.move();
            });
        },

        clearChecked: function() {
            this.forEachCell((position) => this.map[position.y][position.x].checked = false)
        },

        // собрать ряд
        getRow: function(position) {
            let row = this.map[position.y];
            return row.map((cell, ind) => new Point(ind, position.y));
        },

        // собрать группу тайлов одного цвета
        getNeighbors: function(position, action) {

            let tile = this.map[position.y][position.x];
            let color = tile.color;

            let neighbors = [];
            let checked = [];

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

                if (action) currentTile.action = action;

                neighbors.push(position); // добавить клетку в массив
                currentTile.checked = true; // пометить тайл как проверенный

                check(new Point(position.x - 1, position.y));
                check(new Point(position.x + 1, position.y));
                check(new Point(position.x, position.y - 1))
                check(new Point(position.x, position.y + 1))
            }
            
            check(position);

            this.clearChecked();

            return neighbors;
        },

        // собрать группу тайлов в радиусе действия бомбы 
        getRadius: function(position, radius, action) {
            let x1 = Math.max(position.x - radius, 0);
            let x2 = Math.min(position.x + radius, this.cols - 1);

            let y1 = Math.max(position.y - radius, 0);
            let y2 = Math.min(position.y + radius, this.rows - 1);

            let tiles = [];

            for (let y = y1; y <= y2; y++) {
                for (let x = x1; x <= x2; x++) {
                    if (action) this.map[y][x].action = action;
                    tiles.push(new Point(x, y));
                }
            }
            return tiles;
        },

        // передвинуть тайлы на место пустых
        move: function() {
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

            // отрисовать передвижение
            // после этого заполнить пустые клетки
            this.$refs.canvas.move(this.map, () => this.fill())
        },

        // перемешать поле
        mix: function() {
            // перемешать ряды
            this.map.sort(this.randomSort);

            // перемешать элементы в каждом ряду
            for (let y = 0; y < this.rows; y++) {
                let row = this.map[y];
                this.map[y].sort(this.randomSort);

                for (let x = 0; x < this.cols; x++) {
                    row[x].position = new Point(x, y);
                }
            }

            if (this.check()) {
                this.$refs.canvas.draw(this.map, () => this.active = true);
            } else this.mix();
        },

        randomSort: function(a, b) {
            return Math.random() - 0.5;
        }
    }
}
</script>