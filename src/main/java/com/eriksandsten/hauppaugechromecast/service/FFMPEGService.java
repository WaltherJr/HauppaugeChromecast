package com.eriksandsten.hauppaugechromecast.service;

import com.eriksandsten.hauppaugechromecast.utils.ProcessHelper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * FUNKAR: (starta om terminalen när det inte funkar)
 * "How can I switch video stream to a new one, "New video stream with index 2", when I have used czap to swap channel, with ffmpeg? Append the new content to already created output.ts?"
 * If your goal is “continuous recording while zapping”
 * https://stackoverflow.com/questions/12938581/ffmpeg-mux-video-and-audio-from-another-video-mapping-issue
 * In FFmpeg, the -re flag means “read input at its native (real-time) rate.”
 * You must choose the stream with -map before starting, unless you use a filter designed for live switching (e.g., streamselect) and control it via sendcmd/zmq.
 * https://ffmpeg.org/ffmpeg-filters.html#streamselect_002c-astreamselect
 * ffmpeg -loglevel verbose -i input \
 * -filter_complex "[0:v]streamselect=inputs=4:map=0[v]" \
 * -map "[v]" -map 0:a? \
 * -f zmq tcp://127.0.0.1:5555 \
 * output.mp4
 *
 * A. With zmq (recommended)
 * Start ffmpeg:
 *
 * ffmpeg -loglevel verbose -i input \
 * -filter_complex "[0:v]streamselect=inputs=4:map=0[v]" \
 * -map "[v]" -map 0:a? \
 * -f zmq tcp://127.0.0.1:5555 \
 * output.mp4
 *
 * Then send a command from another shell:
 * echo "Parsed_streamselect_0 map 3" | zmqsend tcp://127.0.0.1:5555
 * This switches to stream index 3 while ffmpeg is running.
 *
 *
 *
 * Then the proper architecture is:
 *
 * Option A — Use FFmpeg with -map tied to dynamic streams
 *
 * Hard, unreliable.
 *
 * Option B — Use tvheadend or vdr which handles PID remapping
 *
 * Much more reliable for channel-switch recording.
 *
 * Option C — Use TSDuck to normalize PIDs before FFmpeg
 *
 * *************************************************
 * Streamselect och zmq:
 * ./ffmpeg -loglevel verbose -f mpegts -i /dev/dvb/adapter0/dvr0 -filter_complex "[0:v]streamselect=inputs=4:map=0[v]" -map "[v]" -map 0:a? -b:a 192k output.ts
 * *************************************************
 *
 * Lägga till en till input till ffmpeg (webkamera): -i /dev/video0 (förutom -i /dev/dvb/adapter0/dvr0)
 *
 * BÄSTA: ffmpeg -loglevel verbose -f mpegts -i /dev/dvb/adapter0/dvr0 -map 0 -c copy -c:a libvorbis -b:a 192k output.ts
 *      ./ffmpeg -loglevel verbose -f mpegts -i /dev/dvb/adapter0/dvr0 -map 0 -c copy -b:a 192k output.ts
 *      ./ffmpeg -loglevel verbose -f mpegts -i /dev/dvb/adapter0/dvr0 -map 0 -c copy -b:a 192k -filter_complex "[0:v]streamselect=inputs=4:map=0[v]" -map "[v]" output.ts
 *      "Streamcopy requested for output stream fed from a complex filtergraph. Filtering and streamcopy cannot be used together."
 *      ./ffmpeg -loglevel verbose -f mpegts -i /dev/dvb/adapter0/dvr0 -map 0 -b:a 192k -filter_complex "[0:v]streamselect=inputs=4:map=0[v]" -map "[v]" output.ts
 *      ./ffmpeg -loglevel verbose -f mpegts -i /dev/dvb/adapter0/dvr0 -filter_complex "[0:v]streamselect=inputs=2:map=0[v]" -map "[v]" -c:v libx264 -c:a aac -b:a 192k output.ts

 * ffmpeg -loglevel verbose -f mpegts -i /dev/dvb/adapter0/dvr0 output.ts
 * ffmpeg -loglevel verbose -f mpegts -i /dev/dvb/adapter0/dvr0 -c:a libvorbis -b:a 192k output.ts
 * ffmpeg -loglevel verbose -f mpegts -i /dev/dvb/adapter0/dvr0 -filter_complex "[0:v]streamselect=inputs=4:map=0[v]" -map "[v]" -map 0:a? -c:a libvorbis -b:a 192k -f zmq tcp://127.0.0.1:5555 output.ts
 * ffmpeg -loglevel verbose -f mpegts -i /dev/dvb/adapter0/dvr0 -c:a libopus -b:a 192k -c:v libx264 -b:v 2000k output.ts
 * ffmpeg -loglevel verbose -f mpegts -i /dev/dvb/adapter0/dvr0 -c:a libopus -b:a 192k -c:v libx264 -b:v 2000k output.ts
 * ffmpeg -loglevel verbose -f mpegts -i /dev/dvb/adapter0/dvr0 -c:a libopus -b:a 192k -c:v libvpx-vp9 -b:v 2000k output.webm
 * ffmpeg -loglevel verbose -f mpegts -i /dev/dvb/adapter0/dvr0 -c:a libopus -b:a 192k -c:v libvpx-vp9 -crf 30 -b:v 0 output.webm
 * ffmpeg -loglevel verbose -i in.mkv -map 0:v:0 -map 0:a:1 out.mkv                                                                   Selects: first video stream, second audio stream
 *                                                                                                                  Copy streams without re-encoding ffmpeg -i input.mkv -map 0 -c copy output.mkv
 *
 *
 *
 * ffmpeg -f mpegts -i /dev/dvb/adapter0/dvr0 -c:v libx264 output.ts
 * If you tune a HD channel (for instance "SVT1 HD(Com Hem)" - Stream #0:1[0x1001]: Video: h264 (High), yuv420p(progressive), 1280x720 [SAR 1:1 DAR 16:9], 50 fps, 50 tbr, 90k tbn
 *           non-HD channel (for instance "Kanal 9(Com Hem)" - Stream #0:1[0x1004]: Video: mpeg2video (Main), yuv420p(tv, top first), 720x576 [SAR 64:45 DAR 16:9], 5000 kb/s, 25 fps, 25 tbr, 90k tbn
 *                                                                      tbn = the time base in AVStream that has come from the container
 *                                                                      tbc = the time base in AVCodecContext for the codec used for a particular stream
 *
 *
 *  For a HD channel: ffmpeg -i /dev/dvb/adapter0/dvr0 -map 0 -c:a libopus -c:v mpeg2video -c:v libx264 -f webm out.webm
 *    non-HD channel: ffmpeg -i /dev/dvb/adapter0/dvr0 -map 0 -c:a libopus -c:v libx264 -f -q:v [1-31] webm out.webm
 *
 *  Errors:
 *      "Only VP8 or VP9 or AV1 video and Vorbis or Opus audio and WebVTT subtitles are supported for WebM" - That message means you are trying to put a codec into a WebM container that WebM does not support.
 *                                                                                                            WebM only supports these codecs: VP8, VP9, AV1. Audio: Vorbis, Opus. How to fix it:
 *                                                                                                                  Encode using VP9 (recommended for quality): ffmpeg -i input.mp4 -c:v libvpx-vp9 -b:v 2M -c:a libopus output.webm
 *
**/
@Service
public class FFMPEGService {
    private static final Logger logger = LoggerFactory.getLogger(ChannelService.class);
    ExecutorService executor = Executors.newSingleThreadExecutor();
    private final ProcessHelper processHelper;

    @Autowired
    public FFMPEGService(ProcessHelper processHelper) {
        this.processHelper = processHelper;
    }

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

        // Solution to "Error during demuxing: Value too large for defined data type": Search for ts_packetsize
        //   Stream #0:0: Video: vp9, yuv420p(tv, top coded first (swapped)), 720x480 [SAR 32:27 DAR 16:9], q=2-31, 25 fps, 1k tbn
        // ffmpeg -re -i /dev/dvb/adapter0/dvr0 -c:a libopus -c:v vp9 -s 720x576 -f webm out.webm
        // ffmpeg -re -i /dev/dvb/adapter0/dvr0 -c:a libopus -c:v vp9 -pix_fmt yuv420p -s 720x576 -f webm out.webm
        return command3;
    }

    public void runFFMPEG(String inputSource) {
        processHelper.startNewProcessInNewThread(new String[] {"ffmpeg", "-re", "-i", "/dev/dvb/adapter0/dvr0", "-c", "copy", "-f", "hls", "out.m3u8"}, "[ffmpeg]", executor);

    }

    /*
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
    }*/
}
