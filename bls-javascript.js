const { Builder ,By} = require('selenium-webdriver');

const express = require('express');

const app = express();
app.use(express.urlencoded({ extended: true }));

const { Configuration, NopeCHAApi } = require('nopecha');
const e = require('express');

const configuration = new Configuration({
    apiKey: 'sub_1PnKLpCRwBwvt6ptvzUXaXGx',
});
const nopecha = new NopeCHAApi(configuration);

const titles = [
    '504 Gateway Time-out', '403 Forbidden', 'Problem loading page', '503 Service Temporarily Unavailable',
    'Service Unavailable', '500 Internal Server Error', 'Database error', 'FastCGI Error',
    'The connection has timed out', 'Problemas al cargar la página', 'Error 502 (Server Error)!!1'
];

const headingTexts = [
    '502 Bad Gateway', 'Service Unavailable', '403 ERROR', 'Error 503 Service Unavailable',
    '404 Not Found', '504 Gateway Time-out', 'This page isn’t working'
];

const refreshIfNeeded = async (driver) => {
    let title = await driver.getTitle();
    let bodyElements = await driver.findElements(By.tagName('body'));
    const includes = titles.includes(title)
    if ( includes) {
        console.log("Error detected in title. Refreshing...");
        await driver.navigate().refresh();
    } else {
        let h1Elements = await driver.findElements(By.tagName('h1'));
        if (h1Elements.length > 0) {
            let h1Text = await h1Elements[0].getText();
            if (headingTexts.includes(h1Text)) {
                console.log("Error detected in heading text. Refreshing...");
                await driver.navigate().refresh();
            }
        }
    }
};

const solveCaptcha = async (captchaElement) => {
    let captchaSrc = await captchaElement.getAttribute('src');
    let result = await nopecha.solveRecognition({
        type: 'textcaptcha',
        image_urls: [captchaSrc],
    });

    return (result[0]);
    };

const solveRecaptcha = async (url) => {
    
    const token = await nopecha.solveToken({
        type: 'recaptcha2',
        sitekey: '6LcQb8klAAAAAHDDKtB3PaB6gvbh-ej4qa8BRKV9',
        url: url,
    });
    return token;
};

app.get('/', (req, res) => {
    res.send(`
        <h1>Book Appointment</h1>
        <form method="post">
            <label for="first_name">First Name:</label><br>
            <input type="text" id="first_name" name="first_name"><br>
            <label for="last_name">Last Name:</label><br>
            <input type="text" id="last_name" name="last_name"><br>
            <label for="username">Username:</label><br>
            <input type="text" id="username" name="username"><br>
            <label for="password">Password:</label><br>
            <input type="password" id="password" name="password"><br>
            <label for="application_centre">Application Centre:</label><br>
            <select id="application_centre" name="application_centre">
                <option value="Islamabad">Islamabad</option>
                <option value="Lahore">Lahore</option>
                <option value="Faisalabad">Faisalabad</option>
                <option value="Multan">Multan</option>
            </select><br>
            <label for="service_type">Service Type:</label><br>
            <select id="service_type" name="service_type">
                <option value="National - work">National - work</option>
                <option value="National Family reunion">National Family reunion</option>
            </select><br>
            <label for="applicant_type">Applicant Type:</label><br>
            <select id="applicant_type" name="applicant_type">
                <option value="Individual">Individual</option>
            </select><br>
            <label for="card">card:</label><br>
            <input type="number" id="card" name="card"><br>
            <input type="submit" value="Book Now">
        </form>
    `);
});

