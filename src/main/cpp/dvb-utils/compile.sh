#!/bin/sh
g++ dvb-utils.cpp -o dvb-utils -ldvbv5
gcc dvb-fe-tool.c -o dvb-fe-tool -ldvbv5
gcc dvbv5-scan.c -o dvb-scan -ldvbv5
gcc dvbv5-zap.c -o dvb-zap -ldvbv5
gcc dvb-format-convert.c -o dvb-format-convert -ldvbv5
