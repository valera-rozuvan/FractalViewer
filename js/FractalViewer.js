define('FractalViewer', ['complex'], function(Complex) {
  'use strict';

  function FractalViewer(maxI, centerX, centerY, viewWidth) {
    this.width = undefined;
    this.height = undefined;

    this.centerX = centerX || -0.5;
    this.centerY = centerY || 0;
    this.viewWidth = viewWidth || 4;
    this.viewHeight = undefined;

    this.maxI = maxI || 30;
    this.colorCycle = 10;
    this.colorPhase = 0;

    this.canvas = document.getElementById('fractalViewerCanvas');
    this.ctx = this.canvas.getContext('2d');

    this.reshape();
  }

  FractalViewer.prototype.reshape = function() {
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0px';
    this.canvas.style.left = '0px';
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.viewHeight = this.viewWidth * this.height / this.width;

    this.drawSuccessive();
  };

  FractalViewer.prototype.pixelDrag = function(pxDx, pxDy) {
    var dx = this.xPixelToReal(this.width / 2 + pxDx);
    var dy = this.yPixelToReal(this.height / 2 + pxDy);
    this.centerX = dx;
    this.centerY = dy;
    this.reshape();
  };

  FractalViewer.prototype.zoom = function(amount) {
    this.viewWidth *= amount;
    this.reshape();
  };

  FractalViewer.prototype.calcEscapeNum = function(maxI, x0, y0) {
    var i = 0;
    var c = Complex(x0, y0);
    var z = Complex(0, 0);

    while (z.abs() <= 8.0 && i < maxI) {
      z = z.rPow(2.0)['+'](c);

      i += 1;
    }

    return i;
  };

  FractalViewer.prototype.escapeToHue = function(i) {
    if (i === this.maxI) {
      return 0;
    }
    if (this.colorCycle) {
      return 1 - ((i % this.colorCycle) / this.colorCycle + this.colorPhase) % 1;
    }else {
      return 1 - (i / this.maxI + this.colorPhase) % 1;
    }
  };

  FractalViewer.prototype.hueToRGB = function(h, targetArray, i) {
    var h2 = h * 6;
    var x = 255 * (1 - Math.abs((h2 % 2) - 1));
    if (h === 0) {
      targetArray[i] = 0;
      targetArray[i + 1] = 0;
      targetArray[i + 2] = 0;
    } else if (h2 < 1) {
      targetArray[i] = 255;
      targetArray[i + 1] = x;
      targetArray[i + 2] = 0;
    } else if (h2 >= 1 && h2 < 2) {
      targetArray[i] = x;
      targetArray[i + 1] = 255;
      targetArray[i + 2] = 0;
    } else if (h2 >= 2 && h2 < 3) {
      targetArray[i] = 0;
      targetArray[i + 1] = 255;
      targetArray[i + 2] = x;
    } else if (h2 >= 3 && h2 < 4) {
      targetArray[i] = 0;
      targetArray[i + 1] = x;
      targetArray[i + 2] = 255;
    } else if (h2 >= 4 && h2 < 5) {
      targetArray[i] = x;
      targetArray[i + 1] = 0;
      targetArray[i + 2] = 255;
    } else if (h2 >= 5 && h2 < 6) {
      targetArray[i] = 255;
      targetArray[i + 1] = 0;
      targetArray[i + 2] = x;
    } else {
      targetArray[i] = 255;
      targetArray[i + 1] = 0;
      targetArray[i + 2] = 0;
    }
    targetArray[i + 3] = 255;
  };

  FractalViewer.prototype.xPixelToReal = function(pxX) {
    return this.viewWidth * (pxX / this.width - 0.5) + this.centerX;
  };

  FractalViewer.prototype.yPixelToReal = function(pxY) {
    return this.centerY - this.viewHeight * (pxY / this.height - 0.5);
  };

  FractalViewer.prototype.drawSuccessive = function(chunkSizeOpt, countsArrayOpt, pxYStartOpt) {
    var MAX_CHUNK = 16;
    var CHUNK_ZOOM = 2;

    if (this.pendingDraw) {
      clearTimeout(this.pendingDraw);
      this.pendingDraw = null;
    }
    var chunkSize = chunkSizeOpt || MAX_CHUNK;
    var countsArray = countsArrayOpt || [];
    var pxYStart = pxYStartOpt || 0;

    var width = this.width;
    var height = this.height;
    var maxI = this.maxI;

    var colorCycle = this.colorCycle;

    var pxYStop;
    if (chunkSize === MAX_CHUNK) {
      pxYStop = height;
    } else {
      pxYStop = pxYStart + chunkSize * MAX_CHUNK;
    }

    var imageData;
    var pixelArray;
    if (chunkSize === 1) {
      imageData = this.ctx.createImageData(this.width, pxYStop - pxYStart);
      pixelArray = imageData.data;
    }

    var count = function(pxX, pxY) {
      return countsArray[pxY * width + pxX];
    };

    var allNeighborsSame = function(pxX, pxY, chunkSize) {
      var c = count(pxX, pxY);
      return (c === count(pxX, pxY + chunkSize)) &&
      (c === count(pxX + chunkSize, pxY + chunkSize)) &&
      (c === count(pxX + chunkSize, pxY)) &&
      (c === count(pxX + chunkSize, pxY - chunkSize)) &&
      (c === count(pxX, pxY - chunkSize)) &&
      (c === count(pxX - chunkSize, pxY - chunkSize)) &&
      (c === count(pxX - chunkSize, pxY)) &&
      (c === count(pxX - chunkSize, pxY + chunkSize));
    };
    for (var pxX = 0; pxX < width; pxX += chunkSize) {
      for (var pxY = pxYStart; pxY < pxYStop; pxY += chunkSize) {
        var parentX;
        var parentY;
        var doEvaluate;

        if (pxX % (CHUNK_ZOOM * chunkSize) === 0) {
          parentX = pxX;
        }else {
          parentX = pxX - chunkSize;
        }
        if (pxY % (CHUNK_ZOOM * chunkSize) === 0) {
          parentY = pxY;
        }else {
          parentY = pxY - chunkSize;
        }

        if (chunkSize === MAX_CHUNK) {
          doEvaluate = true;
        }else if ((pxX === parentX) && (pxY === parentY)) {
          doEvaluate = false;
        }else if (allNeighborsSame(parentX, parentY, CHUNK_ZOOM * chunkSize)) {
          doEvaluate = false;
        }else {
          doEvaluate = true;
        }

        var i;
        if (doEvaluate) {
          i = this.calcEscapeNum(maxI, this.xPixelToReal(pxX), this.yPixelToReal(pxY));
        } else {
          i = count(parentX, parentY);
        }
        countsArray[pxY * width + pxX] = i;
        if (chunkSize === 1) {
          var paIndex = ((pxY - pxYStart) * width + pxX) * 4;
          this.hueToRGB(this.escapeToHue(i), pixelArray, paIndex);
        }else if (doEvaluate) {
          this.ctx.fillStyle = this.hueToRGBString(this.escapeToHue(i));
          this.ctx.fillRect(pxX, pxY, chunkSize, chunkSize);
        }
      }
    }
    if (chunkSize === 1) {
      this.ctx.putImageData(imageData, 0, pxYStart);
    }
    var me = this;
    if (pxYStop < height) {
      this.pendingDraw = setTimeout(function() {me.drawSuccessive(chunkSize, countsArray, pxYStop);});
    }else if (chunkSize > 1) {
      this.pendingDraw = setTimeout(function() {me.drawSuccessive(chunkSize / CHUNK_ZOOM, countsArray);});
    }
  };

  FractalViewer.prototype.hueToRGBString = function(h) {
    var h2 = h * 6;
    var x = Math.floor(255 * (1 - Math.abs((h2 % 2) - 1)));
    var r;
    var g;
    var b;
    if (h === 0) {
      r = 0;
      g = 0;
      b = 0;
    } else if (h2 < 1) {
      r = 255;
      g = x;
      b = 0;
    } else if (h2 >= 1 && h2 < 2) {
      r = x;
      g = 255;
      b = 0;
    } else if (h2 >= 2 && h2 < 3) {
      r = 0;
      g = 255;
      b = x;
    } else if (h2 >= 3 && h2 < 4) {
      r = 0;
      g = x;
      b = 255;
    } else if (h2 >= 4 && h2 < 5) {
      r = x;
      g = 0;
      b = 255;
    } else if (h2 >= 5 && h2 < 6) {
      r = 255;
      g = 0;
      b = x;
    } else {
      r = 255;
      g = 0;
      b = 0;
    }
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  };

  return FractalViewer;
});