app.post('/', async (req, res) => {
    let {
        first_name, last_name, username, password,
        application_centre, service_type, applicant_type, card
    } = req.body;

    let driver = await new Builder().forBrowser('chrome').build();
    try {
        await driver.get('https://blsitalypakistan.com/account/login');
        await refreshIfNeeded(driver);

        let loginSuccess = false;

        while (!loginSuccess) {
            await driver.findElement(By.xpath("//input[@placeholder='Enter Email']")).sendKeys(username);
            await driver.findElement(By.xpath("//input[@placeholder='Enter Password']")).sendKeys(password);

            let captchaElement = await driver.findElement(By.xpath("/html/body/div[6]/div/div/div/div/div[2]/form/div[5]/img"));
            console.log("Solving captcha...");
            let captchaCode = await solveCaptcha(captchaElement);
            await driver.findElement(By.xpath("/html/body/div[6]/div/div/div/div/div[2]/form/div[6]/input")).sendKeys(captchaCode);
            await driver.findElement(By.xpath("/html/body/div[6]/div/div/div/div/div[2]/form/div[8]/button")).click();

            let currentUrl = await driver.getCurrentUrl();
            if (currentUrl === 'https://blsitalypakistan.com/account/account_details') {
                loginSuccess = true;
            } else {
                await driver.navigate().refresh();
            }
        }

        console.log("Login successful");
        await refreshIfNeeded(driver);
        await driver.findElement(By.xpath("/html/body/div[5]/div/div/div[1]/div/ul/li[4]/a")).click();
        
        //await driver.findElement(By.xpath("/html/body/div[6]/a/img")).click();
        // Select application centre based on user input
        switch (application_centre) {
            case 'Islamabad':
                
                await driver.findElement(By.xpath("/html/body/div[13]/div/div/div[2]/div/form/div[1]/select/option[7]")).click();
                await driver.findElement( By.xpath("/html/body/div[11]/div/div/div[2]/div/form/div[2]/select/option[7]")).click();
                break;
            case 'Lahore':
                await driver.findElement(By.xpath("/html/body/div[13]/div/div/div[2]/div/form/div[1]/select/option[7]")).click();
                
                await driver.findElement(By.xpath("/html/body/div[11]/div/div/div[2]/div/form/div[2]/select/option[7]")).click();
                break;
            case 'Faisalabad':
                await driver.findElement(By.xpath("/html/body/div[13]/div/div/div[2]/div/form/div[1]/select/option[5]")).click();
                
                await driver.findElement(By.xpath("/html/body/div[11]/div/div/div[2]/div/form/div[2]/select/option[4]")).click();
                break;
            case 'Multan':
                await driver.findElement(By.xpath ("/html/body/div[13]/div/div/div[2]/div/form/div[1]/select/option[6]")).click();
                
                await driver.findElement(By.xpath ("/html/body/div[11]/div/div/div[2]/div/form/div[2]/select/option[4]")).click();
                break;
        }

        await refreshIfNeeded(driver);
        
        await driver.findElement(By.xpath( "/html/body/div[11]/div/div/div[2]/div/form/div[3]/select/option[2]")).click();
        await refreshIfNeeded(driver);

        console.log("Solving Captcha");
        let boom = true;
        let datePicked = false;
        let ul = driver.getCurrentUrl();
        while (boom) {
            try {
                // Solve captcha and attempt to pick a date
                let captchaElement = await driver.findElement(By.xpath("/html/body/div[11]/div/div/div[2]/div/form/div[4]/div/img"));
                let captchaCode = await solveCaptcha(captchaElement);
                await driver.findElement(By.xpath("/html/body/div[11]/div/div/div[2]/div/form/div[5]/input")).sendKeys(captchaCode);

                await driver.findElement(By.name ("valAppointmentDate")).click();
                await refreshIfNeeded(driver);
                let dateElements = await driver.findElements(By.xpath("//td[contains(@class, 'day')]"));
                for (let dateElement of dateElements) {
                    await refreshIfNeeded(driver);  // Assuming refreshIfNeeded is defined elsewhere
                    let classes = await dateElement.getAttribute("class");
        
                    if (!classes.includes("disabled")) {
                        await dateElement.click();
                        console.log("Available date clicked");
                        boom = false;
                        datePicked = true;
                        break;  // Exit the loop once a date is clicked
                    }
                }
                
                if(boom){
                    console.log(`Date picking failed: . Retrying...`);
                    driver.navigate().refresh();
                }
            } catch 
            {
                console.log(`Failed due to an error:. Retrying...`);
                driver.navigate().refresh();
               
                    if(driver.getCurrentUrl==="https://blsitalypakistan.com/"){
                        console.log("You are at homepage!");
                        refreshIfNeeded(driver);
                        let login = false;
                        while(!login){
                            if(driver.getCurrentUrl==="https://blsitalypakistan.com/"){
                                console.log("You are at homepage");
                                driver.findElement(By.xpath , "/html/body/div[6]/a/img").click();
                                driver.findElement(By.xpath, "/html/body/div[2]/div/div/div[3]/span[1]/a").click();
                                refreshIfNeeded(driver);

                            }
                            await driver.findElement(By.xpath("//input[@placeholder='Enter Email']")).sendKeys(username);
                            await driver.findElement(By.xpath("//input[@placeholder='Enter Password']")).sendKeys(password);

                            let captchaElement = await driver.findElement(By.xpath("/html/body/div[6]/div/div/div/div/div[2]/form/div[5]/img"));
                            console.log("Solving captcha...");
                            let captchaCode = await solveCaptcha(captchaElement);
                            await driver.findElement(By.xpath("/html/body/div[6]/div/div/div/div/div[2]/form/div[6]/input")).sendKeys(captchaCode);
                            await driver.findElement(By.xpath("/html/body/div[6]/div/div/div/div/div[2]/form/div[8]/button")).click();

                            let currentUrl = await driver.getCurrentUrl();
                            if (currentUrl === 'https://blsitalypakistan.com/account/account_details') {
                            login = true;
                            } else {
                            await driver.navigate().refresh();
                            }
                        }
                    }
                

            }
        }
        if (datePicked) {
            console.log("Date picked successfully!");
            await driver.findElement(By.xpath("/html/body/div[11]/div/div/div[2]/div/form/div[8]/div/select/option[2]")).click();
            await driver.findElement(By.xpath("/html/body/div[11]/div/div/div[2]/div/form/div[9]/div[5]/input")).sendKeys(first_name);
            await driver.findElement(By.xpath("/html/body/div[11]/div/div/div[2]/div/form/div[9]/div[6]/input")).sendKeys(last_name);
            console.log("Solving recaptchav2");
            let ur =  driver.getCurrentUrl;
            let recaptchaResponse =await solveRecaptcha(ur);
            await driver.executeScript(`document.getElementById("g-recaptcha-response").innerHTML = "${recaptchaResponse}";`);
            console.log("V2solved");
            await driver.findElement(By.xpath("/html/body/div[11]/div/div/div[2]/div/form/div[9]/p/input")).click();
            await driver.findElement(By.xpath("/html/body/div[11]/div/div/div[2]/div/form/div[9]/div[11]/button")).click();
        }
        

    } finally {
        console.log("End");
    }

    res.send("Appointment booked successfully.");
});
const port = process.env.PORT ? process.env.PORT : 5000
app.listen(port, () => {
    console.log('Server started on http://localhost:'+port);
});
