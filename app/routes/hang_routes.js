// import the express library
const express = require('express')
// import the passport for bearer strategy authentication
const passport = require('passport')

// requiring the example model (mongoose) so we can use it to interact with our database
const Hang = require('../models/hang')

// the lib custom customErrors
// import customErrors so we can throw them for the error handlers to catch
const customErrors = require('../../lib/custom_errors')

// if we do not have a record(doc), then throw a doc customErrors
// import error 404, doc not found if a doc does not exist, otherwise a doc will pass through this function
const handle404 = customErrors.handle404

// this will raise an error if the incoming request is not the owned by user requesting the document being requested
// used to make sure you can only edit/delete resources that you own
const requireOwnership = customErrors.requireOwnership

// Import the remove blanks middleware, will remove any empty strings in a resource
// ex. { text: 'Jeff', title: ''}
// { text: 'Jeff' }
const removeBlanks = require('../../lib/remove_blank_fields')

// use passport to get a function that raises an error if a token is not provided on the resource
const requireToken = passport.authenticate('bearer', { session: false })

// create a new router, a router is like a 'mini-app'
// these routes can have routes defined on them
// a router is a middleware, so it will be used in a server.js
const router = express.Router()

// INDEX
// we don't have a 'requireToken' so we can access hangs without authentication
router.get('/hangs', (req, res, next) => {
// get all the hangs from db
  Hang.find()
    .then(hangs => hangs.map(hang => hang.toObject()))
    // respond to the client
    .then(hangs => res.json({ hangs }))
    // handle any errors that occurs call 'next'
    .catch(next)
})

// SHOW

router.get('/hangs/:id', (req, res, next) => {
  Hang.findById(req.params.id)
    .then(handle404)
    .then(hang => res.json({ hang: hang.toObject() }))
    .catch(next)
})

// DESTROY
// DELETE /examples/5a7db6c74d55bc51bdf39793
// use the .delete method
router.delete('/hangs/:id', requireToken, (req, res, next) => {
  Hang.findById(req.params.id)
    .then(handle404)
    .then(hang => {
      requireOwnership(req, hang)
      hang.deleteOne()
    })
    .then(() => res.sendStatus(204))
    .catch(next)
})

// UPDATE
// Patch - changing information request
router.patch('/hangs/:id', requireToken, removeBlanks, (req, res, next) => {
  delete req.body.hang.owner
  // remove the 'owner' property form the req.body.example so it cannot be updated
  Hang.findById(req.params.id)
    .then(handle404)
    .then(hang => {
      requireOwnership(req, hang)

      return hang.updateOne(req.body.hang)
    })
    .then(() => res.sendStatus(204))
    .catch(next)
})

// RSVP -----
router.patch('/rsvp/:id', removeBlanks, (req, res, next) => {
  delete req.body.hang.owner
// remove the 'owner' property form the req.body.example so it cannot be updated
  Hang.findById(req.params.id)
    .then(handle404)
    .then(hang => {


      return hang.updateOne({$push:{rsvp:req.body.hang}})
    })
    .then(() => res.sendStatus(204))
    .catch(next)
})

// CREATE
// POST /
// use post to CREATE
router.post('/hangs', requireToken, (req, res, next) => {
  req.body.hang.owner = req.user.id
  Hang.create(req.body.hang)
    .then(hang => {
      res.status(201).json({ hang: hang.toObject() })
    })
    .catch(next)
})

// export the router so that it can be used and mounted in server.js
module.exports = router
