import mongodb, { ObjectID } from 'mongodb'
import config from 'config'
import { hasProp } from 'lib'
import { mergeRight, isEmpty } from 'ramda'

// eslint-disable-next-line
import { green, yellow, redf } from 'logger'

const MongoClient = mongodb.MongoClient

let client

class DatabaseError extends Error {
  constructor(e, ...params) {
    super(...params)
    this.name = 'DatabaseError'
    this.message = e.message
  }
}

const convertIdPropToObjId = (obj) => {
  const { _id: id } = obj
  const _id = typeof id === 'string' ? ObjectID(id) : id
  const final = mergeRight(obj, { _id })
  return final
}

/**
 *
 * @param {*} objOrStringId either an object with _id: <string> || a string that is a valid MongoDB ObjectId
 * @description If objOrString is an object with an _id prop, e.g. { _id: '5732f...', name: 'joe', ... } will return object with { _id: ObjectId('5732f...'), name: 'joe', ... }
 * @description If objOrString is a string returns string as an ObjectId.
 */
const stringIdToObjectId = (objOrStringId) => {
  switch (typeof objOrStringId) {
    case 'string':
      return ObjectID(objOrStringId)
    case 'object':
      if (isEmpty(objOrStringId)) {
        return objOrStringId
      }
      if (!hasProp('_id', objOrStringId)) {
        return objOrStringId
      }
      return convertIdPropToObjId(objOrStringId)
    default:
      // TODO: should obj be returned?
      return objOrStringId
  }
}

const connectDB = async () => {
  try {
    const cfg = config()
    if (!client) {
      client = await MongoClient.connect(cfg.mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      })
    }
    return { db: client.db(cfg.dbName) }
  } catch (e) {
    throw new Error('Unable to connect to MongoDB')
  }
}

export const close = async () => {
  if (client) {
    client.close()
  }
  client = undefined
}

/**
 * @param {string} collection the name of a collection
 * @param {object} filter filter criteria
 * @param {object} replacement object to replace current data
 */
export const findOneAndReplace = async ({
  collection,
  filter,
  replacement
}) => {
  try {
    const { db } = await connectDB()
    const r = await db
      .collection(collection)
      .findOneAndReplace(filter, replacement)
    return r.ops
  } catch (e) {
    throw new Error(e.message)
  }
}

/**
 *
 * @param {string} collection the name of a collection
 * @param {Array} data  an array of documents, without _id, to be inserted
 * @returns {object}
 */
export const insertMany = async ({ collection, data }) => {
  try {
    const { db } = await connectDB()
    const r = await db.collection(collection).insertMany(data)
    return r.ops
  } catch (e) {
    redf('dbFunctions.inserMany ERROR', e.message)
    redf('writeErrors', e.result.result.writeErrors)
    redf('op', e.result.result.writeErrors[0])
    console.log(e)
    throw new Error(e.message)
  }
}

/**
 *
 * @param {string} collection the name of a collection
 * @returns {boolean}
 *
 */
export const dropCollection = async (collection) => {
  try {
    const { db } = await connectDB()
    return await db.collection(collection).drop()
  } catch (e) {
    if (e.message === 'ns not found') {
      return true
    } else {
      throw new Error(e.message)
    }
  }
}

/**
 *
 * @param {string} collection the name of a collection
 * @param {object} data a documnet, without _id, to be inserted
 * @returns {object}
 *
 */
export const insertOne = async ({ collection, data }) => {
  try {
    const { db } = await connectDB()
    const r = await db.collection(collection).insertOne(data)
    return r.ops
  } catch (e) {
    redf('dbFunctions ERROR', e.message)
    throw new Error(e.message)
  }
}

/**
 *
 * @param {string} collection the name of a collection
 * @param {object} filter filter criteria
 * @param {object} projection a valid projection
 * @param {object} collation a valid collation
 * @param {number} sort 1 ascending, -1 descinding
 * @param {number} limit number > 0. default is 0
 * @returns {array} an array of matching documents
 * @description collection is required. All other params are optional
 */
export const find = async ({
  collection,
  filter = {},
  projection = {},
  collation = {},
  sort = {},
  limit = 0
}) => {
  try {
    const { db } = await connectDB()
    return await db
      .collection(collection)
      .find(filter)
      .project(projection)
      .collation(collation)
      .sort(sort)
      .limit(limit)
      .toArray()
  } catch (e) {
    throw new DatabaseError(e)
  }
}

