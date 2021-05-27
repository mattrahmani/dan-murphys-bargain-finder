const Page = require('./page');
const fs = require('fs');
const { assert } = require('chai');

class OfferPage extends Page {

    get offerNumberWrapper() {return $('span.count.bold')};
    get pageCountWrapper() {return $('span.page-count')};
    get nextPageChevron() {return $('i.icon-chevron-right')};
    get items() {return $$('ul.product-list>li.js-list')};

    open (extension) {
        return super.open(extension);
    }

    findBargains() {
        let offerNumber, pageCount, itemHTML, priceNow, priceWas, itemOne, itemCounter = 0, currentPage = 1;
        this.offerNumberWrapper.waitForDisplayed({timeout: 20000})
        offerNumber = this.offerNumberWrapper.getText();
        pageCount = (this.pageCountWrapper.getText().trim().split(' '))[1];
        do {
            console.log('Page '+currentPage + ' of ' + pageCount);
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
                    if (itemHTML.includes('MEMBER OFFER') && itemHTML.includes('Non-member')) {
                        priceNow = item.$('span.card-price.font-din-condensed').getText().slice(1);
                        priceWas = item.$('span*=Non-member').getText().split(' ')[2].slice(1);
                        this.recordItem(item, priceNow, priceWas);
                    }
                }
            })
            if (currentPage < pageCount) {
                this.nextPageChevron.click();
                browser.waitUntil( () => this.items[0].$('span.title').getText() != itemOne, {timeout: 20000});
            }
            currentPage++;
        } while (currentPage <= pageCount);
        console.log('Total items checked: ' + itemCounter + ' out of ' + offerNumber);
        assert.equal(itemCounter,offerNumber, '!!!!! Some items are missing !!!!!');
    }

    recordItem(item, priceNow, priceWas) {
        let percent, name, filePath;
        percent = ((1-(priceNow/priceWas))*100).toFixed(0);
        if (percent >= 20) {
            name = item.$('h2').getText().split('\n').join(' ').split('/').join(' ');
            filePath = 'screenshots/' + percent + ' ' + name + '.png';
            if (!fs.existsSync(filePath)) {
                item.scrollIntoView(false);
                item.$('img').waitForDisplayed({timeout: 5000});
                this.drawHighlight(item.$('div.product-content'));
                browser.saveScreenshot(filePath);
                this.removeHighlight(item.$('div.product-content'));
            }
        }
    }
}

module.exports = new OfferPage();
