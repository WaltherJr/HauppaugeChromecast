
let developerConsole;

export function clearTooltipClasses() {
    $('.tooltip.is-visible').removeClass('is-visible');
    $('.tooltip.is-hidden').removeClass('is-hidden');
    $('.tooltip-pin-btn.state-pressed, tooltip-trigger.state-pressed').removeClass('state-pressed');
}

function setTooltipDropTargetHovered(tooltip, dropTargetHovered) {
    tooltip.find('.tooltip-trigger')[dropTargetHovered ? 'removeClass' : 'addClass']('drop-target-hovered')
}

function resetTooltip(tooltip) {
    tooltip.removeClass(['is-visible', 'has-been-dragged']).find('.tooltip-trigger').removeClass('state-pressed');
    unpinTooltip(tooltip);
    setTooltipDropTargetHovered(tooltip, false);
}

function isTooltipPinned(tooltip) {
    return tooltip.find('.tooltip-pin-btn').hasClass('state-pressed');
}

function pinTooltip(tooltip) {
    tooltip.find('.tooltip-pin-btn, .tooltip-trigger').addClass('state-pressed');
}

function unpinTooltip(tooltip) {
    tooltip.find('.tooltip-pin-btn, .tooltip-trigger').removeClass('state-pressed');
}

function moveTooltip(tooltip, event) {
    tooltip.find('.tooltip-text').css(getTooltipDropCoordinates(event, tooltip));
}

function isFrontMost(zIndex, otherZIndices) {
    const biggestOtherZIndex = Math.max(...otherZIndices);
    return zIndex >= biggestOtherZIndex; // Self z-index in still in zIndices list
}

function bringTooltipTextToFront(tooltipText) {
    const zIndices = $('#developer-mode-console .tooltip.is-stackable.is-visible').map((index, element) => parseInt($(element).find('.tooltip-text').css('z-index'))).toArray();

    if (!isFrontMost(parseInt(tooltipText.css('z-index')), zIndices)) {
        zIndices.sort();
        const biggestZIndex = zIndices[zIndices.length - 1];
        tooltipText.css('z-index', biggestZIndex + 1);
    }

}

function handleTooltipTriggerMouseOver() {
    const tooltipTrigger = $(this);
    const tooltipWrapper = tooltipTrigger.closest('.tooltip');

    if (!tooltipTrigger.hasClass('apansson')) {
        if (!tooltipWrapper.hasClass('is-hidden') && !tooltipWrapper.hasClass('has-been-dragged')) {
            const bodyHeight = $('body').outerHeight();
            const coords = $(this).offset();
            const dx = 32;
            const tooltipText = $(this).siblings('.tooltip-text');
            const tooltipTopOffset = 10;

            tooltipText.attr('data-arrow-left-pos', (tooltipWrapper.find('.tooltip-trigger').outerWidth() / 2) - dx);
            tooltipText.css({
                display: 'block',
                left: `${coords.left}px`,
                bottom: `${Math.round(bodyHeight - coords.top) + tooltipTopOffset}px`
            });
        }
    }
}

function handleTooltipTriggerMouseOut() {
    $(this).removeClass('apansson');
    const tooltipText = $(this).siblings('.tooltip-text');
    tooltipText.removeClass('fade-in').css({display: ''}); // Don't reset the left or bottom coord - element might need to be visible after the mouse has been hovered over it
}

function handleTooltipTriggerClick() {
    const tooltipTrigger = $(this);
    const tooltip = tooltipTrigger.closest('.tooltip');
    const tooltipIsPinned = isTooltipPinned(tooltipTrigger.closest('.tooltip'));

    if (!tooltipIsPinned) {
        pinTooltip(tooltip)
    } else {
        unpinTooltip(tooltip);
    }

    if (!tooltip.hasClass('is-hidden') && tooltip.hasClass('has-close-button')) {
        tooltip.toggleClass('is-visible', !tooltipIsPinned/* tooltipTrigger.hasClass('state-pressed') */);
    }
}

function handleTooltipTextClick() {
    bringTooltipTextToFront($(this));
}

function handleTooltipCloseButtonClick() {
    resetTooltip($(this).closest('.tooltip'));
}

function handleTooltipTextDragStart(event) {
    const tooltipPosition = $(this).offset();
    const tooltipHeight = $(this).outerHeight();
    const dragId = `drag-id-${new Date().getTime()}`;
    event.originalEvent.dataTransfer.effectAllowed = "move";

    developerConsole.data('tooltip-being-dragged-drag-id', dragId);
    $(this).closest('.tooltip').attr('data-drag-id', dragId).addClass('is-being-dragged').data({
        dx: event.clientX - tooltipPosition.left,
        dy: (tooltipPosition.top + tooltipHeight) - event.clientY
    })
    // const img = new Image();
    // img.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Uu36PUAAAAASUVORK5CYII=";
    // event.originalEvent.dataTransfer.setDragImage(img, 0, 0);
}

