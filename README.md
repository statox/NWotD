# Nasa Wallpaper of the Day 🚀

Set the [Nasa Picture of the Day](https://apod.nasa.gov/apod/astropix.html) as your wallpaper and zoom background!

## Requirements

This script is made to run on linux. Tested only on Ubuntu >= `22.04` with [i3wm](https://i3wm.org/) >= `4.20.1`

- [`feh`](https://feh.finalrewind.org/) Used to set up the desktop wallpaper. For now this is only tested on i3, for Gnome `man feh` recommends using `gsettings set org.gnome.desktop.background picture-uri file:///path` instead.
- [`zoom`](https://zoom.us/) This program can change the virtual background you use on zoom

## Installation

1. Clone the repo and run the `post-install.sh` script. The script will add a line to the current user's crontab to run NWotD every hour.
1. Change the config in `index.sh`
    1. `WALLPAPER_DIR` must be an existing directory. Last downloaded wallpapers are stored there.
    1. `ZOOM_BACKGROUND_PATH` is the path to the virtual background file in zoom. You need to set a virtual background through the application first to create the image with a random name. Use this random name in the variable.

## Startup configuration

With i3 you can configure the script to run on start up by adding the following line in your `$HOME/.config/i3/config` file:

```
exec_always --no-startup-id /path/to/NWotD/index.sh >> /var/log/nwotd.log 2>&1
```

## Usage

The script supports some parameter to tweak its actions:

- `--nozoom` prevents changing the zoom wallpaper
- `--nowallpaper` prevents change the desktop wallpaper
