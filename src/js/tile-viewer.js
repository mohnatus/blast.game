
  import { Point } from './point.js';
  import { Tile } from './tile.js';
  import { assets } from './assets.js';
  import { statuses } from './statuses.js';

  let settings = {
    heightRatio: 1.14, // отношение высоты тайла к ширине
    radiusRatio: 0.2, // скругление углов
    deleteSpeed: 3,
  };

  class TileViewer {

    constructor(readyCallback) {
        this.width = 0;
        this.height = 0;
        this.radius = 0;

        this.assets = [];
        this.loadAssets(readyCallback);
    }

    loadAssets(callback) {
        let loading = 0;
        let loaded = 0;
        let errors = 0;

        let check = () => {
            if (errors + loaded == loading) {
                this.ready = true;
                callback ? callback() : null;
            }
        };

        for (let asset in assets) {
            let assetSettings = assets[asset];
            let img = new Image();
            img.src = '/' + assetSettings.src;
            loading++;
            img.onload = () => {
                this.assets[asset] = {
                    src: img,
                    widthRatio: assetSettings.widthRatio,
                    heightRatio: assetSettings.heightRatio
                };
                loaded++;
                check();
            };
            img.onerror = () => {
                errors++;
                check();
            }
        }
    }

    setWidth(width) {
        let sizes = this.getSizes(width);
        this.width = sizes.width;
        this.height = sizes.height;
        this.radius = sizes.radius;
    }

    getSizes(width) {
        return {
            width: width,
            height: width * settings.heightRatio,
            radius: width * settings.radiusRatio
        }
    }

    draw(tile, coords, size) {
        if (!tile) return; // пустая клетка

        size = size || this.width;
        
        if (tile.status == statuses.super) { // супертайл
            this.drawSuper(tile, coords, size);
        } else { // обычный тайл
            this.drawDefault(tile, coords, size);
        }
    }

    drawDefault(tile, coords, size) {
       
        let ctx = this.ctx;
        
        size = size && size !== 0 ? size : this.width;

        // координаты и размеры
        let diff = this.width - size;
        let newSizes = diff ? this.getSizes(size) : null;

        let x = coords.x1 + diff / 2; 
        let y = coords.y2 - size - diff / 2;
        let width = size;
        let height = width;
        let radius = diff ? newSizes.radius : this.radius;
        let colors = this.getTileColors(x, y, tile.color);

        let top = () => {
            let top = this.assets.top;
            let topWidth = width * top.widthRatio;
            let topHeight = top.heightRatio * topWidth;
            let topX = x + (width - topWidth) / 2;
            let topY = y + radius / 4 - topHeight;
            ctx.beginPath();
            ctx.drawImage(top.src, topX, topY, topWidth, topHeight);
            ctx.globalCompositeOperation = 'source-atop';
            ctx.fillStyle = colors.dark;
            ctx.fillRect(topX, topY, topWidth, topHeight);
            ctx.globalCompositeOperation = 'source-over';
        }

        let front = () => {
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
        };

        let star = () => {
            let star = this.assets.star;
            let starWidth = width * star.widthRatio;
            let starHeight = starWidth * star.heightRatio;
            let starX = x + (width - starWidth) / 2;
            let starY = y + (height - starHeight) / 2;
            ctx.globalCompositeOperation = "destination-out"
            ctx.drawImage(star.src, starX, starY, starWidth, starHeight);
            ctx.globalCompositeOperation = "destination-over";
            ctx.fillStyle = colors.star;
            ctx.fillRect(starX - 2, starY - 2, starWidth + 4, starHeight + 4);
            ctx.globalCompositeOperation = 'source-over';
        };

        top();
        front();
        star();
    }

    // отрисовать супер-тайл
    drawSuper(tile, coords) {
        this.drawTileDefault(tile, coords);
    }

    // удалить тайл
    delete(tile, coords, callback) {

        let start = performance.now();

        let size = this.width;
        let min = settings.deleteSpeed;

        let step = timestamp => {
            let progress = timestamp - start;
            if (progress > 0) {
                this.clear(coords);
                size -= settings.deleteSpeed;

                if (size > min) {
                    this.draw(tile, coords, size);
                }
                    
            }
            if (size > min) {
                requestAnimationFrame(step);
            } else {
                callback();
            }
        }

        requestAnimationFrame(step);
        
    }

    clear(coords) {

        if (!coords) return;
        this.ctx.clearRect(
            coords.x1, coords.y1, 
            coords.x2 - coords.x1, coords.y2 - coords.y1
        );
        
    }

    // собрать набор цветов для тайла по значению оттенка цвета
    getTileColors(x, y, color) {
        let baseColor = `hsl(${color}, 100%, 40%)`;
        let lightColor = `hsl(${color}, 100%, 80%)`;
        let darkColor = `hsl(${color}, 100%, 30%)`;

        let x1 = x;
        let x2 = x;
        let y1 = y;
        let y2 = y + this.width;

        let back = this.ctx.createLinearGradient(x1, y1, x2, y2);
        back.addColorStop(0, lightColor);
        back.addColorStop(1, baseColor);

        let star = this.ctx.createLinearGradient(x1, y1, x2, y2);
        star.addColorStop(0, darkColor);
        star.addColorStop(1, lightColor);

        return {
            back: back, 
            star: star,
            base: baseColor,
            light: lightColor,
            dark: darkColor
        };
    }

    

  }


  export { TileViewer };
