require('dotenv').config();
const { open } = require("../pageobjects/offer.page");
const onOfferPage = require("../pageobjects/offer.page");
const email = process.env.EMAIL,
    password = process.env.PASSWORD;

describe('Dan Murphy bargain finder machine', () => {

    before('Should login', () => {
        open('');
        onOfferPage.login(email, password);

    });

    it('Should find bargains on dan murphy website', () => {
        onOfferPage.open('current-offers?size=2000');
        onOfferPage.getExistingItems();
        onOfferPage.findBargains();
    });

    it('Should find bargains on market place deals', () => {
        onOfferPage.open('list/exclusive-dans-marketplace-offers?size=1000');
        onOfferPage.getExistingItems();
        onOfferPage.findBargains();
    });

    it('Should find bargains in under wraps deals', () => {
        onOfferPage.open('list/under-wraps?i_cid=dskmob:6891:under-wraps-mg-hp&size=1000');
        onOfferPage.getExistingItems();
        onOfferPage.findBargains();
    });
});


