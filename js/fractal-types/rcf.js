define('fractal-types/rcf', ['complex'], function (Complex) {
  return function calcEscapeNum(maxI, x0, y0) {
    var x = 0;
    var y = 0;

    var i = 0;

    var t1, t2, t3, t4, t5, T1, T2, T3, T4;
    var r0 = Complex(x0, y0).abs();

    while( x*x + y*y <= 40000000 && i < maxI ) {
      t1 = Complex(r0, -10)['+'](Complex(x, y));
      t2 = Complex(r0, 10);
      t3 = Complex(-100, -2.0 * r0)['^'](Complex(x0, y0));
      t4 = Complex(0, r0);
      t5 = Complex(-200, -r0)['*'](Complex(x0, y0));

      T1 = t1['^'](t2);
      T2 = T1['+'](t3);
      T3 = T2['+'](t5);
      T4 = T3['^'](t4);

      x = T4.re();
      y = T4.im();

      i++;
    }

    return i;
  };
});
