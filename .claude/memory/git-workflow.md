# Git 工作流规范

## 当前模式：本地测试

**重要**: 当前为本地测试阶段，不推送远端仓库。

## 远程仓库提交规则 (正式开发时启用)

**重要**: 只有当一个**大阶段完成时**才能提交到远端仓库。

### 什么是"大阶段"？

参考 GSD 里程碑配置中的 Milestone 和 Phase 划分：

- ✅ **大阶段完成** = 一个 Phase 全部完成
  - 例如：Phase 1.0 Monorepo 脚手架完成
  - 例如：Phase 2.0 核心框架完成

- ❌ **不要**在 Phase 内部中途推送
  - 不要在单个任务完成后就推送
  - 不要在部分功能完成后就推送

### 本地开发流程

1. 在本地正常进行 git commit
2. 累积多个本地提交
3. 等待整个 Phase 完成
4. 一次性 `git push` 到远端

### 示例

```bash
# 本地开发时的提交 (正常进行)
git add .
git commit -m "feat: add plugin system core"

git add .
git commit -m "fix: resolve hook registration bug"

# ... 继续开发 ...

# 当整个 Phase 完成后，才推送到远端
git push -u origin master
```

### 远程仓库 (正式开发时配置)

- origin: https://github.com/zyz2003/MyBlog_New.git
