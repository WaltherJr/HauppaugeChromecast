`w_scan --frontend c -a 0 -c SE --output-xine > ~/.czap/channels.conf`
` czap -r -n 1` - Byt till kanal med index 1 (VIKTIGT MED -r, funkar inte annars!)

```
w_scan --frontend c -a 0 -c SE --output-xine 
w_scan version 20170107 (compiled for DVB API 5.11)
using settings for SWEDEN
DVB cable
DVB-C
scan type CABLE, channellist 7
output format czap/tzap/szap/xine
output charset 'UTF-8', use -C <charset> to override
-_-_-_-_ Getting frontend capabilities-_-_-_-_ 
Using DVB API 5.12
frontend 'Silicon Labs Si2168' supports
INVERSION_AUTO
QAM_AUTO
FEC_AUTO
FREQ (48.00MHz ... 870.00MHz)
SRATE (1.000MSym/s ... 7.200MSym/s)
```
```
usage: w_scan [options...] 
       -f type, --frontend type
               What programs do you want to search for?
               a = atsc (vsb/qam)
               c = cable 
               s = sat 
               t = terrestrian [default]
       -A N, --atsc_type N
               specify ATSC type
               1 = Terrestrial [default]
               2 = Cable
               3 = both, Terrestrial and Cable
       -c, --country
               choose your country here:
                       DE, GB, US, AU, ..
                       ? for list
               
       -s, --satellite
               choose your satellite here:
                       S19E2, S13E0, S15W0, ..
                       ? for list
               ---output switches---
       -G, --output-dvbsrc
               generate channels.conf for dvbsrc plugin
       -L, --output-VLC
               generate VLC xspf playlist (experimental)
       -M, --output-mplayer
               mplayer output instead of vdr channels.conf
       -X, --output-xine
               tzap/czap/xine output instead of vdr channels.conf
       -x, --output-initial
               generate initial tuning data for (dvb-)scan
       -Z, --output-xml
               generate w_scan XML tuning data
       -H, --extended-help
               view extended help (experts only)
```