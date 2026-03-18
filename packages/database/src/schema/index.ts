// Schema exports - to be populated by subsequent plans
// This file serves as the central schema export point

// Plan 03-02: User and Category Schema
export { users, usersRelations } from './users'
export { categories, categoriesRelations } from './categories'

// Plan 03-03: Posts and Tags Schema (to be added)
// export { posts, postsRelations } from './posts'
// export { tags, tagsRelations } from './tags'
// export { postTags, postTagsRelations } from './post_tags'

// Plan 03-04: Media Schema (to be added)
// export { media, mediaRelations } from './media'

// Schema object for Drizzle Kit - updated as schemas are added
export const schema = {
  users,
  categories,
}
