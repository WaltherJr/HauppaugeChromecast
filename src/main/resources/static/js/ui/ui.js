import * as utils from '../utils/utils.js';

$(document).ready(function() {
    // TODO: add a proxy in home.js and let functions like these attach event listeners first (should have highest priority since they modify state)
    $('body').on('click', 'button.two-states, input[type="submit"].two-states', function() {
        $(this).toggleClass('state-pressed');
    });

    $('.resize-bar[draggable="true"]')
        .on('dragstart', handleResizeBarDragStartEvent)
        .on('drag', handleResizeBarDragEvent)
});

function handleResizeBarDragStartEvent(event) {
debugger;
    const resizeTarget = $(this).attr('data-resize-target');
    $(this).data('initialCoords', {clientX: event.clientX, clientY: event.clientY});
    $(this).data('initialDimensions', {width: $(resizeTarget).outerWidth(), height: $(resizeTarget).outerHeight()});
    $(this).data('resizeProp', $(this).attr('data-resize-target-prop'));

    if ($(this).hasClass('no-drag-image')) {
        event.originalEvent.dataTransfer.setDragImage(utils.createTransparentImage(), 0, 0);
    }
}

function handleResizeBarDragEvent(event) {
    $(this).addClass('has-been-dragged');
    const initialCoords = $(this).data('initialCoords');
    const initialDimensions = $(this).data('initialDimensions');
    const resizeProp = $(this).data('resizeProp');
    const targetElement = $($(this).attr('data-resize-target'));
    targetElement.css({'max-width': '', 'max-height': ''});
    const resizeAxis = resizeProp === 'width' ? 'X' : 'Y';
    const clientCoordKey = `client${resizeAxis}`;
    const dxOrDy = (initialCoords[clientCoordKey] - event[clientCoordKey]);
    const newWidthOrHeight = initialDimensions[resizeProp] + dxOrDy;

    if (event[clientCoordKey] !== 0) { // Avoid wierd value on the last event fired
        console.log(clientCoordKey, resizeProp);
        console.log(resizeProp, `${newWidthOrHeight}px`);
        targetElement.css(resizeProp, newWidthOrHeight + 'px');
    }
}

export function switchHighlightJSTheme(themeName) {
  document.getElementById('hljs-theme').href = `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/${themeName}.css`;
}
