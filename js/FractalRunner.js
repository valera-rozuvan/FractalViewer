define('FractalRunner', [], function() {
  'use strict';

  var fractalViewer;
  var mouseX;
  var mouseY;
  var dragging = false;
  var trackParameters;
  var timeoutId;

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

    var iterControl = document.getElementById('iterControl');
    var updateButton = document.getElementById('updateFractalViewer');
    var controlToggler = document.getElementById('controlToggler');
    var exportToPngBtn = document.getElementById('exportToPngBtn');
    var controlsForm = document.getElementById('controlsForm');
    var canvas = document.getElementById('fractalViewerCanvas');

    window.onresize = function(e) {
      fractalViewer.reshape();
      scheduleUpdateHash();
    };

    controlToggler.onclick = toggleControlsForm;
    exportToPngBtn.onclick = function() {
      window.open(exportToPNG(), '_newtab');
      return false;
    };

    controlsForm.onsubmit = function() {
      updateFractalViewer();
      return false;
    };

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

  function updateFractalViewer() {
    var maxI = parseInt(document.getElementById('iterControl').value);
    fractalViewer.maxI = maxI;
    fractalViewer.colorCycle = parseInt(document.getElementById('cycleColorsPeriod').value);
    fractalViewer.colorPhase = parseFloat(document.getElementById('cycleColorsPhase').value);
    trackParameters = document.getElementById('trackParameters').checked;
    updateHash();
    fractalViewer.reshape();
    return false;
  }

  function scheduleUpdateHash() {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(updateHash, 300);
  }

  function updateHash() {
    if (trackParameters) {
      window.location.hash = '' +
        '#maxI=' + fractalViewer.maxI +
        '$centerX=' + fractalViewer.centerX +
        '$centerY=' + fractalViewer.centerY +
        '$viewWidth=' + fractalViewer.viewWidth +
        '$cyclePeriod=' + fractalViewer.colorCycle +
        '$cyclePhase=' + fractalViewer.colorPhase +
        '$trackParameters=' + trackParameters;
    }
  }

  function setParametersFromHash() {
    var maxI = getHashVariable('maxI');
    var centerX = getHashVariable('centerX');
    var centerY = getHashVariable('centerY');
    var viewWidth = getHashVariable('viewWidth');
    var cyclePeriod = getHashVariable('cyclePeriod');
    var cyclePhase = getHashVariable('cyclePhase');
    var trackParameters = getHashVariable('trackParameters');

    if (maxI) {
      document.getElementById('iterControl').value = parseInt(maxI);
    }
    if (centerX) {fractalViewer.centerX = parseFloat(centerX);}
    if (centerY) { fractalViewer.centerY = parseFloat(centerY); }
    if (viewWidth) { fractalViewer.viewWidth = parseFloat(viewWidth);}
    if (cyclePeriod) {document.getElementById('cycleColorsPeriod').value = cyclePeriod;}
    if (cyclePhase) { document.getElementById('cycleColorsPhase').value = cyclePhase;}
    if (trackParameters) {document.getElementById('trackParameters').checked = trackParameters;}

    updateFractalViewer();
  }

  function toggleControlsForm() {
    var controlsForm = document.getElementById('controlsForm');
    var controlToggler = document.getElementById('controlToggler');
    if (!controlsForm.style.display) {
      controlToggler.innerHTML = '-controls';
      controlsForm.style.display = 'block';
    }else {
      controlToggler.innerHTML = '+controls';
      controlsForm.style.display = '';
    }
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
