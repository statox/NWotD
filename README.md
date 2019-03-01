# Nasa Wallpaper of the Day

Set the Nase Picture of the Day as your wallpaper!

Using some code from [nasa-cli](https://github.com/xxczaki/nasa-cli) and the npm package [wallpaper](https://www.npmjs.com/package/wallpaper)

# Usage

Clone the depo `git clone https://github.com/statox/NWotD ~/.bin/NWotD`

Create a new file `/etc/cron.daily/nasawallpaper` and make it executable. Inside put the following code

```
#!/bin/bash

node /path/to/NWotD/index.js
```
