
```
ffmpeg -i /dev/video0 \
  -c:v libx264 -preset veryfast -tune zerolatency -c:a aac \
  -f hls -hls_time 4 -hls_list_size 6 -hls_flags delete_segments \
  stream.m3u8
```
```
ffmpeg -i /dev/dvb/adapter0/frontend0 \
  -c:v libx264 -preset veryfast -tune zerolatency -c:a aac \
  -f hls -hls_time 4 -hls_list_size 6 -hls_flags delete_segments \
  stream.m3u8
```

"Note: You need the data right format in this file. Different scanning programs produce different output formats. For example w_scan must be run with the '-X' argument to obtain a channels.conf suitable for 'tzap'."
Lista V4l (video) och DVB devices: `v4l2-ctl --list-devices`
Tuna in TV-kanaler (samt hitta namn för tunern): 
* `w_scan /usr/share/dvb/dvb-c/se-comhem > ~/.tzap/channels.conf` - (bästa alternativet)
* `w_scan -fc -c SE > channels_SE.conf`
* `w_scan /usr/share/dvb/dvb-c/se-comhem -ft -A1 -X > ~/.tzap/channels.conf`

Qt6 filer: `/usr/lib/qt6/bin`

`ls /dev/video*`
`ffmpeg -f v4l2 -i /dev/video0 -vcodec libx264 -preset fast -t 00:00:30 output.mp4`

`curl -L https://github.com/KDE/kaffeine/archive/refs/heads/master.tar.gz | tar xz --strip-components=3 kaffeine-master/src/dvb`

App-ikoner:
* https://fonts.google.com/icons
* https://fonts.google.com/download?family=Material%20Symbols%20Outlined|Material%20Symbols%20Rounded|Material%20Symbols%20Sharp

Hämta TV-kanalnamn från tv.nu:

```
const channels = Array.from(document.querySelectorAll('a[href^="/kanal/"][class]')).map(link => {
    return {
        "name": link.getAttribute('aria-label'), 
        "key": (link.getAttribute('aria-label') || '').toUpperCase().replaceAll(' ', '_'), 
        "imageUrl": (link.querySelector('img') || {"src": ''}).src
    }
}).filter(channel => channel.name);
const channelsHtml = Array.from(channels).map(channel => `<li><a href="#" data-channel-key="${channel.key}"><img src="${channel.imageUrl}">${channel.name}</a></li>`).join('');
const channelsJavaList = Array.from(channels).map(channel => `CHANNELS_LIST.add(new Channel("${channel.key}", "${channel.name}", "${channel.imageUrl}"));`).join(' ');
const channelsJavaFinal = `static { ${channelsJavaList} }`;
```
