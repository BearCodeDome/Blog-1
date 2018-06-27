const http = require('http')
const cheerio = require('cheerio')
const superagent = require('superagent')
const fs = require('fs')
const { spawnSync } = require('child_process')

var baseUrl = 'https://user-storage-api-ms.juejin.im/v1/getUserInfo?src=web&uid=57e371072e958a00541ddcaf&token=eyJhY2Nlc3NfdG9rZW4iOiJ6WDZVMnk3QUVuQXZaT0YzIiwicmVmcmVzaF90b2tlbiI6Ik9UeGpLalgyZk93bHB1V0MiLCJ0b2tlbl90eXBlIjoibWFjIiwiZXhwaXJlX2luIjoyNTkyMDAwfQ%3D%3D&device_id=1499997315233&current_uid=57e371072e958a00541ddcaf'
var juejinUrl = baseUrl || process.argv[2]
superagent.get(juejinUrl)
	.end((err, obj) => {
		var msg = obj.body.d
		var totalCollectionsCount = msg.totalCollectionsCount //喜欢数
		var totalViewsCount = msg.totalViewsCount //阅读数
		console.log('实时喜欢数：' + totalCollectionsCount)
		console.log('实时阅读数：' + totalViewsCount)
		changeReadMe(totalCollectionsCount, totalViewsCount)
	})

function changeReadMe(like, read) {
	const fileName = './README.md'
	const readAble = fs.createReadStream(fileName)
	var body = ''
	readAble.on('data', (chunk) => {
	  body += chunk
	})
	readAble.on('end', () => {
		$ = cheerio.load(body)
		var regLike = $('#like').attr('src'),
			regRead = $('#read').attr('src')
		body = body.replace(regLike, 'https://img.shields.io/badge/掘金-'+ (like / 1000).toFixed(1)+'k喜欢-blue.svg')
		body = body.replace(regRead, 'https://img.shields.io/badge/掘金-'+ (read / 1000).toFixed(1)+'k阅读-blue.svg')
		fs.writeFile(fileName, body, (err) => {
		  	if (err) throw err;
		  	var updateRan = 'update' + Number(Math.random().toString().split('.')[1])
		  	console.log('文件：'+ fileName +' 已经更新')
		  	process.argv[3] && gitPush(updateRan)
		});
	})
}

function gitPush(updateRan) {
	spawnSync('git', ['add', '-A'])
  	spawnSync('git', ['commit', '-m'+updateRan])
  	spawnSync('git', ['push'])
  	console.log('数据已同步到github')
}

