import { Ending, GameEvent, Stats } from '../types';

export const INITIAL_STATS: Stats = {
  lust: 30,
  anxiety: 10,
  euphoria: 80,
  wealth: 3000, 
  health: 100,
};

export function rollDisease(prob: number, state: any) {
  let hivProb = prob;
  if (state.hasPrEP) hivProb *= 0.05; // PrEP极大降低概率
  if (Math.random() < hivProb * 0.3 && !state.infections.includes('hiv')) {
    state.infections.push('hiv');
    return;
  }
  if (Math.random() < prob * 1.5 && !state.infections.includes('syphilis')) {
    state.infections.push('syphilis');
    return;
  }
  if (Math.random() < prob * 2.5 && !state.infections.includes('gonorrhea')) {
    state.infections.push('gonorrhea');
  }
}

export const ENDINGS: Ending[] = [
  {
    id: 'health_zero',
    title: '凄风苦雨',
    description: '你的生命体征已经彻底枯竭（健康值归零）。各种并发症摧毁了你的免疫系统，你在这个冰冷的都市角落里孤独地合上了双眼。',
    priority: 95,
    condition: (state) => state.stats.health <= 0,
  },
  {
    id: 'hospital_hiv_positive',
    title: '阳性沉沦',
    description: '在疾控中心的检测室里，医生证实了你的抗体阳性。即便这不一定会立刻死亡，但在极度的崩溃下你彻底丧失了活下去的勇气（这是你主动终结游戏）。如果积极治疗，本来是可以像普通人一样生活的。',
    priority: 100,
  },
  {
    id: 'mental_breakdown',
    title: '精神崩溃',
    description: '压力和罪恶感突破了你的承受极限（压力≥100）。你每天都在度日如年、疑神疑鬼，最终在一场深夜的幻觉中彻底崩溃，被送进了卫生中心。',
    priority: 90,
    condition: (state) => state.stats.anxiety >= 100,
  },
  {
    id: 'zero_euphoria',
    title: '生无可恋',
    description: '欣快度降至冰点（欣快度≤0）。长期的空虚、职场的压榨与极度的缺爱抽干了你的生命力，你在一个无人的深夜选择了平静地离开。',
    priority: 90,
    condition: (state) => state.stats.euphoria <= 0,
  },
  {
    id: 'bankrupt',
    title: '流落街头',
    description: '资金枯竭。在这个充满诱惑又冰冷的城市，没钱寸步难行，甚至连医院都去不起。你只能收拾行李黯然返乡。',
    priority: 80,
    condition: (state) => state.stats.wealth < 0,
  },
  {
    id: 'relationship_broken_caught',
    title: '捉奸在床 / 身败名裂',
    description: '你在外面的滥交被伴侣当场抓获。在极度的愤怒与失望中，你们曾经构建的温存瞬间崩塌。在这个快餐式的圈子里，也许你注定无法拥有一段长久稳定的感情。',
    priority: 70,
  },
  {
    id: 'relationship_broken_affection',
    title: '感情破裂 / 分道扬镳',
    description: '你们的感情数值降至冰点。长期的冷暴力、争吵与貌合神离，终于让他绝望地收拾行李离开了这个曾经被称为“家”的地方。你再次成为这个城市里孤独漂泊的孤魂野鬼。',
    priority: 75,
  }
];

