<template>
    <canvas ref="canvas" id="game-field" 
        width="400"
        v-on:click="onClick"></canvas>
</template>

<script>
import { Point } from '../js/point.js';
import { Tile } from '../js/tile.js';
import { TileViewer } from '../js/tile-viewer.js';

export default {
    data: function() {
        return {
            ready: false, // все ресурсы загружены
            waiting: [], // коллбэки, ожидающие загрузки ресурсов

            ctx: null, // контекст для манипуляций
            position: null, // положение в документе для вычисления позиции клика
            
            width: 0, // реальная ширина канвы
            height: 0, // реальная высота канвы
            cols: 0,
            rows: 0,
            
            tileViewer: null,

            speed: 8,

            field: null
        }
    },

    created: function() {
        let requestAnimationFrame = 
            window.requestAnimationFrame || 
            window.mozRequestAnimationFrame ||
            window.webkitRequestAnimationFrame || 
            window.msRequestAnimationFrame;
        window.requestAnimationFrame = requestAnimationFrame;

        this.tileViewer = new TileViewer(() => this.$emit('ready'));
    },

    mounted: function() {
        this.ctx = this.ctx || this.$refs.canvas.getContext('2d');
        this.tileViewer.ctx = this.ctx;
        this.setPosition();
    },

    methods: {
        // установить и отслеживать положение канвы в документе
        setPosition: function() {
            let setPosition = () => {
                let canvasCoords = this.$refs.canvas.getBoundingClientRect()
                this.position = new Point(canvasCoords.left, canvasCoords.top);
            }
            setPosition(); // сохранить текущее положение канвы

            document.addEventListener('resize', (e) => {
                setPosition(); // сохранить текущее положение канвы
            });

            document.addEventListener('scroll', (e) => {
                setPosition();
            });
        },

        // обновить настройки канвы
        update: function(settings) {
            
            this.width = this.$refs.canvas.offsetWidth;

            this.cols = settings.cols;
            this.rows = settings.rows;

            this.tileViewer.setWidth(Math.floor(this.width / this.cols));

            this.$refs.canvas.height = this.height = this.tileViewer.height * this.rows;
        },

        // отрисовать все поле
        draw: function(field, callback) {
        
            if (!field || !field.length || !field[0].length) return;

            

            this.field = field; // сохранить матрицу

            // отрисовать каждый тайл
            for (let y = 0; y < this.rows; y++) {
                for (let x = 0; x < this.cols; x++) {
                    let tile = field[y][x];
                    if (!tile) return;
                    let coords =  this.getCoordsByPoint(tile.position); // координаты клетки
                    this.tileViewer.draw(tile, coords); 
                }
            }
            callback ? callback() : null;
        },

        // получить позицию игрового поля по координатам канвы
        getPointByCoords: function(coords) {
            let x = Math.floor(coords.x / this.tileViewer.width);
            let y = Math.floor(coords.y / this.tileViewer.height);
            return new Point(x, y);
        },

        // получить координаты клетки, соответствующей конкретной позиции игрового поля
        getCoordsByPoint: function(point) {
            let x1 = point.x * this.tileViewer.width;
            let x2 = x1 + this.tileViewer.width;

            let y1 = point.y * this.tileViewer.height;
            let y2 = y1 + this.tileViewer.height;
            
            return {
                x1, x2, y1, y2 
            };
        },

        // обработка клика по канве
        onClick: function($event) {
            let x = $event.clientX - this.position.x;
            let y = $event.clientY - this.position.y;
            let position = this.getPointByCoords(new Point(x, y));

            this.$emit('tile-click', position);
        },

        // удалить выбранные клетки с поля
        delete: function(field, cells, callback) {
            let deleted = [];
            let addDeleted = (ind) => {
                deleted.push(ind);
                // вызвать коллбэк, когда все тайлы удалятся
                if (deleted.length == cells.length) callback();
            }
            
            cells.forEach(
                (cell, ind) => {
                    let tile = field[cell.y][cell.x];
                    let coords = this.getCoordsByPoint(tile.position);
                    this.tileViewer.delete(
                        tile, 
                        coords,
                        () => addDeleted(ind)
                    )
                }
            );
        },

        

        // анимация перемещения тайлов
        move: function(field, callback) {
            this.field = field;

            let movingSet = [];
            field.forEach((row, y) => {
                row.forEach((tile, x) => {
                    if (!tile || !tile.from) return;
                    if (tile.from.x !== x || tile.from.y !== y ) {
                        tile.current = this.getCoordsByPoint(tile.from);
                        tile.destination = this.getCoordsByPoint(tile.position);
                        movingSet.push(tile);
                    }
                })
            })

            if (!movingSet.length) {
                callback();
                return;
            }

            let start = performance.now();

            let step = (timestamp) => {
                let next = false;
                movingSet.forEach(tile => {
                    if (!tile.current) return;
                    this.tileViewer.clear(tile.current);

                    tile.current.y1 -= this.speed;
                    tile.current.y2 -= this.speed;

                    let coords = tile.current;

                    if (tile.current.y1 <= tile.destination.y1) {
                        tile.current = null;
                        coords = this.getCoordsByPoint(tile.position);
                    } else {
                        next = true;
                    }
                    this.tileViewer.draw(tile, coords);

                })
                if (next) {
                    requestAnimationFrame(step);
                } else {
                    callback();
                }
            }

            requestAnimationFrame(step)
        }
    }
}
</script>