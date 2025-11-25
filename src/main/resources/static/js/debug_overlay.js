
document.getElementById("fetch-chromecast-info-btn").addEventListener("click", function() {
    const chromecastInfoUrl = document.getElementById("chromecast-info-url").value;
    getJSON(`/chromecast-info?chromecast-info-url=${encodeURIComponent(chromecastInfoUrl)}`).then(response => console.log(response));
});
