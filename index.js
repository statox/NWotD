const async = require('async');

const exec = require('child_process').exec;
const got = require('got');
const cheerio = require('cheerio');
const fs = require('fs');
const https = require('https');

const dir = process.env.HOME ? `${process.env.HOME}/.wallpaper/` : './.wallpaper';

const removeOldPictures = (cb) => {
    const rmCommand = `find ${dir} -mtime +3 -delete`;

    exec(rmCommand, (error, _stdout, _stderr) => {
        if (error) {
            console.log('error while deleting previous wallpapers');
            return cb(error);
        }
        return cb();
    });
};

// Use feh to set the background image
const setWallpaper = (imagePath, cb) => {
    const TODAY_WP_PATH = '/home/adrien/.wallpaper/today_wallpaper';
    const copyImageCommand = `cp ${imagePath} ${TODAY_WP_PATH}`;
    const setWallpaperCommand = `feh --bg-scale ${TODAY_WP_PATH}`;

    async.auto(
        {
            copyImage: (cb) => copyFile({src: imagePath, dest: TODAY_WP_PATH}, cb),
            desktopWallpaper: ['copyImage', (_result, cb) => exec(setWallpaperCommand, cb)]
        },
        cb
    );
};

// Util to copy a file on the file system
const copyFile = ({src, dest}, cb) => {
    console.log('Copying file from');
    console.log(src);
    console.log('to');
    console.log(dest);

    const cmd = `cp ${src} ${dest}`;
    exec(cmd, (error, _stdout, _stderr) => {
        if (error) {
            console.log('Error while copying file');
            return cb(error);
        }
        return cb();
    });
};

// To set the Zoom background we replace the image at the path already configured in zoom
const setZoomBackground = (imagePath, cb) => {
    const BACKGROUND_PATH = '/home/adrien/.zoom/data/VirtualBkgnd_Custom/{d04bd4b9-57d8-44a1-9cd7-31cea7945157}';
    return copyFile({src: imagePath, dest: BACKGROUND_PATH}, cb);
};

// Util to parse the apod page and get the image link
const linkSplitter = (data) => {
    try {
        return data.split('<a href="image')[1].split('"')[0];
    } catch (error) {
        return undefined;
    }
};

// Download the image in the image directory
const downloadImage = ({fullUrl, name}, cb) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    const save = fs.createWriteStream(`${dir}${name}`);

    https.get(fullUrl, (res, _cb) => {
        console.log(`Saving image at ${dir}${name}`);
        res.pipe(save);

        save.on('finish', () => {
            console.log(`Saved image at ${dir}${name}`);
            save.close((error) => {
                if (error) {
                    return cb(error);
                }
                return cb(null, {imagePath: `${dir}${name}`});
            });
        });

        save.on('error', () => {
            console.log(`Error while saving image at ${dir}${name}`);
            return cb(error);
        });
    });
};

// Parse the pic of the day page to get image url and name
const getImageOfTheDayData = (cb) => {
    got('https://apod.nasa.gov/apod/')
        .then((res) => {
            const $ = cheerio.load(res.body);
            const link = linkSplitter(res.body);
            const aboutImage = `${$('center').eq(1).text().split('\n')[1].trim().split(' ').join('-')}.jpg`;
            const escapedAboutImage = aboutImage.replace(/[^a-zA-Z0-9-_]/gi, '_').toLowerCase();

            if (!link) {
                return cb(new Error('Can t find an image, aborting'));
            }
            const fullUrl = `https://apod.nasa.gov/apod/image${link}`;

            return cb(null, {fullUrl, name: escapedAboutImage});
        })
        .catch((error) => {
            return cb(error);
        });
};

console.log('New execution', new Date());

async.auto(
    {
        imageData: (cb) => {
            console.log('Downloading image data');
            return getImageOfTheDayData(cb);
        },
        image: [
            'imageData',
            (results, cb) => {
                console.log('Downloading image', results.imageData.name);
                return downloadImage(results.imageData, cb);
            }
        ],
        setWallpaper: [
            'image',
            (results, cb) => {
                console.log('Setting wallpaper');
                return setWallpaper(results.image.imagePath, cb);
            }
        ],
        setZoomBackground: [
            'setWallpaper',
            (results, cb) => {
                console.log('Setting Zoom background');
                return setZoomBackground(results.image.imagePath, cb);
            }
        ],
        deletePictures: [
            'setWallpaper',
            'setZoomBackground',
            (_result, cb) => {
                console.log('Delete previous wallpapers');
                return removeOldPictures(cb);
            }
        ]
    },
    (error, results) => {
        if (error) {
            console.log('The following error happened. Aborting.');
            console.log(error);
            process.exit(1);
        }
        console.log('Everything went well');
    }
);
