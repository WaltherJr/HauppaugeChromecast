
const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1);

function callAppFunction(functionName, developerModeMessage) {
    eval(functionName + '();');
    const timestamp = new Date().toLocaleString();
    $('#developer-mode-messages').prepend(`<li><span class="developer-mode-message-time">${timestamp}</span><span class="developer-mode-message">${developerModeMessage}</span></li>`);
}

function setActiveTab(event) {
    event.preventDefault();
    setActiveTabContent($(this).closest('li'), $(this).attr('href'));
}

function setActiveTabContent(contentTabOrTabHeading, hash) {
    const tabIndex = $(contentTabOrTabHeading).index() + 1;
    const tabsContainer = $(contentTabOrTabHeading).closest('.tabs');
    const items = tabsContainer.find(`.tab-headings > li:nth-child(${tabIndex}), .tab-content-wrapper > li:nth-child(${tabIndex})`);
    items.addClass('active-tab').siblings().removeClass('active-tab');
    window.location.hash = hash;
}

function updatePageQueryParameter(parameterName, parameterValue) {
    let url = new URL(window.location);
    let params = new URLSearchParams(url.search);

    params.set(parameterName, parameterValue);
    url.search = params.toString(); // Update the URL with the new query parameters
    window.history.pushState({}, '', url); // Update the browser's URL without reloading the page
}

function reloadPageSearchParams(callback) {
    const url = new URL(window.location);
    callback(url.searchParams);
    window.location = url.toString();
}

function cssFloatToInteger(cssFloatString) {
    return parseFloat(cssFloatString) * 1000;
}

function getText(url) {
    return fetch(url).then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.text();
    }).catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });
}

function getJSON(url) {
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        }).catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

function putJSON(url, body) {
    return fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: body
    }).then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    }).catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });
}

function getFormattedDate(dateDelta) {
    const date = new Date();
    date.setDate(new Date().getDate() + dateDelta);
    return date.toISOString().split('T')[0];
}
