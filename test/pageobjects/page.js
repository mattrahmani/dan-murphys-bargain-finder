module.exports = class Page {

    open (path) {
        browser.maximizeWindow();
        browser.deleteAllCookies();
        return browser.url(`/${path}`)
    }

    drawHighlight(element) {
        browser.execute('arguments[0].style.outline = "#f00 solid 4px";', element);
    }
    removeHighlight(element) {
        browser.execute('arguments[0].style.outline = "#f00 solid 0px";', element);
    }
}
