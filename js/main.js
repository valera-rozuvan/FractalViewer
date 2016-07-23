(function() {
  'use strict';

  require.config({
    baseUrl: 'js',
    paths: {
      jquery: 'vendor/jquery/jquery.min'
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
