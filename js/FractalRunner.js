define('FractalRunner', ['bootstrap-dialog', 'jquery'], function(BootstrapDialog, $) {
  'use strict';

  var fractalViewer;
  var mouseX;
  var mouseY;
  var dragging = false;
  var timeoutId;

  var DEFAULTS = {
    centerX: -0.5,
    centerY: 0,
    viewWidth: 5.2,
    maxI: 50,
    colorCycle: 10,
    colorPhase: 0,
    fractalType: 'mandelbrot'
  };

  function getHashVariable(variable) {
    var query = window.location.hash.substring(1);
    var vars = query.split('$');
    for (var i = 0; i < vars.length; i += 1) {
      var pair = vars[i].split('=');
      if (pair[0] === variable) {
        return pair[1];
      }
    }
    return false;
  }

  function updateCtrlBtnPlacement() {
    var xDisp = 5.0;
    var yDisp = 5.0;

    $('#controlToggler').css({
      top: Math.round(yDisp) + 'px',
      left: Math.round(xDisp) + 'px',
      visibility: 'visible'
    });

    $('#fractalTypesBtn').css({
      top: Math.round(yDisp) + 'px',
      left: Math.round(
          xDisp * 2.0 +
          $('#controlToggler').outerWidth()
        ) + 'px',
      visibility: 'visible'
    });

    $('#exportToPngBtn').css({
      top: Math.round(yDisp) + 'px',
      left: Math.round(
          xDisp * 3.0 +
          $('#controlToggler').outerWidth() +
          $('#fractalTypesBtn').outerWidth()
        ) + 'px',
      visibility: 'visible'
    });

    $('#aboutDialogButton').css({
      top: Math.round(yDisp) + 'px',
      left: Math.round(
          xDisp * 4.0 +
          $('#controlToggler').outerWidth() +
          $('#fractalTypesBtn').outerWidth() +
          $('#exportToPngBtn').outerWidth()
        ) + 'px',
      visibility: 'visible'
    });
  }

  function init(FractalViewer) {
    fractalViewer = new FractalViewer(
      parseInt(getHashVariable('maxI')),

      parseFloat(getHashVariable('centerX')),
      parseFloat(getHashVariable('centerY')),
      parseFloat(getHashVariable('viewWidth')),

      getHashVariable('fractalType')
    );

    var canvas = document.getElementById('fractalViewerCanvas');

    $(window).on('resize', function(e) {
      fractalViewer.reshape();
      scheduleUpdateHash();
    });

    $('#controlToggler').on('click', toggleControlsForm);
    $('#fractalTypesBtn').on('click', toggleFractalTypesDialog);
    $('#exportToPngBtn').on('click', function() {
      // window.open(exportToPNG(), '_newtab');

      // We can't simply open a new blank window with the image.
      // Apparently Google Chrome has removed support for top-frame
      // navigation, you can see more informations here:
      // https://groups.google.com/a/chromium.org/forum/#!topic/blink-dev/GbVcuwg_QjM

      // So, to get around this problem, we open a new window, and inside it create
      // an IFrame with our image.

      // var win = window.open();
      // win.document.write(
      //   '<iframe src="' + exportToPNG() + '" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>'
      // );

      // Update #2. The above fix doesn't work in Chrome anymore. New fix!
      // Have a dummy HTML document which will load the image data URI and create an image
      // element based on that data.

      // Update #3. As of January 5th, 2024, the below code works well :-)
      // Good to know that web standards are finally stabilizing.

      window.open('static_image.html#img=' + exportToPNG());

      return false;
    });
    $('#aboutDialogButton').on('click', toggleAboutDialog);

    canvas.onmousedown = function(e) {
      mouseX = e.pageX;
      mouseY = e.pageY;
      dragging = true;
    };
    canvas.onmousemove = function(e) {
      if (dragging) {
        var dx = mouseX - e.pageX;
        var dy = mouseY - e.pageY;
        mouseX = e.pageX;
        mouseY = e.pageY;
        fractalViewer.pixelDrag(dx, dy);
        scheduleUpdateHash();
      }
    };
    canvas.onmouseup = function(e) {
      dragging = false;
    };

    // For webkit
    canvas.onmousewheel = function(e) {
      fractalViewer.zoom(Math.min(Math.max(1 - e.wheelDelta / 100, 0.7), 1.3));
      scheduleUpdateHash();
      return false;
    };

    // For firefox
    if (window.addEventListener) {
      window.addEventListener('DOMMouseScroll', function(e) {
        // firefox's e.detail appears to use the opposite direction
        e.wheelDelta = -e.detail;
        canvas.onmousewheel(e);
      }, true);
    }

    updateCtrlBtnPlacement();

    setParametersFromHash();
  }

  function updateFractalViewer(maxI, colorCycle, colorPhase) {
    fractalViewer.maxI = maxI;
    fractalViewer.colorCycle = colorCycle;
    fractalViewer.colorPhase = colorPhase;

    updateHash();

    fractalViewer.reshape();

    return false;
  }

  function scheduleUpdateHash() {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(updateHash, 300);
  }

  function updateHash() {
    window.location.hash = '' +
      '#maxI=' + fractalViewer.maxI +
      '$centerX=' + fractalViewer.centerX +
      '$centerY=' + fractalViewer.centerY +
      '$viewWidth=' + fractalViewer.viewWidth +
      '$cyclePeriod=' + fractalViewer.colorCycle +
      '$cyclePhase=' + fractalViewer.colorPhase +
      '$fractalType=' + fractalViewer.currentFractalType;
  }

  function setParametersFromHash() {
    var maxI = getHashVariable('maxI');
    var centerX = getHashVariable('centerX');
    var centerY = getHashVariable('centerY');
    var viewWidth = getHashVariable('viewWidth');
    var cyclePeriod = getHashVariable('cyclePeriod');
    var cyclePhase = getHashVariable('cyclePhase');
    var fractalType = getHashVariable('fractalType');

    if (centerX) {
      fractalViewer.centerX = parseFloat(centerX);
    } else {
      fractalViewer.centerX = DEFAULTS.centerX;
    }

    if (centerY) {
      fractalViewer.centerY = parseFloat(centerY);
    } else {
      fractalViewer.centerY = DEFAULTS.centerY;
    }

    if (viewWidth) {
      fractalViewer.viewWidth = parseFloat(viewWidth);
    } else {
      fractalViewer.viewWidth = DEFAULTS.viewWidth;
    }

    if (fractalType) {
      fractalViewer.currentFractalType = fractalType;
    } else {
      fractalViewer.currentFractalType = DEFAULTS.fractalType;
    }

    updateFractalViewer(
      parseInt(maxI, 10) || DEFAULTS.maxI,
      parseInt(cyclePeriod, 10) || DEFAULTS.colorCycle,
      parseFloat(cyclePhase) || DEFAULTS.colorPhase
    );
  }

  function toggleControlsForm(e) {
    e.preventDefault();
    e.stopPropagation();

    var controlsForm = $('#controlsForm').clone(false);

    controlsForm.css({
      display: 'block'
    });

    controlsForm.find('#iterControl').val(fractalViewer.maxI);
    controlsForm.find('#cycleColorsPeriod').val(fractalViewer.colorCycle);
    controlsForm.find('#cycleColorsPhase').val(fractalViewer.colorPhase);

    controlsForm.find('#updateFractalViewer').on('click', function(e) {
      e.preventDefault();
      e.stopPropagation();

      var maxI = parseInt(controlsForm.find('#iterControl').val(), 10);
      var colorCycle = parseInt(controlsForm.find('#cycleColorsPeriod').val(), 10);
      var colorPhase = parseFloat(controlsForm.find('#cycleColorsPhase').val(), 10);

      updateFractalViewer(maxI, colorCycle, colorPhase);

      return false;
    });

    controlsForm.on('submit', function(e) {
      e.preventDefault();
      e.stopPropagation();

      return false;
    });

    BootstrapDialog.show({
      title: 'Controls',
      cssClass: 'controls-form-dialog',
      message: controlsForm,
      draggable: true,
      closeByBackdrop: false,
      closeByKeyboard: false,
      buttons: [{
        label: 'Close',
        action: function(dialogRef) {
          dialogRef.close();
        }
      }]
    });

    return false;
  }

  function toggleFractalTypesDialog(e) {
    e.preventDefault();
    e.stopPropagation();

    var fractalTypesEl = $('#fractalTypes').clone(false);

    fractalTypesEl.css({
      display: 'block'
    });

    fractalTypesEl.find('#ft-mandelbrot').on('click', function(e) {
      e.preventDefault();
      e.stopPropagation();

      var maxI = 50;
      var colorCycle = 10;
      var colorPhase = 0;
      var fractalType = 'mandelbrot';

      fractalViewer.centerX = -0.5;
      fractalViewer.centerY = 0.0;
      fractalViewer.viewWidth = 5.2;

      fractalViewer.currentFractalType = fractalType;

      updateFractalViewer(maxI, colorCycle, colorPhase);

      return false;
    });

    fractalTypesEl.find('#ft-rcf').on('click', function(e) {
      e.preventDefault();
      e.stopPropagation();

      var maxI = 50;
      var colorCycle = 15;
      var colorPhase = 0.35;
      var fractalType = 'rozuvan-circles-fractal';

      fractalViewer.centerX = 4.366526931088112;
      fractalViewer.centerY = -0.62812161248458;
      fractalViewer.viewWidth = 372.4972899876641;

      fractalViewer.currentFractalType = fractalType;

      updateFractalViewer(maxI, colorCycle, colorPhase);

      return false;
    });

    BootstrapDialog.show({
      title: 'Fractal Type',
      cssClass: 'fractal-types-dialog',
      message: fractalTypesEl,
      draggable: true,
      closeByBackdrop: false,
      closeByKeyboard: false,
      buttons: [{
        label: 'Close',
        action: function(dialogRef) {
          dialogRef.close();
        }
      }]
    });

    return false;
  }

  function toggleAboutDialog(e) {
    e.preventDefault();
    e.stopPropagation();

    var aboutDialogEl = $('#aboutDialog').clone(false);

    aboutDialogEl.css({
      display: 'block'
    });

    BootstrapDialog.show({
      title: 'About',
      cssClass: 'fractal-types-dialog',
      message: aboutDialogEl,
      draggable: true,
      closeByBackdrop: false,
      closeByKeyboard: false,
      buttons: [{
        label: 'Close',
        action: function(dialogRef) {
          dialogRef.close();
        }
      }]
    });

    return false;
  }

  function exportToPNG() {
    var canvas = document.getElementById('fractalViewerCanvas');
    return canvas.toDataURL('image/png');
  }

  return {
    init: init
  };
});
