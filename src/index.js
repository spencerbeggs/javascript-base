export const sleep = (delay) => new Promise((res) => setTimeout(res, delay, undefined));

await sleep(1000);
console.log("Hello, world!");
