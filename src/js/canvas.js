import { Point } from './point';
import { Tile } from './tile';
import { Subscriber } from './subscriber.js';

import * as star from '../images/star.png';

import { statuses } from './statuses.js';

let settings = {
    ratio: 1.14, // отношение высоты тайла к ширине
    radiusPercent: 20, // радиус скругления фронтальной части
    assets: {
        'star': {
            src: star,
            widthRatio: 58,
            heightRatio: 1
        }
    },
    speed: 10, // скорость перемещения тайлов
}

export class Canvas {
    
    constructor(canvas) {
        let requestAnimationFrame = 
        window.requestAnimationFrame || 
        window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame || 
        window.msRequestAnimationFrame;
        window.requestAnimationFrame = requestAnimationFrame;

        new Subscriber(this);

        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');

        this.canvasPosition = null;
        this.canvasSize = {
            width: 0, 
            height: 0
        };
        this.setSizes();

        // обработка клика по игровому полю
        this.canvas.addEventListener('click', (e) => this.onClick(e));

        this.cols = 0; // количество колонок
        this.rows = 0; // количество рядов

        this.tile = { // настройки тайла
            width: 0,
            height: 0,
            radius: 0,
        };

        this.assets = {}; // ассеты для рендера
        this.loadAssets();
    }

    // установка и отслеживание размеров и позиции канвы
    setSizes() {
        this.canvasSize.width = this.canvas.offsetWidth;

        let setPosition = () => {
            let canvasCoords = this.canvas.getBoundingClientRect()
            this.canvasPosition = new Point(canvasCoords.left, canvasCoords.top);
        }
        setPosition(); // сохранить текущее положение канвы

        document.addEventListener('resize', (e) => {
            setPosition(); // сохранить текущее положение канвы
        });

        document.addEventListener('scroll', (e) => {
            setPosition();
        });
    }

    // загрузка ассетов для рендера
    loadAssets() {
        this._waitings = {}; // коллбэки, ожидающие загрузки ассетов
        for (let asset in settings.assets) {
            let img = new Image();
            img.src = '/' + settings.assets[asset].src;
            this._waitings[asset] = [];
            img.onload = () => {
                let width = settings.assets[asset].widthRatio * this.tile.width / 100;
                this.assets[asset] = {
                    src: img,
                    width: width,
                    height: width * settings.assets[asset].heightRatio
                };
                this._waitings[asset].forEach(callback => callback())
            }
        }
    }

    // коллбэки, зависящие от загрузки ассетов
    ifAsset(asset, callback) {
        if (!settings.assets[asset]) return;
        if (this.assets[asset]) callback();
        else this._waitings[asset].push(callback);
    }

    // рассчитать размеры тайла с учетом размеров канвы и количества колонок
    setTileSize() {
        let tileWidth = Math.floor(this.canvasSize.width / this.cols);
        this.tile = { // настройки тайла
            width: tileWidth,
            height: settings.ratio * tileWidth,
            radius: tileWidth * settings.radiusPercent / 100,
        };
    }

    // отрисовать все игровое поле
    draw(field, callback) {
        if (!field || !field.length || !field[0].length) return;

        this.field = field; // сохранить матрицу

        // если количество колонок отличается от установленного
        if (this.cols !== field[0].length) {
            this.cols = field[0].length;
            this.rows = field.length;
            // рассчитать новые размеры тайла
            this.setTileSize();
            // установить высоту канвы
            this.canvasSize.height = this.tile.height * this.rows;
            this.canvas.height = `${this.canvasSize.height}`;
        } else if (this.rows !== field.length) { // если отличается только количество рядов
            this.rows = field.length;
            this.canvasSize.height = this.tile.height * this.rows;
            this.canvas.height = `${this.canvasSize.height}`;
        }

        // очистить канву
        this.ctx.clearRect(0, 0, this.canvasSize.width, this.canvasSize.height);

        // отрисовать каждый тайл
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                this.drawTile(field[y][x]);
            }
        }

        callback ? callback() : null;
    }


    // отрисовать один тайл
    drawTile(tile, coords) {
        if (!tile) return; // пустая клетка
        
        if (tile.status == statuses.super) { // супертайл
            this.drawTileSuper(tile, coords);
        } else { // обычный тайл
            this.drawTileDefault(tile, coords);
        }
    }

    // отрисовать обычный тайл
    drawTileDefault(tile, coords) {
        let ctx = this.ctx;
        
        coords = coords || this.getCoordsByPoint(tile.position); // координаты клетки
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
            ctx.fillRect(starX - 2, starY - 2, star.width + 4, star.height + 4);

            ctx.globalCompositeOperation = 'source-over';
        });
    }

    // отрисовать супер-тайл
    drawTileSuper(tile, coords) {
        this.drawTileDefault(tile, coords);
    }

    // собрать набор цветов для тайла по значению оттенка цвета
    getTileColors(x, y, color) {
        let baseColor = `hsl(${color}, 100%, 40%)`;
        let lightColor = `hsl(${color}, 100%, 80%)`;
        let darkColor = `hsl(${color}, 100%, 20%)`;

        let x1 = x;
        let x2 = x;
        let y1 = y;
        let y2 = y + this.tile.width;

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

    // очистить клетку поля
    clearArea(coords) {
        if (!coords) return;
        this.ctx.clearRect(
            coords.x1, coords.y1, 
            coords.x2 - coords.x1, coords.y2 - coords.y1
        );
    }

    // получить позицию игрового поля по координатам канвы
    getPointByCoords(coords) {
        let x = Math.floor(coords.x / this.tile.width);
        let y = Math.floor(coords.y / this.tile.height);
        return new Point(x, y);
    }

    // получить координаты клетки, соответствующей конкретной позиции игрового поля
    getCoordsByPoint(point) {
        let x1 = point.x * this.tile.width;
        let x2 = x1 + this.tile.width;

        let y1 = point.y * this.tile.height;
        let y2 = y1 + this.tile.height;
        
        return {
            x1, x2, y1, y2 
        };
    }

    // обработка клика по канве
    onClick(event) {
        let x = event.clientX - this.canvasPosition.x;
        let y = event.clientY - this.canvasPosition.y;
        let position = this.getPointByCoords(new Point(x, y));
        this.publish('click', position);
    }

    // удалить выбранные клетки с поля
    delete(cells, callback) {
        let deleted = [];
        let addDeleted = (ind) => {
            deleted.push(ind);
            // вызвать коллбэк, когда все тайлы удалятся
            if (deleted.length == cells.length) callback();
        }
        cells.forEach(
            (cell, ind) => this.deleteTile(
                cell, 
                () => addDeleted(ind)
            )
        );
    }

    // анимация удаления тайла
    deleteTile(cell, callback) {
        // получить координаты клетки
        let coords = this.getCoordsByPoint(cell);

        let centerX = coords.x1 + this.tile.width / 2;
        let centerY = coords.y2 - this.tile.height / 2;

        let start = performance.now();

        this.ctx.fillStyle = 'black';
        this.ctx.beginPath();

        let step = timestamp => {
            let progress = timestamp - start;
            let radius = 0;
            if (progress > 0) {
                radius = progress / 30;
                this.ctx.beginPath();
                this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
                this.ctx.fill();
            }
            if (progress < 2000 && radius < this.tile.width / 2) {
                requestAnimationFrame(step);
            } else {
                callback();
            }
        }

        requestAnimationFrame(step);
    }

    // анимация перемещения тайлов
    move(field, callback) {
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

                tile.current.y1 -= settings.speed;
                tile.current.y2 -= settings.speed;

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
}