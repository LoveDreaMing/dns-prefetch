const path = require('path');
const fs = require('fs');
const filePath = path.resolve(__dirname, './dist');
const suffixs = ['.html', '.js', '.css'];

const set = new Set();
let template = '';
readFile(filePath);
function readFile(way) {
    const files = fs.readdirSync(way);
    files.forEach(file => {
        const filedir = path.join(way, file);
        const stats = fs.statSync(filedir);
        const isContinue = suffixs.includes(path.extname(filedir));
        if (stats.isFile() && isContinue) {
            const data = fs.readFileSync(filedir);
            const str = data.toString();
            if (path.basename(filedir) === 'index.html') {
                template = str;
            }
            const reg = /\/\/([a-z0-9.]+)(.com|.cn){1}/ig;
            str.match(reg).forEach(item => {
                set.add(item);
            });
        }
        if (stats.isDirectory()) {
            readFile(filedir);
        }
    });
}
let all = '';
for (let x of set) {
    all += `<link rel="dns-prefetch" href="${x}">`
}
template = template.split('<title>').join(all + '<title>');
fs.writeFileSync('./dist/index.html', template);
