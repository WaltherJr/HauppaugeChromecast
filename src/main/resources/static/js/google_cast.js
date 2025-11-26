
/*
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

var player = new cast.framework.RemotePlayer();
var playerController = new cast.framework.RemotePlayerController(player);
playerController.addEventListener(
cast.framework.RemotePlayerEventType.ANY_CHANGE,
function(event) {
alert("apa!");
});
*/
