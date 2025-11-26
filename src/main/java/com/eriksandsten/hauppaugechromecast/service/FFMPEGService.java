package com.eriksandsten.hauppaugechromecast.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Service
public class FFMPEGService {
    private static final Logger logger = LoggerFactory.getLogger(ChannelService.class);
    ExecutorService executor = Executors.newSingleThreadExecutor();

    /*
Input #0, mpegts, from '/dev/dvb/adapter0/dvr0':
Duration: N/A, start: 74752.410489, bitrate: N/A
Stream #0:0[0x1133]: Audio: mp2, 48000 Hz, stereo, s16p, 192 kb/s
Stream #0:1[0x1033]: Video: h264 (High), yuv420p(top first), 1920x1080 [SAR 1:1 DAR 16:9], 25 fps, 50 tbr, 90k tbn
     */
    public String getFFMPEGCommand(String inputSource) {
        final String command1 = "ffmpeg -i /dev/dvb/adapter0/dvr0 -vcodec h264  -hls_time 4 -hls_list_size 50 -hls_flags delete_segments -map v:0 -c:v:0 h264 -map a:0 -c:a copy -master_pl_name master.m3u8 -var_stream_map \"v:0,a:0\" ~/Skrivbord/HauppaugeChromecast/src/main/resources/static/video/channel_%v.m3u8";
        final String command2 = "ffmpeg -i /dev/dvb/adapter0/dvr0 -vcodec h264  -hls_time 4 -hls_list_size 50 -hls_flags delete_segments -map v:0 -c:v:0 h264 -map a:0 -c:a copy -master_pl_name master.m3u8 -var_stream_map \"v:0,a:0\" quality_%v.m3u8";
        final String command3 = "ffmpeg -i /dev/dvb/adapter0/dvr0 -vcodec h264 -acodec aac -hls_list_size 0 -hls_segment_type mpegts -hls_flags single_file ~/Skrivbord/HauppaugeChromecast/src/main/resources/static/video/channel.m3u8";
        final String command4 = "ffmpeg -i /dev/dvb/adapter0/dvr0 -c:v h264 -preset veryfast -tune zerolatency -c:a aac -b:a 128k -hls_time 5 -hls_list_size 0 -hls_segment_type mpegts -hls_flags delete_segments+append_list ~/Skrivbord/HauppaugeChromecast/src/main/resources/static/video/channel.m3u8";
        final String remuxToMKV = "ffmpeg -i /dev/dvb/adapter0/dvr0 -c:v libx264 -preset veryfast -tune zerolatency -c:a aac -b:a 128k ~/Skrivbord/HauppaugeChromecast/src/main/resources/static/video/output.mkv";
        final String simple = "ffmpeg -re -i /dev/dvb/adapter0/dvr0 -c copy -f hls out.m3u8";

        return command3;
    }

    public void runFFMPEG(String inputSource) {
        try {
            ProcessBuilder pb = new ProcessBuilder("bash", "-c", getFFMPEGCommand(inputSource));
            Process process = pb.inheritIO().start();

            executor.submit(() -> {
                try (BufferedReader r = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                    String line;
                    while ((line = r.readLine()) != null) {
                        System.out.println("[ffmpeg] " + line);
                    }
                } catch (IOException e) {
                    e.printStackTrace();
                }
            });
        } catch (final IOException e) {
            logger.error("Error when trying to start ffmpeg: \"{}\"", e.getMessage());
        }
    }
}
