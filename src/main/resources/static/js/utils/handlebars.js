
Handlebars.registerHelper('getApplicationConfig', function(key) {
    return document.app_config[key];
});

Handlebars.registerHelper('markIfActiveProgramme', function(channelProgrammesList, iteratedChannelProgramme, currentIterationIndex) {
    const iteratedProgrammeStartTime = new Date(iteratedChannelProgramme).date;
    const nextProgrammeStartTime = currentIterationIndex < channelProgrammesList.length - 1 ? new Date(channelProgrammesList[currentIterationIndex + 1].time) : undefined;
    const now = new Date();

    if (iteratedProgrammeStartTime <= now && nextProgrammeStartTime && nextProgrammeStartTime > now) { // TODO: not 100% correct
        return ' channel-current-programme';
    }

    return '';
});

Handlebars.registerHelper('todayTomorrowHelper', function(type, index) {
    if (type === 'className') {
        return index === 0 ? 'today' : 'tomorrow';
    } else if (type === 'innerHTML') {
        return document.app_config.channel_programmes_day_list_captions[index === 0 ? 'today' : 'tomorrow'];
    }
});

Handlebars.registerHelper('encodeURIHelper', function(url) {
    return encodeURI(url);
});

Handlebars.registerHelper('prettyChannelName', function(str) {
    return str.replaceAll(/\([T|S]\)/g, '').trim();
});

Handlebars.registerHelper('prettyProgrammeStartTime', function(str) {
    return new Date(str).toLocaleTimeString().substring(0, 5);
});

async function renderHandlebarsTemplate(templateFile, data, partials) {
    if (partials !== undefined && Array.isArray(partials) && partials.length !== 0) {
        await Promise.all(partials.map(partial => {
            return getText(partial.url).then(partialTemplate => {
                Handlebars.registerPartial(partial.name, partialTemplate);
            });
        }));
    }

    return getText(templateFile).then((template) => {
        const renderedTemplate = Handlebars.compile(template);
        return renderedTemplate(data); // TODO:
    });
}
