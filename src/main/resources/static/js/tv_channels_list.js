
function showProgrammeDetailsPopup(popupContent) {
    let popup = $('#global-popup');
    debugger;
    if (popup.length !== 0) {
        popup.append(popupContent)
    } else {
        popup = $('<div id="global-popup"></div>');
        popup.append(popupContent);
    }

    $('body').append(popup);
}

function loadChannelProgrammes(channelEvents) {
    const channelProgrammesList = $('<ul class="channel-programmes-list"></ul>');

    // TODO: sort on time field

    for (var i = 0; i < channelEvents.length; i++) {
        const channelEvent = channelEvents[i];
        const channelEventDetails = channelEvent.details ? {
            'data-programme-title': channelEvent.title,
            'data-programme-description': channelEvent.details.description,
            'data-programme-image-url': encodeURI(channelEvent.details.image)
        } : undefined;

        const iteratedProgrammeStartTime = new Date(channelEvent.time);
        const nextProgrammeStartTime = i < channelEvents.length - 1 ? new Date(channelEvents[i + 1].time) : undefined;
        const now = new Date();
        const channelEventItem = $(`<li><a href="#"><span class="channel-programme-name">${channelEvent.title}</span><span class="channel-programme-start-time">${iteratedProgrammeStartTime.toTimeString().substring(0, 5)}</span></a></li>`);

        if (iteratedProgrammeStartTime <= now && nextProgrammeStartTime && nextProgrammeStartTime > now) { // TODO: not 100% correct
            channelEventItem.addClass('channel-current-programme');
        }

        if (channelEventDetails) {
            channelEventItem.attr(channelEventDetails);
        }
        channelProgrammesList.append(channelEventItem);
    }

    return channelProgrammesList;
}
/*
function loadChannelProgrammes(channelEvents) {
    const channelProgrammesList = $('<ul class="channel-programmes-list"></ul>');

    for (const channelEvent of channelEvents) {
        const channelEventDetails = channelEvent.details ? {
            'data-programme-description': channelEvent.details.description,
            'data-programme-image-url': channelEvent.details.image
        } : undefined;

        const channelEventItem = $(`<li data-programme-description="${channelEvent.details.description}" data-programme-image-url="${encodeURI(channelEvent.details.image)}"><a href="#"><span class="channel-programme-name">${channelEvent.title}</span><span class="channel-programme-start-time">${channelEvent.time.slice(11, 16)}</span></a></li>`);

        if (channelEventDetails) {
            channelProgrammesList.attr(channelEventDetails);
        }
        channelProgrammesList.append(channelEventItem);
    }

    return channelProgrammesList;
}
*/
function loadChannelList(channelJson) {
    const channelListElement = $('#left-channel-list');
    channelListElement.html('');

    for (const channel of channelJson.channels) {
        const channelName = `<span>${channel.name.replace('(T)', '').trim()}</span>`;
        const channelListItem = $(`<li><a href="#" data-channel-key="${channel.id}"><img src="${channel.icon}"></a></li>`);
        const channelProgrammes = loadChannelProgrammes(channel.events);
        channelListItem.children("a").append(channelProgrammes);
        channelListElement.append(channelListItem);

        channelProgrammes.children('.channel-current-programme').each(function(index, element) {
            const listItemTopPosition = $(element).position().top;
            const roundedTopPosition = Math.round(listItemTopPosition);
            const listTopCSSValue = `-${roundedTopPosition}px`;
            $(element).closest('ul').css('top', listTopCSSValue);
        });
    }
}

function populateChannelList() {
    fetch('/allente-epg')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();  // Assuming the response is in JSON format
        }).then(data => {
            loadChannelList(data);  // Handle the data here
    }).catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });
}

populateChannelList();

$('#left-channel-list').on('click', 'ul.channel-programmes-list', function() {
    // $(this).closest('.left-channel-list').find('ul.channel-programmes-list');
    $(this).toggleClass('programme-list-open');
});

$('body').on('click', '#global-popup', function() {
    $(this).remove();
});

$('body').on('click', '.channel-programmes-list > li > a', function() {
    const programmeListItem = $(this).closest('li');
    const programmeImageUrl = programmeListItem.attr('data-programme-image-url');
    const programmeDescription = programmeListItem.attr('data-programme-description');

    showProgrammeDetailsPopup($(`<div style="background-image: url('${programmeImageUrl}');"><p>${programmeDescription}</p></div>"`));
});

setInterval(function() {
    populateChannelList();
}, 3 * 60 * 1000);
