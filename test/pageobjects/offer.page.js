const Page = require("./page");
const fs = require("fs");
const { assert } = require("chai");
const path = require("path");
let existingItems, itemCounter, offerNumber, today;

class OfferPage extends Page {
  get offerNumberWrapper() {
    return $(
      "div.filter.ng-star-inserted div.ng-star-inserted:nth-child(1) span:nth-child(1)"
    );
  }
  get pageCountWrapper() {
    return $("span.pagination-container__pagetext");
  }
  get productList() {
    return $("ul.search-results__product-list");
  }
  get LoadMoreBtn() {
    return $("button.infinite-loader__load-more-button");
  }
  get nextPageChevron() {
    return $("mat-icon=chevron_right");
  }
  get items() {
    return $$("ul.search-results__product-list>li.js-list");
  }
  get loginLnk() {
    return $("div#system-header-login");
  }
  get emailInput() {
    return $("#signInName");
  }
  get passwordInput() {
    return $("#password");
  }
  get loginBtn() {
    return $("button#next");
  }
  get panelGroup() {
    return $("div.panel-group");
  }
  get toastContainer() {
    return $("#toast-container .dans-toaster__body");
  }

  get countSelector() {
    return $("div.infinite-loader__summary");
  }

  getExistingItems() {
    const directoryPath = path.join("screenshots/");
    existingItems = fs
      .readdirSync(directoryPath)
      .map((file) => file.toString().split(" ").slice(1).join(" "));
    return existingItems;
  }

  open(extension) {
    return super.open(extension);
  }

  // Main Function
  findBargains() {
    today = this.getTodayDate();

    offerNumber = this.getInitialPageInfo(this);
    this.loadAllItems();

    this.processItems(this.items, this.recordItem);

    this.assertItemCount(itemCounter, offerNumber);
  }

  getInitialPageInfo(context) {
    context.offerNumberWrapper.waitForDisplayed({ timeout: 240000 });
    let offerNumber = this.offerNumberWrapper.getText();
    return offerNumber;
  }

  logCurrentPage(currentPage, pageCount) {
    console.log(`Page ${currentPage} of ${pageCount}`);
  }

  processItems(items, recordItem) {
    console.log("processItems");
    console.log(items.length);
    itemCounter = 0;
    items.forEach((item) => {
      item.scrollIntoView();
      itemCounter++;
      console.log(itemCounter);
      let itemHTML = item.getHTML();
      if (!itemHTML.includes("Out of stock")) {
        this.handleOffers(item, itemHTML, recordItem);
      }
    });
    return itemCounter;
  }

  handleOffers(item, itemHTML, recordItem) {
    if (itemHTML.includes("Online Offer")) {
      let priceNow = item
        .$("div.price.promo-price span[class=value]")
        .getText()
        .slice(1);
      let priceWas = item
        .$('div[class="price ng-star-inserted"]:nth-child(2) span[class=value]')
        .getText()
        .slice(1);
      recordItem(item, priceNow, priceWas);
    }

    if (itemHTML.includes("MEMBER OFFER") && itemHTML.includes("Non-Member")) {
      let priceNow = item
        .$("span.card-price.font-din-condensed")
        .getText()
        .slice(1);
      let priceWas = item
        .$("span*=Non-Member")
        .getText()
        .split(" ")[1]
        .slice(1);
      recordItem(item, priceNow, priceWas);
    }
  }

  navigateToNextPage(nextPageChevron, items, currentPage, pageCount) {
    if (currentPage < pageCount) {
      nextPageChevron.scrollIntoView();
      nextPageChevron.click();
      let itemOne = items[0].$("span.title").getText();
      browser.waitUntil(() => items[0].$("span.title").getText() != itemOne, {
        timeout: 30000
      });
    }
  }

  assertItemCount(itemCounter, offerNumber) {
    console.log("assertItemCount");
    assert.equal(
      itemCounter,
      offerNumber,
      "!!!!! Some items are missing !!!!!"
    );
  }

  loadAllItems() {
    let [currentCount, totalCount] = this.getCounts();

    while (currentCount < totalCount) {
      this.LoadMoreBtn.click();
      browser.pause(1000); // Adjust the wait time as needed
      [currentCount, totalCount] = this.getCounts();
    }
  }

  getCounts() {
    const countText = this.countSelector.getText();
    const matches = countText.match(/Showing (\d+) of (\d+) results/);

    if (matches && matches.length >= 3) {
      return [parseInt(matches[1], 10), parseInt(matches[2], 10)];
    } else {
      return [0, 0]; // Default or error handling
    }
  }

  recordItem(item, priceNow, priceWas) {
    let percent, name;
    percent = ((1 - priceNow / priceWas) * 100).toFixed(0);
    if (percent >= Number(discount)) {
      name = item.$("h2").getText().split("\n").join(" ").split("/").join(" ");
      const itemName = `${percent}% Off (Now ${priceNow}) ${name}.png`;
      const filePath = `screenshots/${today}--> ${itemName}`;

      if (!existingItems.includes(itemName)) {
        item.scrollIntoView(false);
        browser.waitUntil(() => {
          return item.$("img").isDisplayed();
        });
        item.saveScreenshot(filePath);
      }
    }
  }

  getTodayDate() {
    const date = new Date();
    return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
  }

  login(email, password) {
    this.handleCookies();
    this.closeToastIfPresent();
    this.performLogin(email, password);
  }

  handleCookies() {
    browser.deleteAllCookies();
  }

  closeToastIfPresent() {
    if (this.toastContainer.isExisting()) {
      this.toastContainer.$(".dans-alert__btn-close-icon").click();
    }
  }

  performLogin(email, password) {
    this.loginLnk.click();
    // browser.pause(3000);
    this.emailInput.waitForDisplayed();
    this.emailInput.setValue(email);
    this.passwordInput.setValue(password);
    // browser.pause(2000);
    this.loginBtn.click();
    this.panelGroup.waitForExist({ reverse: true, timeout: 60000 });
  }
}

module.exports = new OfferPage();
