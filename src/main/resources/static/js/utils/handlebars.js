import * as utils from '../utils/utils.js';

Handlebars.registerHelper('getApplicationConfig', function(keys) {
    let appConfigValue = document.app_config;
    keys.split(/\./g).forEach(key => appConfigValue = appConfigValue[key]);

    return appConfigValue;
});

Handlebars.registerHelper('nowTimestamp', () => new Date());
Handlebars.registerHelper('i18n', (...keys) => {
    const translated = keys.filter(key => typeof key === 'string').map(key => document.app_config.I18NStrings[key]);
    return translated.join(' ');
});
Handlebars.registerHelper('capitalize', str => str.charAt(0).toUpperCase() + str.slice(1));

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

export async function renderHandlebarsTemplate(templateFile, data, partials) {
    if (partials !== undefined && Array.isArray(partials) && partials.length !== 0) {
        await Promise.all(partials.map(partial => {
            return utils.getText(partial.url).then(partialTemplate => {
                Handlebars.registerPartial(partial.name, partialTemplate);
            });
        }));
    }

    return utils.getText(templateFile).then((template) => {
        const renderedTemplate = Handlebars.compile(template);
        return renderedTemplate(data); // TODO:
    });
}
