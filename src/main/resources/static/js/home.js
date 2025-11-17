
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
    url.searchParams.set('lang', $(this).attr('data-locale-key'));
    window.location = url;
});

$('#load-allente-epg-btn').on('click', function() {
    fetch('/allente-epg')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();  // Assuming the response is in JSON format
        }).then(data => {
            console.log(data);  // Handle the data here
        }).catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });

        alert('done!');
});

$(document).ready(async function() {
    const updatedMainChannelList = await populateChannelList([getFormattedDate(0), getFormattedDate(1)]);
    debugger;

    $('body').on('click', '#global-popup', function() {
        $(this).remove();

    }).on('click', 'ul#main-channel-list > li', function(event) {
        const listItem = $(this);
        const isProgrammeDetailsChild = $(event.target).closest('li.channel-programme-details').length !== 0;
        listItem.siblings('li.programme-list-open').removeClass('programme-list-open').find('.flex-parent').css('max-height', '0');

        if (!isProgrammeDetailsChild) {
            // Only toggle list if not clicking on a programme information link
            const newHeight = listItem.find('ul.channel-programmes-day-list:first-child').outerHeight();
            debugger;
            const flexParent = listItem.toggleClass('programme-list-open').find('.flex-parent');
            flexParent.css('max-height', listItem.hasClass('programme-list-open') ? `${Math.round(newHeight)}px` : '0');
            const channelDisplayAnimationDelay = cssFloatToInteger(document.app_config.channel_item_display_animation.duration);

            debugger;

            setTimeout(function() {
                scrollToChannelListItem(listItem);

            }, channelDisplayAnimationDelay);

            /*
            setTimeout(function() {
                const listItemTop = listItem.offset().top;
                alert('apa!' + listItemTop);
                $('#main-channel-list').animate(
                    { scrollTop: listItemTop },
                    1000
                );
            }, 1100);*/ // TODO: use transition-duration value
        }

    }).on('click', '.channel-programmes-day-list > li > a', function() {
        const programmeListItem = $(this).closest('li');
        const programmeImageUrl = programmeListItem.attr('data-programme-image');
        const programmeDescription = programmeListItem.attr('data-programme-description');
        $(this).closest('li').addClass('currently-inspected-programme').siblings().removeClass('currently-inspected-programme');

        showProgrammeDetails($(this), programmeImageUrl, programmeDescription);

    }).on('click', '.zap-to-channel-btn', function() {
        zapToChannel($(this).closest('[data-channel-name]').attr('data-channel-name'));

    });

    document.getElementById('main-channel-list').addEventListener('scroll', function() {
        console.log('SCROLLING');
    });

    /*
    setInterval(function() {
        populateChannelList();
    }, 3 * 60 * 1000);*/
});