/**
 *
 * @param {string} collection the name of a collection
 * @param {object} filter filter criteria
 * @param {object} projection a valid projection
 * @returns {array}
 *
 */
export const findOne = async ({ collection, filter = {}, projection = {} }) => {
  const f = stringIdToObjectId(filter)
  try {
    const { db } = await connectDB()
    return await db.collection(collection).findOne(f, { projection })
  } catch (e) {
    throw new Error(e.message)
  }
}

/**
 *
 * @param {string} collection the name of a collection
 * @param {string} id a valid _id as string
 * @param {object} projection a valid projection
 * @returns {object}
 */
export const findById = async ({ collection, id, projection = {} }) => {
  try {
    const _id = stringIdToObjectId(id)
    const { db } = await connectDB()
    return await db
      .collection(collection)
      .find({ _id })
      .project(projection)
      .toArray()
  } catch (e) {
    throw new Error(e.message)
  }
}

/**
 *
 * @param {string} collection the name of a collection
 * @param {object} filter a valid mongodb filter
 * @returns {object}
 */
export const findOneAndDelete = async ({ collection, filter }) => {
  try {
    const { db } = await connectDB()

    const r = await db.collection(collection).findOneAndDelete(filter)
    const { n, value } = r.lastErrorObject
    if (n === 0 && typeof value === 'undefined') {
      // throw an error
      throw new Error(
        `No document found for ${JSON.stringify(filter, null, 2)}`
      )
    }
    return [r.value]
  } catch (e) {
    throw new Error(e.message)
  }
}

/**
 *
 * @param {string} collection the name of a collection
 * @param {object} filter a valid mongodb filter
 *
 */
export const deleteMany = async (collection, filter) => {
  try {
    const { db } = await connectDB()
    const r = await db.collection(collection).deleteMany(filter)
    return r.deletedCount
  } catch (e) {
    throw new Error(e.message)
  }
}

/**
 *
 * @param {string} collection the name of a collection
 * @param {object} filter a valid mongodb filter
 * @param {object} update document properties to be updated such as { title: 'new title', completed: true }
 * @param {boolean} returnOriginal if true, returns the original document instead of the updated one
 * @returns {object}
 *
 */
export const findOneAndUpdate = async ({
  collection,
  filter = {},
  update,
  returnOriginal = false
}) => {
  try {
    const _id = filter._id
    const objId = new ObjectID(_id)
    const f = { _id: objId }

    const { db } = await connectDB()

    const r = await db
      .collection(collection)
      .findOneAndUpdate(f, update, { returnOriginal: returnOriginal })
    return [r.value]
  } catch (e) {
    console.group('dbFunctions.findOneAndUpdate ERROR')
    console.log('collection', collection)
    console.log('filter', filter)
    console.log('update', update)
    console.groupEnd()
    throw new Error(e.message)
  }
}

/**
 * @param {string} collection the name of a collection
 * @param {object} filter filter criteria
 * @param {object} update the object to use for the update
 */
export const updateMany = async ({ collection, filter = {}, update }) => {
  try {
    const { db } = await connectDB()

    const r = await db.collection(collection).updateMany(filter, update)
    return { matchedCount: r.matchedCount, modifiedCount: r.modifiedCount }
  } catch (e) {
    console.group('dbFunctions.updateMany ERROR')
    console.log('collection', collection)
    console.log('filter', filter)
    console.log('update', update)
    console.groupEnd()
    throw new Error(e.message)
  }
}

/**
 *
 * @param {string} collection the name of a collection
 * @param {string} field the name of the field to create the index on
 * @param {object} options any valid createIndex option
 */
export const createIndex = async ({ collection, field, options = {} }) => {
  const { db } = await connectDB()
  await db.collection(collection).createIndex(field, options)
}

/**
 *
 * @param {string} name the name for the new collection
 * @param {object} any valid createCollection options
 */
export const createCollection = async ({ name, options }) => {
  const { db } = await connectDB()
  await db.createCollection(name, options)
}

/**
 *
 * @param {string} name the name for the new collection
 * @param {Array} query an arry of aggregation pipeline stages
 */
export const executeAggregate = async ({ collection, query }) => {
  const { db } = await connectDB()
  const ret = await db.collection(collection).aggregate(query).toArray()
  return ret
}
