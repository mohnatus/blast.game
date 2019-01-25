
  import { Point } from '../js/point.js';
  import { Tile } from '../js/tile.js';
  import assets from '../js/assets.js';

  let settings = {
    heightRatio: 1.14, // отношение высоты тайла к ширине
    radiusRatio: 0.2, // скругление углов
  };

  class TileView {

    constructor(readyCallback) {
      this._width = 0;
      this._height = 0;
      this._radius = 0;

      this.assets = [];
      this.loadAssets(readyCallback);
    }

    loadAssets(callback) => {
      let loading = 0;
      let loaded = 0;
      let errors = 0;

      let check = () => {
          if (errors + loaded == loading) {
              this.ready = true;
              callback();
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
    },

    set width(newValue) {
      this._width = newValue;
      this._height = this._width * settings.heightRatio;
      this._radius = this._width * settings.radiusRatio;
    }

    draw(tile, coords, size) {
      if (!tile) return; // пустая клетка

        size = size || this.tile.width;
        
        if (tile.status == this.statuses.super) { // супертайл
            this.drawTileSuper(tile, coords, size);
        } else { // обычный тайл
            this.drawTileDefault(tile, coords, size);
        }
    }

    drawTileDefault(tile, coords, size) {
        let ctx = this.ctx;
        
        size = size || this.tile.width;
        
        coords = coords || this.getCoordsByPoint(tile.position); // координаты клетки

        // координаты и размеры
        let diff = this.tile.width - size;
        
        let x = coords.x1 + diff / 2; 
        let y = coords.y2 - size - diff / 2;
        let width = size;
        let height = width;
        let radius = diff ? size * settings.radiusPercent / 100 : this.tile.radius;

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
    drawTileSuper(tile, coords) {
        this.drawTileDefault(tile, coords);
    }

    // собрать набор цветов для тайла по значению оттенка цвета
    getTileColors(x, y, color) {
        let baseColor = `hsl(${color}, 100%, 40%)`;
        let lightColor = `hsl(${color}, 100%, 80%)`;
        let darkColor = `hsl(${color}, 100%, 30%)`;

        let x1 = x;
        let x2 = x;
        let y1 = y;
        let y2 = y + this.tile.width;

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


  export { TileView };
