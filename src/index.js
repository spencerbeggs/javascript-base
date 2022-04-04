export const sleep = (delay) => new Promise((res) => setTimeout(res, delay, undefined));

export const hello = async () => {
	await sleep(50);
	console.log("Hello, world!");
};
