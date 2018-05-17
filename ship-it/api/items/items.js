const mongo = require('mongodb');
const collectionName = 'items';

/**
* @throws bad_item The item object is incomplete.
* @param {string} userId The user id that listed the item (this must be validated before calling).
* @param {item} item The item to list.
*/
async function createItem(userId, item) {
  const keys = ['name', 'category', 'notes', 'image', 'from', 'to'];
  var insertable = {};
  for (var key of keys) {
    if (item[key] === undefined) {
      throw new Error('bad_item');
    }
    else {
      insertable[key] = item[key];
    }
  }
  insertable.userId = userId;
  const items = await getCollection(collectionName);
  await items.insertOne(insertable);
}

/**
 * Query mongo for items.
 * @param {filter} filter A filter to apply to the Mongo query.
 * @returns an array of delicate items.
 */
async function getItems(filter) {
  const items = await getCollection(collectionName);
  const delicateItemsCursor = await items.find(filter);
  const delicateItems = await delicateItemsCursor.toArray();
  return delicateItems;
}

/**
 * @throws sender_transporter_collision The item cannot be transported by the same person that listed it.
 * @throws item_does_not_exist The referred item does not exist.
 * @throws item_already_accepted The referred item already has a transporter.
 * @param {string} itemId The id of the item that will be transported.
 * @param {string} transporterUserId The id of the user that will transport the item (This id has to be previously validated against an existing and active user).
 */
async function acceptItem(itemId, transporterUserId) {
  const items = await getItems({ _id: new mongo.ObjectID(itemId) });
  if (items.length == 0) throw new Error('item_does_not_exist');
  const item  = items[0];
  if (item.transporterUserId != undefined) throw new Error('item_already_accepted');
  if (item.userId == transporterUserId) throw new Error('sender_transporter_collision');
  const itemsCollection = await getCollection(collectionName);
  const result = await itemsCollection.updateOne({ _id: new mongo.ObjectID(itemId) }, { $set: { transporterUserId } });
}

module.exports = { createItem, getItems, acceptItem };
