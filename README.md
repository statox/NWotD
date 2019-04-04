# Nasa Wallpaper of the Day

Set the Nasa Picture of the Day as your wallpaper!

This script reuses some code from [nasa-cli](https://github.com/xxczaki/nasa-cli).

# Dependencies

This application is made to run with the following software installed:

 - npm
 - Gnome3
 - gsettings


It uses the following gsettings entries to set up the gnome wallpaper and screensaver:

```bash
gsettings set org.gnome.desktop.background picture-uri
gsettings set org.gnome.desktop.background picture-options
gsettings set org.gnome.desktop.screensaver picture-uri
gsettings set org.gnome.desktop.screensaver picture-options
```

# Installation

Clone the depo and install the dependencies with `npm`

```bash
$ git clone https://github.com/statox/NWotD ~/.bin/NWotD
$ cd ~/.bin/NWotD
$ npm install
```

Then you can setup the application to run every time you start your session:

```bash
$ cd ~/.bin/NWotD
$ npm run post-install
```

This will create a file `$HOME/.config/autostart/NWotD.desktop` that Gnome will use to execute the application on each startup.
You should see a new entry in the `Startup Application Preferences` Gnome's application.

*Note* If you don't shutdown you computer every day, you'll need to put this application in a daily cron job to change the wallpaper.
To do so create a file `/etc/cron.daily/nasawallpaper` and make it executable. Inside put the following code:

```bash
#!/bin/bash

node ~/.bin/NWotD/index.js
```

(Maybe I'll update the post-install script to do that too)
