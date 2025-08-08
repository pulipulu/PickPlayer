# 游戏内战匹配系统 - Vue 3版本

这是一个使用Vue 3 + Composition API重构的游戏匹配系统，相比原版纯JavaScript版本，具有更好的状态管理、组件化和开发体验。

## 🚀 特性

- **Vue 3 + Composition API**: 现代化的响应式状态管理
- **组件化架构**: 清晰的组件分离和复用
- **TypeScript支持**: 更好的类型安全（可选）
- **响应式设计**: 适配各种屏幕尺寸
- **本地存储**: 数据自动保存到浏览器
- **拖拽功能**: 支持玩家拖拽操作
- **实时更新**: 状态变化自动同步UI

## 📦 安装和运行

### 前置要求
- Node.js 16+ 
- npm 或 yarn

### 安装依赖
```bash
cd vue-version
npm install
```

### 开发模式
```bash
npm run dev
```
访问 http://localhost:3000

### 构建生产版本
```bash
npm run build
```

### 预览生产版本
```bash
npm run preview
```

## 🏗️ 项目结构

```
vue-version/
├── src/
│   ├── components/          # Vue组件
│   │   ├── NavBar.vue       # 导航栏
│   │   ├── ActionBar.vue    # 操作栏
│   │   ├── MatchResultArea.vue # 匹配结果区域
│   │   ├── SettingsModal.vue # 设置弹窗
│   │   ├── PlayersModal.vue # 玩家管理弹窗
│   │   ├── CandidatesModal.vue # 待选区弹窗
│   │   ├── LoadingOverlay.vue # 加载覆盖层
│   │   └── ToastContainer.vue # 通知容器
│   ├── composables/         # 组合式函数
│   │   ├── usePlayerManager.js # 玩家管理
│   │   ├── useMatchEngine.js # 匹配引擎
│   │   ├── useDraftMode.js  # 选马模式
│   │   ├── useToast.js      # 通知系统
│   │   └── useShareManager.js # 分享管理
│   ├── App.vue              # 主应用组件
│   └── main.js              # 应用入口
├── index.html               # HTML模板
├── package.json             # 项目配置
├── vite.config.js           # Vite配置
└── README.md                # 项目文档
```

## 🎯 核心功能

### 1. 玩家管理
- 批量添加玩家
- 示例玩家导入
- 玩家信息编辑
- 玩家删除

### 2. 匹配系统
- 随机匹配
- 平衡度计算
- 队长自动选择
- 结果展示

### 3. 选马模式
- 队长选择
- 轮流选人
- 自动选择
- 实时状态更新

### 4. 数据管理
- 本地存储
- 数据导出
- 系统重置

## 🔧 技术栈

- **前端框架**: Vue 3
- **构建工具**: Vite
- **样式框架**: Tailwind CSS
- **状态管理**: Vue 3 Composition API
- **本地存储**: @vueuse/core
- **图标库**: Font Awesome
- **拖拽库**: SortableJS

## 🆚 与原版对比

| 特性 | 原版(纯JS) | Vue版本 |
|------|------------|---------|
| 状态管理 | 手动同步 | 响应式自动同步 |
| 组件化 | 无 | 完整组件化 |
| 代码组织 | 单文件 | 模块化 |
| 开发体验 | 一般 | 优秀 |
| 维护性 | 困难 | 简单 |
| 扩展性 | 有限 | 强大 |
| 类型安全 | 无 | 可选TypeScript |

## 🎨 自定义样式

项目使用Tailwind CSS，可以通过修改`index.html`中的配置来自定义主题：

```javascript
tailwind.config = {
  theme: {
    extend: {
      colors: {
        'primary': '#3b82f6',
        'secondary': '#6366f1',
        // 添加自定义颜色
      }
    }
  }
}
```

## 📝 开发指南

### 添加新功能
1. 在`composables/`中创建新的组合式函数
2. 在`components/`中创建对应的Vue组件
3. 在`App.vue`中集成新功能

### 状态管理
使用Vue 3的响应式API：
```javascript
import { ref, reactive, computed } from 'vue'

// 响应式数据
const players = ref([])
const candidates = reactive([])

// 计算属性
const playerCount = computed(() => players.value.length)
```

### 组件通信
- 父传子：Props
- 子传父：Emit
- 跨组件：Provide/Inject 或 Pinia

## 🐛 常见问题

### Q: 如何添加新的匹配算法？
A: 在`useMatchEngine.js`中添加新的匹配方法，然后在组件中调用。

### Q: 如何自定义玩家属性？
A: 修改`usePlayerManager.js`中的`addPlayer`方法。

### Q: 如何添加新的UI组件？
A: 在`components/`目录下创建新的Vue组件文件。

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📞 联系方式

如有问题，请通过GitHub Issues联系。
