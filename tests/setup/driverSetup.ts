import { Builder, WebDriver } from 'selenium-webdriver';

let driver: WebDriver;

export async function startDriver(): Promise<WebDriver> {
    driver = await new Builder().forBrowser('chrome').build();
    return driver;
}

export async function stopDriver(): Promise<void> {
    if(driver){
        await driver.quit();
    }
}