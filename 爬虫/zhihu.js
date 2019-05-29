// 这一行是套路, 给 node.js 用的
// 如果没有这一行, 就没办法使用一些 let const 这样的特性
"use strict"


const request = require('request')
const cheerio = require('cheerio')

/*
本文件需要安装两个基本的库
request 用于下载网页
cheerio 用于解析网页数据

安装命令如下
npm install request cheerio

html js json 格式化工具
http://jsbeautifier.org/

课间问题 2
- 下载图片
- 爬虫也能找到工作吗？ 能的
- 是不是我们前端还会加一件数据库的课了。毕竟爬多了，不好存啊

*/

// 定义一个类来保存回答的信息
// 这里只定义了 3 个要保存的数据
// 分别是  作者 内容 链接
function Answer() {
    this.author = ''
    this.content = ''
    this.link = ''
    this.numberOfComments = 0
}


const log = function() {
    console.log.apply(console, arguments)
}


const answerFromDiv = function(div) {
    // 这个函数来从一个回答 div 里面读取回答信息
    const a = new Answer()
    // 使用 cheerio.load 函数来返回一个可以查询的特殊对象
    // 使用这个 options 才能使用 html() 函数来获取带回车的文本信息
    const options = {
        decodeEntities: false,
    }
    const e = cheerio.load(div, options)
    // 然后就可以使用 querySelector 语法来获取信息了
    // .text() 获取文本信息
    a.author = e('.UserLink-link').text()
    log(e('.UserLink-link').text())
    // 如果用 text() 则会获取不到回车
    // 这里要讲一讲爬虫的奥义
    a.content = e('.RichContent-inner').html()
    //
    a.link = 'https://zhihu.com' + e('.ContentItem-time > a').attr('href')
    a.numberOfComments = e('.ContentItem-action').text()
    // log('***  ', a.content)
    return a
}


const answersFromBody = function(body) {
    // cheerio.load 用字符串作为参数返回一个可以查询的特殊对象
    const options = {
        decodeEntities: false,
    }
    const e = cheerio.load(body, options)
    // 查询对象的查询语法和 DOM API 中的 querySelector 一样
    const divs = e('.List-item')
    const answers = []
    for(let i = 0; i < divs.length; i++) {
        let element = divs[i]
        // 获取 div 的元素并且用 movieFromDiv 解析
        // 然后加入 movies 数组中
        const div = e(element).html()
        log(div)
        const m = answerFromDiv(div)
        answers.push(m)
        console.log(answers)
    }
    return answers
}


const writeToFile = function(path, data) {
    const fs = require('fs')
    fs.writeFile(path, data, function(error){
        if (error != null) {
            log('--- 写入成功', path)
        } else {
            log('*** 写入失败', path)
        }
    })
}


const cachedUrl = function(options, callback) {
    const fs = require('fs')
    // 先生成对应的文件
    const path = options.url.split('/').join('-').split(':').join('-')
    // 先尝试去硬盘中读取这个 url 对应的文件
    fs.readFile(path, function(err, data){
        if (err != null) {
            // 读取这个文件失败
            // 读不到的话说明是第一次请求，那么就使用 request
            request(options, function(error, response, body) {
                // 下载好了之后，保存到本地文件
                // TODO, 应该下载成功之后再保存
                writeToFile(path, body)
                callback(error, response, body)
            })
        } else {
            log('读取到缓存的页面', path)
            // 读取到，说明已经下载过了，我们讲直接读取硬盘上的文件
            const response = {
                statusCode: 200,
            }
            callback(null, response, data)
        }
    })
}


const __main = function() {
    // 这是主函数
    // 知乎答案
    const url = 'https://www.zhihu.com/question/31515263'
    // request 从一个 url 下载数据并调用回调函数
    // 根据 伪装登录爬虫设置图例 替换 cookie 和 useragent 中的内容
    // 这里 useragent 我已经替换好了, 替换上你自己的 cookie 就好了
    const cookie = '_xsrf=YpFOpevdeD1bOwoseEmHdNYPQDAzJNQE; _zap=6a653cda-cc65-412e-a294-a10489aa7096; d_c0="AAAhxIhYFw-PTmde6JILO-ZbJC4GA8IF_No=|1552044750"; z_c0="2|1:0|10:1552044781|4:z_c0|92:Mi4xc1VUOUFBQUFBQUFBQUNIRWlGZ1hEeVlBQUFCZ0FsVk43YUJ2WFFDNGd3UHMtZ0FaOVFQWVdlYkx6T1hyV1BvVHNn|d49a79477afc196e4cfdefd13dddf3e71e4ca8c22f1b1553606bb90a718d7812"; tst=r; __gads=ID=a750e988b747a76e:T=1554102189:S=ALNI_MaqzCq09Mavnt2kIm31CbaZH9ajGQ; __utma=51854390.1468815862.1555061188.1555061188.1555061188.1; __utmz=51854390.1555061188.1.1.utmcsr=zhihu.com|utmccn=(referral)|utmcmd=referral|utmcct=/people/zheng-jin-da-71/collections; __utmv=51854390.100-1|2=registration_date=20150223=1^3=entry_date=20150223=1; q_c1=11ee3e085cef41e2b8184da7bc154fc3|1558698139000|1552044782000; tgw_l7_route=a37704a413efa26cf3f23813004f1a3b'
    const useragent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.98 Safari/537.36'
    const headers = {
        'Cookie': cookie,
        'User-Agent': useragent,
    }

    const options = {
        url: url,
        headers: headers,
    }
    cachedUrl(options, function(error, response, body){
        // 回调函数的三个参数分别是  错误, 响应, 响应数据
        // 检查请求是否成功, statusCode 200 是成功的代码
        if (error === null && response.statusCode == 200) {
            const answers = answersFromBody(body)

            // 引入自己写的模块文件
            // ./ 表示当前目录
            const utils = require('./utils')
            const path = 'zhihu.answers.txt'
            utils.saveJSON(path, answers)
        } else {
            log('*** ERROR 请求失败 ', error)
        }
    })
    // request(options, function(error, response, body) {
    //     // 回调函数的三个参数分别是  错误, 响应, 响应数据
    //     // 检查请求是否成功, statusCode 200 是成功的代码
    //     if (error === null && response.statusCode == 200) {
    //         const answers = answersFromBody(body)
    //
    //         // 引入自己写的模块文件
    //         // ./ 表示当前目录
    //         const utils = require('./utils')
    //         const path = 'zhihu.answers.txt'
    //         utils.saveJSON(path, answers)
    //     } else {
    //         log('*** ERROR 请求失败 ', error)
    //     }
    // })
}


// 程序开始的主函数
__main()
