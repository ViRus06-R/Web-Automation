(async () => {
    const fetch = (await import('node-fetch')).default;

    const webhookURL = 'https://discord.com/api/webhooks/1274660391288573972/JttFmAu7-i0kkj4584Voa6klmsVqm01XsK7bsTSwDSLPovm_rVjsyRXmvFgfLSK3hzhY';

    const payload = {
        content: 'Hello, this is a test message from the webhook!',
        username: 'Webhook Bot',
        avatar_url: 'https://example.com/avatar.png',
    };

    async function sendMessage() {
        try {
            const response = await fetch(webhookURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                console.log('Message sent successfully!');
            } else {
                console.error('Failed to send message:', response.statusText);
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    }

    sendMessage();
})();
