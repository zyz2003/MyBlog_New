import { eq, and, like, sql, count, desc, isNull } from 'drizzle-orm'
import { db } from '../utils/db'
import { pages } from '../db/schema/pages'
import { BusinessErrors } from '../utils/response'

/** Page create input */
export interface PageCreateInput {
  title: string
  slug: string
  componentCode: string
  template?: 'default' | 'wide' | 'full'
  seoTitle?: string
  seoDescription?: string
  showInNav?: boolean
  navLabel?: string
  navOrder?: number
  status?: 'draft' | 'published'
}

/** Page update input */
export interface PageUpdateInput {
  title?: string
  slug?: string
  componentCode?: string
  template?: 'default' | 'wide' | 'full'
  seoTitle?: string
  seoDescription?: string
  showInNav?: boolean
  navLabel?: string
  navOrder?: number
  status?: 'draft' | 'published'
}

/** Page list query params */
export interface PageListQuery {
  page?: number
  pageSize?: number
  status?: string
}

/** Paginated list result */
export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/** Page with author info */
export interface PageWithAuthor {
  id: number
  title: string
  slug: string
  componentCode: string
  template: string
  seoTitle: string | null
  seoDescription: string | null
  showInNav: boolean
  navLabel: string | null
  navOrder: number
  status: string
  authorId: number
  createdAt: Date
  updatedAt: Date
}

export class PageService {
  /**
   * List pages with pagination and filters
   */
  static async list(params: PageListQuery = {}): Promise<PaginatedResult<PageWithAuthor>> {
    const page = Math.max(1, params.page || 1)
    const pageSize = Math.min(100, Math.max(1, params.pageSize || 20))
    const offset = (page - 1) * pageSize

    const conditions = [isNull(pages.deletedAt)]

    if (params.status) {
      conditions.push(eq(pages.status, params.status))
    }

    const [items, totalResult] = await Promise.all([
      db.select().from(pages)
        .where(and(...conditions))
        .orderBy(desc(pages.createdAt))
        .limit(pageSize)
        .offset(offset),
      db.select({ total: count() }).from(pages)
        .where(and(...conditions)),
    ])

    const total = totalResult[0]?.total ?? 0
    const totalPages = Math.ceil(total / pageSize)

    return {
      items: items as PageWithAuthor[],
      total,
      page,
      pageSize,
      totalPages,
    }
  }

  /**
   * Get page by ID
   */
  static async getById(id: number): Promise<PageWithAuthor | undefined> {
    const result = await db.select().from(pages)
      .where(and(eq(pages.id, id), isNull(pages.deletedAt)))
      .limit(1)
    return result[0] as PageWithAuthor | undefined
  }

  /**
   * Get page by slug (for public access)
   */
  static async getBySlug(slug: string): Promise<PageWithAuthor | undefined> {
    const result = await db.select().from(pages)
      .where(and(
        eq(pages.slug, slug),
        eq(pages.status, 'published'),
        isNull(pages.deletedAt),
      ))
      .limit(1)
    return result[0] as PageWithAuthor | undefined
  }

  /**
   * Get pages that should appear in navigation
   */
  static async getNavPages(): Promise<Array<Pick<PageWithAuthor, 'id' | 'slug' | 'navLabel' | 'navOrder'>>> {
    const result = await db.select({
      id: pages.id,
      slug: pages.slug,
      navLabel: pages.navLabel,
      navOrder: pages.navOrder,
    }).from(pages)
      .where(and(
        eq(pages.showInNav, true),
        eq(pages.status, 'published'),
        isNull(pages.deletedAt),
      ))
      .orderBy(pages.navOrder)

    return result
  }

  /**
   * Create a new page
   */
  static async create(data: PageCreateInput, authorId: number): Promise<PageWithAuthor> {
    // Check slug uniqueness
    const existing = await db.select().from(pages)
      .where(and(eq(pages.slug, data.slug), isNull(pages.deletedAt)))
      .limit(1)

    if (existing.length > 0) {
      throw new Error(BusinessErrors.DUPLICATE_SLUG.message)
    }

    const [result] = await db.insert(pages).values({
      title: data.title,
      slug: data.slug,
      componentCode: data.componentCode,
      template: data.template ?? 'default',
      seoTitle: data.seoTitle ?? null,
      seoDescription: data.seoDescription ?? null,
      showInNav: data.showInNav ?? false,
      navLabel: data.navLabel ?? null,
      navOrder: data.navOrder ?? 0,
      status: data.status ?? 'draft',
      authorId,
    }).returning()

    return result as PageWithAuthor
  }

  /**
   * Update a page
   */
  static async update(id: number, data: PageUpdateInput): Promise<PageWithAuthor | undefined> {
    const existing = await this.getById(id)
    if (!existing) {
      throw new Error(BusinessErrors.PAGE_NOT_FOUND?.message || '页面不存在')
    }

    // Check slug uniqueness if changing slug
    if (data.slug && data.slug !== existing.slug) {
      const duplicate = await db.select().from(pages)
        .where(and(eq(pages.slug, data.slug), isNull(pages.deletedAt)))
        .limit(1)
      if (duplicate.length > 0) {
        throw new Error(BusinessErrors.DUPLICATE_SLUG.message)
      }
    }

    const [result] = await db.update(pages)
      .set({
        ...(data.title !== undefined && { title: data.title }),
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.componentCode !== undefined && { componentCode: data.componentCode }),
        ...(data.template !== undefined && { template: data.template }),
        ...(data.seoTitle !== undefined && { seoTitle: data.seoTitle }),
        ...(data.seoDescription !== undefined && { seoDescription: data.seoDescription }),
        ...(data.showInNav !== undefined && { showInNav: data.showInNav }),
        ...(data.navLabel !== undefined && { navLabel: data.navLabel }),
        ...(data.navOrder !== undefined && { navOrder: data.navOrder }),
        ...(data.status !== undefined && { status: data.status }),
        updatedAt: new Date(),
      })
      .where(eq(pages.id, id))
      .returning()

    return result as PageWithAuthor | undefined
  }

  /**
   * Soft delete a page
   */
  static async delete(id: number): Promise<void> {
    const existing = await this.getById(id)
    if (!existing) {
      throw new Error(BusinessErrors.PAGE_NOT_FOUND?.message || '页面不存在')
    }

    await db.update(pages)
      .set({ deletedAt: new Date() })
      .where(eq(pages.id, id))
  }
}
