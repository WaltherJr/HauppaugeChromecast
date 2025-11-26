
$('#display-chromecast-info-btn').on('click', function() {
    const chromecastInfoUrl = $('chromecast-info-url').val();
    getJSON(`/chromecast-info?chromecast-info-url=${encodeURIComponent(chromecastInfoUrl)}`).then(response => console.log(response));
});

$('#chromecast-info-url').on('change', function() {
    localStorage.setItem('chromecast-url', $(this).val());
}).val(localStorage.getItem('chromecast-url') || '');
