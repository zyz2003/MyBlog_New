/**
 * 数据库迁移脚本 - MySQL 版本
 * 运行此脚本初始化数据库
 *
 * Usage: pnpm db:migrate
 */

import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';

// 从环境变量获取数据库配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'my_blog',
};

async function runMigrations() {
  console.log('Connecting to MySQL database...');
  console.log('Config:', {
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    database: dbConfig.database,
  });

  let connection;

  try {
    // 连接到 MySQL
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to MySQL!');

    console.log('Running database migrations...');

    // 运行迁移
    await connection.query(`
      -- 用户表
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(32) PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        avatar VARCHAR(255),
        bio TEXT,
        role VARCHAR(20) DEFAULT 'subscriber' NOT NULL,
        status VARCHAR(20) DEFAULT 'active' NOT NULL,
        last_login_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT chk_user_role CHECK (role IN ('admin', 'editor', 'author', 'subscriber')),
        CONSTRAINT chk_user_status CHECK (status IN ('active', 'inactive', 'banned'))
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      -- 文章表
      CREATE TABLE IF NOT EXISTS posts (
        id VARCHAR(32) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        summary TEXT,
        content LONGTEXT NOT NULL,
        content_format VARCHAR(20) DEFAULT 'markdown' NOT NULL,
        cover_image VARCHAR(255),
        status VARCHAR(20) DEFAULT 'draft' NOT NULL,
        author_id VARCHAR(32) NOT NULL,
        published_at TIMESTAMP NULL,
        scheduled_at TIMESTAMP NULL,
        view_count INT DEFAULT 0,
        like_count INT DEFAULT 0,
        comment_count INT DEFAULT 0,
        is_top TINYINT DEFAULT 0,
        is_featured TINYINT DEFAULT 0,
        allow_comments TINYINT DEFAULT 1,
        seo_title VARCHAR(255),
        seo_description TEXT,
        seo_keywords TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT chk_post_status CHECK (status IN ('draft', 'published', 'scheduled', 'archived')),
        CONSTRAINT chk_post_format CHECK (content_format IN ('markdown', 'html', 'rich-text')),
        CONSTRAINT fk_posts_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      -- 分类表
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(32) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        parent_id VARCHAR(32) NULL,
        sort_order INT DEFAULT 0,
        post_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_categories_parent FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      -- 标签表
      CREATE TABLE IF NOT EXISTS tags (
        id VARCHAR(32) PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        slug VARCHAR(50) NOT NULL UNIQUE,
        description TEXT,
        color VARCHAR(20),
        post_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      -- 文章 - 分类关联表
      CREATE TABLE IF NOT EXISTS post_categories (
        post_id VARCHAR(32) NOT NULL,
        category_id VARCHAR(32) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (post_id, category_id),
        CONSTRAINT fk_pc_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
        CONSTRAINT fk_pc_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      -- 文章 - 标签关联表
      CREATE TABLE IF NOT EXISTS post_tags (
        post_id VARCHAR(32) NOT NULL,
        tag_id VARCHAR(32) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (post_id, tag_id),
        CONSTRAINT fk_pt_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
        CONSTRAINT fk_pt_tag FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      -- 迁移记录表
      CREATE TABLE IF NOT EXISTS _migrations (
        id VARCHAR(50) PRIMARY KEY,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      -- 索引
      CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
      CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);
      CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(published_at);
      CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
      CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
      CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);
    `);

    console.log('✓ Database tables created successfully!');

    // 创建默认管理员用户
    console.log('Creating default admin user...');

    const [existingUsers]: any[] = await connection.query(
      'SELECT * FROM users WHERE role = ? LIMIT 1',
      ['admin']
    );

    if (existingUsers.length === 0) {
      const adminId = nanoid();
      const hashedPassword = await bcrypt.hash('admin123', 10);

      await connection.query(
        `INSERT INTO users (id, username, email, password, role, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [adminId, 'admin', 'admin@example.com', hashedPassword, 'admin', 'active']
      );

      console.log('✓ Default admin user created!');
      console.log('  Username: admin');
      console.log('  Password: admin123');
      console.log('  (请首次登录后修改密码)');
    } else {
      console.log('✓ Admin user already exists');
    }

    // 记录迁移
    const [existingMigrations]: any[] = await connection.query(
      'SELECT * FROM _migrations WHERE id = ?',
      ['0001_init']
    );

    if (existingMigrations.length === 0) {
      await connection.query('INSERT INTO _migrations (id) VALUES (?)', ['0001_init']);
      console.log('✓ Migration 0001_init recorded');
    }

    await connection.end();

    console.log('\n✅ Database initialization complete!');
    console.log('\nNext steps:');
    console.log('  1. Run "pnpm dev" to start the development server');
    console.log('  2. Login with admin/admin123');
    console.log('  3. Change the default password!');

  } catch (error) {
    console.error('Migration failed:', error);
    if (connection) {
      await connection.end();
    }
    process.exit(1);
  }
}

runMigrations();
