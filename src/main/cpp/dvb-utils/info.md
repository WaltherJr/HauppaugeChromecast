DVB-T2 möjliggör minst 30 procent högre datatakt (i bit/s) än DVB-T över samma spektrala bandbredd (i MHz) och vid samma signalkvalitet, det vill säga samma antenner och geografiska position. Detta gör den lämplig för högupplöst tv (HDTV) och MPEG4-kompression av video, medan DVB-T vanligen används för standardupplöst tv och MPEG2-kompression. Emellertid använder nätägare i flera länder DVB-T-transmission även för HDTV-sändningar. Dagens DVB-T-mottagare kan inte ta emot sändningar i DVB-T2-formatet.

```
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

enum dvb_dev_type {
	DVB_DEVICE_FRONTEND,
	DVB_DEVICE_DEMUX,
	DVB_DEVICE_DVR,
	DVB_DEVICE_NET,
	DVB_DEVICE_CA,
	DVB_DEVICE_CA_SEC,
	DVB_DEVICE_VIDEO,
	DVB_DEVICE_AUDIO,
};

frontend Controls the physical tuner and demodulator, responsible for receiving the raw signal from an antenna, dish, or cable, and converting it into a digital transport stream.
demux    The demultiplexer filters the incoming MPEG transport stream for specific data (audio, video, data, etc.) based on their Packet Identifiers (PIDs).
dvr	 This device node is used for capturing the raw, filtered MPEG transport stream data to a file (digital video recording). It acts as a ring buffer for the demux output.
net	 Manages the mapping of DVB data packets (using Multi Protocol Encapsulation) into a standard Linux virtual network interface for "internet over DVB" applications.
ca	 Controls the Conditional Access hardware (e.g., a Common Interface (CI) slot and smart card reader) used for descrambling scrambled pay-TV channels.
audio    Controls the hardware MPEG2 audio decoder on cards that have one. Most modern systems use software decoding, in which case this device may not be present.
video    Controls the hardware MPEG2 video decoder on cards that have one. Like the audio device, this is often omitted in modern systems that rely on software decoding.

```
If you want a higher-level, more convenient API (rather than doing raw ioctl), you can use libdvbv5, which is part of the v4l-utils project.

With libdvbv5 you can:

Enumerate DVB devices / frontends using its abstraction (dvb_dev_alloc(), dvb_dev_find(), etc.)
hobby.esselfe.ca

Open a frontend device and query its properties

Use the DVBv5 tools (e.g. dvb-fe-tool) as reference — these tools are built on libdvbv5.
hobby.esselfe.ca

3. Putting it together — how to detect “Silicon Labs Si2168”

Here is a rough flow:

Call dvb_dev_alloc() to allocate a dvb_device struct.
hobby.esselfe.ca

Call dvb_dev_find() to enumerate all DVB devices. libdvbv5 will populate a list of devices, including frontends.
hobby.esselfe.ca

For each DVB frontend device in the list, open it (dvb_dev_open()), get its file descriptor, then either:
a. Use raw ioctl FE_GET_INFO to read struct dvb_frontend_info.name, or
b. Use libdvbv5 helper functions to query “what driver / frontend” this is.

Compare the .name (or whatever identifier) to the string “Silicon Labs Si2168” (or a substring) to detect that specific frontend.