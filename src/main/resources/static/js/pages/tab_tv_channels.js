import * as utils from '../utils/utils.js';
import * as tv_channels_list from './tab_tv_channels/tv_channels_list.js';

const lastScrolledHandlerTimeout = parseInt(document.app_config['last_scrolled_handler_timeout']);
let mainChannelList;

function setInspectedChannel(listItem) {
    let newHeight = $('#tab-tv-channels').height();
    newHeight -= listItem.find('.channel-banner').outerHeight() - 50;
    const listPosition = listItem.position();

debugger;

    $('#main-channel-list').animate({scrollTop: listPosition.top}, 700, function() {
        listItem.addClass('currently-inspected-channel').find('.flex-parent').css('max-height', `${Math.round(newHeight)}px`);
    });
}

async function closeInspectedChannel(listItem) {
    listItem.removeClass('currently-inspected-channel').find('.flex-parent').css('max-height', '');
    utils.sleep(1000);
}

export async function changeInspectedChannelListItem(listItem) {
    await closeInspectedChannel(listItem.siblings('.currently-inspected-channel'));
    setInspectedChannel(listItem);
    // TODO: different animation durations!
}

function updateProgrammeDescriptionScrollPosition() {
    $('#main-channel-list .flex-parent').each(function(index, element) {
        const marginTop = Math.round(element.scrollTop);
        $(element).find('.currently-inspected-programme-description').css('margin-top', `${marginTop}px`);
    });
}

export function scrollToChannelListItem(scrollableContainer, listItem, openListItem) {
    if (listItem.length !== 0) {
        const topRelativeToChannelList = listItem.position().top + scrollableContainer.scrollTop();

        scrollableContainer.animate({
            scrollTop: `${Math.round(topRelativeToChannelList)}px`
        }, 700);
    }

    if (openListItem) {
        listItem.toggleClass('programme-list-open');
        openListItem.listContainer.css('max-height', listItem.hasClass('programme-list-open') ? `${Math.round(openListItem.listItemHeight)}px` : '0');
    }
}

export function setCurrentChannelProgrammesListPosition(mainChannelList) {
    const currentChannelProgrammes = mainChannelList.find('ul.channel-programmes-day-list:first-child > li.channel-programme-details').toArray();

    currentChannelProgrammes.forEach(programme => {
        const listItemTopPosition = $(programme).position().top;
        const roundedTopPosition = Math.round(listItemTopPosition);
        const listTopCSSValue = `-${roundedTopPosition}px`;
        const firstChannelProgramme = $(programme).closest('ul').children('li').first();

        firstChannelProgramme.css('margin-top', listTopCSSValue);
    });
}

export function setResizeObservers(resizeObserversDefs) {
    resizeObserversDefs.forEach(resizeObserverDef => {
        const observer = new ResizeObserver(entries => resizeObserverDef.callback(entries[0]));
        observer.observe($(resizeObserverDef.selector).get(0));
    })
}

export async function setIntersectionObservers() {
    /*
    const nav = $('#main-left-panel > h2').get();
    const sentinel = $('li[data-channel-name]').get(6);
    const sentinel2 = $(sentinel).find('.channel-programmes-list-tomorrow-heading').get(0);
    const rootElement = document.querySelector('#main-channel-list');

    new IntersectionObserver(([e]) => {
        console.log('INTERSECTING 1!');
    }, {
        root: rootElement,
        rootMargin: "0px",
        scrollMargin: "0px",
        threshold: 1.0,
    }).observe(sentinel);

    new IntersectionObserver(([e]) => {
        console.log('INTERSECTING 2!');
        sentinel2.classList.toggle('fixed', e.intersectionRatio === 0);
        const a = $('h2').offset().top + $('h2').outerHeight();
        $(sentinel2).css('top', Math.round(a) + 'px');

    }, {
        root: rootElement,
        rootMargin: "0px",
        scrollMargin: "0px",
        threshold: 1.0,
    }).observe(sentinel2);
    */
}

$(document).ready(function() {
    setInterval(function() {
        const lastScrolledThreshold = parseInt(document.app_config['last_scrolled_threshold']);

        if (document.lastScrolled && new Date() - document.lastScrolled > lastScrolledThreshold) {
            updateProgrammeDescriptionScrollPosition();
            document.lastScrolled = undefined;
        }
    }, lastScrolledHandlerTimeout);

    mainChannelList = $('#main-channel-list');

    $('body').on('click', 'ul#main-channel-list > li .channel-banner', function() {
        const listItem = $(this).closest('li');

        if (!listItem.hasClass('currently-inspected-channel')) {
            changeInspectedChannelListItem(listItem);
        } else {
            // Same channel - close it
            closeInspectedChannel(listItem);
        }
    }).on('click', '.channel-programmes-day-list > li > a', function() {
        const programmeListItem = $(this).closest('li');
        const programmeImageUrl = programmeListItem.attr('data-programme-image');
        const programmeDescription = programmeListItem.attr('data-programme-description');

        programmeListItem.parent().parent().find('.currently-inspected-programme').removeClass('currently-inspected-programme');
        programmeListItem.addClass('currently-inspected-programme');

        tv_channels_list.showProgrammeDetails($(this), programmeImageUrl, programmeDescription);

    }).on('click', '.zap-to-channel-btn', function(event) {
        if ($(event.target).hasClass('channel-banner')) {
            tv_channels_list.zapToChannel($(this).closest('[data-channel-name]').attr('data-channel-name'));
        }
    });
});

updateProgrammeDescriptionScrollPosition = utils.proxifyFunctionDeveloperMode(updateProgrammeDescriptionScrollPosition);
changeInspectedChannelListItem = utils.proxifyFunctionDeveloperMode(changeInspectedChannelListItem);
setCurrentChannelProgrammesListPosition = utils.proxifyFunctionDeveloperMode(setCurrentChannelProgrammesListPosition);
scrollToChannelListItem = utils.proxifyFunctionDeveloperMode(scrollToChannelListItem);
