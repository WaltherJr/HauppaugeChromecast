FUNKAR: `ffmpeg -vcodec h264 -i /dev/dvb/adapter0/dvr0 -hls_time 4 -hls_list_size 50 -hls_flags delete_segments -map v:0 -c:v:0 h264 -map a:0 -c:a copy -master_pl_name master.m3u8 -var_stream_map "v:0,a:0" quality_%v.m3u8`

Är detta fel! : https://www.reddit.com/r/ffmpeg/comments/xeht6c/ffmpeg_stuck_at_opening_url_for_reading/

https://forums.raspberrypi.com/viewtopic.php?t=22293 - "This results in flawless, stutter free video and audio on the hdmi connector! Yipee! The load is amazingly low (like 30%)."

https://mplayerhq.hu/pipermail/ffmpeg-user/2014-June/022128.html

`ffmpeg -i /dev/dvb/adapter0/dvr0 -c copy output.mkv -loglevel debug`

If you want FFmpeg to read from a named pipe (FIFO), you should simply use:

ffmpeg -i test output.mp4

A simple command to stream a program, without additional encoding might look like so:
`ffmpeg -loglevel debug -protocol_whitelist file,http,https,tcp,tls,crypto -f mpegts -i /dev/dvb/adapter0/dvr0 out.mp4`

Ska få output likt:
```
[file @ 0x1452139d0] Setting default whitelist 'file,crypto,data'
Successfully opened the file.
Stream mapping:
Stream #0:0 -> #0:0 (aac (native) -> aac (libfdk_aac))
Press [q] to stop, [?] for help
cur_dts is invalid st:0 (0) [init:0 i_done:0 finish:0] (this is harmless if it occurs once at the start per stream)
[aac @ 0x146824200] skip 1024 / discard 0 samples due to side data
cur_dts is invalid st:0 (0) [init:0 i_done:0 finish:0] (this is harmless if it occurs once at the start per stream)
detected 8 logical cores
```
```
sudo apt update
sudo apt install ffmpeg
sudo apt install libx264-dev
```

If you're on a platform with other hardware acceleration options (like NVIDIA or Intel), you can use h264_nvenc for NVIDIA GPUs or h264_qsv for Intel Quick Sync Video. These hardware-accelerated encoders can be used as alternatives to h264_mmal.

`ffmpeg -y -t 5 -f video4linux2 -i /dev/dvb/adapter0/dvr0 out.mov` - borde funka...?
`ffmpeg -y -t 5 -f video4linux2 -i /dev/video0 out.mov` - funkar!
`ffmpeg -i /dev/dvb/adapter0/dvr0 -t 10 output.mp4`
`ffplay /dev/video0`

./configure --enable-gpl --enable-libx264
make
sudo make install

ffmpeg -codecs | grep libx264
`

`dd if=/dev/dvb/adapter0/dvr0 conv=noerror | ffmpeg -c:v h264_mmal -i - -hls_time 4 -hls_list_size 50 -hls_flags delete_segments -map v:0 -c:v: 0 h264_omx b:v: 0 6000k -map a:0 -c:a copy -master_pl_name master.m3u8 -var_stream_map "v:0,a:0" quality_%v.m3u8`
`ffmpeg -c:v h264_nvenc -i /dev/dvb/adapter0/dvr0 -hls_time 4 -hls_list_size 50 -hls_flags delete_segments -map v:0 -c:v: 0 h264_omx b:v: 0 6000k -map a:0 -c:a copy -master_pl_name master.m3u8 -var_stream_map "v:0,a:0" quality_%v.m3u8`
`ffmpeg -vcodec h264 -i /dev/dvb/adapter0/dvr0 -hls_time 4 -hls_list_size 50 -hls_flags delete_segments -map v:0 -c:v:0 h264 -map a:0 -c:a copy -master_pl_name master.m3u8 -var_stream_map "v:0,a:0" quality_%v.m3u8`

Minimal example (copy the stream without re-encoding — works if the stream is already H.264 + AAC):
```
# Terminal B -- read the tuner device and feed ffmpeg
sudo cat /dev/dvb/adapter0/dvr0 | \
  ffmpeg -hide_banner -loglevel info -i - \
    -c:v copy -c:a copy \
    -f hls \
    -hls_time 4 \
    -hls_list_size 6 \
    -hls_flags delete_segments \
    /home/erik/Skrivbord/HauppaugeChromecast/src/main/resources/static/video/stream2/stream.m3u8
```

If codecs are not browser-friendly (for example MPEG-2 video), transcode:
```
sudo cat /dev/dvb/adapter0/dvr0 | \
  ffmpeg -hide_banner -loglevel info -i - \
    -c:v libx264 -preset veryfast -b:v 2000k \
    -c:a aac -b:a 128k \
    -f hls \
    -hls_time 3 -hls_list_size 10 \
    /home/erik/Skrivbord/HauppaugeChromecast/src/main/resources/static/video/stream2/stream.m3u8
```

# Errors and solutions
Always specify the correct -f (format), -pix_fmt, and other input parameters, since FFmpeg can’t auto-detect from stdin.
Some formats (like MP4) cannot be streamed properly to stdout (because they need to write headers at the end). Use formats like MPEG-TS, Matroska, or raw when streaming/piping.

The pipe: syntax is special in FFmpeg.
pipe:0 = stdin
pipe:1 = stdout
pipe:2 = stderr
You can also specify pipe:N (where N is a file descriptor number), but not pipe:<name>.
***

```
[in#0/mpegts @ 0x59d945a22e80] Error during demuxing: Value too large for defined data type
[in#0/mpegts @ 0x59d945a22e80] Error retrieving a packet from demuxer: Value too large for defined data type
[h264 @ 0x59d945c073c0] error while decoding MB 81 19, bytestream -6
```
From what I can gather ffmpeg allocates a constant buffer size of 2MB to hold a compressed frame. 1080p is 3MB uncompressed for example, and the codec can't always compress a large frame into less than 2MB.
You can possibly fix this by increasing the buffer size, and/or making it dynamic.

In FFmpeg, the buffer size for the H.264 encoder (or any codec) is controlled using the -bufsize option, typically alongside the bitrate settings.
-c:v libx264 — use the H.264 encoder (x264).
-b:v 5M — set the target video bitrate to 5 megabits per second.
-bufsize 3M — sets the rate control buffer size to 3 megabytes.
-maxrate 5M — optional, limits the maximum instantaneous bitrate.