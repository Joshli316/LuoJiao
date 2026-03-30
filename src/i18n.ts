export type Lang = 'en' | 'zh';

const strings: Record<string, Record<Lang, string>> = {
  // App chrome
  'app.title': { en: 'LuoJiao', zh: '落脚' },
  'app.subtitle': { en: 'Find where you belong in LA', zh: '在洛杉矶找到属于你的地方' },
  'app.tagline': { en: 'Cultural navigation for Chinese students', zh: '留学生文化导航' },

  // Categories
  'cat.food': { en: 'Food', zh: '美食' },
  'cat.services': { en: 'Services', zh: '服务' },
  'cat.spiritual': { en: 'Spiritual', zh: '信仰' },
  'cat.fun': { en: 'Fun', zh: '娱乐' },
  'cat.academic': { en: 'Academic', zh: '学术' },

  // Need stages
  'stage.just_arrived': { en: 'Just Arrived', zh: '刚到' },
  'stage.settling_in': { en: 'Settling In', zh: '安顿中' },
  'stage.living_here': { en: 'Living Here', zh: '生活中' },
  'stage.working_here': { en: 'Working Here', zh: '工作中' },

  // Zones
  'zone.SGV': { en: 'SGV / Monterey Park', zh: '圣谷 / 蒙市' },
  'zone.USC': { en: 'USC / University Park', zh: 'USC / 大学城' },
  'zone.DTLA': { en: 'Downtown LA', zh: '洛杉矶市中心' },

  // Filters
  'filter.category': { en: 'Category', zh: '类别' },
  'filter.stage': { en: 'Need Stage', zh: '阶段' },
  'filter.language': { en: 'Language', zh: '语言' },
  'filter.zone': { en: 'Zone', zh: '区域' },
  'filter.search': { en: 'Search places...', zh: '搜索地点...' },
  'filter.clear': { en: 'Clear all', zh: '清除筛选' },
  'filter.no_results': { en: 'No places match these filters. Try removing a filter.', zh: '没有匹配的地点，试试移除一个筛选条件。' },

  // Languages
  'lang.Mandarin': { en: 'Mandarin', zh: '普通话' },
  'lang.Cantonese': { en: 'Cantonese', zh: '粤语' },
  'lang.English': { en: 'English', zh: '英语' },
  'lang.Bilingual': { en: 'Bilingual', zh: '双语' },

  // Sidebar
  'sidebar.languages': { en: 'Languages', zh: '语言' },
  'sidebar.transit': { en: 'Transit', zh: '交通' },
  'sidebar.transit_yes': { en: 'Transit accessible', zh: '可乘公交到达' },
  'sidebar.transit_no': { en: 'Not easily reached by transit', zh: '公交不便' },
  'sidebar.nearest_transit': { en: 'Nearest', zh: '最近站点' },
  'sidebar.verified': { en: 'Last verified', zh: '最近验证' },
  'sidebar.flag': { en: 'Is this still open?', zh: '这里还开着吗？' },
  'sidebar.flagged': { en: 'Thanks for the report!', zh: '感谢反馈！' },
  'sidebar.directions': { en: 'Get Directions', zh: '导航' },
  'sidebar.close': { en: 'Close', zh: '关闭' },

  // Onboarding
  'onboard.welcome_title': { en: 'Just arrived in LA?', zh: '刚到洛杉矶？' },
  'onboard.welcome_sub': { en: 'Let us help you find your feet in the first 72 hours.', zh: '让我们帮你在头72小时站稳脚跟。' },
  'onboard.start': { en: 'Start Guide', zh: '开始引导' },
  'onboard.skip': { en: 'Skip, explore map', zh: '跳过，直接看地图' },
  'onboard.next': { en: 'Next', zh: '下一步' },
  'onboard.prev': { en: 'Back', zh: '上一步' },
  'onboard.finish': { en: 'Explore Full Map', zh: '探索完整地图' },
  'onboard.reenter': { en: 'First 72 Hours', zh: '头72小时' },
  'onboard.step_grocery': { en: 'Get Groceries', zh: '买菜购物' },
  'onboard.step_grocery_desc': { en: 'Stock up on familiar ingredients and snacks from home.', zh: '囤一些家乡的食材和零食。' },
  'onboard.step_sim': { en: 'Get a SIM Card', zh: '办手机卡' },
  'onboard.step_sim_desc': { en: 'Get connected — you\'ll need a US number for everything.', zh: '办一张美国手机卡，生活处处需要。' },
  'onboard.step_bank': { en: 'Open a Bank Account', zh: '开银行账户' },
  'onboard.step_bank_desc': { en: 'A local bank account makes life much easier.', zh: '有了本地银行账户，生活方便很多。' },
  'onboard.step_food': { en: 'Find Comfort Food', zh: '找家乡味' },
  'onboard.step_food_desc': { en: 'Homesick? These spots serve food that tastes like home.', zh: '想家了？这些地方有家的味道。' },
  'onboard.step_transit': { en: 'Learn Transit', zh: '了解交通' },
  'onboard.step_transit_desc': { en: 'Key bus and metro lines connecting Chinese neighborhoods.', zh: '连接华人社区的主要公交和地铁线路。' },

  // Corridors
  'corridor.toggle': { en: 'Transit Lines', zh: '公交线路' },

  // Footer
  'footer.privacy': { en: 'No accounts. No tracking. We don\'t collect your data.', zh: '无需注册。不追踪。我们不收集任何数据。' },

  // Print
  'print.title': { en: 'First 72 Hours Checklist', zh: '头72小时清单' },
  'print.btn': { en: 'Print Checklist', zh: '打印清单' },
};

let currentLang: Lang = (localStorage.getItem('luojiao-lang') as Lang) || 'zh';

export function t(key: string): string {
  const entry = strings[key];
  if (!entry) return key;
  return entry[currentLang] || entry['en'] || key;
}

export function getLang(): Lang {
  return currentLang;
}

export function setLang(lang: Lang): void {
  currentLang = lang;
  localStorage.setItem('luojiao-lang', lang);
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n')!;
    if (el instanceof HTMLInputElement) {
      el.placeholder = t(key);
    } else {
      el.textContent = t(key);
    }
  });
  // Dispatch custom event for components that need to re-render
  window.dispatchEvent(new CustomEvent('lang-change', { detail: { lang } }));
}

export function toggleLang(): void {
  setLang(currentLang === 'en' ? 'zh' : 'en');
}
