// 生成网站设计说明书 .docx
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, ImageRun,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, PageNumber, PageBreak, TableOfContents, LevelFormat
} = require('docx');

const screenshotDir = path.join(__dirname, '截图');
const screenshots = fs.readdirSync(screenshotDir).filter(f => f.endsWith('.png')).sort();
console.log('Found screenshots:', screenshots.length);

// Load all screenshots
const images = screenshots.map(name => ({
  name,
  data: fs.readFileSync(path.join(screenshotDir, name))
}));

// Image insertion function
function img(idx, width) {
  if (idx >= images.length) return new Paragraph({ children: [new TextRun('[截图待补充]')] });
  const img = images[idx];
  const ratio = 9 / 16; // typical 16:9 screenshot
  const h = Math.round(width * ratio);
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 120, after: 200 },
    children: [new ImageRun({
      type: 'png',
      data: img.data,
      transformation: { width, height: h },
      altText: { title: img.name, description: '网站截图', name: img.name }
    })]
  });
}

// Small centered image for forms/toasts (square-ish, narrow)
function imgNarrow(idx, width) {
  if (idx >= images.length) return new Paragraph({ children: [new TextRun('[截图待补充]')] });
  const img = images[idx];
  const h = Math.round(width * 1.2);
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 120, after: 200 },
    children: [new ImageRun({
      type: 'png',
      data: img.data,
      transformation: { width, height: h },
      altText: { title: img.name, description: '网站截图', name: img.name }
    })]
  });
}

// Helpers
const border = { style: BorderStyle.SINGLE, size: 1, color: 'E0D5C5' };
const borders = { top: border, bottom: border, left: border, right: border };
const cellMargins = { top: 60, bottom: 60, left: 100, right: 100 };

function p(text, opts = {}) {
  return new Paragraph({
    spacing: { before: 80, after: 80 },
    ...opts,
    children: [new TextRun({ text, font: { name: 'Microsoft YaHei' }, size: 24, ...(opts.run || {}) })]
  });
}

function h1(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 360, after: 200 }, children: [new TextRun({ text, font: { name: 'Microsoft YaHei' }, size: 36, bold: true })] });
}
function h2(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 280, after: 160 }, children: [new TextRun({ text, font: { name: 'Microsoft YaHei' }, size: 30, bold: true })] });
}
function h3(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_3, spacing: { before: 200, after: 120 }, children: [new TextRun({ text, font: { name: 'Microsoft YaHei' }, size: 26, bold: true })] });
}

function tableRow(cells) {
  return new TableRow({
    children: cells.map((cell, i) => new TableCell({
      borders,
      width: { size: Math.floor(9360 / cells.length), type: WidthType.DXA },
      margins: cellMargins,
      children: [new Paragraph({ children: [new TextRun({ text: cell, font: { name: 'Microsoft YaHei' }, size: 20 })] })]
    }))
  });
}

