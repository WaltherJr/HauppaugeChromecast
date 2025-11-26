
loadTestVideo = function() {
    const testVideoUrl = document.getElementById("test-video-url").value;
    const testVideoMimeType = document.getElementById("test-video-mime-type").value;
    const mediaInfo = new chrome.cast.media.MediaInfo(testVideoUrl, testVideoMimeType);
    var request = new chrome.cast.media.LoadRequest(mediaInfo);
    cast.framework.CastContext.getInstance().getCurrentSession().loadMedia(request).then(
        function() { console.log('Load succeed'); },
        function(errorCode) { console.log('Error code: ' + errorCode); });
}

function computeMaxHeightOfChannelListItem(listItem) {
    const programmesListHeight = listItem.find('.channel-programmes-list-container').outerHeight(true); // Include margins
    const inspectedProgrammeDescription = listItem.find('.currently-inspected-programme-description').outerHeight(true);
    const newHeight = Math.max(programmesListHeight, inspectedProgrammeDescription);

    debugger;

    return Math.round(newHeight) + 20;
}

$(document).ready(async function() {
    const mainChannelList = $('#main-channel-list');

    if(window.location.hash) {
        const startingTab = $(window.location.hash);
        setActiveTabContent(startingTab, window.location.hash);
    }

    await populateChannelList([getFormattedDate(0), getFormattedDate(1)], mainChannelList.outerHeight())
        .then(() => {
            const a = document.querySelectorAll('.flex-parent');
            a.forEach(element => element.addEventListener('scroll', function() {
                document.lastScrolled = new Date();
                console.log('SCROLLING!');
            }));

            setIntersectionObservers()
        });

    $('body').on('click', 'ul#main-channel-list > li', changeInspectedChannelListItem)
        .on('click', '.channel-programmes-day-list > li > a', function() {
            const programmeListItem = $(this).closest('li');
            const programmeImageUrl = programmeListItem.attr('data-programme-image');
            const programmeDescription = programmeListItem.attr('data-programme-description');

            programmeListItem.parent().parent().find('.currently-inspected-programme').removeClass('currently-inspected-programme');
            programmeListItem.addClass('currently-inspected-programme');

            showProgrammeDetails($(this), programmeImageUrl, programmeDescription);

        }).on('click', '.zap-to-channel-btn', function() {
            zapToChannel($(this).closest('[data-channel-name]').attr('data-channel-name'));

        }).on('click', '.tabs > .tab-headings a', setActiveTab)
        .on('change', 'select#language-selection', function() {
            localStorage.setItem('locale', $(this).val());
            reloadPageSearchParams((pageSearchParams) => pageSearchParams.set('lang', $(this).val()));

        }).on('click', '#load-test-video-btn', function() {
            loadTestVideo();
        });

    setResizeObservers([{
        selector: '#main-left-panel',
        callback: (entry => {
            const newWidth = Math.round(entry.contentRect.width);
            const newHeight = Math.round(entry.contentRect.height);

            localStorage.setItem("main-left-panel-dimensions", JSON.stringify({width: newWidth}));
            $('#inspected-programme-image-container').css({width: `${newWidth}px`, height: `${newHeight}px`});
        })
    }]);

    const mainLeftPanelDimensions = JSON.parse(localStorage.getItem("main-left-panel-dimensions") || '{}');

    if (mainLeftPanelDimensions) {
        $('#main-left-panel').css('width', `${mainLeftPanelDimensions.width}px`);
    }

    const defaultLocale = document.app_config['default_locale'];
    $('select#language-selection').val(localStorage.getItem('locale') || defaultLocale);
    /*
    setInterval(function() {
        populateChannelList();
    }, 3 * 60 * 1000);*/
});
