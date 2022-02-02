const async = require('async');

const exec = require('child_process').exec;
const got = require('got');
const cheerio = require('cheerio');
const fs = require('fs');
const https = require('https');

const {config} = require('./config');
const TODAY_WP_PATH = `${config.wallpaperDirectory}/today_wallpaper`;

const validateConfig = () => {
    if (!config.wallpaperDirectory) {
        console.log('wallpaperDirectory is not defined in config.js');
        process.exit(1);
    }

    if (config.enableZoomBackground && !config.zoomBackgroundPath) {
        console.log('enableZoomBackground is set to true but no zoomBackgroundPath is not defined');
        process.exit(1);
    }
    console.log('Configuration valid');
};

const removeOldPictures = (cb) => {
    const dir = config.wallpaperDirectory;
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
    const BACKGROUND_PATH = config.zoomBackgroundPath;
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
    const dir = config.wallpaperDirectory;
    const imagePath = `${dir}/${name}`;
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    const save = fs.createWriteStream(imagePath);

    https.get(fullUrl, (res, _cb) => {
        console.log(`Saving image at ${imagePath}`);
        res.pipe(save);

        save.on('finish', () => {
            console.log(`Saved image at ${imagePath}`);
            save.close((error) => {
                if (error) {
                    return cb(error);
                }
                return cb(null, {imagePath});
            });
        });

        save.on('error', () => {
            console.log(`Error while saving image at ${imagePath}`);
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
validateConfig();
async.auto(
    {
        imageData: (cb) => {
            console.log('Downloading today image data');
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
                if (!config.enableDesktopWallpaper) {
                    console.log('Not setting wallpaper');
                    return cb();
                }
                console.log('Setting wallpaper');
                return setWallpaper(results.image.imagePath, cb);
            }
        ],
        setZoomBackground: [
            'setWallpaper',
            (results, cb) => {
                if (!config.enableZoomBackground) {
                    console.log('Not setting Zoom background');
                    return cb();
                }
                console.log('Setting Zoom background');
                return setZoomBackground(results.image.imagePath, cb);
            }
        ],
        deletePictures: [
            'setWallpaper',
            'setZoomBackground',
            (_result, cb) => {
                if (!config.enableOldWallpaperDeletion) {
                    console.log('Not deleting previous wallpapers');
                    return cb();
                }
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
