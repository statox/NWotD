#!/usr/bin/env bash

set -e

# Config
WALLPAPER_DIR="$HOME/.wallpaper"
ZOOM_BACKGROUND_PATH="$HOME/.zoom/data/VirtualBkgnd_Custom/{a9e6f18c-18d7-4d29-a4b9-758f3f87256b}"
TODAY_WP_PATH="${WALLPAPER_DIR}/today_wallpaper"
APOD_API_KEY="DEMO_KEY" # A key can be generated at https://api.nasa.gov
                        # But the DEMO_KEY allows for 50 calls/day and 30 calls/hour from the same IP
                        # Which is good enough for a simple daily/hourly wallpaper change

# Arguments
nozoom=false
nowallpaper=false
while getopts 'zw' name
do
    case $name in
        'z') nozoom=true;;
        'w') nowallpaper=true;;
        ?)   echo "Usage: [-z] (no zoom) [-w] (no wallpaper)"
            exit 2;;
    esac
done

echom() {
    echo "nwotd [$(date +"%Y/%m/%d %H:%M:%S")] $*"
}

fileIsImage() {
    if file "$1" |grep -qE 'image|bitmap'; then
        return 0;
    fi
    return 1;
}

fileIsOld() {
    local filepath="$1"

    # Check if file exists and is accessible
    if [ ! -f "$filepath" ]; then
        return 0
    fi

    # Get modification time in seconds since epoch
    local mod_time
    mod_time=$(stat -c "%Y" "$filepath")
    local now
    now=$(date +%s)
    local twenty_four_hours=$((12 * 60 * 60))

    if (( now - mod_time > twenty_four_hours )); then
        # File is more than 12 hours old
        return 0
    fi

    return 1
}

APOD_API_URL="https://api.nasa.gov/planetary/apod?api_key=$APOD_API_KEY"
downloadImage() {
    todayDetails=$(curl -s "$APOD_API_URL")
    media_type=$(jq -r '.media_type' <<< "$todayDetails" )
    tries=1
    while [ "$media_type" != 'image' ] && [ $tries -lt 3 ]; do
        ((tries++))
        echo 'Today\s media is not an image, fetching a random one'
        APOD_API_URL="https://api.nasa.gov/planetary/apod?api_key=$APOD_API_KEY&count=1"
        todayDetails=$(curl -s "$APOD_API_URL" | jq first)
        media_type=$(jq -r '.media_type' <<< "$todayDetails" )
    done
    imageURL=$(jq -r '.url' <<< "$todayDetails" )
    imageName=${imageURL//*\//} # Replace everything until last slash by nothing

    imagePath="${WALLPAPER_DIR}/${imageName}"
    if [ -f "$imagePath" ]; then
        echom "Image already exists $imagePath"
        return 0
    fi

    echom "Download new image to $imagePath"
    curl -s "$imageURL" > "$imagePath"

    if fileIsImage "$imagePath" ; then
        cp "$imagePath" "$TODAY_WP_PATH"
        return 0
    fi

    echo "$imagePath is not an image"
    return 1;
}

setWallpaper() {
    if ( $nowallpaper ); then
        echom '--nowallpaper provided dont set the wallpaper'
        return 0;
    fi

    echom 'Update wallpaper'
    feh --bg-scale "$TODAY_WP_PATH"
    return 0;
}

setZoomBackground() {
    if ( $nozoom ); then
        return 0;
    fi

    echom 'Update zoom'
    cp "$TODAY_WP_PATH" "$ZOOM_BACKGROUND_PATH"
    return 0;
}

deleteOldWallpapers() {
    nbDeletions=$(find "$WALLPAPER_DIR" -mtime +1 | wc -l)
    echom "Delete $nbDeletions files"
    find "$WALLPAPER_DIR" -mtime +3 -delete
}

checkWallpaperDirectory() {
    if [ ! -d "${WALLPAPER_DIR}" ]; then
        echom "Wallpaper directory doesn't exist $WALLPAPER_DIR"
        echom "Please create it yourself or check the value of the \$WALLPAPER_DIR variable in the script"
        return 1
    fi
    return 0
}

stopIfNeeded() {
    if ! fileIsOld "$TODAY_WP_PATH" ; then
        echo "The wallpaper file is less than 12 hours old. Don't run"
        exit 0
    fi
}

echom "New execution"

checkWallpaperDirectory
stopIfNeeded

downloadImage

setWallpaper
setZoomBackground
deleteOldWallpapers

echom 'Done'
