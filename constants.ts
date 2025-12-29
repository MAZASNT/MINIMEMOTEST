import { TarotCard, SpreadDefinition, DeckTheme } from './types';

// Simplified Major Arcana
export const MAJOR_ARCANA: Omit<TarotCard, 'isReversed'>[] = [
  { id: 0, name: "The Fool", name_cn: "愚者", archetype: "新的开始", meaningUpright: "新的开始、纯真、自发性", meaningReversed: "鲁莽、冒险" },
  { id: 1, name: "The Magician", name_cn: "魔术师", archetype: "显化", meaningUpright: "显化、足智多谋、力量", meaningReversed: "操纵、计划不周" },
  { id: 2, name: "The High Priestess", name_cn: "女祭司", archetype: "直觉", meaningUpright: "直觉、神圣知识、潜意识", meaningReversed: "秘密、与直觉断联" },
  { id: 3, name: "The Empress", name_cn: "皇后", archetype: "丰饶", meaningUpright: "女性特质、美丽、自然、养育", meaningReversed: "创造力受阻、依赖" },
  { id: 4, name: "The Emperor", name_cn: "皇帝", archetype: "权威", meaningUpright: "权威、体制、结构", meaningReversed: "支配、过度控制" },
  { id: 5, name: "The Hierophant", name_cn: "教皇", archetype: "传统", meaningUpright: "精神智慧、宗教信仰、从众", meaningReversed: "个人信仰、自由、挑战现状" },
  { id: 6, name: "The Lovers", name_cn: "恋人", archetype: "爱", meaningUpright: "爱、和谐、关系、价值观一致", meaningReversed: "自爱、不和谐、失衡" },
  { id: 7, name: "The Chariot", name_cn: "战车", archetype: "意志力", meaningUpright: "控制、意志力、成功、行动", meaningReversed: "自律、反对、缺乏方向" },
  { id: 8, name: "Strength", name_cn: "力量", archetype: "勇气", meaningUpright: "力量、勇气、说服力、影响力", meaningReversed: "内在力量、自我怀疑、低能量" },
  { id: 9, name: "The Hermit", name_cn: "隐士", archetype: "内省", meaningUpright: "灵魂探索、内省、独处", meaningReversed: "孤立、孤独、退缩" },
  { id: 10, name: "Wheel of Fortune", name_cn: "命运之轮", archetype: "命运", meaningUpright: "好运、业力、生命周期、命运", meaningReversed: "厄运、抗拒改变" },
  { id: 11, name: "Justice", name_cn: "正义", archetype: "真相", meaningUpright: "正义、公平、真相、因果", meaningReversed: "不公、缺乏责任感" },
  { id: 12, name: "The Hanged Man", name_cn: "倒吊人", archetype: "臣服", meaningUpright: "暂停、臣服、放手、新视角", meaningReversed: "拖延、抗拒、停滞" },
  { id: 13, name: "Death", name_cn: "死神", archetype: "转化", meaningUpright: "结束、改变、转化、过渡", meaningReversed: "抗拒改变、个人转化" },
  { id: 14, name: "Temperance", name_cn: "节制", archetype: "平衡", meaningUpright: "平衡、适度、耐心、目的", meaningReversed: "失衡、过度、自我疗愈" },
  { id: 15, name: "The Devil", name_cn: "恶魔", archetype: "阴影", meaningUpright: "阴影自我、依恋、成瘾、限制", meaningReversed: "释放限制性信念、探索黑暗思想" },
  { id: 16, name: "The Tower", name_cn: "高塔", archetype: "剧变", meaningUpright: "突然改变、动荡、混乱、启示", meaningReversed: "个人转化、害怕改变" },
  { id: 17, name: "The Star", name_cn: "星星", archetype: "希望", meaningUpright: "希望、信念、目的、更新、灵性", meaningReversed: "缺乏信念、绝望、自我信任" },
  { id: 18, name: "The Moon", name_cn: "月亮", archetype: "幻觉", meaningUpright: "幻觉、恐惧、焦虑、潜意识", meaningReversed: "释放恐惧、压抑情绪" },
  { id: 19, name: "The Sun", name_cn: "太阳", archetype: "积极", meaningUpright: "积极、乐趣、温暖、成功、活力", meaningReversed: "内在小孩、情绪低落、过度乐观" },
  { id: 20, name: "Judgement", name_cn: "审判", archetype: "重生", meaningUpright: "审判、重生、内在召唤、赦免", meaningReversed: "自我怀疑、内在批评、忽视召唤" },
  { id: 21, name: "The World", name_cn: "世界", archetype: "圆满", meaningUpright: "完成、整合、成就、旅行", meaningReversed: "寻求个人了结、捷径、延误" },
];

export const SPREADS: SpreadDefinition[] = [
  {
    id: 'single',
    name: '每日指引 (单张)',
    description: '抽取一张牌，获得当下的核心指引或简单问题的答案。',
    cardCount: 1,
    positions: [
      { id: 'core', name: '核心指引', description: '问题的核心能量或直接答案', x: 0, y: 0 }
    ]
  },
  {
    id: 'three_card',
    name: '圣三角 (时间流)',
    description: '经典的过去、现在、未来牌阵，理清事情的脉络。',
    cardCount: 3,
    positions: [
      { id: 'past', name: '过去', description: '导致当前情况的过往因素', x: -1, y: 0 },
      { id: 'present', name: '现在', description: '当下的能量和状态', x: 0, y: 0 },
      { id: 'future', name: '未来', description: '按照当前趋势发展的可能结果', x: 1, y: 0 }
    ]
  },
  {
    id: 'celtic_cross',
    name: '凯尔特十字',
    description: '深入分析复杂问题的经典牌阵，涵盖内在、外在、障碍与结果。',
    cardCount: 10,
    positions: [
      { id: 'p1', name: '现状', description: '核心问题', x: -2, y: 0 },
      { id: 'p2', name: '阻碍/助力', description: '交叉的影响因素', x: -2, y: 0, rotation: 90 },
      { id: 'p3', name: '潜意识/根源', description: '事情的基础', x: -2, y: 1.2 },
      { id: 'p4', name: '过去', description: '刚发生的影响', x: -3.2, y: 0 },
      { id: 'p5', name: '表意识/目标', description: '最好的结果或目标', x: -2, y: -1.2 },
      { id: 'p6', name: '未来', description: '即将发生的事情', x: -0.8, y: 0 },
      { id: 'p7', name: '自我', description: '当事人的态度', x: 2, y: 1.5 },
      { id: 'p8', name: '环境', description: '周遭的影响', x: 2, y: 0.5 },
      { id: 'p9', name: '希望/恐惧', description: '心理预期', x: 2, y: -0.5 },
      { id: 'p10', name: '结果', description: '最终的综合结果', x: 2, y: -1.5 },
    ]
  }
];

export const DECK_THEMES: DeckTheme[] = [
  {
    id: 'classic',
    name: '经典星空',
    backColor: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
    frontStyle: 'classic'
  },
  {
    id: 'mystic_gold',
    name: '神秘金沙',
    backColor: 'linear-gradient(135deg, #451a03 0%, #78350f 100%)',
    frontStyle: 'mystic'
  },
  {
    id: 'nebula',
    name: '星云幻梦',
    backColor: 'linear-gradient(135deg, #4c1d95 0%, #db2777 100%)',
    frontStyle: 'illustration'
  }
];
