import * as tab_developer from './pages/tab_developer.js';
import * as tab_tv_channels from './pages/tab_tv_channels.js';
import * as tv_channels_list from './pages/tab_tv_channels/tv_channels_list.js';
import * as utils from './utils/utils.js';
import * as tabs from './ui/tabs.js';

let resizeCallback;

$(document).ready(async function() {
    const mainChannelList = $('#main-channel-list');

    if(window.location.hash) {
        const startingTab = $(window.location.hash);
        tabs.setActiveTabContent(startingTab, window.location.hash);
    }

    await tv_channels_list.populateChannelList([utils.getFormattedDate(0), utils.getFormattedDate(1)], mainChannelList.outerHeight())
        .then(() => {
            const a = document.querySelectorAll('.flex-parent');
            a.forEach(element => element.addEventListener('scroll', function() {
                document.lastScrolled = new Date();
                console.log('SCROLLING!');
            }));

            tab_tv_channels.setIntersectionObservers();
        });

    $('body').on('mousemove', utils.handleDocumentMouseMove);
/*
    tab_tv_channels.setResizeObservers([{
        selector: '#tab-tv-channels',
        callback: (entry => {
            const newWidth = Math.round(entry.contentRect.width);
            const newHeight = Math.round(entry.contentRect.height);

            // Use a timer here, else patchJson would be called all the time - inefficient
            clearInterval(resizeCallback);
            resizeCallback = setTimeout(function() {
                utils.patchJson('/config', {key: 'main-left-panel-width', value: newWidth});
            }, 2000);
        })
    }]);
*/
    tv_channels_list.setSelectedChannel();

    $('input#developer-mode').on('change', function() {
        const developerModeEnabled = $(this).is(':checked');
        tab_developer.toggleDeveloperMode(developerModeEnabled);
        localStorage.setItem('developerMode', developerModeEnabled);
    });

    const defaultLocale = document.app_config['default_locale'];
    $('select#language-selection').val(localStorage.getItem('locale') || defaultLocale);

    const developerMode = localStorage.getItem('developerMode');
    tab_developer.toggleDeveloperMode(!!(developerMode && developerMode === 'true'));
});

