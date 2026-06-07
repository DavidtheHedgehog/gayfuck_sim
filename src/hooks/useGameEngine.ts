import { useState, useRef, useEffect } from 'react';
import { GameState } from '../types';
import { INITIAL_STATS, EVENTS, ENDINGS } from '../data/gameData';
import { generateRandomNpc, generateId } from '../lib/npcGenerator';

export function useGameEngine() {
  const [gameState, setGameState] = useState<GameState>({
    day: 1,
    stats: { ...INITIAL_STATS },
    flags: {},
    logs: [
      { id: generateId(), text: '【系统提示】长线生存模式：在这个暗流涌动的都市里存活下去。\n你的心理防线（压力）达到 100 将会精神崩溃。\n你的生存意愿（欣快度）降至 0 将会绝望夭折。\n高危性行为有几率染病，且无任何提示，直到你去医院检测。\n祝你好运。', type: 'system' },
      { id: generateId(), text: '————', type: 'story' },
      { id: generateId(), text: '清晨，你在冰冷的出租屋醒来。无聊、空虚与躁动的多巴胺正侵蚀着你的大脑。', type: 'story' }
    ],
    isGameOver: false,
    endingId: null,
    infections: [],
    hasFissure: false,
    hasPrEP: false,
    currentEventId: null,
    npcs: {},
    currentNpcId: null,
    playerRole: null,
    playerProfile: null,
    partnerId: null,
    partnerAffection: null
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [gameState.logs]);

  const advanceDay = (state: GameState, days = 1): GameState => {
    state.day += days;
    state.stats.lust += 15 * days; // 欲望自然增长较快
    state.stats.euphoria -= 5 * days; // 欣快度自然流失
    
    // 如果感染了，欣快度流失更快，压力自然增加（身体潜意识反应），生命体征下降
    if (state.infections.length > 0) {
        state.stats.anxiety += 3 * days;
        state.stats.euphoria -= 2 * days;
        if (state.infections.includes('hiv')) state.stats.health -= 10 * days;
        if (state.infections.includes('syphilis')) state.stats.health -= 5 * days;
        if (state.infections.includes('gonorrhea')) state.stats.health -= 2 * days;
    }

    // 随机事件发作
    if (state.stats.lust >= 100) {
        state.logs.push({ id: generateId(), text: '【警告】你的欲望已经拉满，理智正在崩溃边缘，急需发泄！', type: 'warning' });
    }

    return state;
  };

  const constrainStats = (state: GameState): GameState => {
    const s = { ...state.stats };
    const clamp = (val: number) => Math.max(0, Math.min(100, val));
    s.lust = clamp(s.lust);
    s.anxiety = clamp(s.anxiety);
    s.euphoria = clamp(s.euphoria);
    s.health = clamp(s.health);
    return { ...state, stats: s };
  };

  const checkEndings = (state: GameState): GameState => {
    const sortedEndings = [...ENDINGS].sort((a, b) => b.priority - a.priority);
    for (const ending of sortedEndings) {
      if (ending.condition && ending.condition(state)) {
        return { ...state, isGameOver: true, endingId: ending.id };
      }
    }
    return state;
  };

  const performMainAction = (actionType: 'hospital' | 'work' | 'rest' | 'app' | 'bathhouse' | 'solo' | 'relationship') => {
    let newState = { ...gameState, logs: [] }; // Clear logs for new action to avoid endless scrolling

    if (actionType === 'hospital') {
      newState.logs.push({ id: generateId(), text: '>>> 前往医院/疾控中心', type: 'choice' });
      newState.currentEventId = 'hospital_enter';
      const evt = EVENTS.find(e => e.id === 'hospital_enter');
      if (evt) {
        const txt = typeof evt.text === 'function' ? evt.text(newState) : evt.text;
        newState.logs.push({ id: generateId(), text: txt, type: 'story' });
      }
      setGameState(newState);
      return;
    } else if (actionType === 'relationship') {
       if (!newState.partnerId) {
          newState.partnerId = generateId(); // Random partner ID
          newState.partnerAffection = 50;
          newState.logs.push({ id: generateId(), text: '>>> 决定在圈内“收心”，你答应了一位条件不错的追求者的表白，开始了长期的同居恋爱关系。最初的羁绊建立，感情值：50。', type: 'choice' });
          newState.stats.anxiety -= 20;
          newState.stats.euphoria += 20;
       } else {
          newState.currentEventId = 'relationship_home';
          const evt = EVENTS.find(e => e.id === 'relationship_home');
          if (evt) {
            const txt = typeof evt.text === 'function' ? evt.text(newState) : evt.text;
            newState.logs.push({ id: generateId(), text: txt, type: 'story' });
          }
          setGameState(newState);
          return;
       }
       newState = advanceDay(newState);
    } else if (actionType === 'work') {
      newState.logs.push({ id: generateId(), text: '>>> 努力搬砖加班', type: 'choice' });
      newState.stats.wealth += Math.floor(Math.random() * 400) + 600; // 600-1000
      newState.stats.anxiety += 15;
      newState.stats.euphoria -= 10;
      newState.logs.push({ id: generateId(), text: '在格子间里被老板PUA了一整天。虽然银行卡余额增加了，但你的精神严重萎靡，感觉自己就像个没有灵魂的机器。', type: 'story' });
      newState = advanceDay(newState);
    } else if (actionType === 'rest') {
      newState.logs.push({ id: generateId(), text: '>>> 躺平休息', type: 'choice' });
      newState.stats.wealth -= 100;
      newState.stats.anxiety -= 25;
      newState.stats.euphoria += 8;
      newState.stats.lust += 5;
      newState.logs.push({ id: generateId(), text: '点了一份外卖（-$100），在床上昏天黑地刷了一天短视频。紧绷的神经放松了不少，但生理的寂寞感悄然蔓延。', type: 'story' });
      newState = advanceDay(newState);
    } else if (actionType === 'app') {
      const npc = generateRandomNpc();
      newState.npcs[npc.id] = npc;
      newState.currentNpcId = npc.id;
      newState.currentEventId = 'app_match';
      newState.logs.push({ id: generateId(), text: '>>> 打开手机交友软件，狩猎开始...', type: 'choice' });
      
      const evt = EVENTS.find(e => e.id === 'app_match');
      if (evt) {
        const txt = typeof evt.text === 'function' ? evt.text(newState) : evt.text;
        newState.logs.push({ id: generateId(), text: txt, type: 'story' });
      }
    } else if (actionType === 'bathhouse') {
      if (newState.stats.wealth < 200) {
        newState.logs.push({ id: generateId(), text: '【警告】门票要200，你现在的钱不够。', type: 'warning' });
        setGameState(newState);
        return;
      }
      newState.stats.wealth -= 200;
      newState.logs.push({ id: generateId(), text: '>>> 踏入同志洗浴中心（-$200）', type: 'choice' });

      const npc = generateRandomNpc();
      newState.npcs[npc.id] = npc;
      newState.currentNpcId = npc.id;
      
      newState.currentEventId = 'bathhouse_enter';
      const evt = EVENTS.find(e => e.id === 'bathhouse_enter');
      if (evt) {
        const txt = typeof evt.text === 'function' ? evt.text(newState) : evt.text;
        newState.logs.push({ id: generateId(), text: txt, type: 'story' });
      }
    } else if (actionType === 'solo') {
      if (newState.stats.wealth < 150) {
        newState.logs.push({ id: generateId(), text: '【警告】生活捉襟见肘，连高级玩具清洗液和水溶性润滑油都买不起了。', type: 'warning' });
        setGameState(newState);
        return;
      }
      newState.stats.wealth -= 150;
      newState.logs.push({ id: generateId(), text: '>>> 锁上房门，掏出“幻龙”/“狂兽”等重口味玩具 (-$150)', type: 'choice' });
      
      newState.stats.lust -= 60; 
      newState.stats.anxiety -= 15;
      newState.stats.euphoria += 15; 
      
      newState.logs.push({ id: generateId(), text: '你拉严窗帘，调暗灯光。涂满冰凉的润滑液后，将巨大的硅胶玩具一点点吞没。伴随着浑浊不堪的粗重喘息和额头细密的汗水，你在一阵无可救药的抽搐中释放了自己。空气中弥漫着腥甜的味道，硅胶的死皮倒也比城里某些渣男更会服侍人。虽然空虚，但十分安全。', type: 'story' });
      newState = advanceDay(newState);
    }

    newState = constrainStats(newState);
    newState = checkEndings(newState);
    setGameState(newState);
  };

  const handleEventChoice = (choiceIndex: number) => {
    if (!gameState.currentEventId) return;
    
    const event = EVENTS.find(e => e.id === gameState.currentEventId);
    if (!event) return;

    const choice = event.choices[choiceIndex];
    let newState = { ...gameState, logs: [...gameState.logs] };

    const choiceText = typeof choice.text === 'function' ? choice.text(newState) : choice.text;
    newState.logs.push({ id: generateId(), text: `>> ${choiceText}`, type: 'choice' });

    if (choice.effect) {
      const res = choice.effect(newState);
      // can handle returned state if needed, but we mostly mutate newState
    }

    if (newState.partnerAffection !== null && newState.partnerAffection <= 0) {
       newState.partnerId = null;
       newState.partnerAffection = null;
       newState.logs.push({ id: generateId(), text: '【感情破裂】你们的感情数值降至冰点。长期的冷暴力、争吵与貌合神离，终于让他绝望地收拾行李离开了这个曾经被称为“家”的地方。你再次成为这个城市里孤独漂泊的孤魂野鬼。', type: 'warning' });
    }

    if (!newState.isGameOver) {
      if (choice.nextEventId) {
        newState.currentEventId = choice.nextEventId;
        const nextEvent = EVENTS.find(e => e.id === choice.nextEventId);
        if (nextEvent) {
           const txt = typeof nextEvent.text === 'function' ? nextEvent.text(newState) : nextEvent.text;
           newState.logs.push({ id: generateId(), text: txt, type: 'story' });
        }
      } else {
        newState.currentEventId = null;
        newState = advanceDay(newState);
        newState.logs.push({ id: generateId(), text: `—— 第 ${newState.day - 1} 天结束 ——\n`, type: 'system' });
      }
    }

    newState = constrainStats(newState);
    newState = checkEndings(newState);
    setGameState(newState);
  };

  const setPlayerRoleAndProfile = (role: 'top' | 'bottom' | 'vers', profile: {charm: number, length: number, hardness: number, fetishes: string[]}) => {
    setGameState(s => ({ ...s, playerRole: role, playerProfile: profile, logs: [{ id: generateId(), text: `你确定了自己【${role === 'top' ? '主导者' : role === 'bottom' ? '承受者' : '互攻'}】的身份。在这个暗流涌动的都市里存活下去吧。`, type: 'system' }] }));
  };

  const restartGame = () => {
    setGameState({
      day: 1,
      stats: { ...INITIAL_STATS },
      flags: {},
      logs: [{ id: generateId(), text: '【系统提示】重新开始模拟。', type: 'system' }],
      isGameOver: false,
      endingId: null,
      infections: [],
      hasFissure: false,
      hasPrEP: false,
      currentEventId: null,
      npcs: {},
      currentNpcId: null,
      playerRole: null,
      playerProfile: null,
      partnerId: null,
      partnerAffection: null
    });
  };

  return {
    gameState,
    scrollRef,
    performMainAction,
    handleEventChoice,
    restartGame,
    setPlayerRoleAndProfile
  };
}
