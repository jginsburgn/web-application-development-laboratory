const express = require('express');
const mongo = require('mongodb');
const sendMail = require('../utils/email');
const bodyParser = require('body-parser');

// General utilites
const utils = require('../utils');

// User utilities
const users = require('../users/users');

// Items utilities
const items = require('./items');

// Exportable routers
const root = express.Router();
const usersRouter = express.Router({ mergeParams: true });

// Body parser
const jsonParser = bodyParser.json();

root.get('/', async function(req, res) {
  console.log(`Query items, by ${req.get('x-user')}`);
  const userMail = req.get('x-user');
  const token = utils.getTokenFromHeader(req.get('authorization'));
  if (await users.validateSession(userMail, token)) {
    const user = await users.getUser(userMail);
    const delicateItems = await items.getItems({
      $and: [ 
        { userId: { $ne: user._id } },
        { transporterUserId: { $exists: false } }
      ] 
    });
    for (var delicateItem of delicateItems) {
      delicateItem.id = delicateItem._id;
      delete delicateItem._id;
      delete delicateItem.userId;
    }
    res.send(delicateItems);
    return;
  }
  else {
    res.sendStatus(401);
    return;
  }
});

root.patch('/:id', async function(req, res) {
  console.log(`Accept item ${req.params.id}, by ${req.get('x-user')}`);
  const userMail = req.get('x-user');
  const token = utils.getTokenFromHeader(req.get('authorization'));
  if (await users.validateSession(userMail, token)) {
    const user = await users.getUser(userMail);
    try {
      await items.acceptItem(req.params.id, user._id);
      const item = (await items.getItems({ _id: new mongo.ObjectID(req.params.id) }))[0];
      const transporter = user;
      const sender = await users.getUserById(item.userId);
      console.log(item, sender, transporter);
      // Tell transporter that he accepted the item.
      const transporterEmailOptions = {
        from: '"Ship It" <ship-it@wake.mx>', // sender address
        to: `"${transporter.name + ' ' + transporter.lastName}" <${transporter.email}>`, // list of receivers
        subject: `Transport for ${item.name} accepted!`, // Subject line
        text: `Hey!\nYou accepted to transport an item for ${sender.name + ' ' + sender.lastName}.\nThe details of the item are as follows:\n\tName: ${item.name}\n\tNotes: ${item.notes}\n\tFrom: ${item.from}\n\tTo: ${item.to}\nIt is now time to contact ${sender.name} at ${sender.email} in order to arrange the details.\nCongratulations!`, // plain text body
      };
      await sendMail(transporterEmailOptions);
      // Tell sender that his item was accepted.
      const senderEmailOptions = {
        from: '"Ship It" <ship-it@wake.mx>', // sender address
        to: `"${sender.name + ' ' + sender.lastName}" <${sender.email}>`, // list of receivers
        subject: `Transport for ${item.name} accepted!`, // Subject line
        text: `Hey!\nYour item will be transported by ${transporter.name + ' ' + transporter.lastName}.\nThe details of the item are as follows:\n\tName: ${item.name}\n\tNotes: ${item.notes}\n\tFrom: ${item.from}\n\tTo: ${item.to}\nIt is now time to contact ${transporter.name} at ${transporter.email} in order to arrange the details.\nCongratulations!`, // plain text body
      };
      await sendMail(senderEmailOptions);
      res.send();
    } catch (e) {
      switch (e.message) {
        case 'sender_transporter_collision':
        res.sendStatus(409);
        return;
        case 'item_does_not_exist':
        res.sendStatus(404);
        return;
        case 'item_already_accepted':
        res.sendStatus(410);
        return;
      }
    }
  }
  else {
    res.sendStatus(401);
    return;
  }
});

usersRouter.post('/', jsonParser, async function(req, res) {
  console.log(`Create new item ${JSON.stringify(req.body, null, 2)} for user ${JSON.stringify(req.params.user, null, 2)}`);
  if (req.params.user == undefined) {
    res.sendStatus(401);
    return;
  }
  const user = await users.getUser(req.params.user);
  if (user == undefined) {
    res.sendStatus(401);
    return;
  }
  const token = utils.getTokenFromHeader(req.get('authorization'));
  if (await users.validateSession(user.email, token)) {
    try {
      await items.createItem(user._id, req.body);
      res.send();
    }
    catch (e) {
      switch (e.message) {
        case 'bad_item':
        res.sendStatus(400);
        return;
      }
    }
  }
  else {
    res.sendStatus(401);
    return;
  }
});

usersRouter.delete('/:id', function(req, res) {
  console.log('Unlist an item for shipment');
  res.sendStatus(501);
});

usersRouter.get('/', async function(req, res) {
  console.log(`Query my items, by ${req.get('x-user')}`);
  const userMail = req.params.user || '';
  const token = utils.getTokenFromHeader(req.get('authorization'));
  if (await users.validateSession(userMail, token)) {
    const user = await users.getUser(userMail);
    const delicateItems = await items.getItems({
      $and: [ 
        { userId: user._id },
        { transporterUserId: { $exists: false } }
      ] 
    });
    for (var delicateItem of delicateItems) {
      delicateItem.id = delicateItem._id;
      delete delicateItem._id;
      delete delicateItem.userId;
    }
    res.send(delicateItems);
    return;
  }
  else {
    res.sendStatus(401);
    return;
  }
});

module.exports = { root, usersRouter };