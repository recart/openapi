await fetch('https://api.recart.com/app-integrations/2023-12/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/vnd.api+json',
    'X-Recart-API-Key': '<apiKey>',
  },
  body: JSON.stringify({
    data: {
      type: 'messages',
      attributes: {
        phoneNumber: '+123456789',
        messages: [
          {
            type: 'promotional',
            body: 'Content of the message',
          },
          {
            type: 'promotional',
            body: 'Follow-up message',
          },
        ],
      },
    },
  }),
})
  .then((response) => response.json())
  .then((body) => console.log(body))
  .catch((error) => console.error(error))