const doc = new Document({
  styles: {
    default: { document: { run: { font: 'Microsoft YaHei', size: 24 } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 36, bold: true, font: 'Microsoft YaHei' },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 30, bold: true, font: 'Microsoft YaHei' },
        paragraph: { spacing: { before: 280, after: 160 }, outlineLevel: 1 } },
      { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 26, bold: true, font: 'Microsoft YaHei' },
        paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 2 } },
    ]
  },
  numbering: {
    config: [
      { reference: 'bullets',
        levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },
        margin: { top: 1440, right: 1200, bottom: 1440, left: 1200 }
      }
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [new TextRun({ text: '世界之旅 · 网站设计说明书', font: { name: 'Microsoft YaHei' }, size: 18, color: '8B7E6A' })]
        })]
      })
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: '— ', size: 18, font: { name: 'Microsoft YaHei' }, color: '8B7E6A' }), new TextRun({ children: [PageNumber.CURRENT], size: 18, font: { name: 'Microsoft YaHei' }, color: '8B7E6A' }), new TextRun({ text: ' —', size: 18, font: { name: 'Microsoft YaHei' }, color: '8B7E6A' })]
        })]
      })
    },
    children: [
      // ====== COVER ======
      new Paragraph({ spacing: { before: 3600 } }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: '世界之旅', font: { name: 'Microsoft YaHei' }, size: 56, bold: true, color: 'C67B4B' })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: 'TravelWorld', size: 36, font: { name: 'Microsoft YaHei' }, color: '8B7E6A' })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 1200 }, children: [new TextRun({ text: '网站设计说明书', size: 32, font: { name: 'Microsoft YaHei' }, bold: true })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text: '访问地址：https://octLe0210.github.io/travel-world/', size: 22, font: { name: 'Microsoft YaHei' }, color: '8B7E6A' })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text: '技术栈：HTML5 + CSS3 + JavaScript + GSAP', size: 22, font: { name: 'Microsoft YaHei' }, color: '8B7E6A' })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text: '版本：v2.0  |  2026年6月', size: 22, font: { name: 'Microsoft YaHei' }, color: '8B7E6A' })] }),

      new Paragraph({ children: [new PageBreak()] }),

      // ====== TOC ======
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: '目录', font: { name: 'Microsoft YaHei' }, bold: true })] }),
      new TableOfContents('目录', { hyperlink: true, headingStyleRange: '1-3' }),
      new Paragraph({ children: [new PageBreak()] }),

      // ====== 1. PROJECT OVERVIEW ======
      h1('1. 项目概述'),
      h2('1.1 项目定位'),
      p('世界之旅是一个面向全球旅行者的综合旅游信息平台，提供目的地探索、酒店预订、机票查询、租车服务、旅行攻略等一站式服务。网站以"杂志旅行风"为设计理念，融合 Monocle、Kinfolk 等高端旅行杂志的视觉美学。'),

      h2('1.2 核心特色'),
      ...[
        '沉浸式启动页：粒子星空 + 3D 地球 + GSAP 动画编排',
        '杂志风排版：Playfair Display 衬线标题 + 大地暖色调 + 呼吸感留白',
        '全设备适配：桌面/平板/手机三端响应式，侧边栏折叠 + 触摸手势',
        '独立分类子页：酒店/机票/租车各 20 条数据，含排序、筛选、分页',
        '后台管理：独立的 admin 后台，支持六大模块的增删改查'
      ].map(t => new Paragraph({ numbering: { reference: 'bullets', level: 0 }, spacing: { before: 60, after: 60 }, children: [new TextRun({ text: t, font: { name: 'Microsoft YaHei' }, size: 24 })] })),

      h2('1.3 技术选型'),
      tableRow(['技术', '用途', '选型理由']),
      tableRow(['纯 HTML/CSS/JS', '全站架构', '零构建依赖，GitHub Pages 直接部署']),
      tableRow(['GSAP 3.12', '动画引擎', '高性能 timeline + ScrollTrigger']),
      tableRow(['Playfair Display', '标题字体', 'Google Fonts，衬线杂志感']),
      tableRow(['localStorage', '数据持久化', '纯前端方案，无需后端数据库']),
      tableRow(['GitHub Pages', '部署平台', '免费 HTTPS + 全球 CDN']),

      // ====== 2. INTERFACE DESIGN ======
      h1('2. 界面设计'),
      h2('2.1 设计理念'),
      p('整体风格定位为"杂志旅行风"，参考高端旅行出版物（如 Monocle、Condé Nast Traveler）的排版美学——大图出血、衬线标题、暖色留白、精致网格。'),
      img(0, 5400),

      h2('2.2 色彩系统'),
      tableRow(['色板角色', '色值', '用途']),
      tableRow(['主色（陶土棕）', '#c67b4b', '按钮、链接、高亮、选中态']),
      tableRow(['主色深', '#a05a35', '按钮 hover、强调']),
      tableRow(['页面底色', '#f7f3ed', '全局背景，暖纸白']),
      tableRow(['卡片底色', '#fffdf9', '内容卡片，微暖白']),
      tableRow(['侧边栏深色', '#2c2416', '侧边栏背景，深橡木']),
      tableRow(['正文色', '#3d3628', '标题、正文文字']),
      tableRow(['副文色', '#8b7e6a', '描述文字、辅助信息']),
      tableRow(['边框色', '#e8e0d5', '卡片边框、分隔线']),
      tableRow(['成功色', '#27ae60', '成功提示']),
      p('设计原则：全局以大地暖色调替代传统冷灰/纯白，营造纸质阅读般的温润感。'),
      img(1, 5400),

      h2('2.3 字体系统'),
      tableRow(['层级', '字体', '字号', '字重', '用途']),
      tableRow(['H1 Hero', 'Playfair Display', '44-72px', '700', '启动页大标题']),
      tableRow(['H2 Section', 'Playfair Display', '30px', '700', '区域标题']),
      tableRow(['H3 Card', 'Playfair Display', '18-20px', '700', '卡片标题']),
      tableRow(['H4 Guide', 'Playfair Display', '18px', '700', '攻略卡片标题']),
      tableRow(['Body', '系统字体栈', '14-16px', '400', '正文']),
      tableRow(['Small', '系统字体栈', '12-13px', '400', '辅助文字']),
      tableRow(['Button', '系统字体栈', '13-16px', '600-700', '按钮']),
      p('系统字体栈：-apple-system, BlinkMacSystemFont, \'Segoe UI\', \'PingFang SC\', Roboto, sans-serif。正文字号 14-16px，行高 1.8。'),
      img(2, 5400),

      h2('2.4 图标与图片'),
      p('图标：使用 Emoji 作为场景图标（🏠🌍🏨✈️🚗📖📋），与旅行主题天然契合，无需额外加载图标库。'),
      p('图片：全站图片来自 picsum.photos 占位图服务，所有 <img> 标签添加 loading="lazy" 原生懒加载。卡片图片包裹在 .card-img-wrap 容器中，hover 时轻微放大增强交互感。'),
      p('[截图待补充：图片加载效果 + 卡片 hover 放大]'),

      // ====== 3. RESPONSIVE ======
      h1('3. 响应式设计'),
      h2('3.1 设备兼容性'),
      p('网站支持桌面端（≥1024px）、平板端（768-1023px）、手机端（≤767px）、小屏手机（≤360px）。使用标准 HTML5 + CSS3，兼容 Chrome、Edge、Firefox、Safari。'),
      p('[截图待补充：三种设备尺寸并排]'),

      h2('3.2 屏幕尺寸适应性'),
      tableRow(['断点', '侧边栏', '网格列数', '卡片图片', '区块内边距']),
      tableRow(['>1024px', '260px 完整', '3 列', '220px', '80px']),
      tableRow(['768-1023px', '260px 完整', '2 列', '200px', '60px 40px']),
      tableRow(['≤767px', '60px 图标', '1 列', '180px', '48px 24px']),
      tableRow(['≤360px', '60px 图标', '1 列', '160px', '32px 12px']),
      img(5, 5400),

      h2('3.3 触摸交互优化'),
      ...[
        '全局：touch-action: manipulation 防止 300ms 点击延迟和双击缩放',
        '卡片：:active 伪类提供按压反馈（内阴影替代 shadow 浮动）',
        '弹窗关闭：支持下滑手势（touchstart/touchend 检测 ≥100px 垂直位移）',
        '滚动容器：-webkit-overflow-scrolling: touch + overscroll-behavior: contain',
        '按钮：GSAP mousedown scale(0.96) + mouseup scale(1.04) 按压弹力反馈'
      ].map(t => new Paragraph({ numbering: { reference: 'bullets', level: 0 }, spacing: { before: 60, after: 60 }, children: [new TextRun({ text: t, font: { name: 'Microsoft YaHei' }, size: 24 })] })),

      h2('3.4 加载速度'),
      tableRow(['优化项', '实现方式']),
      tableRow(['DNS 预连接', '<link rel="preconnect"> + dns-prefetch']),
      tableRow(['图片懒加载', '全部 <img loading="lazy">']),
      tableRow(['CSS/JS 内联', '主站 CSS + JS 内联，零外部文件请求']),
      tableRow(['无框架依赖', '纯原生代码']),
      tableRow(['首屏体积', '主站 HTML ~110KB，GSAP CDN 并行加载']),
      p('[截图待补充：Lighthouse 评分]'),

      // ====== 4. FEATURES ======
      h1('4. 功能实现'),
      h2('4.1 核心功能'),
      h3('4.1.1 登录/注册系统'),
      ...[
        '用户名 + 密码注册，数据存入 localStorage',
        '登录态通过 localStorage.loggedInUser 持久化，页面刷新不丢失',
        '未登录时预订按钮提示"请先登录"',
        '登录后在个人中心查看所有预订记录'
      ].map(t => new Paragraph({ numbering: { reference: 'bullets', level: 0 }, spacing: { before: 60, after: 60 }, children: [new TextRun({ text: t, font: { name: 'Microsoft YaHei' }, size: 24 })] })),
      imgNarrow(6, 3000),

      h3('4.1.2 搜索功能'),
      p('启动页右上角毛玻璃搜索栏，输入关键词后滚动到目的地区域，支持回车触发搜索，focus 时 GSAP 动画扩展宽度 + 背景提亮。'),
      imgNarrow(7, 3000),

      h3('4.1.3 目的地浏览'),
      p('6 个热门目的地卡片（含主站）+ 20 个目的地（子页面）。点击卡片进入详情弹窗（景点列表 + 旅行贴士 + 预算参考）。子页面支持区域筛选标签（全部/亚洲/欧洲/美洲/大洋洲）和排序标签。'),
      img(8, 5400),

      h3('4.1.4 酒店/机票/租车查询'),
      p('三组数据各 20 条，支持筛选（酒店按地点、机票按出发/到达、租车按车型），标签云风格筛选，排序 + 每页 6 条分页，预订按钮带登录检查。'),
      img(9, 5400),

      h3('4.1.5 预订管理'),
      p('预订中心：表单提交（目的地、姓名、日期、人数、邮箱），表单验证（空值检查 + 日期逻辑 + 邮箱格式 + 人数范围），预订成功后弹窗确认，侧边栏徽章实时更新。'),
      imgNarrow(10, 3200),

      h3('4.1.6 攻略页面'),
      p('6 篇旅行攻略（签证、最佳时间、行李清单、交通、美食、安全），每篇含 4 个子章节，点击进入详情弹窗。'),
      img(11, 5400),

      h2('4.2 交互体验'),
      ...[
        '导航进度条：全局 3px 进度条，GSAP 驱动',
        '弹窗过渡：入场 back.out(1.4) 弹性回弹，退场 power2.in 快速消失',
        '卡片滚动入场：GSAP ScrollTrigger 驱动，toggleActions: \'play none none reverse\'',
        '启动页入场序列：GSAP Timeline 编排，地球弹出 → 标题淡入 → 数据滚动 → 按钮弹入',
        '搜索框交互：focus 时毛玻璃背景提亮 + 输入框宽度 GSAP 动画扩展',
        'Toast 提示：弹性入场 + 2.5s 后自动消失'
      ].map(t => new Paragraph({ numbering: { reference: 'bullets', level: 0 }, spacing: { before: 60, after: 60 }, children: [new TextRun({ text: t, font: { name: 'Microsoft YaHei' }, size: 24 })] })),

      h2('4.3 错误处理'),
      ...[
        '空状态：无数据时显示引导提示',
        '表单验证：实时错误提示，红色边框 + 错误信息',
        '登录拦截：未登录时弹出"请先登录"Toast',
        '图片加载失败：alt 属性兜底'
      ].map(t => new Paragraph({ numbering: { reference: 'bullets', level: 0 }, spacing: { before: 60, after: 60 }, children: [new TextRun({ text: t, font: { name: 'Microsoft YaHei' }, size: 24 })] })),
      imgNarrow(3, 3200),

      h2('4.4 代码规范'),
      ...[
        '语义化 HTML5 标签（<aside> <nav> <main> <section> <footer>）',
        'CSS 分区块注释（Reset → Sidebar → Splash → Cards → Overlays → Responsive）',
        'JS 分模块注释（Splash → Search → Data → Overlay → Booking → Login → Animations）',
        '按钮添加 aria-label 无障碍标注',
        '所有图片有 alt 属性',
        '表现与结构分离——搜索框定位从内联 style 迁移到 CSS'
      ].map(t => new Paragraph({ numbering: { reference: 'bullets', level: 0 }, spacing: { before: 60, after: 60 }, children: [new TextRun({ text: t, font: { name: 'Microsoft YaHei' }, size: 24 })] })),

      // ====== 5. CONTENT ======
      h1('5. 内容质量'),
      h2('5.1 内容准确性'),
      p('目的地数据基于真实热门旅游城市信息（巴黎、马尔代夫、东京、冰岛、巴厘岛、纽约等 20 个）。酒店/机票/租车数据参考市场价格区间。攻略内容覆盖签证、季节、行李、交通、美食、安全六大真实旅行场景。'),

      h2('5.2 内容丰富性'),
      tableRow(['内容模块', '数量', '覆盖范围']),
      tableRow(['目的地', '20 个', '亚洲/欧洲/美洲/大洋洲']),
      tableRow(['酒店', '20 家', '10 个国家/地区']),
      tableRow(['机票', '20 条航线', '北上广蓉港出发，覆盖全球 17 个目的地']),
      tableRow(['租车', '20 款车型', '经济型/SUV/豪华/电动/MPV/个性小车']),
      tableRow(['攻略', '6 篇 24 节', '签证→交通→美食→安全全流程']),

      h2('5.3 内容更新机制'),
      p('网站通过后台管理页面（admin.html）实现内容的实时增删改查。'),

      // ====== 6. ARCHITECTURE ======
      h1('6. 技术架构'),
      h2('6.1 项目文件结构'),
      p('旅游网站/'),
      p('├── index.html          # 首页（含粒子启动页+全部功能模块）'),
      p('├── search.html         # 分类查询子页'),
      p('├── admin.html          # 后台管理系统'),
      p('└── docs/               # 文档与设计说明书'),

      h2('6.2 数据流向'),
      p('用户操作 → JavaScript 事件处理 → DOM 更新 → localStorage 读写 → 页面状态同步'),

      h2('6.3 动画系统架构'),
      p('GSAP Timeline（启动页入场编排）: globeIn scale(0→1) → titleIn y(40→0) → counters → buttonIn'),
      p('GSAP ScrollTrigger（卡片滚动入场）: .card-grid children y(40→0) stagger(0.08)'),
      p('GSAP overlay helpers: openOverlay() back.out(1.4) / closeOverlay() power2.in'),

      // ====== 7. PAGE STRUCTURE ======
      h1('7. 页面结构'),
      h2('7.1 首页（index.html）'),
      p('启动页(100vh) → 快捷服务(4卡片) → 热门目的地(20卡片) → 精选酒店 → 特价机票 → 全球租车 → 旅行攻略(6卡片) → Footer'),
      p('侧边栏：260px 固定定位，含 Logo、导航菜单、登录入口，手机端折叠为 60px 图标模式。'),

      h2('7.2 分类子页（search.html）'),
      p('顶栏（返回链接 + 标题）→ 筛选标签云 → 排序标签[最新|最热|推荐] → 卡片网格（每页6条）→ 分页导航'),

      h2('7.3 弹窗层'),
      p('目的地详情 / 酒店机票租车详情 / 预订中心 / 个人中心 / 登录注册 —— 共 5 类弹窗，统一使用 GSAP 驱动的 openOverlay/closeOverlay 管理。'),

      // ====== 8. ADMIN ======
      h1('8. 后台管理系统'),
      h2('8.1 系统概述'),
      p('独立的管理后台页面（admin.html），用于管理网站全部数据。登录账号：admin / admin123。'),
      img(4, 5400),

      h2('8.2 功能模块'),
      tableRow(['模块', '功能']),
      tableRow(['仪表盘', '6 统计卡片 + 最近预订列表']),
      tableRow(['目的地管理', '增删改查（名称/区域/评分/描述）']),
      tableRow(['酒店管理', '增删改查（名称/地点/价格/评分）']),
      tableRow(['机票管理', '增删改查（出发/到达/价格/航司/直飞标识）']),
      tableRow(['租车管理', '增删改查（名称/类型/价格/座位数）']),
      tableRow(['预订管理', '查看所有预订，支持删除']),
      tableRow(['用户管理', '查看注册用户，支持删除']),

      // ====== APPENDIX ======
      h1('附录'),
      h2('A. 浏览器兼容性'),
      tableRow(['浏览器', '支持版本']),
      tableRow(['Chrome', '90+']),
      tableRow(['Edge', '90+']),
      tableRow(['Firefox', '88+']),
      tableRow(['Safari', '14+']),
      tableRow(['移动端 Chrome', '90+']),
      tableRow(['移动端 Safari', '14+']),

      h2('B. 第三方资源'),
      tableRow(['资源', '来源', '用途']),
      tableRow(['GSAP 3.12.5', 'cdnjs.cloudflare.com', '动画引擎']),
      tableRow(['Playfair Display', 'fonts.googleapis.com', '标题字体']),
      tableRow(['图片', 'picsum.photos', '占位图']),
    ]
  }]
});

const outPath = path.join(__dirname, 'docs', '网站设计说明书.docx');
Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(outPath, buffer);
  console.log('Done!', outPath, 'Size:', (buffer.length / 1024).toFixed(0), 'KB');
});
