#!/usr/bin/env bash

LOG_FILE='/var/log/nwotd.log'
AUTOSTART_DIR="$HOME/.config/autostart"
AUTOSTART_FILE="$AUTOSTART_DIR/NWotD.desktop"

# Add the application in Gnome's autostart directory
mkdir -p "$AUTOSTART_DIR"
touch "$AUTOSTART_FILE" 
cat > "$AUTOSTART_FILE" << EOF
[Desktop Entry]
Type=Application
Exec=/usr/bin/node $PWD/index.js >> $LOG_FILE 2>&1
Hidden=false
NoDisplay=false
X-GNOME-Autostart-enabled=true
Name[en_US]=Nasa Wallpaper of the Day
Name=Nasa Wallpaper of the Day
Comment[en_US]=Set up Nasa Pic of the day as Wallpaper
Comment=Set up Nasa Pic of the day as Wallpaper
EOF

# Add the application to cron.daily
CRON_DIR="/etc/cron.daily/"
CRON_FILE="$CRON_DIR/NWotD"
touch "$CRON_FILE"
chmod +x "$CRON_FILE"

cat > "$CRON_FILE" << EOF
#!/bin/bash

/usr/bin/node $PWD/index.js >> $LOG_FILE 2>&1
EOF
