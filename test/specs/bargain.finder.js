const onOfferPage = require("../pageobjects/offer.page");

describe('Dan Murphy bargain finder machine', () => {
    it('Should find bargains on dan murphy website', () => {
        console.log('DISCOUNT= ' + discount);
        onOfferPage.open('current-offers?size=120');
        onOfferPage.getExistingItems();
        onOfferPage.findBargains();
    });
});


