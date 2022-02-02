exports.config = {
    enableZoomBackground: true,
    enableDesktopWallpaper: true,
    enableOldWallpaperDeletion: true,
    // To get this path set up a custom virtual background in Zoom
    // then check in the data directory what name Zoom used to store the background
    // The program will simply replace the picture at this path and Zoom should update
    // the background each time it's started.
    // In an ideal world Zoom would have an API to do that properly but it doesn't seem to be the case
    zoomBackgroundPath: '/home/adrien/.zoom/data/VirtualBkgnd_Custom/{d04bd4b9-57d8-44a1-9cd7-31cea7945157}',
    // This is the path where the program will store the downloaded images.
    // Make sure you use a directory the program has permissions to write in
    // /!\ DO NOT INCLUDE A TRAILING SLASH
    wallpaperDirectory: '/home/adrien/.wallpaper'
};
