#!/usr/bin/env node

/*
 * codebasetxt
 * Generates a codebase.txt by recursively scanning the current directory,
 * respecting .gitignore, skipping folders starting with ".", the "drizzle" folder,
 * and certain file types.
 */

const fs = require("node:fs");
const path = require("node:path");
const ignore = require("ignore");

// File types/extensions to exclude
const excludedExtensions = [
	".png",
	".jpg",
	".jpeg",
	".gif",
	".bmp",
	".svg",
	".ico",
	".pdf",
	".zip",
	".gz",
	".tar",
	".rar",
	".7z",
	".woff",
	".ttf",
	".eot",
	".otf",
	".ico",
	".sql",
	".lock",
];

// Filenames to exclude
const excludedFilenames = ["package-lock.json"];

// Path to your .gitignore
const GITIGNORE_PATH = path.join(process.cwd(), ".gitignore");

// Output file
const OUTPUT_FILE = path.join(process.cwd(), "codebase.txt");

// Load .gitignore
let ig;
try {
	const gitignoreContents = fs.readFileSync(GITIGNORE_PATH, "utf8");
	ig = ignore().add(gitignoreContents);
} catch (err) {
	console.error(`Could not read .gitignore: ${err.message}`);
	console.error("Proceeding without gitignore-based ignoring...");
	ig = ignore();
}

/**
 * Recursively walk the directory structure, skipping:
 * - .gitignore patterns
 * - directories that start with "."
 * - the "drizzle" folder
 * - certain file extensions or filenames
 */
function getAllFiles(dir) {
	const dirEntries = fs.readdirSync(dir, { withFileTypes: true });
	let files = [];

	for (const dirent of dirEntries) {
		const fullPath = path.join(dir, dirent.name);
		const relativePath = path.relative(process.cwd(), fullPath);

		// 1. Skip if .gitignore says to ignore
		if (ig.ignores(relativePath)) {
			continue;
		}

		// 2. Skip if the path contains "drizzle"
		if (relativePath.toLowerCase().includes("drizzle")) {
			continue;
		}

		// 3. Skip if the path contains "node_modules"
		if (relativePath.toLowerCase().includes("node_modules")) {
			continue;
		}

		// 4. Directories
		if (dirent.isDirectory()) {
			// Skip folders starting with '.'
			if (dirent.name.startsWith(".")) {
				continue;
			}

			// Otherwise, recurse into the subdirectory
			files = files.concat(getAllFiles(fullPath));
		} else {
			// 5. Check excluded extensions
			const ext = path.extname(dirent.name).toLowerCase();
			if (excludedExtensions.includes(ext)) {
				continue;
			}

			// 6. Check excluded filenames
			if (excludedFilenames.includes(dirent.name.toLowerCase())) {
				continue;
			}

			// If it passes all checks, add to the file list
			files.push(fullPath);
		}
	}

	return files;
}

// Gather all files from the current working directory
const allFiles = getAllFiles(process.cwd());

// Write them into codebase.txt
const writeStream = fs.createWriteStream(OUTPUT_FILE, { flags: "w" });

for (const filePath of allFiles) {
	try {
		const content = fs.readFileSync(filePath, "utf8");
		writeStream.write(
			`---\nFILE: ${path.relative(process.cwd(), filePath)}\n\n`,
		);
		writeStream.write(content);
		writeStream.write("\n\n");
	} catch (err) {
		console.error(`Could not read file "${filePath}": ${err.message}`);
	}
}

writeStream.end(() => {
	console.log(
		`Generated ${OUTPUT_FILE} containing all non-ignored files (skipping . dirs, "drizzle", images, archives, etc.).`,
	);
});
