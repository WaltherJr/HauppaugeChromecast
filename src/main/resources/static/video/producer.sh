#!/bin/bash
pipe="/tmp/temperature_pipe"

while true; do
    temp=$((RANDOM % 30 + 10))
    echo "$temp" > "$pipe"
    sleep 2
done