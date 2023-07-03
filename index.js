const puppeteer = require('puppeteer');
const express = require('express');
const fs = require('fs');
const app = express();
const port = 8000;
const path = require('path');

app.use(express.static('public'));
const mobNo = '';
const pass = '';

app.get('/vehicleNo', (req, res) =>{
    
    const vechNo = req.query.vehicleNum.toUpperCase();
    async function getCaptcha(imgPath) {
        res.send(`  <!DOCTYPE html>
                    <html lang="en">
                        <head>
                            <meta charset="UTF-8">
                            <meta http-equiv="X-UA-Compatible" content="IE=edge">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Document</title>            
                            <style>
                                *{
                                    width: auto;
                                    margin: 2% auto;
                                    padding: 2%;
                                }
                                input{ width: 20%;}
                                form{
                                    display: flex;
                                    flex-direction: column;
                                    align-items: center;
                                    justify-content: center;
                                    width: 70%;
                                }
                            </style>
                        </head>
                        <body>
                            <form action="/getCaptcha" method="get">
                                <h1> Enter Captcha.. </h1>
                                <img src="../captchaImages/${imgPath}.jpg" alt="" srcset="">
                                <input type="text" name="captcha">
                                <button type="submit" onclick="showDetails()"> Submit</button>
                            </form>
                        </body>
                        <script>
                            function openWindow(){
                                window.open("http://localhost:8000/details.html"); 
                                clearInterval(openPage);
                            }
                            function showDetails(){
                                const openPage = setInterval(openWindow, 5000);
                            }
                        </script>
                    </html>`);
        return 0;
    } 

    if (req.query.vehicleNum) {
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
                    path: `./public/captchaImages/${captchaImageName}.jpg`,
                    clip: {
                        x: 476,
                        y: 341,
                        width: 130,
                        height: 50
                    }
                });
        
            await getCaptcha(captchaImageName);

            app.get('/getCaptcha', async (req, res) =>{
                var captchaInput = await page.waitForXPath("//input[@id='vahancaptcha:CaptchaID']");
                await captchaInput.type(req.query.captcha);
                await page.click('#j_idt67'); 
                await new Promise(r => setTimeout(r, 3000));        
                var data =  await page.evaluate(() => {
                    const details = {};
                    details.vehicleNo = document.querySelector('[title="Registration Number"]').innerText;
                    details.status = document.querySelector('[title="RC Status"]').innerText.substring(7,22);
                    details.class = document.querySelector('[title="Vehicle Class"]').innerText;
                    details.fuel = document.querySelector('[title="Fuel"]').innerText;
                    details.emissionNorms = document.querySelector('[title="Emission norms"]').innerText;
                    details.modelName = document.querySelector('[title="Model Name"]').innerText;
                    details.manufacturerName = document.querySelector('[title="Manufacturer Name"]').innerText;
                    details.registeringAuthority = document.querySelector('[title="Registering Authority"]').innerText;
                    details.ownerName = document.getElementsByClassName('col-md-3 fit-width-content font-bold content-resize')[0].innerText;
                    details.registrationDate = document.getElementsByClassName('col-md-3 fit-width-content font-bold content-resize')[1].innerText;
                    details.fitnessRegn  = document.getElementsByClassName('col-md-3 fit-width-content font-bold content-resize')[2].innerText;
                    details.mvTax  = document.getElementsByClassName('col-md-3 fit-width-content font-bold content-resize')[3].innerText;
                    details.insurance  = document.getElementsByClassName('col-md-3 fit-width-content font-bold content-resize')[4].innerText;
                    details.pucc  = document.getElementsByClassName('col-md-3 fit-width-content font-bold content-resize')[4].children[0].innerText;
                    return  details;
                });

                var dataHtml = `<!DOCTYPE html>
                                <html lang="en">
                                    <head>
                                        <meta charset="UTF-8" />
                                        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
                                        <meta name="viewport" content="width=device-width, initial-scale=1.0" />    
                                        <style>
                                            body {
                                            width: 80%;
                                            margin: auto;
                                            margin-top: 5%;
                                            font-family: "Courier New", Courier, monospace;
                                            }                                          
                                            tr:nth-child(even){background-color: #f2f2f2;}
                                            tr:hover {background-color: #ddd;}
                                        </style>
                                        <title>Vehicle Details</title>
                                    </head>
                                    <body>
                                        <table id="table_id" class="display">
                                            <tr> <td>Vehicle No</td> <td> ${data.vehicleNo} </td> </tr>
                                            <tr> <td>Stauts</td> <td> ${data.status} </td> </tr>
                                            <tr> <td>Class</td> <td> ${data.class} </td> </tr>
                                            <tr> <td>Fuel</td> <td> ${data.fuel} </td> </tr>
                                            <tr> <td>Emmission Norm</td> <td> ${data.emissionNorms}} </td> </tr>
                                            <tr> <td>Model Name</td> <td> ${data.modelName} </td> </tr>
                                            <tr> <td>Manufacturer Name</td> <td> ${data.manufacturerName} </td> </tr>
                                            <tr> <td>Registring Authority</td> <td> ${data.registeringAuthority} </td> </tr>
                                            <tr> <td>Owner Name</td> <td> ${data.ownerName} </td> </tr>
                                            <tr> <td>Registration Date</td> <td> ${data.registrationDate} </td> </tr>
                                            <tr> <td>Fitness Regn</td> <td> ${data.fitnessRegn} </td> </tr>
                                            <tr> <td>MV Tax</td> <td> ${data.mvTax} </td> </tr>
                                            <tr> <td>Insurance</td> <td> ${data.insurance} </td> </tr>
                                            <tr> <td>Pucc</td> <td> ${data.pucc} </td> </tr>
                                        </table>
                                    </body>
                                </html>`;
                fs.writeFile('./public/details.html', dataHtml, err =>{
                    if (err) {
                        console.err;
                    }
                });           
            });
            // await browser.close();
        })();
        app.use(express.static('public/details.html'));
    }else{
        res.send(`<center><h1>Some error occoured... </h1></center>`);
    }
})

app.listen(port, ()=>{
    console.log(`App running on ${port}`);
})