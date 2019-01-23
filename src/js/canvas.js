import { Point } from './point';
import { Tile } from './tile';
import { Subscriber } from './subscriber.js';

export class Canvas {
    
    constructor(canvas, tile = { width: 60, height: 60}) {
        new Subscriber(this);

        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');

        let canvasCoords = this.canvas.getBoundingClientRect()
        this.canvasX = canvasCoords.left;
        this.canvasY = canvasCoords.top;

        document.addEventListener('resize', (e) => {
            let canvasCoords = this.canvas.getBoundingClientRect()
            this.canvasX = canvasCoords.left;
            this.canvasY = canvasCoords.top;
        })

        document.addEventListener('scroll', (e) => {
            let canvasCoords = this.canvas.getBoundingClientRect()
            this.canvasX = canvasCoords.left;
            this.canvasY = canvasCoords.top;
        })

        this.canvas.addEventListener('click', (e) => this.onClick(e));

        this.cols = 0;
        this.rows = 0;
        this.tile = tile;

        this.width = 0;
        this.height = 0;
    }

    draw(field, callback) {
        if (!field || !field.length || !field[0].length) return;
        if (this.rows !== field.length) {

            this.height = field.length * this.tile.height;
            this.canvas.height = `${this.height}`; 
            this.rows = field.length;
        }

        if (this.cols !== field[0].length) {
            this.width = field[0].length * this.tile.width;
            this.canvas.width = `${this.width}`; 
            this.cols = field[0].length;
        }

        this.ctx.clearRect(0, 0, this.width, this.height);


        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                
                this.drawTile(field[y][x]);
            }
        }

        callback ? callback() : null;
    }

    drawTile(tile) {
        console.log('draw', tile)
        if (!tile) return;
        let coords = this.getCoordsByPoint(tile.position);
        this.ctx.fillStyle = tile.color;
        this.ctx.fillRect(coords.x1, coords.y1, this.tile.width, this.tile.height);
        this.ctx.fill();
    }

    clearPosition(position) {
        if (!position) return;
        let coords = this.getCoordsByPoint(position);
        this.ctx.clearRect(coords.x1, coords.y1, this.tile.width, this.tile.height);
    }

    getPointByCoords(coords) {
        let x = Math.floor(coords.x / this.tile.width);
        let y = Math.floor(coords.y / this.tile.height);
        return new Point(x, y);
    }

    getCoordsByPoint(point) {
        let x1 = point.x * this.tile.width;
        let x2 = x1 + this.tile.width;

        let y1 = point.y * this.tile.height;
        let y2 = y1 + this.tile.height;
        
        return {
            x1, x2, y1, y2 
        };
    }

    onClick(event) {
        let x = event.clientX - this.canvasX;
        let y = event.clientY - this.canvasY;
        let position = this.getPointByCoords(new Point(x, y));
        this.publish('click', position);
    }

    burn(cells, callback) {
        cells.forEach(cell => {
            let coords = this.getCoordsByPoint(cell);
            this.ctx.fillStyle = 'black';
            this.ctx.fillRect(coords.x1, coords.y1, this.tile.width, this.tile.height);
            this.ctx.fill();
        });
        setTimeout(callback, 1000);
    }

    move(field, callback) {
        let movingSet = [];
        field.forEach((row, y) => {
            row.forEach((tile, x) => {
                if (!tile || !tile.from) return;
                if (tile.from.x !== x || tile.from.y !== y ) {
                    
                    movingSet.push(tile);
                }
            })
        })

        setTimeout(() => {
            console.log('move')
            movingSet.forEach(tile => {
                this.clearPosition(tile.from);
                this.drawTile(tile);
            })
            setTimeout(callback, 1000)
        }, 1000)

        
    }
}