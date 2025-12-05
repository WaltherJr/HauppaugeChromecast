import * as handlebars from './handlebars.js';
import * as developer_console from "../pages/developer_console/developer_console.js";
import * as ui from '../ui/ui.js'

let updateMouseCoordsTimer;
let insertedTooltipCount = 0;

const responseHandlerMappings = {
    'application/json': 'json',
    'text/plain': 'text'
}

function handleFetchError(error) {
    console.error('There was a problem with the fetch operation!!!', error);
}

function createFetchRequestParams(httpMethod, contentType, body) {
    let requestParameters = {method: httpMethod, headers: {'Content-Type': contentType}};
    if (body) {
        requestParameters.body = JSON.stringify(body);
    }

    return requestParameters;
}

async function fetchRequest(url, parameters) {
    return fetch(url, parameters).then(response => {
         if (!response.ok) {
             throw new Error('Network response was not ok');
         }
         const responseHandler = responseHandlerMappings[parameters.headers['Content-Type']];
         return response[responseHandler]();

    }).catch(error => handleFetchError)
}

export function updatePageQueryParameter(parameterName, parameterValue) {
    let url = new URL(window.location);
    let params = new URLSearchParams(url.search);

    params.set(parameterName, parameterValue);
    url.search = params.toString(); // Update the URL with the new query parameters
    window.history.pushState({}, '', url); // Update the browser's URL without reloading the page
}

export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function reloadPageSearchParams(callback) {
    const url = new URL(window.location);
    callback(url.searchParams);
    window.location = url.toString();
}

export function cssFloatToInteger(cssFloatString) {
    return parseFloat(cssFloatString) * 1000;
}

export async function getText(url) {
    return fetchRequest(url, createFetchRequestParams('GET', 'text/plain'));
}

export async function getJson(url) {
    return fetchRequest(url, createFetchRequestParams('GET', 'application/json'));
}

export async function putJson(url, body) {
    return fetchRequest(url, createFetchRequestParams('PUT', 'application/json', body));
}

export async function patchJson(url, body) {
    return fetchRequest(url, createFetchRequestParams('PATCH', 'application/json', body));
}

export function getFormattedDate(dateDelta) {
    const date = new Date();
    date.setDate(new Date().getDate() + dateDelta);
    return date.toISOString().split('T')[0];
}

export function createInspectionBoundingBox(element) {
    const boundingBox = $(document.createElement('div')).addClass('inspected-bounding-box');
    boundingBox.css({left: element.offset().left, top: element.offset().top, width: element.outerWidth(), height: element.outerHeight()});
    $('body').append(boundingBox);
}

export function handleCalledFunctionParameterMouseOut() {
    $('.developer-mode-inspected').removeClass('developer-mode-inspected');
    $('.inspected-bounding-box').remove();
}

export function handleDocumentMouseMove(event) {
    clearTimeout(updateMouseCoordsTimer);
    updateMouseCoordsTimer = setTimeout(() => {
        developer_console.updateMouseCoordinates(event.clientX, event.clientY);
    }, 300);
}

async function generateFunctionDefinition(functionDefinition) {
    const functionDefPretty = await prettier.format(functionDefinition, {
        parser: "babel",
        semi: true,
        tabWidth: 3,
        singleQuote: true,
        plugins: prettierPlugins,
    });

    return {
        functionDefPretty: functionDefPretty,
        functionDefPrettyAndHighlighted: hljs.highlight(
            functionDefPretty, {
                language: 'javascript',
                theme: 'arduino-light-min'
            }
        ).value
    }
}

export function createTransparentImage() {
    const img = new Image();
    img.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Uu36PUAAAAASUVORK5CYII=";
    return img;
}

export function proxifyFunctionDeveloperMode(functionToOverride) {
    return new Proxy(functionToOverride, {
        async apply(target, thisArg, argumentsList) {
            const timestamp = new Date().toLocaleString();
            const functionDefinition = target.toString();
            const functionDefFormatted = await generateFunctionDefinition(functionDefinition);

            insertedTooltipCount++;
            const developerModeMessage = await handlebars.renderHandlebarsTemplate('/js/templates/developer-mode-message.hbs',
                {functionName: target.name, functionDefinition: functionDefinition, functionDefFormatted: functionDefFormatted, parameters: argumentsList, tooltipZIndex: insertedTooltipCount});

            developer_console.queueDeveloperModeMessageInsertion(`<li class="item-enter-anim" data-anim-duration="${developer_console.insertDeveloperMessageAnimationDuration}"><span class="developer-mode-message-time">${timestamp}</span>${developerModeMessage}</li>`);


            console.log('INDEX2: ' + insertedTooltipCount);
            return target(...argumentsList);
        }
    })
}

reloadPageSearchParams = proxifyFunctionDeveloperMode(reloadPageSearchParams);
updatePageQueryParameter = proxifyFunctionDeveloperMode(updatePageQueryParameter);
