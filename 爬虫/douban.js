const request = require('request')
const cheerio = require('cheerio')
const fs = require('fs')

const log = function () {
    console.log.apply(console, arguments)
}

// 定义一个类来保存电影的信息
// 这里只定义了 5 个要保存的数据
// 分别是  电影名 评分 引言 排名 封面图片地址
const Movie = function() {
    this.name = ''
    this.score = 0
    this.quote = ''
    this.id = 0
    this.coverUrl = ''
}

const movies = []

const movieFromDiv = function(div) {
    // 这个函数来从一个电影 div 里面读取电影信息
    const movie = new Movie()
    // 使用 cheerio.load 函数来返回一个可以查询的特殊对象
    const e = cheerio.load(div)
    // 然后就可以使用 querySelector 语法来获取信息了
    // .text() 获取文本信息
    movie.name = e('.title').text()
    movie.score = e('.rating_num').text()
    movie.quote = e('.inq').text()

    const pic = e('.pic')
    movie.id = pic.find('em').text()
    // 元素的属性用 .attr('属性名') 确定
    movie.coverUrl = pic.find('img').attr('src')

    return movie
}

const saveMovies = function (movies) {
    const path = 'douban.txt'
    //第二个参数是 null
    //第三个参数是缩进参数
    const s = JSON.stringify(movies, null, 2)
    fs.appendFile(path, s, function (error) {
        if (error) {
            log('写入文件错误', error)
        } else {
            log('保存成功')
        }
    })
}
const moveFromUrl = function (url) {
    request(url, function (error, response, body) {
        // 回调函数的三个参数分别为 错误， 响应， 响应数据
        // statusCode 200 是成功的代码
        if (error === null && response.statusCode === 200) {
            // cheerio.load 用字符串返回一个可以查询的特殊对象
            // body 就是 html 内容
            const e = cheerio.load(body)
            // 查询对象 和 DOM API 中的 querySelect() 类似
            const moviesDivs = e('.item')

            for (let i = 0; i < moviesDivs.length; i++) {
                let element = moviesDivs[i]
                // 获取 div 元素并使用 moveFromDiv 解析
                // 然后加入 moves 数组中
                const div = e(element).html()
                const m = movieFromDiv(div)
                log('正在爬取' + m.name)
                movies.push(m)
            }
            if (movies.length === 250){
                var sortM = movies.sort(sortMovie('id'))
                saveMovies(sortM)
            }
        } else {
            log('失败')
        }
    })
}

var sortMovie = function(id){
    return function(obj ,obj1){
        var value = obj[id]
        var value1 = obj1[id]
        return value - value1
    }
}

var top250Url = function(){
    let l = ['https://movie.douban.com/top250']
    var urlContinue = 'https://movie.douban.com/top250?start='
    let cont = 25
    for (let i = 0; i < 10; i++) {
        l.push(urlContinue + cont)
        cont += 25
    }
    return l
}

const __main = function () {
    var url = top250Url()
    for (let i = 0; i < url.length; i++) {
        moveFromUrl(url[i])
    }
}

__main()