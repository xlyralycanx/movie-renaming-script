const fs = require("fs");
const path = require("path");

// LyraLycan's movie renaming script FOR LINUX. Requires node-js. If it is not installed, use: apt-get update && apt upgrade -y \ apt install node-js
// Designed to follow Emby's naming convention, preserves subtitles, logs errors if anything wasn't quite right.
// Just put this in a directory above the folder containing the movies (or don't and specify a path from root, I'm not your boss), open the terminal and type (without quotes) "node rename-movies-linux <source folder> <destination folder>".
// Folder syntax is as follows: "destination folder/first character of movie/movie name and year/movie file.


//The arrays this script needs.
const lower = ["A", "An", "And", "As", "At", "But", "By", "For", "In", "Nor", "Of", "Or", "The", "Up"]; // Words that do not need capitalization
const es = ["DIRECTORS.CUT.", "EXTENDED.", "UNRATED.", "UNCUT.", "IMAX.", "THEATRICAL."]; // Editions
const rs = ["480p.", "720p.", "1080p.", "2160p."]; // Resolutions
const qs = {"Web": ["webrip.", "web."], "BluRay": ["brrip.", "bluray."], "Dvd": ["dvdrip.", "dvd."]}; // Qualities
const ex = {"English": ["en.srt", "eng.srt", "english.srt"], "Forced": ["[forced]", "en.forced", "forced.en", "eng.forced", "forced.eng", "english.forced", "forced.english"]}; // Extensions for subtitle files
const ee = [".mp4", ".mkv", ".avi"]; // Extensions for movie files
const oldDirs = []; // This is populated with directories to remove after the transfers are complete
const unknownInfo = []; // This is populated with files with unidentified information, the information in question and the reason for it
const duplicates = []; // This is populated with directories if there is already an identically named directory at the destination, after checking for files inside it.
const subs = []; // This is populated with subtitles. The nature of the code requires all existing subtitles to be catalogued before attempting to match them to a (movie) file.
let tm = 0; // Transferred movie counter
let ts = 0; // Transferred subtitle counter
var log = './logs/rename_log_' + new Date().toISOString().split('T')[0] + '.txt'; // The dynamic name and location of the log file, default = same directory as the .js

const avoidCatastrophe = async (dir) => { // Ensures the given source does not contain a .js file, thereby preventing a very bad accident
        const files = await fs.readdirSync(dir);
	if (files.some((element) => element.toLowerCase().endsWith('.js'))) {
		return 1;
	}
}

