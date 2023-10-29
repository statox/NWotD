#!/usr/bin/env bash

# Add a line in the user's crontab to run the script periodically
#
# This script should be idempotent and only add the line if it doesnt exist
# (This is why we add a "header" line, to check if the script run already)

LOG_FILE='/var/log/nwotd.log'
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
