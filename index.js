const async = require('async');

const exec = require('child_process').exec;
const got = require('got');
const cheerio = require('cheerio');
const fs = require('fs');
const https = require('https');

const dir = (process.env.HOME) ? `${process.env.HOME}/.wallpaper/` : './.wallpaper';

const removeOldPictures = () => {
    const rmCommand = `find ${dir} -mtime +3 -delete`

    exec(rmCommand, (error, _stdout, _stderr) => {
        if (error) {
            console.log("error while deleting previous wallpapers");
            console.log(error);
            return;
        }
        console.log("Previous wallpapers deleted successfully");
    });
};

const setWallpaper = (imagePath) => {
    console.log("setting wallpaper");

    const desktopCommand = `feh --bg-scale ${imagePath}`
    const copyImage = `cp ${imagePath} /home/afabre/.wallpaper/today_wallpaper`;

    async.auto({
        desktopWallpaper: (cb) => exec(desktopCommand, (error, _stdout, _stderr) => {
            if (error) {
                console.log("error while setting desktop wallpaper");
                console.log(error);
                return cb(error);
            }
            console.log("Desktop wallpaper set successfully");
            return cb();
        }),
        copyImage: (cb) => exec(copyImage, (error, _stdout, _stderr) => {
            if (error) {
                console.log("error while setting screensaver wallpaper");
                console.log(error);
                return cb(error);
            }
            console.log("Screensaver wallpaper set successfully");
            return cb();
        })
    }, (error) => {
        if (error) {
            console.log("We add an error in the async ececution");
            console.log(error);
            return;
        }

        console.log("Async execution went find, removing the previous wallpaper");
        removeOldPictures();
    });
};

const linkSplitter = data => {
    try {
        return data.split('<a href="image')[1].split('"')[0];
    } catch (error) {
        return undefined;
    }
};

// Download image and set as wallpaper
const downloadImage = (imageSource, picture) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    const save = fs.createWriteStream(`${dir}${picture}`);

    https.get(imageSource, (res, cb) => {
        res.pipe(save);
        console.log(`Picture saved at ${dir}${picture}`);

        save.on('finish', () => {
            setWallpaper(`${dir}${picture}`);
            save.close(cb);
        });

        save.on('error', () => {
            process.exit(1);
        });
    });
};

console.log('New execution', new Date());

got('https://apod.nasa.gov/apod/').then(res => {
    const $ = cheerio.load(res.body);
    const link = linkSplitter(res.body);
    const aboutImage = `${$('center').eq(1).text().split('\n')[1].trim().split(' ').join('-')}.jpg`;
    const escapedAboutImage = aboutImage.replace(/[^a-zA-Z0-9-_]/gi, '_').toLowerCase();

    if (!link) {
        console.log('Can t find an image, aborting', fullUrl);
    }
    const fullUrl = `https://apod.nasa.gov/apod/image${link}`;

    console.log("downloading", fullUrl);

    downloadImage(fullUrl, escapedAboutImage);
}).catch(error => {
    if (error) {
        process.stdout.write(error);
    }
});