export const EVENTS: GameEvent[] = [
  {
    id: 'hospital_enter',
    text: '你来到了市传染病医院/疾控中心。走廊上弥漫着刺鼻的消毒水味，长椅上坐着形形色色神情凝重的人。',
    choices: [
      {
        text: (state) => `【全套STD检测】（￥500）排除所有隐患`,
        condition: (state) => state.stats.wealth >= 500,
        nextEventId: null,
        effect: (state) => {
          state.stats.wealth -= 500;
          if (state.infections.length > 0) {
             if (state.infections.includes('hiv')) {
                 // 发现HIV直接崩溃游戏结束
                 state.isGameOver = true;
                 state.endingId = 'hospital_hiv_positive';
             } else {
                 // 发现其他可治愈疾病
                 let treatCost = 0;
                 const msgs = [];
                 if (state.infections.includes('syphilis')) treatCost += 1500, msgs.push('梅毒');
                 if (state.infections.includes('gonorrhea')) treatCost += 800, msgs.push('淋病');
                 
                 state.logs.push({ id: Date.now().toString(), text: `【确诊】化验结果显示你感染了 ${msgs.join('、')}。需要支付 ￥${treatCost} 的治疗费。`, type: 'warning' });
                 if (state.stats.wealth >= treatCost) {
                     state.stats.wealth -= treatCost;
                     state.infections = state.infections.filter((i: string) => i === 'hiv'); // 清楚治愈掉的
                     state.logs.push({ id: Date.now().toString() + '1', text: `【治愈】你咬牙支付了治疗费，经过一个疗程的痛苦折磨，终于康复。你发誓再也不乱玩了。（-$${treatCost}）健康稍有恢复。`, type: 'effect' });
                     state.stats.anxiety += 20; // 吓坏了
                     state.stats.health += 20; // 治愈后健康恢复点
                 } else {
                     state.logs.push({ id: Date.now().toString() + '2', text: `【没钱治病】你连治疗费都交不起。只能拿着化验单失魂落魄地走在大街上，任由病毒侵蚀你的身体。`, type: 'warning' });
                     state.stats.anxiety += 50;
                 }
             }
          } else {
            state.stats.anxiety -= 40;
            if (state.stats.anxiety < 0) state.stats.anxiety = 0;
            state.stats.euphoria += 15;
            state.logs.push({ id: Date.now().toString(), text: '【结果通知】全套化验结果：全阴！你在医院门口喜极而泣，那种重获新生的感觉让你欣快度大增。', type: 'story' });
          }
        }
      },
      {
        text: '【肛肠外科看诊】（￥2000）治疗下体严重撕裂',
        condition: (state) => state.hasFissure && state.stats.wealth >= 2000,
        nextEventId: null,
        effect: (state) => {
          state.stats.wealth -= 2000;
          state.hasFissure = false;
          state.stats.anxiety -= 20;
          state.logs.push({ id: Date.now().toString() + '2', text: '【手术治疗】医生对你的肛裂进行了缝合治疗。在极度的羞耻和疼痛中，你发誓再也不玩那么大了。', type: 'story' });
        }
      },
      {
        text: '【开具PrEP处方】（￥1500包月）每日一粒，极大降低暴露风险',
        condition: (state) => !state.hasPrEP && state.stats.wealth >= 1500,
        nextEventId: null,
        effect: (state) => {
          state.stats.wealth -= 1500;
          state.hasPrEP = true;
          state.stats.anxiety -= 30; // 获得极大的心理安慰
          state.logs.push({ id: Date.now().toString() + '3', text: '你拿到了PrEP药瓶。这颗蓝色的小药丸将成为你在这个欲望都市里最坚实的心理防线。', type: 'story' });
        }
      },
      { text: '（觉得太贵/挂不上号）离开医院。', nextEventId: null }
    ]
  },
  {
    id: 'relationship_home',
    text: '你回到与伴侣同居的家中。这个温馨的避风港似乎暂时屏蔽了外面都市的喧嚣与诱惑。',
    choices: [
      {
        text: '【甜蜜约会】精心准备一顿烛光晚餐，陪伴他度过浪漫的夜晚。',
        nextEventId: null,
        effect: (state) => {
          state.stats.lust -= 40;
          state.stats.anxiety -= 30;
          state.stats.euphoria += 20;
          if (state.partnerAffection !== null) state.partnerAffection += 15;
          if (state.partnerAffection && state.partnerAffection > 100) state.partnerAffection = 100;
          state.logs.push({ id: Date.now().toString() + 'r1', text: '温暖的灯光下，他看着你的眼神充满爱意。你们紧紧相拥，这一刻，外面的花花世界仿佛都变得不再重要。', type: 'story' });
        }
      },
      {
        text: '【日常陪伴】窝在沙发上一起看部老电影。',
        nextEventId: null,
        effect: (state) => {
          state.stats.lust -= 30;
          state.stats.anxiety -= 20;
          state.stats.euphoria += 10;
          if (state.partnerAffection !== null) state.partnerAffection += 5;
          if (state.partnerAffection && state.partnerAffection > 100) state.partnerAffection = 100;

          if (Math.random() < 0.2) {
             state.logs.push({ id: Date.now().toString() + 'r2', text: '【惊险】伴侣突然拿起你的手机想看电影票，你惊出一身冷汗，想起了那个刚聊骚完还没滑掉的交友软件后台...幸好他很快就放下了。', type: 'warning' });
             state.stats.anxiety += 25;
             if (state.partnerAffection !== null) state.partnerAffection -= 5;
          } else {
             state.logs.push({ id: Date.now().toString() + 'r3', text: '平平淡淡的居家时光，你们在沙发上依偎着入睡。', type: 'story' });
          }
        }
      },
      {
        text: '【冷暴力】借口工作太累，洗完澡直接把自己锁在书房里。',
        nextEventId: null,
        effect: (state) => {
          state.stats.lust -= 10;
          state.stats.anxiety -= 5;
          if (state.partnerAffection !== null) state.partnerAffection -= 20;
          state.logs.push({ id: Date.now().toString() + 'r4', text: '你在书房里百无聊赖，听着门外他默默打扫卫生的声音，心里隐隐有些烦躁。你只觉得伴侣越来越无趣，便打开交友软件刷了几下缓解思绪。', type: 'story' });
        }
      },
      {
        text: '【坦白局】尝试和伴侣谈谈开放式关系(Open Relationship)...',
        condition: (state) => (state.partnerAffection ?? 0) >= 60,
        nextEventId: null,
        effect: (state) => {
          if (Math.random() < 0.7) { 
             state.logs.push({ id: Date.now().toString() + 'r5', text: '【大吵一架】他极度抗拒且难以置信：“你到底把我当什么？！你是不是在外面有人了？！”你们爆发了激烈的争吵。', type: 'warning' });
             state.stats.anxiety += 40;
             state.stats.euphoria -= 30;
             if (state.partnerAffection !== null) state.partnerAffection -= 40;
          } else {
             state.logs.push({ id: Date.now().toString() + 'r6', text: '【互相试探】令人意外的是，他沉默良久后叹了口气：“其实在这个圈子里，我也明白很难一生一世一双人。既然你提了，也许我们可以定一些规则...”', type: 'story' });
             state.stats.anxiety -= 40;
             state.stats.euphoria += 50;
             if (state.partnerAffection !== null) state.partnerAffection -= 10;
          }
        }
      }
    ]
  },
  // --- Dating App Flow ---
  {
    id: 'app_match',
    text: (state) => {
      const npc = state.npcs[state.currentNpcId || ''];
      if (!npc) return '匹配异常...';
      const isTop = state.playerRole === 'top';
      const isBottom = state.playerRole === 'bottom';
      
      const pFetish = state.playerProfile?.fetishes || [];
      const commonFetishes = pFetish.filter(x => npc.tags.includes(x));
      const hasCommon = commonFetishes.length > 0;
      
      let detailMsg = isTop ? '想看你在我身下喘息的样子 / 让我好好服侍你' : '想看你被我玩坏的样子 / 让我好好操你';
      if (hasCommon) {
         detailMsg = `正好我们都喜欢【${commonFetishes.join(',')}】，我准备了相应的道具，直接过来玩场大的？`;
      } else if (npc.tags.includes('群体派对')) {
         detailMsg = `我这里还有几个身材极品的圈内朋友在办派对，要不要过来一起群P狂欢？肉海绝对满足你。`;
      }
      
      let relationshipWarning = state.partnerId ? "\n\n【道德预警】你目前处于一段稳定的恋爱关系中。这次赴约将属于严重出轨，一旦败露后果不堪设想..." : "";

      return `📱 在无尽的左滑右滑中，你匹配到了【${npc.name}】。\n\n${npc.description}\n\n他在软件上主动发来露骨的消息：“正好一个人在家，可以直接过来？${detailMsg}”${relationshipWarning}`;
    },
    choices: [
      { text: '（被冲动冲昏头脑）这条件太辣了，去他家！', nextEventId: 'app_meet' },
      { text: '（仔细端详照片）总觉得透着一股诡异，保险起见，划走。', nextEventId: null, effect: (state) => {
        state.stats.anxiety -= 5;
        state.stats.lust += 5; // 得不到的躁动
        state.currentNpcId = null;
      } },
      { 
        text: '（想到自己的伴侣）不，我不能做对不起他的事。拉黑！', 
        nextEventId: null, 
        condition: (state) => state.partnerId !== null,
        effect: (state) => {
          state.stats.anxiety -= 15;
          state.stats.euphoria += 10; 
          if (state.partnerAffection !== null) state.partnerAffection += 5; // 忠诚带来感情的稳固
          if (state.partnerAffection && state.partnerAffection > 100) state.partnerAffection = 100;
          state.currentNpcId = null;
        } 
      }
    ]
  },
  {
    id: 'app_meet',
    text: (state) => {
      const npc = state.npcs[state.currentNpcId || ''];
      const isTop = state.playerRole === 'top';
      let extra = '';
      
      if (npc.tags.includes('群体派对')) {
         extra = `房间里弥漫着催情香薰和汗液的味道，大床上交叠着三四个赤裸雄性，极其淫乱不堪。伴随着此起彼伏的喘息，他们看到你进来，贪婪地将你拉入人堆中心开始围攻。`;
      } else if (npc.tags.includes('原味内衣(Underwear)') || npc.tags.includes('白袜(Socks)') || npc.tags.includes('恋足(Feet)')) {
         extra = `门一开，他居然穿着一身运动装配着白袜和紧身内裤。他直接把脚伸向你的脸挑逗：“先帮我把汗湿的白袜脱了，好好舔干净我的脚和原味内裤，再奖励你别的……”`;
      } else if (npc.tags.includes('打屁股(Spanking)') || npc.tags.includes('束缚(Bondage)') || npc.tags.includes('眼罩蒙眼(Blindfold)')) {
         extra = `一进门他就甩给你一个黑色的皮质眼罩，将你推到墙角双手反绑，冰凉的皮拍突然重重地甩在你的臀部，清脆的响声伴随着剧痛和耻辱感，却让你的后穴不由自主地收缩渗水。`;
      } else if (npc.tags.includes('小狗调教(Pup Play)') || npc.tags.includes('穿孔(Piercings)')) {
         extra = `他戴着全包式的橡胶狗头套，乳头和下体都嵌着金属穿孔。他像一条发情的野兽般四肢着地爬向你，发出呜咽声，用带刺的下体狂热地蹭着你的大腿。`;
      } else if (npc.tags.includes('贞操锁控制(Chastity)')) {
         extra = `他打开门，宽大的睡袍下半身竟套着一个金属贞操锁。他跪在地上双手捧着钥匙：“主人，我已经憋了整整一个月，求你帮我解开吧……”`;
      } else if (npc.tags.includes('黄金雨(Piss Play)')) {
         extra = isTop ? `一进门他就迫不及待地跪在浴室地垫上祈求：“求你惩罚我...我想被你的黄金雨完全弄脏...”` : `一进门他就把你拽进浴室地垫上：“乖，别出声。我想在你身上撒尿，看你被我完全弄脏的样子……”空气中充满腥臊味。`;
      } else if (npc.tags.some(t => t.includes('BDSM') || t.includes('S') || t.includes('窒息'))) {
         extra = isTop ? `你爆发出极强的进攻性，用皮带猛捆住他的手腕按在墙上，让他感到了令人恐惧又极度兴奋的压迫感。` : `他一上来就爆发出极强的进攻性，马鞭抵在你的咽喉，甚至用手死死掐住你的脖子直至你濒临窒息。`;
      } else {
         extra = `门一关，他毫不废话地脱去衣服。实际尺寸暴露无遗：${npc.length}cm！硬度 ${npc.hardness}/10！颜值 ${npc.charm}/100！`;
         if (npc.length < 10 && npc.hardness < 5) extra += ` 你倒吸一口凉气，这甚至比口红大不了多少，还软趴趴像条死虫子，简直是诈骗！`;
      }

      return `你来到他所在的屋子。\n\n${extra}\n\n你余光一瞥，突然发现屋角：【 ${npc.sceneDetail} 】`;
    },
    choices: [
      { 
        text: (state) => state.playerRole === 'top' ? '底线不能破！套上安全伞进行惩戒！' : '底线不能破！不管多刺激必须戴套。', 
        nextEventId: 'app_end', 
        condition: (state) => {
          const npc = state.npcs[state.currentNpcId || ''];
          return (npc.length >= 8 && npc.hardness >= 5) || npc.tags.length > 0; 
        },
        effect: (state) => {
          const npc = state.npcs[state.currentNpcId || ''];
          let eBonus = npc.charm > 80 ? 25 : 15;
          if (npc.length > 16) eBonus += 15; // 巨根加成
          
          const pFetish = state.playerProfile?.fetishes || [];
          const hasCommon = pFetish.some(x => npc.tags.includes(x));
          if (hasCommon) eBonus += 30; // 共同性癖满足度大增

          state.stats.lust -= 60;
          state.stats.anxiety -= 15; 
          
          if (state.partnerId) {
             state.stats.anxiety += 25; // 出轨的负罪感
             if (state.partnerAffection !== null) state.partnerAffection -= 15;
          }
          
          // 如果对方是大屌且自己是承受者，概率触发肛裂
          if (state.playerRole !== 'top' && npc.length >= 19 && Math.random() < 0.2) {
             state.hasFissure = true;
          }

          state.stats.euphoria += eBonus;
        }
      },
      { 
        text: (state) => state.playerRole === 'top' ? '【完全丧失理智】不管了！直接无套疯狂内射！' : '【完全丧失理智】不管了！直接无套肉搏！被贯穿！', 
        nextEventId: 'app_end', 
        condition: (state) => {
          const npc = state.npcs[state.currentNpcId || ''];
          return (npc.length >= 8 && npc.hardness >= 5) || npc.tags.length > 0;
        },
        effect: (state) => {
          const npc = state.npcs[state.currentNpcId || ''];
          let eBonus = npc.charm > 80 ? 40 : 25;
          if (npc.length > 16) eBonus += 25; 
          
          const pFetish = state.playerProfile?.fetishes || [];
          const hasCommon = pFetish.some(x => npc.tags.includes(x));
          if (hasCommon) eBonus += 40; 
          
          if (npc.tags.some(t => t.includes('黄金雨') || t.includes('贞操锁') || t.includes('BDSM'))) {
             eBonus += 20; 
          }

          state.stats.lust -= 100;
          state.stats.anxiety += 60; // 无套后遗症压力剧增
          
          if (state.partnerId) {
             state.stats.anxiety += 40; // 出轨无套，极大的恐慌
             if (state.partnerAffection !== null) state.partnerAffection -= 20;
          }

          if (state.playerRole !== 'top' && npc.length >= 19 && Math.random() < 0.4) {
             state.hasFissure = true;
          }

          state.stats.euphoria += eBonus;
          
          let prob = 0.25 * (npc.riskMultiplier || 1);
          if (npc.tags.includes('群体派对')) prob += 0.3; // 群P风险极高
          if (prob > 0.9) prob = 0.9;
          rollDisease(prob, state); 
        }
      },
      { 
        text: '（扫兴至极/恐慌）太糟了！找个借口提上裤子夺门而出！', 
        nextEventId: null, 
        effect: (state) => {
          state.stats.anxiety += 15;
          state.stats.lust += 25; // 欲求不满，欲火中烧
          state.stats.euphoria -= 20; // 极度扫兴
          state.currentNpcId = null;
        }
      }
    ]
  },
  {
    id: 'app_end',
    text: (state) => {
      const npc = state.npcs[state.currentNpcId || ''];
      if (!npc) return '...';
      const isTop = state.playerRole === 'top';
      let msg = `一场酣畅淋漓的疯狂之后，你们躺在散发着汗液与体液腥味的床单上。`;
      if (npc.length > 18) {
         msg += isTop ? `他被你大尺寸的硬件折磨得眼角挂着泪痕，至今身体都在微微颤抖。` : `他恐怖的尺寸让你至今身体都在不可控地微微颤抖，深处酸胀发麻。`;
      }
      else if (npc.hardness < 7 && npc.tags.length === 0) {
         msg += isTop ? `虽然过程中他比较被动，但靠着你的强硬总算是尽兴了。` : `虽然过程中他软了几次，但靠着手口并用总算是勉强交货了。`;
      }
      
      if (state.hasFissure) {
         msg += `\n【严重负面状态】当你下床时，下体深处传来一阵无法忍受的撕裂剧痛，殷红的鲜血顺着大腿流下。你肛裂了。巨大的痛苦和恐惧让你双腿发软。`;
      }
      
      if (state.partnerId && Math.random() < 0.15) {
         msg += `\n\n就在这时，卧室门忽然被推开，是你一直交往的现任伴侣！！他死死盯着赤身的你们，气得浑身发抖...`;
         // Effect happens in the next event if caught, but actually we can just end game directly if we don't handle a "caught" choice stream.
      } else if (state.partnerId) {
         msg += `\n\n你迅速洗去身上的腥味回到家中，看着熟睡的伴侣，满心都是病态的负罪感与刺激感交织。`;
      }

      msg += `\n在这个肉欲横流的都市，虽然今夜得到了平息，但空虚感又在暗暗滋生。`;
      return msg;
    },
    choices: [
      { text: '离开。', nextEventId: null, effect: (state) => {
         // handle caught
         const msg = state.logs[state.logs.length - 1]?.text || "";
         if (msg.includes("一直交往的现任伴侣")) {
             state.isGameOver = true;
             state.endingId = 'relationship_broken_caught';
         }
         state.currentNpcId = null; 
        } 
      }
    ]
  },

  // --- Bathhouse Flow ---
  {
    id: 'bathhouse_enter',
    text: '雾气缭绕的洗浴中心（门票-200）。到处都是白花花的雄性肉体，汗液与荷尔蒙的气息无比浓烈。远处迷宫般的暗房里，隐约传来令人血液贲张的水声。',
    choices: [
      { text: '在公共区游走，寻找看得顺眼的猎物。', nextEventId: 'bathhouse_random' },
      { text: '没入最黑的暗房深处，加入多人的盛宴（丧失理智，极高危体验）', nextEventId: 'bathhouse_darkroom' },
      { text: '感觉环境太脏了，洗个素脸就回家。', nextEventId: null, effect: (state) => {
         state.stats.anxiety -= 10;
         state.stats.euphoria -= 5;
      }}
    ]
  },
  {
    id: 'bathhouse_random',
    text: (state) => {
      const npc = state.npcs[state.currentNpcId || ''];
      const isTop = state.playerRole === 'top';
      const actionTxt = isTop ? '他顺从地趴在墙角等待你的进入' : '带着不容拒绝的力量将你拉向死角';
      let fText = '';
      if (state.hasFissure) {
         fText = '\n【警告】你目前的肛裂伤口如同撒盐般刺痛，作为承受者进行活动将痛不欲生！';
      }
      return `在蒸汽室里，一个【${npc.name}】盯上了你。\n他一言不发，${actionTxt}。你触摸到了他的硬件：${npc.length}cm！极其坚挺。${fText}`;
    },
    choices: [
      { text: (state) => state.playerRole === 'top' ? '提枪上阵，强势戴套进入！' : '带上自己准备的套，默默配合他！', 
        nextEventId: null, 
        condition: (state) => state.playerRole === 'top' || !state.hasFissure,
        effect: (state) => {
         const npc = state.npcs[state.currentNpcId || ''];
         state.stats.euphoria += 25;
         state.stats.lust -= 50;
         state.stats.anxiety -= 5;
         if (state.partnerId) {
             state.stats.anxiety += 25;
             if (state.partnerAffection !== null) state.partnerAffection -= 15;
         }
         if (state.playerRole !== 'top' && npc.length >= 19 && Math.random() < 0.2) {
             state.hasFissure = true;
         }
         state.currentNpcId = null;
      }},
      { text: '被水汽和现场气氛吞噬，不管不顾无套肉搏！', 
        nextEventId: null, 
        condition: (state) => state.playerRole === 'top' || !state.hasFissure,
        effect: (state) => {
         state.stats.euphoria += 45;
         state.stats.lust -= 90;
         state.stats.anxiety += 35;
         if (state.partnerId) {
             state.stats.anxiety += 40;
             if (state.partnerAffection !== null) state.partnerAffection -= 20;
         }
         const npc = state.npcs[state.currentNpcId || ''];
         if (state.playerRole !== 'top' && npc.length >= 19 && Math.random() < 0.4) {
             state.hasFissure = true;
         }
         rollDisease(0.35, state); // 较高危
         state.currentNpcId = null;
      }},
      { text: '不想在众目睽睽下做，挣脱他。', nextEventId: null, effect: (state) => {
         state.stats.lust += 10;
         state.stats.anxiety += 5;
         state.currentNpcId = null;
      }}
    ]
  },
  {
    id: 'bathhouse_darkroom',
    text: (state) => {
       const isTop = state.playerRole === 'top';
       let fText = state.hasFissure ? '\n【致命警告】你带着肛裂的伤口踏入群P暗房，任何进入都将带来残忍的剧痛！你只能祈祷自己能做主导或边缘观战。' : '';
       return `踏入不见五指的暗房，浓烈发酵的精液味扑面而来。只感觉到无数双粗糙的手和火热的躯体在周围涌动。${isTop ? '你在黑暗中强硬地抓住了一个人的腰，而旁边另一个人则开始舔舐你的胸口...' : '有人从后面强硬地拽住了你，另一个人将粗大的性器塞进你的嘴里，你瞬间被五六人淹没在肉海中！'}\n你完全不知道对方有多长、是否有病，粗暴的快感伴随着随时感染的恐惧，彻底撕裂了你的理智。${fText}`;
    },
    choices: [
      { text: '彻底放纵，在黑暗的肉海中狂欢！', 
        nextEventId: null, 
        condition: (state) => state.playerRole === 'top' || !state.hasFissure,
        effect: (state) => {
         state.stats.euphoria += 80; // 欣快度爆表
         state.stats.lust = 0; // 欲望清空
         state.stats.anxiety += 60; // 压力爆表
         if (state.partnerId) {
             state.stats.anxiety += 50;
             if (state.partnerAffection !== null) state.partnerAffection -= 25;
         }
         if (state.playerRole !== 'top' && Math.random() < 0.6) {
             state.hasFissure = true; // 群P极高概率撕裂
         }
         rollDisease(0.6, state); // 60% 感染概率
      }},
      { text: '理智回归，极度恐慌地尖叫并从人堆里爬出来逃跑！', nextEventId: null, effect: (state) => {
         state.stats.anxiety += 40;
         state.stats.euphoria -= 20;
      }}
    ]
  }
];
