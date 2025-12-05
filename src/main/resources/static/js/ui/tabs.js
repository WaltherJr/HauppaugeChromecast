import * as utils from "../utils/utils.js";

export function setActiveTab(listItem, anchorElement, event) {
    if (event) {
        event.preventDefault();
    }
    setActiveTabContent(listItem, anchorElement.attr('href'));
}

export function setActiveTabContent(contentTabOrTabHeading, hash) {
    const tabIndex = $(contentTabOrTabHeading).index() + 1;
    const tabsContainer = $(contentTabOrTabHeading).closest('.tabs');
    const items = tabsContainer.find(`.tab-headings > li:nth-child(${tabIndex}), .tab-content-wrapper > li:nth-child(${tabIndex})`);
    items.addClass('active-tab').siblings().removeClass('active-tab');
    window.location.hash = hash;
}

$(document).ready(function() {
    $('body').on('click', '.tabs > .tab-headings a', function(event) {
        setActiveTab($(this).closest('li'), $(this), event);
    });
});

setActiveTab = utils.proxifyFunctionDeveloperMode(setActiveTab);
setActiveTabContent = utils.proxifyFunctionDeveloperMode(setActiveTabContent);
