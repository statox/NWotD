#!/usr/bin/env bash

# Config
WALLPAPER_DIR="$HOME/.wallpaper"
ZOOM_BACKGROUND_PATH='/home/afabre/.zoom/data/VirtualBkgnd_Custom/{a9e6f18c-18d7-4d29-a4b9-758f3f87256b}';

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

echom() {
    echo "nwotd [$(date +"%Y/%m/%d %H:%M:%S")] $*"
}

echom "New execution"

# Get image url
APOD_URL="https://apod.nasa.gov/apod"
apodPath=$(curl -s https://apod.nasa.gov/apod/ | grep 'IMG SRC' | grep -o '".*"' | tr -d '"')
imageURL="${APOD_URL}/${apodPath}"
imageName=${imageURL//*\//} # Replace everything until last slash by nothing

echom "url  $imageURL"
echom "name $imageName"

# Download image
imagePath="${WALLPAPER_DIR}/${imageName}"
curl -s "$imageURL" > "$imagePath"
echom "path $imagePath"

# Set wallpaper
if ( ! $nowallpaper ); then
    echom 'Update wallpaper'
    todayWPPath="${WALLPAPER_DIR}/today_wallpaper";
    cp "$imagePath" "$todayWPPath"
    feh --bg-scale "$todayWPPath"
fi

# Set zoom background
if ( ! $nozoom ); then
    echom 'Update zoom'
    cp "$imagePath" "$ZOOM_BACKGROUND_PATH"
fi

# Delete old pictures
nbDeletions=$(find "$WALLPAPER_DIR" -mtime +1 | wc -l)
echom "$nbDeletions files to delete"
find "$WALLPAPER_DIR" -mtime +1 -delete

echom 'Done'
