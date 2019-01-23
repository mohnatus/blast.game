import { Point } from './point';
import { Tile } from './tile';
import { Subscriber } from './subscriber.js';

import * as star from '../images/star.png';

let settings = {
    ratio: 1.14, // отношение высоты тайла к ширине
    radiusPercent: 20, // радиус скругления фронтальной части
    assets: {
        'star': {
            src: star,
            widthRatio: 58,
            heightRatio: 1
        }
    }
}

export class Canvas {
    
    constructor(canvas, tileSize = 100) {
        console.log(123, star)
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
        this.tile = {
            width: tileSize,
            height: settings.ratio * tileSize,
            radius: tileSize * settings.radiusPercent / 100,
        };

        this.width = 0;
        this.height = 0;

        this.assets = {};
        this.waitings = {};

        this.loadAssets();
    }

    loadAssets() {
        for (let asset in settings.assets) {
            let img = new Image();
            img.src = '/' + settings.assets[asset].src;
            this.waitings[asset] = [];
            img.onload = () => {
                let width = settings.assets[asset].widthRatio * this.tile.width / 100;
                this.assets[asset] = {
                    src: img,
                    width: width,
                    height: width * settings.assets[asset].heightRatio
                };
                this.waitings[asset].forEach(callback => callback())
            }

        }
    }

    ifAsset(asset, callback) {
        if (!settings.assets[asset]) return;
        if (this.assets[asset]) callback();
        else this.waitings[asset].push(callback);
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
        if (!tile) return; // пустая клетка
        let ctx = this.ctx;
        
        let coords = this.getCoordsByPoint(tile.position); // координаты клетки

        // координаты и размеры
        // фронтальная часть
        let x = coords.x1; 
        let y = coords.y2 - this.tile.width;
        let width = this.tile.width;
        let height = this.tile.width;
        let radius = this.tile.radius;
        
        let colors = this.getTileColors(x, y, tile.color);

        
    
        // основной фон
        ctx.fillStyle = colors.back;

        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fill();

        this.ifAsset('star', () => {

            let star = this.assets.star;
            let starX = x + (width - star.width) / 2;
            let starY = y + (height - star.height) / 2;

            // звездочка
            ctx.globalCompositeOperation = "destination-out"
            ctx.drawImage(star.src, starX, starY, star.width, star.height);

            // фон звездочки
            ctx.globalCompositeOperation = "destination-over";
            ctx.fillStyle = colors.star;
            ctx.fillRect(starX, starY, star.width, star.height);

            ctx.globalCompositeOperation = 'source-over';
        });
    }

    getTileColors(x, y, color) {
        let baseColor = `hsl(${color}, 100%, 40%)`;
        let lightColor = `hsl(${color}, 100%, 80%)`;
        let darkColor = `hsl(${color}, 100%, 20%)`;

        let x1 = x;
        let x2 = x;
        let y1 = y;
        let y2 = y + this.tile.width;

        console.log(x1, x2, y1, y2)

        let back = this.ctx.createLinearGradient(x1, y1, x2, y2);
        back.addColorStop(0, lightColor);
        back.addColorStop(1, baseColor);

        let star = this.ctx.createLinearGradient(x1, y1, x2, y2);
        star.addColorStop(0, baseColor);
        star.addColorStop(1, lightColor);

        return {
            back: back, 
            star: star,
            base: baseColor,
            light: lightColor,
            dark: darkColor
        };
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
            movingSet.forEach(tile => {
                this.clearPosition(tile.from);
                this.drawTile(tile);
            })
            setTimeout(callback, 1000)
        }, 1000)

        
    }
}