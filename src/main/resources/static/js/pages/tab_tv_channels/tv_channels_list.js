import * as tab_tv_channels from '../tab_tv_channels.js';
import * as utils from '../../utils/utils.js';
import * as handlebars from '../../utils/handlebars.js'

Handlebars.registerHelper('markIfActiveProgramme', markIfActiveProgramme);

export function showProgrammeDetails(programmeAnchorElement, programmeImageUrl, programmeDescription) {
    const listItem = programmeAnchorElement.closest('li').parent().closest('li');
    const alreadyInspectedProgrammeInfoBox = listItem.find('p.currently-inspected-programme-description');
    const fadeAnimationDuration = document.app_config.animations.programme_info_fade_animation.duration;
    const fadeAnimationInteger = utils.cssFloatToInteger(fadeAnimationDuration);

    utils.getJson(`/programme-image?imageUrl=${encodeURIComponent(programmeImageUrl)}`).then((newImageDimensions) => {
        alreadyInspectedProgrammeInfoBox.css('animation-duration', `${fadeAnimationDuration}s`).removeClass('fade-out fade-in').addClass('fade-out');

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

export function markIfActiveProgramme(nowTimestamp, channelProgrammeListItem, channelProgrammesDayList, iteratedProgrammeIndex) {
    const nextProgrammeStartTime = iteratedProgrammeIndex < channelProgrammesDayList.length - 1 ? new Date(channelProgrammesDayList[iteratedProgrammeIndex + 1].time) : undefined;
    const iteratedProgrammeStartTime = new Date(channelProgrammeListItem.time);

    if (iteratedProgrammeStartTime <= nowTimestamp && nextProgrammeStartTime && nextProgrammeStartTime > nowTimestamp) { // TODO: not 100% correct
        return ' ' + 'channel-current-programme';
    }

    return '';
}

export function clearInspectedProgrammeImages() {
    $('#inspected-programme-image-container > img').remove(); // TODO: add animations etc.
}

function scaleChannelProgrammeImage(imageElement, imageWrapper) {
    const imageWidth = imageElement.width;
    const imageHeight = imageElement.height;
    const containerWidth = imageWrapper.width();
    const containerHeight = imageWrapper.height();
    const axisScalingToFit = containerWidth - imageWidth > containerHeight - imageHeight ? 'x' : 'y';
    const scalingRatio = axisScalingToFit === 'x' ? containerWidth / imageWidth : containerHeight / imageHeight;
    const scalingRatioFixed = scalingRatio.toFixed(2);

    return {
        axis: axisScalingToFit,
        ratio: scalingRatioFixed,
        margins: axisScalingToFit === 'x' ?
            {'margin-left': '', 'margin-top' : `-${((imageHeight * scalingRatio) - containerHeight)  / 2}px`} :
            {'margin-left': `${((imageWidth * scalingRatio) - containerWidth) / 2}px`, 'margin-top': ''}
    }
}

function setInspectedProgrammeImage(newImageUrl, newImageDimensions) {
    const inspectedProgrammeImageContainer = $('#inspected-programme-image-container');
    const inspectedProgrammeImages = inspectedProgrammeImageContainer.children('img');
    const imageContainerDimensions = {width: inspectedProgrammeImageContainer.width(), height: inspectedProgrammeImageContainer.height()};
    const imageHasSufficientWidth = newImageDimensions.width >= imageContainerDimensions.width;
    const imageHasSufficientHeight = newImageDimensions.height >= imageContainerDimensions.height;
    let cssTransforms = [];
    let scalingParameters;

    if (imageHasSufficientWidth && !imageHasSufficientHeight) {
        cssTransforms.push({width: 'auto', height: '100%'});
    } else if (!imageHasSufficientWidth && imageHasSufficientHeight) {
        cssTransforms.push({width: '100%', height: 'auto'});
    } else if (imageHasSufficientWidth && imageHasSufficientHeight) {
        cssTransforms.push({width: '100%', height: 'auto'});
    } else {
        // Image has not sufficient width, nor sufficient height - scale it
        scalingParameters = scaleChannelProgrammeImage(newImageDimensions, inspectedProgrammeImageContainer);
        cssTransforms.push({transform: `scale(${scalingParameters.ratio})`});
    }

    cssTransforms.push(scalingParameters ? scalingParameters.margins :
        {'transform': '', 'margin-left': '', 'margin-top': ''});

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

export function loadTestVideo() {
    const testVideoUrl = document.getElementById("test-video-url").value;
    const testVideoMimeType = document.getElementById("test-video-mime-type").value;
    const mediaInfo = new chrome.cast.media.MediaInfo(testVideoUrl, testVideoMimeType);
    var request = new chrome.cast.media.LoadRequest(mediaInfo);
    cast.framework.CastContext.getInstance().getCurrentSession().loadMedia(request).then(
        function() { console.log('Load succeed'); },
        function(errorCode) { console.log('Error code: ' + errorCode); });
}

export function setSelectedChannel() {
    const queryParams = new URLSearchParams(window.location.search);
    const selectedChannel = queryParams.get('selectedChannel');

    if (selectedChannel) {
        tab_tv_channels.scrollToChannelListItem($('#tab-tv-channels'), $(`#main-channel-list > li[data-channel-name="${selectedChannel}"]`));

    } else if (localStorage.getItem('lastSelectedChannel')) {
        const selectedChannelName = localStorage.getItem('lastSelectedChannel')
        tab_tv_channels.scrollToChannelListItem($('#tab-tv-channels'), $(`#main-channel-list > li[data-channel-name="${selectedChannelName}"]`));
        utils.updatePageQueryParameter('selectedChannel', selectedChannelName);
    }
}

export function computeMaxHeightOfChannelListItem(listItem) {
    const programmesListHeight = listItem.find('.channel-programmes-list-container').outerHeight(true); // Include margins
    const inspectedProgrammeDescription = listItem.find('.currently-inspected-programme-description').outerHeight(true);
    const newHeight = Math.max(programmesListHeight, inspectedProgrammeDescription);

    return Math.round(newHeight) + 20;
}

export async function createMainChannelListHtml(channelList, channelListHeight) {
    return handlebars.renderHandlebarsTemplate('/js/templates/main-channel-list.hbs', {channels: channelList, channelListHeight: channelListHeight},
        [{name: 'channelProgrammesList', url: '/js/templates/channel-programmes-list.hbs'}]);
}

export function zapToChannel(requestedChannelName) {
    alert('DEJSAN');
    putJSON('/current-channel', {channelName: requestedChannelName})
        .then(response => {
            console.log(response);
        });
}

export async function populateChannelList(datesToFetch, channelListHeight) {
    await Promise.all(datesToFetch
        .map(date => utils.getJson(`/allente-epg?date=${date}`)))
        .then(async results => {
            const channelLists = loadChannelLists(results);
            const mainChannelList = $('#main-channel-list');
            const updatedMainChannelList = $(await createMainChannelListHtml(channelLists, channelListHeight));
            mainChannelList.replaceWith(updatedMainChannelList);

            tab_tv_channels.setCurrentChannelProgrammesListPosition(updatedMainChannelList);

        }).catch(error => {
            console.error('There was a problem with one of the fetch operations:', error);
            alert('One or more requests failed');
        });
}
