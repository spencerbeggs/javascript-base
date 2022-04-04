const esModules = ["chalk"].join("|");

module.exports = {
	testEnvironment: "node",
	testRegex: "(/tests/.*|(\\.|/)(test|spec))\\.m?js$",
	moduleFileExtensions: ["js", "mjs"],
	verbose: true,
	transform: {
		".js": "babel-jest"
	},
	collectCoverage: true,
	coverageDirectory: ".coverage",
	coverageReporters: ["text"],
	transformIgnorePatterns: [`/node_modules/(?!${esModules})`],
	moduleNameMapper: {
		"#module": "<rootDir>/src/index.js",
		"#ansi-styles": "ansi-styles",
		"#supports-color": "supports-color"
	}
};
