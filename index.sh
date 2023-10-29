#!/usr/bin/env bash

# Config
WALLPAPER_DIR="$HOME/.wallpaper"
ZOOM_BACKGROUND_PATH="$HOME/.zoom/data/VirtualBkgnd_Custom/{a9e6f18c-18d7-4d29-a4b9-758f3f87256b}"
TODAY_WP_PATH="${WALLPAPER_DIR}/today_wallpaper";

# Arguments
nozoom=false
nowallpaper=false
while getopts 'zw' name
do
    case $name in
        'z') nozoom=true;;
        'w') nowallpaper=true;;
        ?)   echo "Usage: [--nozoom] [--nowallpaper]"
            exit 2;;
    esac
done

APOD_URL="https://apod.nasa.gov/apod/"

echom() {
    echo "nwotd [$(date +"%Y/%m/%d %H:%M:%S")] $*"
}

downloadImage() {
    apodPath=$(curl -s "$APOD_URL" | grep 'IMG SRC' | grep -o '".*"' | tr -d '"')
    imageURL="${APOD_URL}/${apodPath}"
    imageName=${imageURL//*\//} # Replace everything until last slash by nothing

    imagePath="${WALLPAPER_DIR}/${imageName}"
    if [ -f "$imagePath" ]; then
        echom "Image already exists $imagePath"
        return 0
    fi

    echom "Download new image to $imagePath"
    curl -s "$imageURL" > "$imagePath"
    cp "$imagePath" "$TODAY_WP_PATH"
    return 1
}

setWallpaper() {
    if ( $nowallpaper ); then
        return;
    fi

    echom 'Update wallpaper'
    feh --bg-scale "$TODAY_WP_PATH"
}

setZoomBackground() {
    if ( $nozoom ); then
        return;
    fi

    echom 'Update zoom'
    cp "$TODAY_WP_PATH" "$ZOOM_BACKGROUND_PATH"
}

deleteOldWallpapers() {
    nbDeletions=$(find "$WALLPAPER_DIR" -mtime +1 | wc -l)
    echom "Delete $nbDeletions files"
    find "$WALLPAPER_DIR" -mtime +3 -delete
}

echom "New execution"
downloadImage
setWallpaper
setZoomBackground
deleteOldWallpapers
echom 'Done'
