import { startDriver, stopDriver } from "./driverSetup";

beforeAll(async () => {
    globalThis.driver = await startDriver();
})

afterAll(async () => {
    await stopDriver();
})