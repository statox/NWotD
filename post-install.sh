#!/usr/bin/env bash
set -e

which jq >/dev/null 2>/dev/null || (echo 'Missing dependency jq' && exit 1)

WALLPAPER_DIR="$HOME/.wallpaper"
if [ ! -d "$WALLPAPER_DIR" ]; then
    echo "Please create wallpaper directory: $WALLPAPER_DIR"
    exit 1
fi

# Add a line in the user's crontab to run the script periodically
#
# This script should be idempotent and only add the line if it doesnt exist
# (This is why we add a "header" line, to check if the script run already)

LOG_FILE='/var/log/nwotd.log'

if [ ! -f "$LOG_FILE" ]; then
    echo "Please create log file: $LOG_FILE"
    exit 1
fi

if [ ! -w "$LOG_FILE" ]; then
    echo "Please make sure log file is writable: $LOG_FILE"
    exit 1
fi


SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

# TO READ /!\ I had an issue to make cron.daily work and simply used crontab -e and added this line
# DISPLAY=:0 is important to solve "Can't open X display" errors with feh
command="40 * * * * DISPLAY=:0 $SCRIPT_DIR/index.sh >> $LOG_FILE 2>&1"
header='# NWotD - Update wallpaper'
tmpFile='/tmp/crontab_tmp'

crontab -l > $tmpFile

if grep -q "$header" "$tmpFile"; then
    echo 'Header found in crontab. No edition.'
else
    echo 'Adding command to crontab'
    echo "$header" >> "$tmpFile"
    echo "$command" >> "$tmpFile"
fi
crontab $tmpFile