function handleTooltipDragEvent(event) {
    /*
    if (event.clientY !== 0) { // Avoid wierd value on the last event fired
        const tooltipPosition = $(this).offset();
        const tooltipHeight = $(this).outerHeight();
        const viewportHeight = document.documentElement.clientHeight;
        const xCoord = tooltipPosition.left + (event.clientX - tooltipPosition.left);
        const yCoord = tooltipPosition.top + (event.clientY - tooltipPosition.top);

        $(this).css({left: `${xCoord}px`, bottom: `${yCoord}px`});
    }
    */
}

function getTooltipDropCoordinates(event, tooltip) {
    const dx = tooltip.data('dx');
    const dy = tooltip.data('dy');
    return {left: `${event.clientX - dx}px`, bottom: `${(document.documentElement.clientHeight - event.clientY) - dy}px`};
}

function handleTooltipDragEnd(event) {
    const tooltipText = $(this);
    const tooltip = tooltipText.closest('.tooltip');
    tooltip.addClass('has-been-dragged').removeClass('is-being-dragged');
    pinTooltip(tooltip);
    moveTooltip(tooltip, event);
    bringTooltipTextToFront(tooltipText);
}

function handleTooltipTriggerDragOverEvent(event) {
    event.preventDefault();
}

/*
function handleTooltipTriggerDropEvent(event) {
    event.preventDefault();
    const dropTarget = $(event.target);

    if (dropTarget.hasClass('tooltip-trigger')) {
        const targetTooltip = $(this).closest('.tooltip');
        const targetDragId = targetTooltip.attr('data-drag-id');
        const originalDragId = developerConsole.data('tooltip-being-dragged-drag-id');
        const originalTooltip = $(`.tooltip[data-drag-id="${originalDragId}"]`);

        if (targetDragId === originalDragId) {
            moveTooltip(originalTooltip, event);
            // event.stopPropagation();
            targetTooltip.find('.tooltip-trigger').addClass('apansson');

            setTimeout(function() {
                resetTooltip(originalTooltip);
            }, 300);
        }
    }
}
*/

function isOriginalDropTarget(targetTooltip, event) {
    const targetDragId = targetTooltip.attr('data-drag-id');
    const originalDragId = developerConsole.data('tooltip-being-dragged-drag-id');
    return targetDragId === originalDragId;
}

function handleTooltipTriggerDropEvent(event) {
    event.preventDefault();
    const dropTarget = $(event.target);

    if (dropTarget.hasClass('tooltip-trigger')) {
        const targetTooltip = $(this).closest('.tooltip');
        const originalDragId = developerConsole.data('tooltip-being-dragged-drag-id')
        const originalTooltip = $(`.tooltip[data-drag-id="${originalDragId}"]`);

        if (isOriginalDropTarget(targetTooltip, event)) {
            console.log('IS ORIGINAL TARGET');
            moveTooltip(targetTooltip, event);
            // event.stopPropagation();
            targetTooltip.find('.tooltip-trigger').addClass('apansson');

            setTimeout(function() {
                resetTooltip(targetTooltip);
            }, 300);
        }
    }
}

function handleTooltipTriggerDragEnterEvent(event) {
    const tooltip = $(event.target).closest('.tooltip');

    if (isOriginalDropTarget(tooltip, event)) {
        setTooltipDropTargetHovered(tooltip, true);
    }
}

function handleTooltipTriggerDragLeaveEvent() {
    setTooltipDropTargetHovered($(this).closest('.tooltip'), false);
}

function handleTooltipTextMouseDownEvent(event) {
    // TODO: check for left mouse button
    setTooltipDropTargetHovered($(event).closest('.tooltip'));
}

$(document).ready(function() {
    /*target.addEventListener("dragover", (ev) => {
        ev.preventDefault();
    });
    target.addEventListener("drop", (ev) => {
        ev.preventDefault();
        const data = ev.dataTransfer.getData("text/plain");
        ev.target.append(data);
    });
    */
    developerConsole = $('#developer-mode-console');

    $('body')
        .on('click', '.tooltip-close-btn', handleTooltipCloseButtonClick)

        .on('click', '.tooltip-text', handleTooltipTextClick)
        .on('dragstart', '.tooltip-text', handleTooltipTextDragStart)
        .on('drag', '.tooltip-text', handleTooltipDragEvent)
        .on('dragend', '.tooltip-text', handleTooltipDragEnd)
        .on('mousedown', '.tooltip-text', handleTooltipTextMouseDownEvent)

        .on('mouseover', '.tooltip-trigger', handleTooltipTriggerMouseOver)
        .on('mouseout', '.tooltip-trigger', handleTooltipTriggerMouseOut)
        .on('click', '.tooltip-trigger', handleTooltipTriggerClick)
        .on('dragover', '.tooltip-trigger', handleTooltipTriggerDragOverEvent)
        .on('drop', '.tooltip-trigger', handleTooltipTriggerDropEvent)
        .on('dragenter', '.tooltip-trigger', handleTooltipTriggerDragEnterEvent)
        .on('dragleave', '.tooltip-trigger', handleTooltipTriggerDragLeaveEvent)
});
