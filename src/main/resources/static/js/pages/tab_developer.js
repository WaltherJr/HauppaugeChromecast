import * as utils from '../utils/utils.js';
import * as ui from '../ui/ui.js';

export function toggleDeveloperMode(state) {
    console.log('TOGGLING DEVELOPER MODE...');
    $('body').toggleClass('developer-mode', state);
    $('input#developer-mode').prop('checked', state);
}

$('#display-chromecast-info-btn').on('click', function() {
    const chromecastInfoUrl = $('chromecast-info-url').val();
    utils.getJson(`/chromecast-info?chromecast-info-url=${encodeURIComponent(chromecastInfoUrl)}`).then(response => console.log(response));
});

$('#chromecast-info-url').on('change', function() {
    localStorage.setItem('chromecast-url', $(this).val());
}).val(localStorage.getItem('chromecast-url') || '');

$('#highlight-js-theme').on('change', function() {
    const newTheme = $(this).val();
    ui.switchHighlightJSTheme(newTheme);
    utils.patchJson('/config', {key: 'highlight-js-theme', value: newTheme})
        .then(response => {
            console.log(response);
        });
});

toggleDeveloperMode = utils.proxifyFunctionDeveloperMode(toggleDeveloperMode);
