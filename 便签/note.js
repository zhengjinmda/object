var addbutton = e('#id-button-add')
var noteDiv = e('#id-div-note')
//创建一个 note 对象
const noteNew = function (key, text, color) {
    var n = {
        key: key,
        text: text,
        color: color,
    }
    return n
}

//读取所有的 note
const loadNote = function () {
    var noteStr = localStorage.notes
    if (noteStr === undefined) {
        noteStr = '[]'
    }
    var noteList = JSON.parse(noteStr)
    return noteList
}

//保存一个 note
const saveNote = function (note) {
    var noteList = loadNote()
    noteList.push(note)
    saveNodes(noteList)
}

//保存所有 note
const saveNodes = function (noteList) {
    localStorage.notes = JSON.stringify(noteList)
}

const showNote = function () {
    var noteList = loadNote()
    for (let i = 0; i < noteList.length; i++) {
        var note = noteList[i]
        var noteDiv = e('#id-div-note')
        var html = noteTemplate(note)
        appendHTML(noteDiv, html)
    }
}

bindEvent(addbutton, 'click', function () {
    /*
    * 1. 把数据存储到 localStorage 中
    * 2. 在页面添加标签*/
    log('click button')
    //得到数据
    var note = getData()

    //将note 存储在 localStorage 中
    saveNote(note)

    //添加便签
    var html = noteTemplate(note)
    var noteDiv = e('#id-div-note')
    appendHTML(noteDiv, html)
})


// 绑定删除节点事件
bindEvent(noteDiv, 'click', function (event) {
    let noteList = loadNote()
    let target = event.target
    let key = target.dataset.id
    log(key)
    //删除 div
    log(target.classList)
    if (target.classList.contains('fld-note')) {
        target.remove()
    }
    //删除 note
    for (let i = 0; i < noteList.length; i++) {
        if (key === noteList[i].key) {
            noteList.splice(i, 1)
        }
    }
    log(noteList)
    //更新 note
    saveNodes(noteList)
})

var tab = es('.fld-tab')
bindEventAll(tab, 'click', function (event) {
    var target = event.target
    var page = target.dataset.page
    log('class', target.classList)
    if (target.classList.contains('fld-tab')) {
        if (page === 'note-new') {
            log('new')
            var Divs = es('.fld-page')
            log(Divs)
            for (var i = 0; i < Divs.length; i++) {
                Div = Divs[i]
                Div.classList.add('hover')
            }
            var noteNewDiv = e('#allContent')
            noteNewDiv.classList.remove('hover')
        } else if (page === 'note-list') {
            log('list')
            var Divs = es('.fld-page')
            for (var i = 0; i < Divs.length; i++) {
                Div = Divs[i]
                Div.classList.add('hover')
            }
            var noteListDiv = e('#id-div-note')
            noteListDiv.classList.remove('hover')
        }
    }

})

// 创建一个模板
const noteTemplate = function (note) {
    var key = note.key
    var text = note.text
    var color = note.color
    var t = `<div class="fld-note" data-id="${key}" style="background: ${color}">${text}</div>`
    return t
}

//得到便签的所有数据
const getData = function () {
    var value = e('#fld-text').value
    // var value = text.value
    var date = new Date()
    var key = 'Note' + date.getTime()
    var colorSelectObj = e("#fld-color")
    var index = colorSelectObj.selectedIndex
    var color = colorSelectObj[index].value
    var note = noteNew(key, value, color)
    return note
}

const __main = function () {
    showNote()
}

__main()


