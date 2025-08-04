import asyncio
from playwright import async_api

async def run_test():
    pw = None
    browser = None
    context = None
    
    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()
        
        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",         # Set the browser window size
                "--disable-dev-shm-usage",        # Avoid using /dev/shm which can cause issues in containers
                "--ipc=host",                     # Use host-level IPC for better stability
                "--single-process"                # Run the browser in a single process mode
            ],
        )
        
        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        context.set_default_timeout(5000)
        
        # Open a new page in the browser context
        page = await context.new_page()
        
        # Navigate to your target URL and wait until the network request is committed
        await page.goto("http://localhost:5173", wait_until="commit", timeout=10000)
        
        # Wait for the main page to reach DOMContentLoaded state (optional for stability)
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=3000)
        except async_api.Error:
            pass
        
        # Iterate through all iframes and wait for them to load as well
        for frame in page.frames:
            try:
                await frame.wait_for_load_state("domcontentloaded", timeout=3000)
            except async_api.Error:
                pass
        
        # Interact with the page elements to simulate user flow
        # Click on Credentials to input invalid credentials to cause an agentic error.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div/div/div[2]/button[3]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Input invalid credentials (username: 'lawsa', password: 'Lawsa##7017') and add them.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div/div[3]/div[2]/div/div[4]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('lawsa')
        

        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div/div[3]/div[2]/div/div[4]/input[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('API Key')
        

        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div/div[3]/div[2]/div/div[4]/input[3]').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('Lawsa##7017')
        

        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div/div[3]/div[2]/div/div[4]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Close the Credential Management popup and run the workflow to trigger an agentic error.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div/div[3]/div[2]/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Click the 'Run Workflow' button to execute the workflow designed to cause an agentic error and observe the frontend for error streaming and display.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div/div/div[2]/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Assert that the backend streams error details to the frontend interface by checking for error messages in the execution output
        execution_output = await frame.locator('xpath=//div[contains(@class, "execution-output")]').inner_text()
        assert 'Field required' in execution_output or 'error' in execution_output.lower(), 'Expected error details not found in execution output'
        
        # Assert that the frontend shows a clear error message and does not hang
        error_message_locator = frame.locator('xpath=//div[contains(text(), "Field required") or contains(text(), "error")]')
        assert await error_message_locator.is_visible(), 'Error message is not visible on the frontend'
        
        # Optionally, check that the UI is responsive and not stuck (e.g., Run Workflow button is enabled)
        run_workflow_button = frame.locator('xpath=//button[contains(text(), "Run Workflow")]')
        assert await run_workflow_button.is_enabled(), 'Run Workflow button is disabled, UI might be hung'
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    