const got = require('got');
const cheerio = require('cheerio');
const fs = require('fs');
const https = require('https');
const wallpaper = require('wallpaper');

const dir = '';

const linkSplitter = data => {
    return data.split('<a href="image')[1].split('"')[0];
};

// Download image and set as wallpaper
const downloadImage = (imageSource, picture) => {
    const save = fs.createWriteStream(`${dir}${picture}`);

    https.get(imageSource, (res, cb) => {
        res.pipe(save);

        save.on('finish', () => {
            save.close(cb);
            wallpaper.set(picture);
            save.on('error', () => {
                process.exit(1);
            });
        });
    });
};

got('https://apod.nasa.gov/apod/').then(res => {
    const $ = cheerio.load(res.body);
    const aboutImage = `${$('center').eq(1).text().split('\n')[1].trim().split(' ').join('-')}.jpg`;
    const link = linkSplitter(res.body);
    const fullUrl = `https://apod.nasa.gov/apod/image${link}`;

    downloadImage(fullUrl, aboutImage);
}).catch(error => {
    if (error) {
        process.stdout.write(error);
    }
});
