# movie-renaming-script
A script written in NodeJS that organises and renames movie files.

This script was originally designed to run on Windows, hence NodeJS, but I converted to Linux and improved on it slightly.

'rename-movies-linux.js' takes movies from a defined source folder and places in a defined destination folder, renaming and moving into a predetermined organisation, as per the [Emby Movie Naming convention](https://emby.media/support/articles/Movie-Naming.html).</br>For example:</br>Old: "./media/source/The Princess Bride (1987)/The.Princess.Bride.1080p.Bluray.x265.SITE.mp4"</br>New: "./media/dest/P/The Princess Bride (1987)/The Princess Bride (1987) - 1080p BluRay.mp4". Due to the differences between movies and shows, it only works on movie files. Shows will be ignored.


<h3>Pros</h3>
- <b>Extracts information</b> from source directory</br>
- <b>Builds a new path</b> from the old</br>
- <b>Moves</b> to the new home</br>
- <b>Logs errors</b> and success information in ./logs/</br>
- <b>Includes subtitles</b> that are forced (foreign only) or full, discards empty or placeholder subs</br>
- <b>Refuses to run</b> if there is an issue</br>

<h3>Cons</h3>
- <b>Cannot</b> handle user permissions. Even if an issue arises due to lacking permissions, can be run again immediately after the issue is resolved and naming will be correct. (User needs destination rw and source rwx)</br>
- <b>Cannot</b> use the internet to scrape information. It can only get data from the file's directory.</br>


Also included here is 'cleanlibrary.js' - this allows the user to spritz a defined directory of subtitles, thumbnail files and/or images (by user definition), and automatically removes movie files, leaving the highest quality.
