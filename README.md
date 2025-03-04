# movie-renaming-script
A script written in NodeJS that organises and renames movie files.

This script was originally designed to run on Windows, hence NodeJS, but I converted to Linux and improved on it slightly.

It takes movies from a defined source folder and places in a defined destination folder, renaming and moving into a predetermined organisation, as per the [Emby Movie Naming convention](https://emby.media/support/articles/Movie-Naming.html). For example, "./media/source/The Princess Bride (1987)/The.Princess.Bride.1080p.Bluray.x265.SITE.mp4" becomes "./media/dest/P/The Princess Bride (1987)/The Princess Bride (1987) - 1080p BluRay.mp4". Due to the differences between movies and shows, it only works on movie files. Shows will be ignored.


<h3>Pros</h3>
- **Extracts information** from source directory
- **Builds a new path** from the old
- **Moves** to the new home
- **Logs errors** and success information in ./logs/
- **Includes subtitles** that are forced (foreign only) or full, discards empty or placeholder subs
- **Refuses to run** if there is an issue

<h3>Cons</h3>
- **Cannot** handle user permissions. Even if an issue arises due to lacking permissions, can be run again immediately after the issue is resolved and naming will be correct. (User needs destination rw and source rwx)
- **Cannot** use the internet to scrape information. It can only get data from the file's directory.
