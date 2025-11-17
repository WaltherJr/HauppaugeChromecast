
function showProgrammeDetails(programmeAnchorElement, programmeImageUrl, programmeDescription) {
    debugger;
    const listItem = programmeAnchorElement.closest('li').parent().closest('li');
    const alreadyInspectedProgrammeInfoBox = listItem.find('p.currently-inspected-programme-description');
    const createdImage = $(document.createElement('img')).attr({'src': programmeImageUrl, 'alt': 'Programme image'});
    const fadeAnimationDuration = document.app_config.programme_info_fade_animation.duration;
    const fadeAnimationInteger = cssFloatToInteger(fadeAnimationDuration);

    alreadyInspectedProgrammeInfoBox.css('animation-duration', fadeAnimationDuration).removeClass('fade-out fade-in').addClass('fade-out');
    setTimeout(function() {
        alreadyInspectedProgrammeInfoBox.text('');
        alreadyInspectedProgrammeInfoBox.removeClass('fade-out').addClass('fade-in');
        alreadyInspectedProgrammeInfoBox.text(programmeDescription);
        debugger;
        listItem.find('img.inspected-programme-image').attr('src', programmeImageUrl);
    }, fadeAnimationInteger);

    // createdImage.on('load', function() {
        // newProgrammeInfoContentDiv.append(createdImage);
    //});
}

function markIfActiveProgramme(iteratedProgrammeStartTime, channelProgrammeListItem, channelProgrammesDayList, j) {
    const nextProgrammeStartTime = j < channelProgrammesDayList.length - 1 ? new Date(channelProgrammesDayList[j + 1].time) : undefined;
    const now = new Date();

    if (iteratedProgrammeStartTime <= now && nextProgrammeStartTime && nextProgrammeStartTime > now) { // TODO: not 100% correct
        channelProgrammeListItem.addClass('channel-current-programme');
        return true;
    }

    return false;
}

function createProgrammesFromChannelEvents(channelEvents) {
    return channelEvents.map(channelEvent => {
        return {
            title: channelEvent.details.title,
            description: channelEvent.details.description,
            image: channelEvent.details.image,
            time: channelEvent.time
        }
    });
}

function loadChannelLists(channelListsJson) {
    /*
    channelListsJson.sort((a, b) => {
        return a.date === b.date ? 0 : new Date(a.date).getTime() > new Date(b.date).getTime();
    });
    */

    var channels = {};

    channelListsJson.forEach(channelList => {
        channelList.channels.forEach(channel => {
            if (channels[channel.id] === undefined) {
                channels[channel.id] = {
                    id: channel.id,
                    icon: channel.icon,
                    name: channel.name,
                    programmes: [createProgrammesFromChannelEvents(channel.events)]
                }
            } else {
                channels[channel.id].programmes.push(createProgrammesFromChannelEvents(channel.events));
            }
        });
    })

    return channels;

}

async function createMainChannelListHtml(channelList) {
    return renderHandlebarsTemplate('/js/templates/main-channel-list.hbs', {channels: channelList},
        [{name: 'channelProgrammesList', url: '/js/templates/channel-programmes-list.hbs'}]);
}

function zapToChannel(requestedChannelName) {
    alert('DEJSAN');
    putJSON('/current-channel', JSON.stringify({channelName: requestedChannelName}))
        .then(response => {
            console.log(response);
        });
}

async function populateChannelList(datesToFetch) {
    Promise.all(datesToFetch
        .map(date => getJSON(`/allente-epg?date=${date}`)))
        .then(async results => {
            const channelLists = loadChannelLists(results);
            const mainChannelList = $('#main-channel-list');
            const updatedMainChannelList = $(await createMainChannelListHtml(channelLists));
            mainChannelList.replaceWith(updatedMainChannelList);
            setCurrentChannelProgrammesListPosition(updatedMainChannelList);


        }).catch(error => {
            console.error('There was a problem with one of the fetch operations:', error);
            alert('One or more requests failed');
        });
}
