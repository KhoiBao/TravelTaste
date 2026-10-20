import { MongoClient } from 'mongodb'

const client = new MongoClient('mongodb://localhost:27017')
const dbName = 'review_diadiem'
const collectionName = 'diadiem'
const maxCommentDepth = 3

function clone(value) {
  return structuredClone(value)
}

function commentSchemaAt(validator) {
  const schema = validator?.$jsonSchema
  const commentSchema = schema?.properties?.reviews?.items?.properties?.binhLuan?.items
  if (!schema || !commentSchema?.properties || !Array.isArray(commentSchema.required)) {
    throw new Error('Could not find reviews.binhLuan comment schema in the collection validator')
  }
  return commentSchema
}

function normalizeCommentSchema(schema, template, depth) {
  if (!schema?.properties || !Array.isArray(schema.required)) {
    throw new Error('Comment validator is missing properties or required fields')
  }

  schema.required = [...new Set(schema.required.map(field => field === 'id' ? 'commentId' : field))]
  if (schema.properties.id && !schema.properties.commentId) {
    schema.properties.commentId = schema.properties.id
  }
  delete schema.properties.id

  if (depth === maxCommentDepth) {
    delete schema.properties.traLoi
    return schema
  }

  const existingReplies = schema.properties.traLoi
  const replySchema = existingReplies?.items ?? template
  schema.properties.traLoi = {
    ...(existingReplies ?? {}),
    bsonType: 'array',
    items: normalizeCommentSchema(clone(replySchema), template, depth + 1)
  }
  return schema
}

try {
  await client.connect()
  const db = client.db(dbName)
  const collectionInfo = await db.listCollections({ name: collectionName }).next()
  if (!collectionInfo) {
    throw new Error(`Collection "${dbName}.${collectionName}" does not exist`)
  }

  const validator = clone(collectionInfo.options?.validator ?? {})
  const template = clone(commentSchemaAt(validator))
  const correctedCommentSchema = normalizeCommentSchema(template, template, 1)
  validator.$jsonSchema.properties.reviews.items.properties.binhLuan.items = correctedCommentSchema

  await db.command({
    collMod: collectionName,
    validator,
    validationLevel: collectionInfo.options.validationLevel ?? 'strict',
    validationAction: collectionInfo.options.validationAction ?? 'error'
  })

  const updatedInfo = await db.listCollections({ name: collectionName }).next()
  const updatedValidator = updatedInfo?.options?.validator
  const updatedComment = commentSchemaAt(updatedValidator)
  const replies = updatedComment.properties.traLoi.items
  const nestedReplies = replies.properties.traLoi.items
  if (
    updatedComment.required.includes('id') ||
    !updatedComment.required.includes('commentId') ||
    replies.required.includes('id') ||
    !replies.required.includes('commentId') ||
    nestedReplies.required.includes('id') ||
    !nestedReplies.required.includes('commentId')
  ) {
    throw new Error('Validator update did not verify at all three comment depths')
  }

  console.log(`[OK] Updated ${dbName}.${collectionName} validator for commentId at three comment depths`)
} catch (error) {
  console.error('[ERROR] Could not update comment validator:', error.message)
  process.exitCode = 1
} finally {
  await client.close()
}