const catalogueSubs = async (dir) => { // Catalogues the subtitle files (obviously)
        const files = await fs.readdirSync(dir);
        if (files.length === 0) {
                await fs.appendFileSync(log, dir + "\n");
                fs.rmSync(dir);
        }
        for (file of files) { // Matches only subtitles with specific criteria (quality container, marked as English or named the same as its accompanying file, no hard-of-hearing captions)
                const filePath = path.join(dir, file);
                const fileStat = fs.statSync(filePath);
                if (fileStat.isDirectory()) {
                        fileList = await catalogueSubs(filePath);
                }
                else if ((file.toLowerCase().endsWith('.srt') || file.toLowerCase().endsWith('sub')) && fileStat.size > 400 && (rs.some(r => file.toLowerCase().includes(r)) || ex.English.some(x => file.toLowerCase().includes(x)) || ex.Forced.some(y => file.toLowerCase().includes(y))) && !file.toLowerCase().includes('sdh')) {
                	await subs.push(filePath);
                }
	}
}
const batchRename = async (dir) => { // The meat
	const files = await fs.readdirSync(dir);
	if (files.length === 0) {
		await fs.appendFileSync(log, dir + "\n");
		fs.rmSync(dir);
	}
	for (file of files) if (!file.toLowerCase().endsWith('.srt') && !file.toLowerCase().endsWith('sub')) { // Excludes only subtitles to save them from a premature deletion
		let edition;
		let yr;
		let te;
		let res;
		let qual;
		let em;
		let uq = '';
		let sn = 0;
		const filePath = path.join(dir, file);
		const fileStat = fs.statSync(filePath);
		if (fileStat.isDirectory()) {
			fileList = await batchRename(filePath);
		}
		else if (ee.some(e => file.toLowerCase().endsWith(e))) { // Includes only movies
			movie: if (!file.match(/S\d\d+/) && !dir.toLowerCase().includes('featurettes')) { // Excludes obvious show files that contain season numbers or extras
				for (i in es) if (file.toUpperCase().includes(es[i])) { // Extracts the edition
					edition = " " + es[i].charAt(0).toUpperCase() + es[i].substr(1).toLowerCase().replace("s.c","'s C").replace('.',' ');
					file = file.replace(es[i], '');
					if (file.startsWith('.') || file.startsWith(' ')) { // Fixes any issues with the name
						file = file.substring(1);
					}
					if (file.toLowerCase().match(/0p[a-z]/)) { // Fixes any issues with the name
						file = file.toLowerCase().replace('0p', '0p ');
					}
				}
				if (file.slice(0,3) == 'The') { // Extracts the movie's first letter, ignoring 'The' or 'A', defaulting to '#' for numbers
					fc = file[4].toUpperCase();
				}
				else if (file.slice(0,2) == 'A.' || file.slice(0,2) == 'A ') {
					fc = file[2].toUpperCase();
				}
				else {
					fc = file[0].toUpperCase();
				}
				if (!fc.match(/[a-zA-z]/i)) {
					fc = '#';
				}
				if (file.includes(' (')) { // if a file was named but didn't get moved because of an error, fixes it, catching any errors and moves on to the next file
					rnm = file.slice(0, file.indexOf(') ')) + ")";
					fxloc = path.join(process.argv[3], fc, rnm);
					fxpath = path.join(fxloc, file);
					if (!fs.existsSync(fxloc)) {
						fs.mkdirSync(fxloc, { recursive: true });
					}
					else {
						await duplicates.push(fxloc + "\n");
						console.log("Warning - folder already exists:\n" + fxloc);
					}
					try {
						await fs.renameSync(filePath, fxpath);
					} catch (err) {
						console.log("Error moving file:");
						console.error(err);
					}
					oldDirs.push(dir);
					break movie;
				}
				if (!file.match(/\.\d{4}\./g)) { // Extracts the year
					te = file.indexOf(file.match(/\.\d{4}/g));
					if (!dir.match(/\ \(\d{4}\)/g)) {
						if (!dir.match(/\(\ \d{4}\ \)/g)) {
							yr = " (Unknown Year)";
							await unknownInfo.push(file + " -" + yr);
						}
						else {
							by = dir.indexOf(dir.match(/\(\ \d{4}\ \)/g));
							yr = " (" + dir.slice(by+2, by+6) + ")";
						}
					}
					else {
						by = dir.indexOf(dir.match(/\(\d{4}\)/g));
						yr = dir.slice(by-1, by+6);
					}
				}
				else {
					te = file.indexOf(file.match(/\.\d{4}(?=\.\d{4}p)/g));
					yr = file.slice(te, te+6).replace('.', ' (').replace('.', ')');
				}
				for (i in rs) if (file.includes(rs[i])) { // Extracts the resolution
					res = " - " + rs[i].replace('.','');
				}
				if (qs.Web.some(q => file.toLowerCase().includes(q))) { // Extracts the quality, defaulting to 'Web' and logging the issue
					qual = " Web";
				}
				else if (qs.BluRay.some(q => file.toLowerCase().includes(q))) {
					qual = " BluRay";
				}
				else if (qs.Dvd.some(q => file.toLowerCase().includes(q))) {
					qual = " Dvd";
				}
				else {
					qual = " Web";
					await unknownInfo.push(file + ' - Unknown Quality, marking as "Web"');
				}
				words = file.slice(0, te).replace(/\./g,' ').replace('_','').split(' '); // Capitalizes words in the title, excluding the ones found in the above array
				for (var c in words) {
					if ((c > 0) && (c !== words.length) && (lower.includes(words[c]))) {
						words[c] = words[c].toLowerCase();
					}
					else {
						words[c] = words[c].charAt(0).toUpperCase() + words[c].substr(1).toLowerCase();
					}
				}
				title = words.join(' ').replace('  ',' '); // Builds the new title
				ext = file.slice(-4); // Extracts the file extension
				newDir = path.join(process.argv[3], fc, title + yr); // Builds the new directory
				newName = title + yr + (!res ? ' - Unknown Resolution' : res) + (!edition ? '' : edition) + qual; // Builds the new filename
				newPath = path.join(newDir, newName + ext); // Builds the complete new path
				if (!fs.existsSync(newDir)) {
					fs.mkdirSync(newDir, { recursive: true });
				}
				else { // If destination exists, logs it
					console.log("Warning - folder already exists:\n" + newDir + "\n");
					ef = await fs.readdirSync(newDir);
					if (ef.length !== 0) { // As the destination isn't empty, checks for a file matching the new one that has a lower resolution, and also for any subtitles
						em = ef
							.filter(file=> file.startsWith(title + yr + (res == ' - 2160p' ? ' - 1080p' : (res == ' - 1080p' ? ' - 720p' : ' - 480p'))))
							.map(file=> path.resolve(newDir, file))
						esub = ef
							.filter(file=> file.endsWith(".srt"))
							.map(file=> path.resolve(newDir, file))
						if (em.length !== 0) { // As there is an existing version with lower resolution, attempts to remove it and logs the result
							try {
								for (file of em) {
									await fs.unlinkSync(file);
								}
								uq = " -> Upgraded Quality" + res;
							} catch(error) {
								console.error(error);
								uq = " -> Failed to remove existing version";
							}
						}
						sn = esub.length; // Simply counts the amount of existing subtitle files
					}
					await duplicates.push(newDir + uq + "\n");
				}
				try { // The most important step. Attempts to move movie files to their new location, logging any error to the console
					await fs.renameSync(filePath, newPath);
					tm = tm+1;
				} catch(error) {
					console.log("Error moving video file:");
					console.error(error);
				}
				await catalogueSubs(dir); // Populates the array with subtitles in the movie's location, including subdirectories
				for (s in subs) if (subs[s].includes(dir.split('/')[1])) { // Builds the complete new subtitle path
					subPath = path.join(newDir, newName + (sn == 0 ? '' : "." + sn) + ".en" + (ex.Forced.some(f => subs[s].toLowerCase().includes(f)) ? '.forced' : '') + ".srt");
					try { // Attempts to move subtitle files to their new location, logging any error to the console
        	                                await fs.renameSync(subs[s], subPath);
						ts = ts+1;sn = sn+1;
                	                } catch(error) {
                        	                console.log("Error moving subtitle file:");
                                	        console.error(error);
	                                }
				}
				oldDirs.push(dir); // Submits the old directory for deletion later
			}
		}
		else { // Deletes anything that isn't a movie or subtitle file, and logs it
			await fs.appendFileSync(log, file + "\n");
			fs.unlinkSync(filePath);
		}
	}
}
const d = new Date(); // Gets today's date for the log file
async function main() {
	fs.appendFileSync(log, new Date().toString() + "\n\nDeleted files:\n");
	await batchRename(process.argv[2]); // Calls the rename and move function. Initiates everything.
	for (i in oldDirs) { // Checks if the old directory is already removed (happens if the last remaining file gets moved), logs if so, then attempts to remove it, logging for success or error
		if (!fs.existsSync(oldDirs[i])) {
			await fs.appendFileSync(log, "\nFolder already removed:\n" + oldDirs[i] + "\n");
		}
		else {
			try {
				await fs.rmSync(oldDirs[i], { recursive: true });
			} catch(error) {
				console.log("Error removing folder:");
				console.error(error);
				await fs.appendFileSync(log, "\nFailed to remove folder:\n" + oldDirs[i] + "\n");
			}
		}
	}
	if (unknownInfo.length > 0) { // Logs any files with unidentified information
		await fs.appendFileSync(log, "\nUnknown info:\n");
		for (i in unknownInfo) {
			await fs.appendFileSync(log, unknownInfo[i] + "\n");
		}
	}
	if (duplicates.length > 0) { // Logs any files which had existing versions already in the destination (only happens if the same movie has been added beforehand)
		await fs.appendFileSync(log, "\nDuplicate file(s):\n");
		for (i in duplicates) {
			await fs.appendFileSync(log, duplicates[i] + "\n");
		}
	}
	fs.appendFileSync(log, "\nSuccessfully added " + tm + " movie" + (tm == 1 ? '' : 's') + (!ts > 0 ? '' : " & " + ts + " subtitle" + (ts == 1 ? '' : 's')) + ".\n\t~~~~~~~~~~\n\n"); // Logs the final results
}
if (process.argv[2] && process.argv[3]) { // Ensures the user submits two arguments, one being the source folder, two being the destination folder
	if (avoidCatastrophe(process.argv[2]) != 1) {
		main();
	}
	else {
		console.log("Critical error - source folder cannot contain a js file!");
		console.log("Cancelled.");
	}
} else {
	console.log('Error - must provide a source folder and destination folder, e.g.: node rename-movies-linux.js "New Downloads" Movies.');
}
