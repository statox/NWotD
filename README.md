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

Then you can setup the application to run every time you start your session and once every day. The script will need sudo rights to execute properly as it creates a file in `/etc/cron.daily`.

```bash
$ cd ~/.bin/NWotD
$ npm run post-install
```

This will create a file `$HOME/.config/autostart/NWotD.desktop` that Gnome will use to execute the application on each startup.
You should see a new entry in the `Startup Application Preferences` Gnome's application.

It will also create the file `/etc/cron.daily/NWotD` which will execute the script once a day.

By default all execution logs are stored in `/var/log/nwotd.log` but you can change the variable `LOG_FILE` in `./post-install.sh` to use another location for logs.
