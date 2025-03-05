const fs = require("fs");
const path = require("path");

const ext = [".mp4", ".mkv", ".avi", ".png", ".jpg", ".bif"]
const cd = [];
const pf = [];
const ftp = [];
let eres;
let cdc = 0;
let pfc = 0;
let rr;
var log = './logs/cleanup_log_' + new Date().toISOString().split('T')[0] + '.txt';

const help = '\nFormat: <script.js> <target path> <arguments separated by a space>\n\nExamples:\n\tcleanlibrary.js "./New Downloads" subs thumbs\n\tResult: Iterates through all folders at path New Downloads and deletes subtitle and thumbnail files\n\n\tcleanlibrary.js "Video/New/Movies" all\n\tResult: Iterates through all folders at path Video/New/Movies and deletes images, subtitles and thumbnails\n\n\tcleanlibrary.js "Movies" resolution\n\tResult: Iterates through all folders at path Movies and leaves only the highest resolution video\n\nArguments:\n\tsubs = Removes subtitles\n\timages = Removes images\n\tthumbs = Removes .bif thumbnail files\n\tall = Removes all of the above (ignores video files)\n';

const removeRes = async (dir, nres) => {
	if (nres == '2160p') {
		eres = ["1080p", "720p", "480p"];
	}
	else if (nres == '1080p') {
		eres = ["720p", "480p"];
	}
	ef = await fs.readdirSync(dir);
	em = ef
		.filter(file=> eres.some(r => file.includes(r)))
		.map(file=> path.resolve(dir, file))
	if (em.length !== 0) {
		try {
			for (file of em) {
				if (!cd.includes(dir + " -> Removed resolutions lower than " + nres)) {
					await cd.push(dir + " -> Removed resolutions lower than " + nres);
					cdc = cdc+1;
				}
				pf.push(file);
				pfc = pfc+1;
			}
		} catch(error) {
			console.error(error);
			if (!cd.includes(dir + " -> Failed to remove resolutions" + nres)) {
					await cd.push(dir + " -> Failed to remove resolutions" + nres);
					cdc = cdc+1;
			}
		}
	}
	else if (ftp.some(e => file.endsWith(e))) {
			
			
		}
};

const batchClean = async (dir) => {
	const files = await fs.readdirSync(dir);
	if (files.length === 0) {
		await fs.appendFileSync(log, dir + "\n");
		fs.rmdirSync(dir);
	}

	for (file of files) {
		const filePath = path.join(dir, file);
		const fileStat = fs.statSync(filePath);
		if (fileStat.isDirectory()) {
			fileList = await batchClean(filePath);
		}
		else if (ftp.some(e => file.endsWith(e))) {
			if (!cd.includes(dir)) {
				await cd.push(dir);
				cdc = cdc+1;
			}
			pf.push(filePath);
			pfc = pfc+1;
		}
		else if (process.argv.includes('resolution')) {
			if (file.includes('2160p')) {
				await removeRes(dir, '2160p');
			}
			else if (file.includes('1080p')) {
				await removeRes(dir, '1080p');
			}
		}
	}
}
const d = new Date();
async function main() {
	fs.appendFileSync(log, new Date().toString() + "\n\n");
	if (process.argv.includes('all')) {
		ftp.push('.srt', '.jpg', '.png', '.bif');
	}
	else {
		if (process.argv.includes('subs')) {
			ftp.push('.srt');
		}
		if (process.argv.includes('images')) {
			ftp.push('.jpg', '.png');
		}
		if (process.argv.includes('thumbs')) {
			ftp.push('.bif');
		}
	}
	await batchClean(process.argv[2]);
	if (pf.length > 0) { // The following block is a WIP that would use readline to ask the user for confirmation.
		//var ans = prompt("This will delete " + pfc + " file" + (pfc == 1 ? '' : 's') + " from " + cdc + " director" + (cdc == 1 ? 'y' : 'ies') + ". Are you sure? (y/n)");
		//if (ans != null) {
		//	if (ans == 'y') {
		//		console.log("Done.");
		//	} else if (ans == 'n') {
		//		console.log("Cancelled.");
		//	}
		//}
		await fs.appendFileSync(log, "\nDeleted file(s):\n\n");
		for (i in pf) {
			try {
				await fs.unlinkSync(pf[i]);
				await fs.appendFileSync(log, pf[i].substring(pf[i].lastIndexOf('\\')+1) + "\n");
			} catch (error) {
				await fs.appendFileSync(log, "Duplicate deletion attempt - handled\n");
			}
		}
		for (i in cd) {
			console.log(cd[i].substring(cd[i].lastIndexOf('\\')+1));
		}
	}
	console.log("Cleaned up " + cdc + " director" + (cdc == 1 ? 'y' : 'ies') + " and deleted " + pfc + " file" + (pfc == 1 ? '' : 's'));
	fs.appendFileSync(log, "\nCleaned up " + cdc + " director" + (cdc == 1 ? 'y' : 'ies') + " and deleted " + pfc + " file" + (pfc == 1 ? '' : 's') + ".\n\t~~~~~~~~~~\n\n");
}
if (process.argv[2] && process.argv[3]) {
	main();
} else if (process.argv[2] == 'help') {
	console.log(help);
} else {
	console.log('Error - must provide a folder and target files to remove, e.g.: "Videos/Movies" subs. type "help" for more info.');
}
