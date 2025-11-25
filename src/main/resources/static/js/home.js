
loadTestVideo = function() {
    const testVideoUrl = document.getElementById("test-video-url").value;
    const testVideoMimeType = document.getElementById("test-video-mime-type").value;
    const mediaInfo = new chrome.cast.media.MediaInfo(testVideoUrl, testVideoMimeType);
    var request = new chrome.cast.media.LoadRequest(mediaInfo);
    cast.framework.CastContext.getInstance().getCurrentSession().loadMedia(request).then(
        function() { console.log('Load succeed'); },
        function(errorCode) { console.log('Error code: ' + errorCode); });
}

document.getElementById("load-test-video-btn").addEventListener("click", function() {
    loadTestVideo();
});

$('#locale-selection > button').on('click', function() {
    const url = new URL(window.location);
    url.searchParams.set('lang', $(this).attr('data-locale-key'));x
    window.location = url;
});

function computeMaxHeightOfChannelListItem(listItem) {
    const programmesListHeight = listItem.find('.channel-programmes-list-container').outerHeight(true); // Include margins
    const inspectedProgrammeDescription = listItem.find('.currently-inspected-programme-description').outerHeight(true);
    const newHeight = Math.max(programmesListHeight, inspectedProgrammeDescription);

    debugger;

    return Math.round(newHeight) + 20;
}

$(document).ready(async function() {
    const mainChannelList = $('#main-channel-list');

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

        }).on('click', '.tabs > .tab-headings a', function(event) {
            event.preventDefault();
            const listItem = $(this).closest('li');
            const listItemIndex = listItem.index();
            const activeTab = listItem.parent().siblings('.tab-content').children().get(listItemIndex);

            listItem.addClass('active-tab').siblings().removeClass('active-tab');
            $(activeTab).addClass('active-tab').siblings().removeClass('active-tab');

        }).on('change', 'select#language-selection', function() {
            console.log($(this).val());
            reloadPageSearchParams((pageSearchParams) => pageSearchParams.set('lang', $(this).val()));

        });

    setResizeObservers();
    const mainLeftPanelDimensions = JSON.parse(localStorage.getItem("main-left-panel-dimensions") || '{}');
    if (mainLeftPanelDimensions) {
        mainChannelList.css('width', `${mainLeftPanelDimensions.width}px`);
    }

    const inspectedProgrammeImage = $('#inspected-programme-image-container > img');
    const newImageHeight = Math.round(mainChannelList.outerHeight());
    inspectedProgrammeImage.css('height', `${newImageHeight}px`);
    debugger;
    /*
    setInterval(function() {
        populateChannelList();
    }, 3 * 60 * 1000);*/
});
