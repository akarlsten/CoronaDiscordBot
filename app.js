const path = require('path')
require('dotenv').config({path: path.join(__dirname, '/.env')})
const fs = require('fs')
const Twitter = require('twitter')
const axios = require('axios')
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('db.json')
const db = low(adapter)

db.defaults({tweets: []}).write()

const client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_KEY_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  bearer_token: process.env.TWITTER_BEARER_TOKEN
})

const checkTweets = async () => {
  fs.appendFileSync('log.txt', `----------------------`, 'utf8')
  try {
   const response = await client.get('search/tweets', { q: 'from:@BNODesk exclude:replies exclude:retweets'})

   for (const tweet of response.statuses) {
     const exists = db.get('tweets').find({ id: tweet.id }).value()

     if (!exists) {
       fs.appendFileSync('log.txt', `New tweet found!\n${JSON.stringify(tweet.text)}\n`, 'utf8')
       db.get('tweets').push({ 'id': tweet.id }).write()

       await axios.request({
         url: process.env.DISCORD_WEBHOOK,
         method: 'post',
         headers: {
           'Content-Type': 'application/json'
         },
         data: {
           "username": "BNODesk", "icon_url": "test",
           "content": `${tweet.text}`
         }
       })
     }
   }

  } catch (e) {
    fs.appendFileSync('log.txt', `Error: ${JSON.stringify(e)}\n`, 'utf8')
    console.log(e)
  }

  fs.appendFileSync('log.txt', `----------------------`, 'utf8')
} 

checkTweets()