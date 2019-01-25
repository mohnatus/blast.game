<template>
  <canvas ref="canvas" id="game-field" 
    width="400"
    v-on:click="onClick"></canvas>
  <TileView target="tileView" v-on:ready="onReady" />
</template>

<script>
import { Point } from '../js/point.js';
import { Tile } from '../js/tile.js';

import { TileView } from '../js/tile-view.js';

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
    
      tileView: null,

      speed: {
        move: 10,
        remove: 5
      },

      field: null
    }
  },

  mounted: function() {
    this.ctx = this.ctx || this.$refs.canvas.getContext('2d');
    this.tileView = new TileView(() => this.onReady());
    this.setPosition();
  },
  
  methods: {
    // когда загружены ресурсы, очистить очередь ожидающих коллбэков
    onReady: function() {
      this.ready = true;
      this.waiting = this.waiting.filter(callback => {
        callback();
        return false;
      });
    },

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

      this.tileWidth.width = Math.floor(this.width / this.cols);
    },

    // отрисовать все поле
    draw: function(field, callback) {
      if (!field || !field.length || !field[0].length) return;

      this.field = field; // сохранить матрицу

      // очистить канву
      this.ctx.clearRect(0, 0, this.width, this.height);

      // отрисовать каждый тайл
      for (let y = 0; y < this.rows; y++) {
          for (let x = 0; x < this.cols; x++) {
              this.tileView.draw(field[y][x]); 
          }
      }

      callback ? callback() : null;
    },

    

    // очистить клетку поля
    clearArea: function(coords) {
        if (!coords) return;
        this.ctx.clearRect(
            coords.x1, coords.y1, 
            coords.x2 - coords.x1, coords.y2 - coords.y1
        );
    },

    // получить позицию игрового поля по координатам канвы
    getPointByCoords: function(coords) {
        let x = Math.floor(coords.x / this.tile.width);
        let y = Math.floor(coords.y / this.tile.height);
        return new Point(x, y);
    },

    // получить координаты клетки, соответствующей конкретной позиции игрового поля
    getCoordsByPoint: function(point) {
        let x1 = point.x * this.tile.width;
        let x2 = x1 + this.tile.width;

        let y1 = point.y * this.tile.height;
        let y2 = y1 + this.tile.height;
        
        return {
            x1, x2, y1, y2 
        };
    },

    // обработка клика по канве
    onClick: function($event) {
      console.log('clickevent', $event)
        let x = $event.clientX - this.canvasPosition.x;
        let y = $event.clientY - this.canvasPosition.y;
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
            (cell, ind) => this.deleteTile(
                field[cell.y][cell.x], 
                () => addDeleted(ind)
            )
        );
    },

    // анимация удаления тайла
    deleteTile: function(tile, callback) {

        // получить координаты клетки
        let coords = this.getCoordsByPoint(tile.position);

        let centerX = coords.x1 + this.tile.width / 2;
        let centerY = coords.y2 - this.tile.height / 2;

        let start = performance.now();

        //this.ctx.fillStyle = 'black';
        //this.ctx.beginPath();

        let size = this.tile.width;

        let step = timestamp => {
            let progress = timestamp - start;
            let radius = 0;
            if (progress > 0) {
                // radius = progress / 30;
                // this.ctx.beginPath();
                // this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
                // this.ctx.fill();
                this.clearArea(coords);
                size -= settings.speed.remove;
                this.drawTile(tile, null, size);
            }
            // if (progress < 2000 && radius < this.tile.width / 2) {
            //     requestAnimationFrame(step);
            // } else {
            //     callback();
            // }
            if (size > 0) {
                requestAnimationFrame(step);
            } else {
                
                callback();
            }
        }

        requestAnimationFrame(step);
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
                this.clearArea(tile.current);

                tile.current.y1 -= settings.speed.move;
                tile.current.y2 -= settings.speed.move;

                if (tile.current.y1 <= tile.destination.y1) {
                    tile.current = null;
                } else {
                    next = true;
                }
                this.drawTile(tile, tile.current);

            })
            if (next) {
                requestAnimationFrame(step);
            } else {
                callback();
            }
        }

        requestAnimationFrame(step)

        


    }
    
  },
  mounted: function() {
    console.log(234, this.$refs.canvas)
    let requestAnimationFrame = 
        window.requestAnimationFrame || 
        window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame || 
        window.msRequestAnimationFrame;
    window.requestAnimationFrame = requestAnimationFrame,
    //console.log(123, this.$refs.canvas)
    this.ctx = this.$refs.canvas.getContext('2d');
    this.setSizes();
    
    this.loadAssets(() => this.onReady());
  },

}
</script>