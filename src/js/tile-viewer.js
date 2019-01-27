
  import { Point } from './point.js';
  import { Tile } from './tile.js';
  import { assets } from './assets.js';
  import { statuses, actions } from './statuses.js';

  let settings = {
    heightRatio: 1.14, // отношение высоты тайла к ширине
    radiusRatio: 0.2, // скругление углов
    deleteTime: 600, // скорость удаления тайлов
    minSize: 5,
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

        size = size || size === 0 ? size : this.width;

        if (size === 0) return;

        
        if (tile.action == actions.bomb) this.drawBomb(tile, coords, size);
        else if (tile.status == statuses.super) this.drawSuper(tile, coords, size);
        else this.drawDefault(tile, coords, size);
    }

    drawDefault(tile, coords, size) {
        let ctx = this.ctx;

        size = size || this.width;

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

            // let shadow = ctx.createLinearGradient(x, y, x, y + width);
            // shadow.addColorStop(0, 'white');
            // shadow.addColorStop(0.01, 'rgba(255, 255, 255, 0.1)');
            // shadow.addColorStop(0.3, 'transparent');
            // shadow.addColorStop(0.7, 'transparent');
            // shadow.addColorStop(1, 'rgba(0, 0, 0, 0.5)');

            // ctx.fillStyle = shadow;
            // ctx.globalCompositeOperation = "source-atop";
            // ctx.beginPath();
            // ctx.moveTo(x + radius, y);
            // ctx.lineTo(x + width - radius, y);
            // ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
            // ctx.lineTo(x + width, y + height - radius);
            // ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
            // ctx.lineTo(x + radius, y + height);
            // ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
            // ctx.lineTo(x, y + radius);
            // ctx.quadraticCurveTo(x, y, x + radius, y);
            // ctx.closePath();
            // ctx.fill();
            // ctx.globalCompositeOperation = 'source-over';
            
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
    drawSuper(tile, coords, size) {
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
            ctx.fillStyle = colors.bright;
            ctx.fillRect(starX - 2, starY - 2, starWidth + 4, starHeight + 4);
            ctx.globalCompositeOperation = 'source-over';
        };

        top();
        front();
        star();
    }

    drawBomb(tile, coords, size) {
        let ctx = this.ctx;
        
        size = size && size !== 0 && size < this.width ? size : this.width;

        let bomb = this.assets.bomb;
        
        let bombWidth = size * bomb.widthRatio;
        let bombHeight = bomb.heightRatio * bombWidth;
        
        let bombX = coords.x1 + (coords.x2 - coords.x1 - bombWidth) / 2;
        let bombY = coords.y1 + (coords.y2 - coords.y1 - bombHeight) / 2;
        ctx.beginPath();
        ctx.drawImage(bomb.src, bombX, bombY, bombWidth, bombHeight);
    }

    // удалить тайл
    delete(tile, coords, callback) {
        let start = performance.now();
        let stop = settings.deleteTime;

        let step = timestamp => {
            let progress = timestamp - start;
            this.clear(coords);

            let size = this.getDeleteSize(tile.action, progress);
            this.draw(tile, coords, size);

            if (progress < stop) {
                requestAnimationFrame(step);
            } else {
                callback();
            }
        }

        requestAnimationFrame(step); 
    }

    // вычислить размер удаляемого тайла в зависимости от времени
    getDeleteSize(action, time) {
        if (time < 0) time = 0;
        let size;

        if (action == actions.super) { // новые супертайлы не уменьшаются
            size = this.width;
        } else if (action == actions.bomb) { // бомбы увеличиваются и исчезают
            if (time >= settings.deleteTimer) size = 0;
            else {
                let increaseTime = settings.deleteTime / 3;
                let decreaseTime = settings.deleteTime - increaseTime;
                let increaseDiff = this.width / increaseTime;
                let decreaseDiff = this.width / decreaseTime;

                // если бомба - 300ms увеличение, потом уменьшение
                if (time < increaseTime) {
                    size = increaseDiff * time;
                } else {
                    time -= increaseTime;
                    size = this.width - decreaseDiff * time; 
                }
            }
        } else { // обычные тайлы равномерно уменьшаются
            if (time >= settings.deleteTime) size = 0;
            else {
                let diff = this.width / settings.deleteTime;
                size = this.width - diff * time;
            }    
        }

        return size;
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
        let baseColor = `hsl(${color}, 100%, 50%)`;
        let lightColor = `hsl(${color}, 100%, 80%)`;
        let darkColor = `hsl(${color}, 100%, 40%)`;

        let x1 = x;
        let x2 = x;
        let y1 = y;
        let y2 = y + this.width;

        let back = this.ctx.createLinearGradient(x1, y1, x2, y2);
        back.addColorStop(0, `hsl(${color}, 100%, 100%)`);
        back.addColorStop(0.02, `hsl(${color}, 100%, 80%)`);
        back.addColorStop(0.5, `hsl(${color}, 100%, 60%)`);
        back.addColorStop(0.8, `hsl(${color}, 60%, 40%)`);
        back.addColorStop(1, `hsl(${color}, 40%, 40%)`);

        let star = this.ctx.createRadialGradient(
            x1 + this.width * 0.5, y2 - this.width * 0.25, this.width * 0.5,
            x1 + this.width * 0.5, y2, this.width * 0.25
            );
        star.addColorStop(0, `hsl(${color + 8}, 40%, 40%)`);
        star.addColorStop(1, `hsl(${color - 8}, 100%, 60%)`);

        let bright = `hsl(${color + 180}, 100%, 80%)`;

        return {
            back: back, 
            star: star,
            base: baseColor,
            light: lightColor,
            dark: darkColor,
            bright: bright
        };
    }
  }


  export { TileViewer };
