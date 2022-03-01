# Nasa Wallpaper of the Day

Set the Nasa Picture of the Day as your wallpaper!

This script reuses some code from [nasa-cli](https://github.com/xxczaki/nasa-cli).

# Dependencies

This application is made to run with the following software installed:

 - npm
 - feh

It simply uses the `feh` command to set up the desktop wallpaper. For now this is only tested on I3WM but should work on other window managers like Gnome.

# Installation

Clone the repo and install the dependencies with `npm`

```bash
$ git clone https://github.com/statox/NWotD
$ cd NWotD
$ npm install
```

Then you can setup the application to run every time you start your session and once every day. The script will need sudo rights to execute properly as it creates a file in `/etc/cron.daily`.

```bash
$ cd NWotD
$ npm run post-install
```

This will create a file `$HOME/.config/autostart/NWotD.desktop` that GNOME will use to execute the application on each startup.
You should see a new entry in the `Startup Application Preferences` Gnome's application.

_This does not work on I3WM, one would need to add an `exec` command to the i3 config file to run the script on startup._

It will also create the file `/etc/cron.daily/NWotD` which will execute the script once a day.

By default all execution logs are stored in `/var/log/nwotd.log` but you can change the variable `LOG_FILE` in `./post-install.sh` to use another location for logs.

# Configuration

Edit the config file [config.js](./config.js) with the correct location for images.
For the zoom background to work one need to set up a virtual background manually first.

One can also disable some of the actions by changing the following configuration options:

| Option                       | Result                                                                              |
|------------------------------|-------------------------------------------------------------------------------------|
| enableZoomBackground         | When `true`: Copy the downloaded image to `zoomBackgroundPath`                      |
| enableDesktopWallpaper       | When `true`: Use `feh` to set the downloaded image as desktop backgound             |
| enableOldWallpaperDeletion   | When `true`: Delete the downloaded images older tham 3 days in `wallpaperDirectory` |
