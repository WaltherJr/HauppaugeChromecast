
const lastScrolledHandlerTimeout = parseInt(document.app_config['last_scrolled_handler_timeout']);

function changeInspectedChannelListItem() {
    const listItem = $(this);
    const selectedChannelName = listItem.attr('data-channel-name');
    const isProgrammeDetailsChild = $(event.target).closest('li.channel-programme-details').length !== 0;
    const otherChannelListItemOpen = listItem.siblings('li.programme-list-open').get(0);
    if (otherChannelListItemOpen) {
        clearInspectedProgrammeImages(); // Reset inspected programme image
    }

    listItem.siblings('li.programme-list-open').removeClass('programme-list-open').find('.flex-parent').css('max-height', '0');

    updatePageQueryParameter('selectedChannel', selectedChannelName);
    localStorage.setItem('lastSelectedChannel', selectedChannelName);

    if (!isProgrammeDetailsChild) {
        // Only toggle list if not clicking on a programme information link
        const newHeight = computeMaxHeightOfChannelListItem(listItem);
        const flexParent = listItem.find('.flex-parent');

        const channelDisplayAnimationDelay = cssFloatToInteger(document.app_config.channel_item_display_animation.duration);

        setTimeout(function () {
            scrollToChannelListItem($('#tab-tv-channels'), listItem, {listContainer: flexParent, listItemHeight: newHeight});

        }, channelDisplayAnimationDelay);
    }
}

function updateProgrammeDescriptionScrollPosition() {
    $('#main-channel-list .flex-parent').each(function(index, element) {
        const marginTop = Math.round(element.scrollTop);
        $(element).find('.currently-inspected-programme-description').css('margin-top', `${marginTop}px`);
    });
}

function scrollToChannelListItem(scrollableContainer, listItem, openListItem) {
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

function setCurrentChannelProgrammesListPosition(mainChannelList) {
    const currentChannelProgrammes = mainChannelList.find('ul.channel-programmes-day-list:first-child > li.channel-programme-details').toArray();

    currentChannelProgrammes.forEach(programme => {
        const listItemTopPosition = $(programme).position().top;
        const roundedTopPosition = Math.round(listItemTopPosition);
        const listTopCSSValue = `-${roundedTopPosition}px`;
        const firstChannelProgramme = $(programme).closest('ul').children('li').first();

        firstChannelProgramme.css('margin-top', listTopCSSValue);
    });
}

function setResizeObservers(resizeObserversDefs) {
    resizeObserversDefs.forEach(resizeObserverDef => {
        const observer = new ResizeObserver(entries => resizeObserverDef.callback(entries[0]));
        observer.observe($(resizeObserverDef.selector).get(0));
    })
}

async function setIntersectionObservers() {
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

setInterval(function() {
    const lastScrolledThreshold = parseInt(document.app_config['last_scrolled_threshold']);

    if (document.lastScrolled && new Date() - document.lastScrolled > lastScrolledThreshold) {
        updateProgrammeDescriptionScrollPosition();
        document.lastScrolled = undefined;
    }
}, lastScrolledHandlerTimeout);
