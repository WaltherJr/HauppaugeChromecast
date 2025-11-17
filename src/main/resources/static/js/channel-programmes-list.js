
const lastScrolledHandlerTimeout = parseInt(document.app_config['last_scrolled_handler_timeout']);

function updateProgrammeInfoScrollPositions() {
    $('#main-channel-list .flex-parent').each(function(index, element) {
        const marginTop = Math.round(element.scrollTop);
        $(element).find('.currently-inspected-programme-description').css('margin-top', `${marginTop}px`);
    });
}

function scrollToChannelListItem(listItem) {
    const $ul = listItem.parent();
    var topRelativeToUl = listItem.position().top + $ul.scrollTop();

    $('#main-channel-list').animate({
            scrollTop: `${Math.round(topRelativeToUl)}px`
    }, 700);
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

    debugger;

    mainChannelList.find('.flex-parent').on('scroll', function() {
        document.lastScrolled = new Date();
    });
}

setInterval(function() {
    const lastScrolledThreshold = parseInt(document.app_config['last_scrolled_threshold']);

    if (document.lastScrolled && new Date() - document.lastScrolled > lastScrolledThreshold) {
        updateProgrammeInfoScrollPositions();
        document.lastScrolled = undefined;
    }
}, lastScrolledHandlerTimeout);
