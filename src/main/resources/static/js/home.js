
$('#left-channel-list a').on('click', function() {
    $(this).parent('li').addClass('active-channel').siblings('li').removeClass('active-channel');
});

window['__onGCastApiAvailable'] = function(isAvailable) {
    if (isAvailable) {
        initializeCastApi();
    }
};

initializeCastApi = function() {
    cast.framework.CastContext.getInstance().setOptions({
        receiverApplicationId: 'DBC0ED74', // TODO: use Thymeleaf construct to fetch from Java code
        autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
    });
};

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

/*
var player = new cast.framework.RemotePlayer();
var playerController = new cast.framework.RemotePlayerController(player);
playerController.addEventListener(
cast.framework.RemotePlayerEventType.ANY_CHANGE,
function(event) {
alert("apa!");
});*/
