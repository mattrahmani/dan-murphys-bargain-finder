# dan-murphys-bargain-finder

This Robot is able to find discounted products in Dan Murphy's online store.
A screenshots is taken for products come with 20% discount and more. 

Steps to run the bot on your local:

Get the project into your local machine.
Make sure you have node.js installed.
Install and open VScode or any Editor of your choice and open the project in it.
Run npm install in your console and it will download all the packages
wdio.conf.js in the project is the main config file.
To run the bot, just type "npm run dm" in terminal and run it.
The default discount rate is 20%, to change it you can use "DISCOUNT=X npm run dm" instead, where X is the discount rate for example "DISCOUNT= 45 npm run dm" will only captured items are discounted 45% and more.
The results of the project are stored as screenshots in the screenshots folder as d-m-yyyy --> X item name.
After running the bot for the first time, in the next runs, only items which have not been added before will be added and the date at the starts of the file name helps to be identified easily.

