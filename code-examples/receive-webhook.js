// Express example
app.post("<your endpoint>", async (req, res) => {
  const topic = req.get("X-Recart-Topic")
  const hmac = req.get("X-Recart-Signature")

  const body = req.body
  const hash = crypto
    .createHmac("sha256", '<you_secret_key>')
    .update(JSON.stringify(body))
    .digest("hex")

  const signatureOk = crypto.timingSafeEqual(
    Buffer.from(hash),
    Buffer.from(hmac)
  )

  if (signatureOk) {
    console.log("Phew, it came from Recart!")

    // Process the webhook

    res.sendStatus(200)
  } else {
    console.log("Danger! Not from Recart!")
    res.sendStatus(403)
  }
})