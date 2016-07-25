define('FractalRunner', ['bootstrap-dialog', 'jquery'], function(BootstrapDialog, $) {
  'use strict';

  var fractalViewer;
  var mouseX;
  var mouseY;
  var dragging = false;
  var timeoutId;

  var DEFAULTS = {
    maxI: 50,
    colorCycle: 10,
    colorPhase: 0
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

  function init(FractalViewer) {
    fractalViewer = new FractalViewer(
      parseInt(getHashVariable('maxI')),

      parseFloat(getHashVariable('centerX')),
      parseFloat(getHashVariable('centerY')),
      parseFloat(getHashVariable('viewWidth'))
    );

    var canvas = document.getElementById('fractalViewerCanvas');

    $(window).on('resize', function(e) {
      fractalViewer.reshape();
      scheduleUpdateHash();
    });

    $('#controlToggler').on('click', toggleControlsForm);
    $('#exportToPngBtn').on('click', function() {
      window.open(exportToPNG(), '_newtab');
      return false;
    });

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
      '$cyclePhase=' + fractalViewer.colorPhase;
  }

  function setParametersFromHash() {
    var maxI = getHashVariable('maxI');
    var centerX = getHashVariable('centerX');
    var centerY = getHashVariable('centerY');
    var viewWidth = getHashVariable('viewWidth');
    var cyclePeriod = getHashVariable('cyclePeriod');
    var cyclePhase = getHashVariable('cyclePhase');

    if (centerX) {
      fractalViewer.centerX = parseFloat(centerX);
    }
    if (centerY) {
      fractalViewer.centerY = parseFloat(centerY);
    }
    if (viewWidth) {
      fractalViewer.viewWidth = parseFloat(viewWidth);
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
      title: 'Options',
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

  function exportToPNG() {
    var canvas = document.getElementById('fractalViewerCanvas');
    return canvas.toDataURL('image/png');
  }

  return {
    init: init
  };
});
