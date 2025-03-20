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
force=false
do_zoom=false
do_wallpaper=false
while getopts 'fzw' name
do
    case $name in
        'f') force=true;;
        'z') do_zoom=true;;
        'w') do_wallpaper=true;;
        ?)   echo "Usage: [-f] force [-z] (update zoom) [-w] (update wallpaper)"
             echo '      -f: By default the script doesnt run if $TODAY_WP_PATH is less than 12h old, -f prevents that'
             echo '      -z: Update the $ZOOM_BACKGROUND_PATH file'
             echo '      -w: Update the wallpaper with feh'
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
    local twelve_four_hours=$((12 * 60 * 60))

    if (( now - mod_time > twelve_four_hours )); then
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
    else
        echom "Download new image to $imagePath"
        curl -s "$imageURL" > "$imagePath"
    fi

    if fileIsImage "$imagePath" ; then
        cp "$imagePath" "$TODAY_WP_PATH"
        return 0
    fi

    echo "$imagePath is not an image"
    return 1;
}

setWallpaper() {
    if ( ! $do_wallpaper ); then
        echom 'Skip wallpaper update'
        return 0;
    fi

    echom 'Update wallpaper'
    feh --bg-scale "$TODAY_WP_PATH"
    return 0;
}

setZoomBackground() {
    if ( ! $do_zoom ); then
        echom 'Skip zoom update'
        return 0;
    fi

    echom 'Update zoom'
    cp "$TODAY_WP_PATH" "$ZOOM_BACKGROUND_PATH"
    return 0;
}

deleteOldWallpapers() {
    nbDeletions=$(find "$WALLPAPER_DIR" -mtime +3 | wc -l)
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
    if ( $force ); then
        echom "Force mode specified. Dont check if file is old"
        return
    fi
    if ! fileIsOld "$TODAY_WP_PATH" ; then
        echom "The wallpaper file is less than 12 hours old. Don't run"
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
