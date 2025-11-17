
#include <iostream>
using namespace std;

static int adapter = 0;
static int frontend = 0;
static unsigned get = 0;
static int verbose = 0;
static int timeout_flag = 0;

static int print_frontend_stats(FILE *fd, struct dvb_v5_fe_parms *parms);

extern "C" {
    #include "libdvbv5/dvb-dev.h"
    #include "libdvbv5/dvb-file.h"
    #include "libdvbv5/dvb-dev.h"
    #include <argp.h>
    #include <signal.h>
    #include <stdlib.h>
    #include <stdio.h>
    #include <unistd.h>
    #include <libintl.h>
    #include <locale.h>
    #include <iostream>
    #include <cstdlib>
    #include <locale.h>
    #include <langinfo.h>
    #include <iconv.h>

    #define _(str) gettext(str)
}

#define PERROR(x...)                                                    \
        do {                                                            \
                fprintf(stderr, _("ERROR: "));                          \
                fprintf(stderr, x);                                     \
                fprintf(stderr, " (%s)\n", strerror(errno));            \
        } while (0)

/*
struct dvb_device {
	struct dvb_dev_list *devices;
	int num_devices;
	struct dvb_v5_fe_parms *fe_parms;
};

struct dvb_dev_list {
	char *syspath;
	char *path;
	char *sysname;
	enum dvb_dev_type dvb_type;
	char *bus_addr;
	char *bus_id;
	char *manufacturer;
	char *product;
	char *serial;
};
*/

const char* getDeviceType(dvb_dev_list* device) {
    switch (device->dvb_type) {
        case DVB_DEVICE_FRONTEND: return "frontend";
        case DVB_DEVICE_DEMUX: return "demux";
        case DVB_DEVICE_DVR: return "dvr";
        case DVB_DEVICE_NET: return "net";
        case DVB_DEVICE_CA: return "ca";
        case DVB_DEVICE_CA_SEC: return "ca_cec";
        case DVB_DEVICE_VIDEO: return "video";
        case DVB_DEVICE_AUDIO: return "audio";
        default: return NULL;
    }
}

void printDevice(dvb_device *dvb, int i, dvb_dev_list* device) {
    cout << "[Device " << i << "] sysname: " << device->sysname << ", path: " << device->path << ", type: " << getDeviceType(device) << endl;

    dvb_open_descriptor* a = dvb_dev_open(dvb, device->sysname, O_RDONLY);


    dvb_dev_close(a);
}

static void do_timeout(int x) {
        (void)x;
        if (timeout_flag == 0) {
                timeout_flag = 1;
                alarm(2);
                signal(SIGALRM, do_timeout);
        } else {
                /* something has gone wrong ... exit */
                exit(1);
        }
}

static void get_show_stats(struct dvb_v5_fe_parms *parms) {
        int rc;
        signal(SIGTERM, do_timeout);
        signal(SIGINT, do_timeout);
        do {
                rc = dvb_fe_get_stats(parms);
                if (!rc)
                        print_frontend_stats(stderr, parms);
                if (!timeout_flag)
                        usleep(1000000);
        } while (!timeout_flag);
}

static int print_frontend_stats(FILE *fd, struct dvb_v5_fe_parms *parms) {
        char buf[512], *p;
        int rc, i, len, show, n_status_lines = 0;
        rc = dvb_fe_get_stats(parms);
        if (rc) {
                // PERROR(_("dvb_fe_get_stats failed"));
                return -1;
        }
        p = buf;
        len = sizeof(buf);
        dvb_fe_snprintf_stat(parms,  DTV_STATUS, NULL, 0, &p, &len, &show);
        for (i = 0; i < MAX_DTV_STATS; i++) {
                show = 1;
                dvb_fe_snprintf_stat(parms, DTV_QUALITY, _("Quality"), i, &p, &len, &show);
                dvb_fe_snprintf_stat(parms, DTV_STAT_SIGNAL_STRENGTH, _("Signal"), i, &p, &len, &show);
                dvb_fe_snprintf_stat(parms, DTV_STAT_CNR, _("C/N"), i, &p, &len, &show);
                dvb_fe_snprintf_stat(parms, DTV_STAT_ERROR_BLOCK_COUNT, _("UCB"), i,  &p, &len, &show);
                dvb_fe_snprintf_stat(parms, DTV_BER, _("postBER"), i,  &p, &len, &show);
                dvb_fe_snprintf_stat(parms, DTV_PRE_BER, _("preBER"), i,  &p, &len, &show);
                dvb_fe_snprintf_stat(parms, DTV_PER, _("PER"), i,  &p, &len, &show);
                if (p != buf) {
                        if (isatty(fileno(fd))) {
                                enum dvb_quality qual;
                                int color;
                                qual = dvb_fe_retrieve_quality(parms, 0);
                                switch (qual) {
                                case DVB_QUAL_POOR:
                                        color = 31;
                                        break;
                                case DVB_QUAL_OK:
                                        color = 36;
                                        break;
                                case DVB_QUAL_GOOD:
                                        color = 32;
                                        break;
                                case DVB_QUAL_UNKNOWN:
                                default:
                                        color = 0;
                                        break;
                                }
                                fprintf(fd, "\033[%dm", color);
                        }
                        if (n_status_lines)
                                fprintf(fd, "\t%s\n", buf);
                        else
                                fprintf(fd, "%s\n", buf);
                        n_status_lines++;
                        p = buf;
                        len = sizeof(buf);
                }
        }
        fflush(fd);
        return 0;
}

int main() {
    struct dvb_device *dvb;
    struct dvb_dev_list *dvb_dev;
    struct dvb_dev_list *dvb_dev_list;
    struct dvb_v5_fe_parms *parms;

    dvb = dvb_dev_alloc();

    cout << "Hello World!" << endl;

        dvb_dev_set_log(dvb, verbose, NULL);
    int a = dvb_dev_find(dvb, NULL, NULL);


        parms = dvb->fe_parms;

        dvb_dev = dvb_dev_seek_by_adapter(dvb, adapter, frontend,
                                          DVB_DEVICE_FRONTEND);

if (a == 0) {
        cout << "Found DVB devices!" << a << ", list size:" << dvb->num_devices << endl;
}

    for (int i = 0; i < dvb->num_devices; i++) {
        cout << i << ", struct size: " << sizeof(*dvb_dev_list) << endl;
        printDevice(dvb, i, reinterpret_cast<struct dvb_dev_list*>(dvb->devices + i));
    }

    dvb_dev_list = dvb->devices;

    dvb_dev_free(dvb);

    return 0;
}
