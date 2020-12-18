// initialize .env
require('dotenv').config()

// Dependencies
const express = require('express')
const fetch = require('node-fetch')
const app = express()

// Body parser middleware
const bodyparser = require('body-parser')
app.use(bodyparser.json())

// Github payload verification middleware
const verifyPayload = require('./util/verifyPayload')
app.use(verifyPayload)

// Github ping route
app.post('/', (req, res) => {
  res.status(200).send('OK')
})

// Send webhook function
/**
 * @param { String || Object<DiscordWebhookEmbed> } message The message to send to discord.
 * @return {Promise<*>}
 */
const sendWebhook = async (message) => {
  if(typeof message === 'string') message = JSON.stringify({ content: message })
  message = JSON.stringify(message)
  return await fetch(process.env.DISCORD_WEBHOOK_URL, {
    method: 'post',
    body: message
  })
}

/**
 * Colors:
 * Recieved => #7289DA
 * Successful => #009800
 * Error / Unsuccessful => #FC2929
 */

// Post endpoint for github webhook
app.post('/github/autodeploy', async (req, res) => {
  if(req.body.repository.name === process.env.REPO_NAME) {
    if(req.body.action === 'completed') {
      if(req.body.check_run.name === process.env.ACTION_NAME) {
        console.log('Recieved action completion.')
        // Handle discord webhook if any
        if (process.env.DISCORD_WEBHOOK_URL) {
          await sendWebhook({
            embeds: [{
              title: `Recieved ${process.env.ACTION_NAME} completion.`,
              color: '#7289DA'
            }]
          })
        }
      }
    } else res.status(400)
  } else res.status(400)
})

// Allow lowercase and uppercase
const PORT = Number(process.env.PORT) || Number(process.env.port)
const HOST = process.env.HOST || process.env.host

// Listen
app.listen(PORT, HOST, () => {
  console.log(`Listening on ${HOST}:${PORT}`)
})