import { NPC } from '../types';

const FIRST_NAMES = ['阿龙', '体育生小明', '大叔老王', '教练浩子', '男模K', '学弟小白', '总裁A', '程序员小张', '混血帅哥', '黑皮寸头', '网约车司机', '网黄博主'];
const BODY_TYPES = ['健壮', '野兽', '少年', '爹味', '精瘦', '胖熊', '壮熊', '排骨', '双开门'];
export const KINKS = ['BDSM-主', 'BDSM-奴', '纯爱', '狂野粗暴', '内射狂魔', '道具爱好者', '字母圈S', '字母圈M', '冰火两重天', '窒息边缘', '贞操锁控制(Chastity)', '黄金雨(Piss Play)', '群体派对', '露出暴露', '深喉训练', '原味内衣(Underwear)', '打屁股(Spanking)', '束缚(Bondage)', '穿孔(Piercings)', '小狗调教(Pup Play)', '恋足(Feet)', '白袜(Socks)', '眼罩蒙眼(Blindfold)'];

const R_FLAGS = [
  { text: "他床头柜上散落着几粒蓝紫色的不明药片，看起来不像是普通的维生素。", risk: 1.5 },
  { text: "你在他卫生间的垃圾桶里瞥见了带血污的纸巾，甚至空气中还有股浓烈的劣质消毒水味道。", risk: 2.0 },
  { text: "脱衣服时你发现他脖子边缘和后背似乎有几处刚结痂的暗红色疱疹。", risk: 2.5 },
  { text: "电脑桌上大喇喇地放着一盒拆封的 PEP (HIV阻断药)...虽然在吃药，但这也太吓人了。", risk: 1.2 },
  { text: "房间里非常整洁，空气中弥漫着淡淡的祖马龙香水味，床单也散发着阳光晒过的气息，没有发现明显异样。", risk: 0.8 },
  { text: "墙角堆着成箱的润滑液和各种用过的重口味刑具，墙上还挂着手铐，空气里有股糜烂发酵的味道。", risk: 1.8 }
];

export function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

export function generateRandomNpc(): NPC {
  const name = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const body = BODY_TYPES[Math.floor(Math.random() * BODY_TYPES.length)];
  
  // 长度有大有小，5-23 cm
  const length = 5 + Math.floor(Math.random() * 19); 
  // 硬度 2-10 包含起不来的情况
  const hardness = 2 + Math.floor(Math.random() * 9); 
  
  const cutStatus = Math.random() > 0.4 ? 'cut' : 'uncut';
  
  const tagsCount = Math.random() > 0.6 ? 2 : 1;
  const tags = [];
  for (let i=0; i<tagsCount; i++) {
    tags.push(KINKS[Math.floor(Math.random() * KINKS.length)]);
  }
  const uniqueTags = [...new Set(tags)];

  const charm = 40 + Math.floor(Math.random() * 60);

  const flag = R_FLAGS[Math.floor(Math.random() * R_FLAGS.length)];

  let desc = `一个身形 ${body} 的圈内熟客。面板自报数据：颜值 ${charm}/100，长度 ${length}cm，硬度 ${hardness}/10，前端状态：${cutStatus === 'cut' ? '干净利落已割' : '原生态野生湿润'}。他的特殊偏好标签是：[${uniqueTags.join(', ')}]。`;

  if (length < 10) desc += "\n（不过照片里透视感极强，角度极其刻意，实物尺寸相当堪忧。）";
  if (hardness < 6) desc += "\n（他的主页文字隐晦地透露出自己有点ED，可能会临阵疲软。）";

  return {
    id: generateId(),
    name: `${body}的${name}`,
    charm,
    length,
    hardness,
    cutStatus,
    tags: uniqueTags,
    relation: 0,
    description: desc,
    sceneDetail: flag.text,
    riskMultiplier: flag.risk
  };
}
