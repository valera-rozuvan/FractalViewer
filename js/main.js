(function() {
  'use strict';

  require.config({
    baseUrl: 'js',
    paths: {
      jquery: 'vendor/jquery/jquery.min',
      complex: 'vendor/complex-js/complex.min',
      bootstrap: 'vendor/bootstrap/bootstrap.min',
      'bootstrap-dialog': 'vendor/bootstrap3-dialog/bootstrap-dialog.min',
      'fractal-types/mandelbrot': 'fractal-types/mandelbrot',
      'fractal-types/rcf': 'fractal-types/rcf'
    },
    shim: {
      bootstrap: {
        deps: ['jquery']
      },
      'bootstrap-dialog': {
        deps: ['bootstrap']
      }
    }
  });

  require(['jquery'], function($) {
    $.noConflict();
    $(document).ready(onDomReady);
  });

  function onDomReady() {
    console.log('DOM is ready.');

    require(['FractalViewer', 'FractalRunner'], function(FractalViewer, FractalRunner) {
      console.log('Loaded modules FractalViewer, FractalRunner.');

      FractalRunner.init(FractalViewer);
    });
  }
}());
