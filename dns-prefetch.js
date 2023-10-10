const fs = require('fs'); // node文件系统
const { parse } = require('node-html-parser'); // html解析器，生成一个简化的dom树
const { glob } = require('glob'); // 使用 shell 使用的模式匹配文件
const urlRegex = require('url-regex'); // 用于匹配网址的正则表达式

const urlPattern = /(\/\/[^\/]*)/i; // url正则表达式
const urls = new Set(); // 存储域名地址

/**
 * @name 检索域名
 * @description 在“dist”目录及其子目录中搜索扩展名为 html、css 和 js 的文件，读取每个文件并使用正则表达式匹配URL，收集所有URL
 */
async function searchDomain() {
    const files = await glob('dist/**/*.{html,css,js}'); // 获取html、css、js文件
    for (const file of files) {
        const source = fs.readFileSync(file, 'utf-8'); // 读取文件
        const matches = source.match(urlRegex({ strict: true })); // 匹配url
        if (matches) {
            matches.forEach((url) => {
                const match = url.match(urlPattern); // 匹配url
                if (match && match[1]) {
                    urls.add(match[1]); // 收集url
                }
            });
        }
    }
}

/**
 * @name 插入链接
 * @description 将DNS预取链接插入HTML文件
 */
async function insertLinks() {
    const files = await glob('dist/**/*.html'); // 获取html文件
    const links = [...urls]
        .map((url) => `<link rel="dns-prefetch" href="${url}">`)
        .join('\n'); // 生成dns预取链接
    for (const file of files) {
        const html = fs.readFileSync(file, 'utf-8'); // 读取文件
        const root = parse(html); // 解析html，生成一个简化的dom树
        const head = root.querySelector('head'); // 获取head标签
        head.insertAdjacentHTML('afterbegin', links); // 插入dns预取链接
        fs.writeFileSync(file, root.toString()); // 写入文件
    }
}

async function main() {
    await searchDomain(); // 检索域名
    await insertLinks(); // 插入链接
}
main();
