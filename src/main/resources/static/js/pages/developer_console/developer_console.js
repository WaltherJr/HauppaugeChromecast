import * as utils from '../../utils/utils.js';
import * as jquery from '../../utils/jquery.js';
import * as tooltip from '../../ui/tooltip.js';
import * as ui from '../../ui/ui.js';
import * as object_strings_jquery from './object_strings/jquery.js';

const developerModeMessages = $('#developer-mode-messages'); // jquery.jQueryWrapper('#developer-mode-messages');
const developerConsole = $('#developer-mode-console');
const developerConsoleResizeBar = $('#developer-console-resize-bar');
const hideOrShowDeveloperConsoleButton = $('button#hide-or-show-developer-console');
export const insertDeveloperMessageAnimationDuration = document.app_config.animations.developer_console_message_insert_animation.duration;
export const developerConsoleMessageLimit = document.app_config.developer_console.message_limit;
let lastInsertedDeveloperMessageTimestamp = new Date();

Handlebars.registerHelper('buildParameterListHtml', buildParameterListHtml);

const insertQueuedDeveloperModeMessageInterval = utils.cssFloatToInteger(insertDeveloperMessageAnimationDuration);
setInterval(insertQueuedDeveloperModeMessage, insertQueuedDeveloperModeMessageInterval);

hideOrShowDeveloperConsoleButton.on('click', function() {
    toggleDeveloperConsoleVisibility($(this).hasClass('state-pressed'));
});

$(document).ready(function() {
    /*
    $('body').on('mouseover', 'ul.called-function-parameter-list > li', utils.handleCalledFunctionParameterMouseOver)
        .on('mouseout', 'ul.called-function-parameter-list > li', utils.handleCalledFunctionParameterMouseOut);
    */

    $('button#close-developer-console-function-tooltips').on('click', function() {
        closeDeveloperConsoleTooltips(1000);
    });

    developerConsoleResizeBar.on('click', handleDeveloperConsoleClickEvent)
        //.on('drag', handleDeveloperConsoleResizeBarDragEvent) // TODO: generalize for all .resize-bar:s
        .on('dragend', handleDeveloperConsoleResizeBarDragEndEvent);

    $('button#clear-developer-console').on('click', function() {
        clearDeveloperConsoleData();
        ui.switchHighlightJSTheme('atom-one-dark');
    });

    $('button#toggle-developer-console-mouse-coords').on('click', function() {
        $(this).siblings('#developer-console-mouse-coords').css('width', $(this).hasClass('state-pressed') ? '0px' : '');
    });
});

export async function closeDeveloperConsoleTooltips(sleepDuration) {
    const tooltips = developerConsole.find('.tooltip.is-visible').toArray();

    for (let i = 0; i <= tooltips.length; i++) {
        let tooltip = $(tooltips[i]);
        tooltip.removeClass('is-visible').closest('.tooltip').find('.tooltip-trigger.state-pressed').removeClass('state-pressed');
        await utils.sleep(sleepDuration);
    }
}

export function clearDeveloperConsoleData() {
    developerModeMessages.attr({'data-groups-count': '0', 'data-message-count': '0'});
    developerModeMessages.html('');
    document.objectRefs = undefined;
}

export function queueDeveloperModeMessageInsertion(message) {
    if (!document.developerModeMessages) {
        document.developerModeMessages = [message];
    } else {
        document.developerModeMessages.push(message);
    }
}

function printObjectValue(object) {

}

function mapParameterTypeValue(value) {
    const responseMapping = (value, type, objectRef) => {
        const returnVal = {value: value};

        if (type) {
            returnVal.type = type;
        }
        if (objectRef) {
            returnVal.objectRef = objectRef;
        }
        return returnVal;
    }

    if (value === undefined || value === null) {
        return responseMapping(value);
    } else if (typeof value === "string") {
        return responseMapping(`"${value}"`, 'string');
    } else if (typeof value === 'number') {
        return responseMapping(value, Number.isInteger(value) ? 'integer': 'float');
    } else if (typeof value === 'boolean') {
        return responseMapping(value, 'boolean');
    } else if (value instanceof jQuery) {
        return responseMapping(object_strings_jquery.print(value), 'jQuery', value.get()); // TODO: should be able to store multiple elements, not just one
    } else if (typeof value === 'object') {
        return responseMapping(printObjectValue(value), 'object', value);
    } else {
        return {};
    }
}

function buildParameterListHtml(functionDefinition, argumentsList) {
    if (document.functionCallNumber) {
        document.functionCallNumber = document.functionCallNumber + 1;
    } else {
        document.functionCallNumber = 1;
    }
    const paramNames = functionDefinition.match(/function ([^\s]+)\(([^)]+)\)/);
    const parameterList = paramNames.length >= 3 ? paramNames[2].split(/\s*(?:=[^,]+)?,\s*/) : []; // Take default parameter values into account
    const html = Object.entries(parameterList).map(([key, value]) => {
        const suppliedArgument = argumentsList[key];
        const mappedParameterValue = mapParameterTypeValue(suppliedArgument);
        const parameterName = value;
        let newListItem = '<li';

        if (mappedParameterValue.type) {
            newListItem += ` data-parameter-type="${mappedParameterValue.type}"`;
        }
        newListItem += ` data-parameter-name="${parameterName}">${mappedParameterValue.value}</li>`;

        storeObjectReference(parameterName, mappedParameterValue);
        return newListItem;
    }).join('');

    return html;
}

