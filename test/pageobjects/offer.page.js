const Page = require('./page');
const fs = require('fs');
const { assert } = require('chai');
const path = require('path');
let existingItems, today;

class OfferPage extends Page {

    get offerNumberWrapper() { return $('div.filter.ng-star-inserted div.ng-star-inserted:nth-child(1) span:nth-child(1)') };
    // get offerNumberWrapper() { return $('span.count.bold') };
    get pageCountWrapper() { return $('span.page-count') };
    get nextPageChevron() { return $('i.icon-chevron-right') };
    get items() { return $$('ul.product-list>li.js-list') };
    get loginLnk() { return $('div#system-header-login') };
    get emailInput() { return $('input[type=email]') };
    get passwordInput() { return $('input[type=password]') };
    get loginBtn() { return $('button.btn-success') };
    get panelGroup() { return $('div.panel-group') };

    getExistingItems() {
        existingItems = [];
        const directoryPath = path.join('screenshots/');
        fs.readdir(directoryPath, function (err, files) {
            files.forEach(function (file) {
                let fileName = file.toString().split(' ').slice(1).join(' ');
                existingItems.push(fileName);
            });
        });
        return existingItems;
    }

    open(extension) {
        return super.open(extension);
    }

    findBargains() {
        let offerNumber, pageCount, itemHTML, priceNow, priceWas, itemOne, itemCounter = 0, currentPage = 1;
        this.getTodayDate();
        this.offerNumberWrapper.waitForDisplayed({ timeout: 60000 })
        offerNumber = this.offerNumberWrapper.getText();
        if (this.pageCountWrapper.isExisting()) {
            pageCount = (this.pageCountWrapper.getText().trim().split(' '))[1];
        } else {
            pageCount = 1;
        }
        do {
            console.log('Page ' + currentPage + ' of ' + pageCount);
            itemOne = this.items[0].$('span.title').getText();
            this.items.forEach(item => {
                itemCounter++;
                itemHTML = item.getHTML();
                if (!itemHTML.includes('Out of stock')) {
                    if (itemHTML.includes('Online Offer')) {
                        priceNow = item.$('div.price.promo-price span[class=value]').getText().slice(1);
                        priceWas = item.$('div[class="price ng-star-inserted"]:nth-child(2) span[class=value]').getText().slice(1);
                        this.recordItem(item, priceNow, priceWas);
                    }
                    if (itemHTML.includes('MEMBER OFFER') && itemHTML.includes('Non-Member')) {
                        priceNow = item.$('span.card-price.font-din-condensed').getText().slice(1);
                        priceWas = item.$('span*=Non-Member').getText().split(' ')[1].slice(1);
                        this.recordItem(item, priceNow, priceWas);
                    }
                }
            })
            if (currentPage < pageCount) {
                this.nextPageChevron.scrollIntoView();
                this.nextPageChevron.click();
                browser.waitUntil(() => this.items[0].$('span.title').getText() != itemOne, { timeout: 30000 });
            }
            currentPage++;
        } while (currentPage <= pageCount);
        console.log('Total items checked: ' + itemCounter + ' out of ' + offerNumber);
        assert.equal(itemCounter, offerNumber, '!!!!! Some items are missing !!!!!');
    }

    recordItem(item, priceNow, priceWas) {
        let percent, name, filePath;
        percent = ((1 - (priceNow / priceWas)) * 100).toFixed(0);
        if (percent >= Number(discount)) {
            name = item.$('h2').getText().split('\n').join(' ').split('/').join(' ');
            let itemName = percent + '% Off (Now $' + priceNow + ') ' + name + '.png';

            filePath = 'screenshots/' + today + '--> ' + percent + '% Off (Now $' + priceNow + ') ' + name + '.png';

            if (!existingItems.includes(itemName)) {
                item.scrollIntoView(false);
                browser.waitUntil(() => {
                    return item.$('img').isDisplayed();
                })
                this.drawHighlight(item.$('div.product-content'));
                browser.saveScreenshot(filePath);
                this.removeHighlight(item.$('div.product-content'));
            }
        }
    }

    getTodayDate() {
        let date = new Date();
        return today = date.getDate() + '-' + (date.getMonth() + 1) + '-' + date.getFullYear();
    }

    login(email, password) {
        browser.deleteAllCookies();
        this.loginLnk.click();
        browser.pause(3000);
        this.emailInput.setValue(email);
        this.passwordInput.setValue(password);
        browser.pause(2000);
        this.loginBtn.click();
        this.panelGroup.waitForExist({ reverse: true, timeout: 60000 });
    }
}

module.exports = new OfferPage();



