const exec = require('child_process').exec;
const got = require('got');
const cheerio = require('cheerio');
const fs = require('fs');
const https = require('https');

const dir = '/tmp/';

const linkSplitter = data => {
    return data.split('<a href="image')[1].split('"')[0];
};

// Download image and set as wallpaper
const downloadImage = (imageSource, picture) => {
    const save = fs.createWriteStream(`${dir}${picture}`);

    https.get(imageSource, (res, cb) => {
        res.pipe(save);
        console.log(`Picture saved at ${dir}${picture}`);

        save.on('finish', () => {
            save.close(cb);
            console.log("setting wallpaper");
            const options = {
                scale: 'center'
            }

            const desktopCommand = `gsettings set org.gnome.desktop.background picture-uri \'file:///${dir}${picture}\'`;
            const desktopSettingsCommand = `gsettings set org.gnome.desktop.background picture-options \'stretched\'`;
            const screensaverCommand = `gsettings set org.gnome.desktop.screensaver picture-uri \'file:///${dir}${picture}\'`;
            const screensaverSettingsCommand = `gsettings set org.gnome.desktop.screensaver picture-options \'stretched\'`;

            exec(desktopCommand, (error, _stdout, _stderr) => {
                if (error) {
                    console.log("error while setting desktop wallpaper");
                    console.log(error);
                    return;
                }
                console.log("Desktop wallpaper set successfully");
            });

            exec(desktopSettingsCommand, (error, _stdout, _stderr) => {
                if (error) {
                    console.log("error while setting desktop wallpaper options");
                    console.log(error);
                    return;
                }
                console.log("Desktop wallpaper options set successfully");
            });

            exec(screensaverCommand, (error, _stdout, _stderr) => {
                if (error) {
                    console.log("error while setting screensaver wallpaper");
                    console.log(error);
                    return;
                }
                console.log("Screensaver wallpaper set successfully");
            });

            exec(screensaverSettingsCommand, (error, _stdout, _stderr) => {
                if (error) {
                    console.log("error while setting desktop wallpaper options");
                    console.log(error);
                    return;
                }
                console.log("Desktop wallpaper options set successfully");
            });

            save.on('error', () => {
                process.exit(1);
            });
        });
    });
};

console.log('New execution', new Date());

got('https://apod.nasa.gov/apod/').then(res => {
    const $ = cheerio.load(res.body);
    const aboutImage = `${$('center').eq(1).text().split('\n')[1].trim().split(' ').join('-')}.jpg`;
    const link = linkSplitter(res.body);
    const fullUrl = `https://apod.nasa.gov/apod/image${link}`;

    console.log("downloading", fullUrl);

    downloadImage(fullUrl, aboutImage);
}).catch(error => {
    if (error) {
        process.stdout.write(error);
    }
});
