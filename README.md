# Nasa Wallpaper of the Day

Set the Nasa Picture of the Day as your wallpaper!

This script reuses some code from [nasa-cli](https://github.com/xxczaki/nasa-cli).

# Dependencies

This script uses gsettings to set up the gnome wallpaper and screensaver.

    gsettings set org.gnome.desktop.background picture-uri
    gsettings set org.gnome.desktop.background picture-options
    gsettings set org.gnome.desktop.screensaver picture-uri
    gsettings set org.gnome.desktop.screensaver picture-options

So it only works on systems with Gnome and gsettins installed. In the future I'll try to make it more cross platform (or not).

# Usage

Clone the depo `git clone https://github.com/statox/NWotD ~/.bin/NWotD`

Create a new file `/etc/cron.daily/nasawallpaper` and make it executable. Inside put the following code

```
#!/bin/bash

node /path/to/NWotD/index.js
```