function storeObjectReference(parameterName, mappedParameterValue) {
    if (!document.objectRefs) {
        document.objectRefs = {};
    }
    if (!document.objectRefs[`${document.functionCallNumber}`]) {
        document.objectRefs[`${document.functionCallNumber}`] = {};
    }
    if (mappedParameterValue.objectRef) {
        document.objectRefs[`${document.functionCallNumber}`][parameterName] = mappedParameterValue.objectRef;
    }
}

export function handleCalledFunctionParameterMouseOver() {
    const calledFunctionIndex = $(this).parent().closest('li').index();
    const numberOfObjectRefs = Object.keys(document.objectRefs || {}).length;
    const calledFunctionObjectRefs = numberOfObjectRefs !== 0 ? document.objectRefs[numberOfObjectRefs - calledFunctionIndex] : {};
    const parameterName = $(this).attr('data-parameter-name');
    const storedObjectRef = calledFunctionObjectRefs[parameterName];

    if (storedObjectRef) {
        $(storedObjectRef).addClass('developer-mode-inspected');
        utils.createInspectionBoundingBox($(storedObjectRef));
    }
}

export function updateMouseCoordinates(x, y) {
    $('#developer-console-mouse-coords-x').text(`x: ${x}`);
    $('#developer-console-mouse-coords-y').text(`y: ${y}`);
}

function handleDeveloperConsoleClickEvent() {
    if ($(event.target).closest('button').length === 0) { // Separate handler already added if clicking a developer console action button
        handleDeveloperConsoleResizeBarClick();
    }
}

function handleDeveloperConsoleResizeBarDragEndEvent() {
    developerModeMessages.css('max-height', developerModeMessages.css('height'));
}

/*
function handleDeveloperConsoleResizeBarDragEvent(event) {
    developerModeMessages.css('max-height', '');
    const initialCoords = $(this).data('initialCoords');
    const initialDimensions = $(this).data('initialDimensions');
    const resizeProp = $(this).data('resizeProp');
    const newHeight = initialDimensions.height + (initialCoords.clientY - event.clientY);
    console.log(resizeProp);

    if (event.clientY !== 0) { // Avoid wierd value on the last event fired
        developerModeMessages.css('height', `${newHeight}px`);
    }
}
*/

/*
function handleDeveloperConsoleResizeBarDragEvent(event) {
    developerModeMessages.css('max-height', '');
    const offsetY = event.offsetY;

    if (event.clientY !== 0) { // Avoid wierd value on the last event fired
        developerModeMessages.css('height', `-=${offsetY}px`);

        developerConsole.find('.tooltip.is-visible > .tooltip-text').each(function(index, element) {
            $(element).css('bottom', `-=${offsetY}px`);
        });
    }
}
*/

function handleDeveloperConsoleResizeBarClick() {
    hideOrShowDeveloperConsoleButton.toggleClass('state-pressed');
    const developerConsoleHasBeenDragged = developerConsole.hasClass('has-been-dragged');
    developerConsole.removeClass('has-been-dragged');
    let isExpanding = developerConsoleHasBeenDragged ? false : hideOrShowDeveloperConsoleButton.hasClass('state-pressed');

    if (developerModeMessages.css('height') === '0px') {
        developerModeMessages.css('height', ''); // Should expand when clicking and the console's been dragged to 0px before
        isExpanding = true;
    }
    tooltip.clearTooltipClasses();

    if (isExpanding) {
        developerConsole.addClass('is-expanding');
        developerConsole.find('.tooltip').addClass('is-hidden'); // Don't show tooltips during animation phase
        const animDuration = utils.cssFloatToInteger(developerModeMessages.attr('data-anim-duration'));

        setTimeout(function() {
            developerConsole.removeClass('is-expanding');
            developerConsole.find('.tooltip').removeClass('is-hidden');
        }, animDuration);
    }
    toggleDeveloperConsoleVisibility(isExpanding);
}

function shouldCreateNewMessageGroup() {
    return (new Date() - lastInsertedDeveloperMessageTimestamp) > parseInt(document.app_config.developer_console.last_inserted_message_cluster_threshold);
}

export function insertQueuedDeveloperModeMessage() {
    const nextInsertedDeveloperModeMessage = (document.developerModeMessages || []).pop();

    if (nextInsertedDeveloperModeMessage) {
        let insertMsg = nextInsertedDeveloperModeMessage;

        /*
        if (developerModeMessages.children('.developer-mode-messages').length >= developerConsoleMessageLimit) {
            const lastMessageGroup = developerModeMessages.children('.developer-mode-messages:last-child');

            const a = lastSeparator.index();
            const b = lastMessage.index();
            lastMessageGroup.remove();

        }
        */

        const messagesCount = parseInt(developerModeMessages.attr('data-message-count')) + 1;

        if (shouldCreateNewMessageGroup()) {
            // Create a new message group and insert the message
            const messageGroup = $('<ul class="developer-mode-message-group"></ul>');

            const groupsCount = parseInt(developerModeMessages.attr('data-groups-count')) + 1;
            developerConsole.css({'--dc-groups-count': groupsCount, '--dc-messages-count': messagesCount});
            developerModeMessages.attr({'data-groups-count': groupsCount, 'data-message-count': messagesCount}).prepend(messageGroup.prepend(insertMsg));
        } else {
            // Just insert into last message group
            developerConsole.css('--dc-messages-count', messagesCount);
            developerModeMessages.attr('data-message-count', messagesCount)
                .children('.developer-mode-message-group:first-child').prepend(insertMsg);
        }

        lastInsertedDeveloperMessageTimestamp = new Date();
    }
}

export function toggleDeveloperConsoleVisibility(visible) {
    if (visible) {
        developerModeMessages.css('max-height', `${developerConsole.attr('data-initial-height')}px`);
    } else {
        developerModeMessages.css('max-height', '0');
    }
}
