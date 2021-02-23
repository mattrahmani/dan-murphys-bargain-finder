const OfferPage = require("../pageobjects/offer.page");

describe('Dan Murphy bargain finder machine', () => {
    it('Should find bargains on dan murphy website', () => {
        OfferPage.open('current-offers?size=120');
        OfferPage.findBargains();
    });
});


