// Schema exports - to be populated by subsequent plans
// This file serves as the central schema export point

// Plan 03-02: User and Category Schema
export * from './users'
export * from './categories'

// Plan 03-03: Posts and Tags Schema
export * from './posts'
export * from './tags'
export * from './post_tags'

// Plan 03-04: Media Schema (to be added)
// export * from './media'

// Note: schema object will be built incrementally as schemas are added
// Import individual schemas for the schema object
import { users } from './users'
import { categories } from './categories'
import { posts } from './posts'
import { tags } from './tags'
import { postTags } from './post_tags'

export const schema = {
  users,
  categories,
  posts,
  tags,
  postTags,
}
