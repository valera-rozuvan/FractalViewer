define('fractal-types/mandelbrot', ['complex'], function (Complex) {
  return function calcEscapeNum(maxI, x0, y0) {
    var i = 0;
    var c = Complex(x0, y0);
    var z = Complex(0, 0);

    while (z.abs() <= 8.0 && i < maxI) {
      z = z.rPow(2.0)['+'](c);

      i += 1;
    }

    return i;
  };
});
