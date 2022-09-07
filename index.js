const puppeteer = require('puppeteer');
const fs = require('fs');
// const ocr = require('tesseract.js');
const mobNo = '9970943252';
const pass = 'Pajya@123';
const vechNo = 'MH14JK3009';

(async () => {
    const browser = await puppeteer.launch({ 
        headless: false,
        defaultViewport: {
            width: 1280,
            height: 720
        } 
    });

    const page = await browser.newPage();
    await page.goto('https://vahan.parivahan.gov.in/nrservices/faces/user/citizen/citizenlogin.xhtml');
    await new Promise(r => setTimeout(r, 1000));
    
    var records = '';
    var mobNoInput = await page.waitForXPath("//input[@name='TfMOBILENO']");
    await mobNoInput.type(mobNo);
    await page.click('#btRtoLogin');        
    await new Promise(r => setTimeout(r, 2000));
    
    var passInput = await page.waitForXPath("//input[@name='tfPASSWORD']");
    await passInput.type(pass);
    await page.click('#btRtoLogin');
    await new Promise(r => setTimeout(r, 2000));

    var vechNoInput = await page.waitForXPath("//input[@name='regn_no1_exact']");
    await vechNoInput.type(vechNo);

    var captchaImageName = Date.now();
    await page
        .screenshot({ 
            path: `./${captchaImageName}.jpg`,
            clip: {
                x: 476,
                y: 341,
                width: 130,
                height: 50
            }
        });

    var data =  await page.evaluate(() => {
        return  document.getElementById('j_idt56').innerText;
    });

    await new Promise(r => setTimeout(r, 1000));
    
    fs.writeFile('data.txt', data, err =>{
        if (err) {
            console.err;
        }
    });

})();

