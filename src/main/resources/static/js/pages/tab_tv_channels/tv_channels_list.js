
function showProgrammeDetails(programmeAnchorElement, programmeImageUrl, programmeDescription) {
    debugger;
    const listItem = programmeAnchorElement.closest('li').parent().closest('li');
    const alreadyInspectedProgrammeInfoBox = listItem.find('p.currently-inspected-programme-description');
    const fadeAnimationDuration = document.app_config.programme_info_fade_animation.duration;
    const fadeAnimationInteger = cssFloatToInteger(fadeAnimationDuration);

    getJSON(`/programme-image?imageUrl=${encodeURIComponent(programmeImageUrl)}`).then((newImageDimensions) => {
        alreadyInspectedProgrammeInfoBox.css('animation-duration', fadeAnimationDuration).removeClass('fade-out fade-in').addClass('fade-out');

        setTimeout(function() {
            alreadyInspectedProgrammeInfoBox.text('');
            alreadyInspectedProgrammeInfoBox.removeClass('fade-out').addClass('fade-in');
            alreadyInspectedProgrammeInfoBox.text(programmeDescription);
            setInspectedProgrammeImage(programmeImageUrl, newImageDimensions);

        }, fadeAnimationInteger);

        // createdImage.on('load', function() {
        // newProgrammeInfoContentDiv.append(createdImage);
        //});
    });
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

function clearInspectedProgrammeImages() {
    $('#inspected-programme-image-container > img').remove(); // TODO: add animations etc.
}

function setInspectedProgrammeImage(newImageUrl, newImageDimensions) {
    const inspectedProgrammeImageContainer = $('#inspected-programme-image-container');
    const inspectedProgrammeImages = inspectedProgrammeImageContainer.children('img');
    const imageContainerDimensions = {width: inspectedProgrammeImageContainer.width(), height: inspectedProgrammeImageContainer.height()};

    debugger;

    const imageHasSufficientWidth = newImageDimensions.width >= imageContainerDimensions.width;
    const imageHasSufficientHeight = newImageDimensions.height >= imageContainerDimensions.height;
    let cssTransforms = [];

    if (imageHasSufficientWidth && !imageHasSufficientHeight) {
        cssTransforms.push({width: 'auto', height: '100%'});
    } else if (!imageHasSufficientWidth && imageHasSufficientHeight) {
        cssTransforms.push({width: '100%', height: 'auto'});
    } else if (imageHasSufficientWidth && imageHasSufficientHeight) {
        cssTransforms.push({width: '100%', height: 'auto'});
    } else {
        // Image has not sufficient width, nor sufficient height
        cssTransforms.push({transform: 'scale(2)'}); // TODO: add width or height transform
    }

    if (inspectedProgrammeImages.length === 0 || inspectedProgrammeImages.length === 1) {
        const newImage = $(document.createElement('img')).attr('src', newImageUrl).css('z-index', '2');

        if (inspectedProgrammeImages.length === 1) {
            $(inspectedProgrammeImages.get(0)).css('z-index', '1');
        }

        cssTransforms.forEach(transform => newImage.css(transform));
        inspectedProgrammeImageContainer.append(newImage);

    } else if (inspectedProgrammeImages.length === 2) {
        const obsoleteImage = inspectedProgrammeImages.filter(':last-child');
        const swappedImage = inspectedProgrammeImages.filter(':first-child');

        cssTransforms.forEach(transform => swappedImage.css(transform));
        swappedImage.attr('src', newImageUrl).css('z-index', '2');
        obsoleteImage.css('z-index', '1');

    } else {
        throw 'Wrong number of inspected programme images!';
    }
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

// Replace some non-transparent channel images with transparent ones
function setChannelIcon(defaultIcon, channelKey) {
    switch (channelKey) {
        case '1008': return 'https://images.ctfassets.net/lqy9luz7fyfj/5Mrk9WNDDyG8sv6EjuBPAc/990df81023ebc6282d80d23b7764f11a/bloomberg-television.png';
        case '1023': return 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Eurosport_1_Logo_2015.svg/2560px-Eurosport_1_Logo_2015.svg.png';
        case '1024': return 'https://www.connecttv.se/app/uploads/2020/06/channel_logo_eurosport_2_hd.png';
        case '1039': return 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/InvestigationDiscoveryLogo2020.svg/250px-InvestigationDiscoveryLogo2020.svg.png';
        case '0344': return 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f2/Aljazeera_eng.svg/1200px-Aljazeera_eng.svg.png';
        default: return defaultIcon;
    }
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
                    icon: setChannelIcon(channel.icon, channel.id),
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

async function createMainChannelListHtml(channelList, channelListHeight) {
    return renderHandlebarsTemplate('/js/templates/main-channel-list.hbs', {channels: channelList, channelListHeight: channelListHeight},
        [{name: 'channelProgrammesList', url: '/js/templates/channel-programmes-list.hbs'}]);
}

function zapToChannel(requestedChannelName) {
    alert('DEJSAN');
    putJSON('/current-channel', JSON.stringify({channelName: requestedChannelName}))
        .then(response => {
            console.log(response);
        });
}

async function populateChannelList(datesToFetch, channelListHeight) {
    await Promise.all(datesToFetch
        .map(date => getJSON(`/allente-epg?date=${date}`)))
        .then(async results => {
            const channelLists = loadChannelLists(results);
            const mainChannelList = $('#main-channel-list');
            const updatedMainChannelList = $(await createMainChannelListHtml(channelLists, channelListHeight));
            mainChannelList.replaceWith(updatedMainChannelList);

            setCurrentChannelProgrammesListPosition(updatedMainChannelList);



        }).catch(error => {
            console.error('There was a problem with one of the fetch operations:', error);
            alert('One or more requests failed');
        });
}
