const log = function () {
    console.log.apply(console, arguments)
}

const e = function (element) {
    return document.querySelector(element)
}

const es = function (elements) {
    return document.querySelectorAll(elements)
}

const bindEvent = function (element, className, callback) {
    element.addEventListener(className, callback)
}

const appendHTML = function (element, html) {
    element.insertAdjacentHTML('beforeend', html)
}

const bindEventAll = function (elements, className, callback) {
    for (let i = 0; i < elements.length; i++) {
        var element = elements[i]
        element.addEventListener(className, callback)
    }
}

