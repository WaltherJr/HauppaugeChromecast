#!/bin/bash

pipe="/tmp/temperature_pipe"

# Open FIFO for reading in a non-blocking way
# The exec trick keeps a file descriptor open so the FIFO doesn't close after each read
exec 3<>"$pipe"

echo "Non-blocking consumer started. Waiting for data..."

while true; do
    # Try reading one line with a short timeout
    if read -t 1 -u 3 temp; then
        # Only runs if data was received
        echo "Received temperature: $temp°C"
    else
        # No data available in this cycle
        echo "No new data... (waiting)"
    fi
    sleep 1
done