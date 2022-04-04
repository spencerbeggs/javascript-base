import { exec } from "child_process";
import { writeFile, readFile } from "fs/promises";
import { promisify } from "util";
import slugify from "@sindresorhus/slugify";
import inquirer from "inquirer";
import { Observable } from "rxjs";
import semver from "semver";
import validatePackageName from "validate-npm-package-name";

const execAsync = promisify(exec);

async function run(cmd) {
	const { stdout } = await execAsync(cmd);
	return stdout.trim();
}

async function getRemote() {
	let remote = await run("git config --get remote.origin.url");
	if (remote.startsWith("git@github.com:")) {
		remote = `https://github.com/${remote.replace("git@github.com:", "").trim()}`;
	}
	return remote;
}

async function writeJson(url, data = {}) {
	let content;
	try {
		const original = await readFile(url, { encoding: "utf-8" });
		content = JSON.parse(original);
	} catch (err) {
		content = {};
	} finally {
		await writeFile(url, JSON.stringify(Object.assign(content, data), null, "\t") + "\n", {
			encoding: "utf-8"
		});
	}
}

async function rewriteConfig({ pkg }) {
	const packageUrl = new URL("../package.json", import.meta.url);
	await writeJson(packageUrl, pkg);
}

const questions = new Observable((obs) => {
	obs.next({
		type: "input",
		name: "app.title",
		message: "App title? (example: My Application)",
		default: async () => {
			return "My Application";
		},
		validate: (input) => {
			if (!input.length) {
				return "You must add an app title";
			}
			if (slugify(input) === "javascript-base") {
				return `Don't name your app after the template repo. Choose something other than "JavaScript Base"`;
			}
			return true;
		}
	});

	obs.next({
		type: "input",
		name: "pkg.name",
		message: "Package name? (use a valid npm package name)",
		default: async (answers) => {
			return slugify(answers.app.title);
		},
		validate: (input) => {
			if (input === "javascript-base") {
				return `Don't name your app after the template repo. Choose something other than "javascript-base"`;
			}
			const { validForNewPackages, errors = [] } = validatePackageName(input);
			if (!validForNewPackages) {
				return errors.join(" ");
			}
			return true;
		}
	});

	obs.next({
		type: "input",
		name: "pkg.description",
		message: "Package description? (write a brief explanation of what your package does)",
		default: async (answers) => {
			return `AWS CDK infrastructure for ${answers.app.title}`;
		},
		validate: (input) => {
			if (input.length < 1) {
				return "Write a short description for your pkg.";
			}
			return true;
		}
	});

	obs.next({
		type: "input",
		name: "pkg.version",
		message: "Package version? (use valid semver)",
		default: async () => {
			return "0.0.0";
		},
		validate: (input) => {
			return Boolean(semver.valid(input));
		}
	});

	obs.next({
		type: "list",
		name: "pkg.private",
		message: "Keep package private? (prevent accidental publishing to npm)",
		default: () => {
			return "true";
		},
		choices: [
			{
				name: "true",
				value: true
			},
			{
				name: "false",
				value: false
			}
		],
		validate: (input) => {
			return input === true || input === false;
		}
	});

	obs.next({
		type: "input",
		name: "pkg.author.name",
		message: "Package author name? (defaults to output of: git config user.name)",
		default: () => {
			return run("git config user.name");
		},
		validate: (input) => {
			return typeof input === "string" && input.length > 0;
		}
	});

	obs.next({
		type: "input",
		name: "pkg.author.email",
		message: "Package author email? (defaults to output of: git config user.email)",
		default: () => {
			return run("git config user.email");
		},
		validate: (input) => {
			return typeof input === "string" && input.length > 0;
		}
	});

	obs.next({
		type: "input",
		name: "pkg.repository.type",
		message: "Repository type?",
		default: async () => {
			return "git";
		},
		validate: (input) => {
			return typeof input === "string" && input.length > 0;
		}
	});

	obs.next({
		type: "input",
		name: "pkg.repository.url",
		message: "Repository URL? (the HTPPS GiHub url of the current repo)",
		default: async () => {
			const remote = await getRemote();
			return remote;
		},
		validate: (input) => {
			return typeof input === "string" && input.length > 0;
		}
	});

	obs.complete();
});

const answers = await inquirer.prompt(questions);
await rewriteConfig(answers);
