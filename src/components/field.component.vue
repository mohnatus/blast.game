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
import { statuses } from '../js/statuses.js'; // доступные статусы тайлов

export default {
    components: { 
      'game-canvas': Canvas
    },

    props: ['gameActive'],
    
    data: function() {
        return {
        map: [], // матрица поля
        colors: [], // цвета тайлов

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

            this.$refs.canvas.draw(this.map, () => this.active = true);
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
            console.log('field click', position, this.active, this.gameActive)

            if (!this.active || !this.gameActive) return;

            this.active = false; // деактивировать поле, пока выбираются тайлы для удаления

            // тайл, по которому кликнули
            let tile = this.map[position.y][position.x];

            let targets;

            console.log('tile', tile)

            // если супертайл, собрать всю колонку

            // если обычный тайл, собрать соседей
            targets = this.getNeighbors(position);

            console.log('targets', targets)

            // если группа меньше минимальной 
            if (targets.length < this.min) {
                this.active = true;
                return;
            };



            // удалить группу тайлов из матрицы
            this.$refs.canvas.delete(this.map, targets, () => {
                // удалить тайлы из матрицы после удаления с поля
                targets.forEach(point => {
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

        // собрать колонку
        getColumn: function(position) {

        },

        // собрать группу тайлов одного цвета
        getNeighbors: function(position) {

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
    }
}
</script>