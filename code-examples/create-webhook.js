await fetch('https://api.recart.com/app-integrations/2023-12/webhooks', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/vnd.api+json',
    'X-Recart-API-Key': '<apiKey>'
  },
  body: JSON.stringify({
    data: {
      type: 'webhooks',
      attributes: {
        topic: 'messages/incoming',
        address: 'https://your-webhook-url.com'
      }
    }
  })
}).then((response) => response.json()).then((body) => console.log(body)).catch((error) => console.error(error))