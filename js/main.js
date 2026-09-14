const $ = (s) => document.querySelector(s);
const screens = [...document.querySelectorAll('.screen')];
function showScreen(id) { screens.forEach((s) => s.classList.toggle('active', s.id === id)); }

const canvas = $('#gameCanvas');
const ctx = canvas.getContext('2d');
const W = 900, H = 1200;
const R = 36, ROW = 64, COL = 76, TOP = 176, LEFT = 100, BOARD_COLS = 9;
const COLORS = { leaf:'#6ea94d', water:'#58aee5', fire:'#e56b3f', wind:'#e7df9a', stone:'#8f8d84' };

const levels = [
  { name:'Bosque dos Cipós', rows:6, colors:['leaf','water','fire'], goal:28, moves:28, theme:'forest', mechanic:'vine', stageEffect:'pollen', bgIndex:1 },
  { name:'Charco do Sapo-Ancião', rows:7, colors:['leaf','water','stone'], goal:34, moves:31, theme:'cave', mechanic:'shell', stageEffect:'mud', bossType:'frog', bossHp:3, bgIndex:2 },
  { name:'Rio da Serra', rows:7, colors:['leaf','water','wind'], goal:38, moves:30, theme:'river', mechanic:'current', stageEffect:'tide', bgIndex:3 },
  { name:'Desfiladeiro do Casco', rows:8, colors:['fire','wind','stone','leaf'], goal:42, moves:33, theme:'dry', mechanic:'wind', stageEffect:'rockfall', bossType:'crab', bossHp:4, bgIndex:4 },
  { name:'Ruínas da Chuva', rows:8, colors:['water','stone','leaf','fire'], goal:46, moves:34, theme:'ruins', mechanic:'totem', stageEffect:'runes', bgIndex:5 },
  { name:'Ninho da Coruja Antiga', rows:9, colors:['leaf','water','fire','wind','stone'], goal:52, moves:37, theme:'boss', mechanic:'wind', stageEffect:'storm', bossType:'owl', bossHp:5, bgIndex:6 },
  { name:'Jardim Prismático', rows:9, colors:['leaf','water','fire','wind','stone'], goal:56, moves:37, theme:'forest', mechanic:'totem', stageEffect:'prism', bgIndex:1 },
  { name:'Retorno do Casco Real', rows:9, colors:['fire','wind','stone','leaf'], goal:60, moves:38, theme:'dry', mechanic:'shell', stageEffect:'quakes', bossType:'crab', bossHp:6, bgIndex:4 },
  { name:'Coração do Bosque', rows:10, colors:['leaf','water','fire','wind','stone'], goal:70, moves:42, theme:'boss', mechanic:'current', stageEffect:'heart', bossType:'heart', bossHp:8, bgIndex:6 }
];

const characters = [
  {
    id:'ayla', name:'Ayla', title:'Batedora do Bosque', skill:'Troca a semente atual pela próxima sem gastar jogada.', charges:4,
    preview:'assets/characters/ayla/idle1.png', drawScale:0.55,
    frames:{ idle:['assets/characters/ayla/idle1.png','assets/characters/ayla/idle2.png'], aimL:'assets/characters/ayla/aimL.png', aimR:'assets/characters/ayla/aimR.png', action:'assets/characters/ayla/shoot.png', windup:'assets/characters/ayla/windup.png', victory:'assets/characters/ayla/victory.png', hurt:'assets/characters/ayla/hurt.png' }
  },
  {
    id:'bram', name:'Bram', title:'Guardião de Pedra', skill:'Fortalece o próximo disparo: quebra cascas e empurra peças próximas.', charges:3,
    preview:'assets/characters/bram/idle1.png', drawScale:0.58,
    frames:{ idle:['assets/characters/bram/idle1.png','assets/characters/bram/idle2.png'], aimL:'assets/characters/bram/guard.png', aimR:'assets/characters/bram/guard.png', action:'assets/characters/bram/punch.png', windup:'assets/characters/bram/windup.png', victory:'assets/characters/bram/victory.png', hurt:'assets/characters/bram/hurt.png' }
  },
  {
    id:'lumi', name:'Lumi', title:'Curandeira das Fontes', skill:'Converte a próxima semente em Água e faz florescer as Folhas vizinhas.', charges:3,
    preview:'assets/characters/lumi/idle1.png', drawScale:0.56,
    frames:{ idle:['assets/characters/lumi/idle1.png','assets/characters/lumi/idle2.png'], aimL:'assets/characters/lumi/castL.png', aimR:'assets/characters/lumi/castR.png', action:'assets/characters/lumi/cast.png', windup:'assets/characters/lumi/windup.png', victory:'assets/characters/lumi/victory.png', hurt:'assets/characters/lumi/hurt.png' }
  }
];

const decorByLevel = [
  [['vine_barrier',84,980,128,128,.9],['relic_seed',816,978,126,126,.92],['flower_cluster',110,116,92,92,.85]],
  [['frog_idol',92,980,136,136,.95],['shell_barrier',810,978,126,126,.88],['lily_pad',780,120,92,92,.85]],
  [['current_swirl',88,980,132,132,.95],['lily_pad',808,980,124,124,.9],['flower_cluster',770,122,90,90,.84]],
  [['crab_idol',92,985,138,138,.94],['gust_totem',810,980,130,130,.92],['shell_barrier',776,124,88,88,.82]],
  [['ruin_pillar',92,980,138,138,.96],['totem',808,980,122,122,.94],['relic_seed',782,122,90,90,.85]],
  [['owl_branch',94,985,140,140,.95],['gust_totem',810,985,126,126,.9],['relic_seed',780,122,92,92,.86]],
  [['flower_cluster',92,980,136,136,.94],['relic_seed',810,980,124,124,.92],['current_swirl',780,122,90,90,.84]],
  [['crab_idol',90,986,140,140,.95],['shell_barrier',808,982,130,130,.9],['gust_totem',778,122,90,90,.84]],
  [['owl_branch',92,986,142,142,.95],['current_swirl',808,982,128,128,.92],['relic_seed',780,122,92,92,.84]],
];

let save = JSON.parse(localStorage.getItem('mystic-grove-save') || '{"unlocked":1,"sound":true,"character":"ayla"}');
if (!save.character) save.character = 'ayla';
if (!Number.isFinite(save.essence)) save.essence = 0;
if (!save.stars || typeof save.stars !== 'object') save.stars = {};
if (!save.bestScores || typeof save.bestScores !== 'object') save.bestScores = {};
if (!save.missions || typeof save.missions !== 'object') save.missions = {};
if (!save.achievements || typeof save.achievements !== 'object') save.achievements = {};
if (!save.challengeBest || typeof save.challengeBest !== 'object') save.challengeBest = {};
if (!save.relics || typeof save.relics !== 'object') save.relics = {};
if (!save.eventsSeen || typeof save.eventsSeen !== 'object') save.eventsSeen = {};
if (!Number.isFinite(save.infiniteBest)) save.infiniteBest = 0;
if (!Number.isFinite(save.infiniteRuns)) save.infiniteRuns = 0;
if (!Number.isFinite(save.totalWins)) save.totalWins = 0;
if (!Number.isFinite(save.totalCleared)) save.totalCleared = 0;
if (!Number.isFinite(save.totalCombos)) save.totalCombos = 0;
if (!Number.isFinite(save.totalBossWins)) save.totalBossWins = 0;
if (!save.upgrades || typeof save.upgrades !== 'object') save.upgrades = {moves:0,skill:0,score:0};
save.upgrades.moves = Math.max(0, Math.min(3, save.upgrades.moves||0));
save.upgrades.skill = Math.max(0, Math.min(2, save.upgrades.skill||0));
save.upgrades.score = Math.max(0, Math.min(3, save.upgrades.score||0));
localStorage.setItem('mystic-grove-save', JSON.stringify(save));
let selectedCharacter = save.character;
let state = null, paused = false, pointerDown = false, aim = -Math.PI/2, audioCtx = null;
const assets = {};

const upgradeDefs = {
  moves:{name:'Fôlego da Floresta',desc:'Comece cada fase com +1 jogada por nível.',max:3,costs:[70,150,260]},
  skill:{name:'Talismã do Guardião',desc:'Receba +1 carga de habilidade por nível.',max:2,costs:[110,240]},
  score:{name:'Sabedoria Ancestral',desc:'Aumenta a pontuação final em 10% por nível.',max:3,costs:[90,190,320]}
};

const missionDefs = [
  {id:'drop4', text:'Derrube 4 peças sem sustentação', reward:35},
  {id:'stone3', text:'Quebre 3 carapaças', reward:40},
  {id:'water3', text:'Faça 3 reações de Água', reward:40},
  {id:'combo6', text:'Faça um combo de 6 ou mais', reward:45},
  {id:'totem2', text:'Ative 2 totems', reward:45},
  {id:'bossFast', text:'Derrote o chefe com 8+ jogadas restantes', reward:55},
  {id:'elements4', text:'Use 4 elementos diferentes em combinações', reward:50},
  {id:'shell5', text:'Quebre 5 proteções de pedra', reward:55},
  {id:'heart', text:'Derrote o Coração do Bosque', reward:80}
];

const challengeDefs = {
  thorns:{name:'Espinhos do Bosque',desc:'Comece com 6 jogadas a menos. A missão e o objetivo continuam normais.',bonus:70,icon:'🌿'},
  tempest:{name:'Tempestade Selvagem',desc:'Uma rajada move o tabuleiro a cada 2 turnos.',bonus:85,icon:'🌪️'},
  sealed:{name:'Talismã Selado',desc:'Habilidades ficam desativadas durante toda a fase.',bonus:95,icon:'🪨'}
};

const achievementDefs = [
  {id:'firstWin',icon:'🌱',name:'Primeiro Broto',desc:'Vença sua primeira fase.',reward:25,test:()=>save.totalWins>=1},
  {id:'collector',icon:'✦',name:'Essência Viva',desc:'Acumule 250 de Essência do Bosque.',reward:40,test:()=>save.essence>=250},
  {id:'comboMaster',icon:'🔥',name:'Reação Perfeita',desc:'Realize 10 combos grandes ao longo da campanha.',reward:55,test:()=>save.totalCombos>=10},
  {id:'cleaner',icon:'🍃',name:'Restaurador',desc:'Elimine 300 peças ao longo da campanha.',reward:65,test:()=>save.totalCleared>=300},
  {id:'bossHunter',icon:'👑',name:'Guardião dos Guardiões',desc:'Derrote 4 chefes.',reward:75,test:()=>save.totalBossWins>=4},
  {id:'starPath',icon:'⭐',name:'Trilha Dourada',desc:'Consiga 18 estrelas no total.',reward:90,test:()=>Object.values(save.stars).reduce((a,b)=>a+(b||0),0)>=18},
  {id:'missionary',icon:'📜',name:'Chamado da Floresta',desc:'Complete 6 missões de fase.',reward:100,test:()=>Object.values(save.missions).filter(Boolean).length>=6},
  {id:'challenge',icon:'⚔️',name:'Sem Medo',desc:'Vença qualquer modo desafio.',reward:80,test:()=>Object.values(save.challengeBest).some((v)=>v&&v.wins>0)},
  {id:'finalHeart',icon:'💚',name:'Coração Restaurado',desc:'Derrote o Coração do Bosque.',reward:150,test:()=>!!save.achievements.finalHeartFlag},
  {id:'relicHunter',icon:'◆',name:'Guardião das Relíquias',desc:'Conquiste 5 Relíquias regionais.',reward:120,test:()=>Object.values(save.relics).filter(Boolean).length>=5},
  {id:'endless',icon:'∞',name:'Além da Trilha',desc:'Conclua 5 ondas no Bosque Infinito.',reward:140,test:()=>save.infiniteBest>=5}
];

let activeChallenge = null;
let infiniteModeActive = false;

const trailEvents = [
  {id:'gentleRain',name:'Chuva Serena',desc:'+2 jogadas nesta trilha.',apply:(s)=>{s.moves+=2;}},
  {id:'richSoil',name:'Solo Fértil',desc:'Algumas folhas começam florescidas.',apply:(s)=>{[...s.cells.values()].filter((b)=>b.type==='leaf'&&!b.special).slice(0,4).forEach((b)=>b.special='bloom');}},
  {id:'ancientTotems',name:'Ecos Ancestrais',desc:'Totems adicionais surgiram no tabuleiro.',apply:(s)=>{[...s.cells.values()].filter((b)=>!b.special).slice(0,3).forEach((b)=>b.special='totem');}},
  {id:'wildGust',name:'Vento Bravio',desc:'A trilha começa com uma rajada.',apply:(s)=>{setTimeout(()=>{if(state===s){windShift();sfx.wind();}},260);}},
  {id:'oldBlessing',name:'Bênção Antiga',desc:'+1 carga de habilidade nesta trilha.',apply:(s)=>{s.skillCharges+=1;}},
  {id:'goldenPollen',name:'Pólen Dourado',desc:'Pontuação da trilha recebe bônus de 15%.',apply:(s)=>{s.eventScoreMult=1.15;}}
];

function queueImage(key, src){ const img = new Image(); img.src = src; assets[key] = img; }
function preloadAssets(){
  for(let i=1;i<=6;i++) queueImage(`bg_${i}`, `assets/backgrounds/${i}.webp`);
  ['leaf','water','fire','wind','stone','bloom','shell','vinecore','cracked','heal','blaze','prism'].forEach((type)=>queueImage(`orb_${type}`, `assets/orbs/${type}.png`));
  ['vine_barrier','shell_barrier','totem','flower_cluster','ruin_pillar','lily_pad','frog_idol','crab_idol','owl_branch','current_swirl','gust_totem','relic_seed'].forEach((name)=>queueImage(`obj_${name}`, `assets/objects/${name}.png`));
  ['leaf','water','fire','wind'].forEach((type)=>{ for(let i=0;i<4;i++) queueImage(`fx_${type}_${i}`, `assets/effects/${type}/${i}.png`); });
  characters.forEach((char)=>{
    char.frames.idle.forEach((p)=>queueImage(`${char.id}_${p}`, p));
    ['aimL','aimR','action','windup','victory','hurt'].forEach((k)=>queueImage(`${char.id}_${char.frames[k]}`, char.frames[k]));
    queueImage(`preview_${char.id}`, char.preview);
    for(let i=1;i<=6;i++){ const tp=`assets/characters/${char.id}/tween_${i}.png`; queueImage(`${char.id}_tween_${i}`,tp); assets[`${char.id}_${tp}`]=assets[`${char.id}_tween_${i}`]; }
  });
  const bosses = { frog:['idle1','idle2','charge','jump','hurt','defeat'], crab:['idle1','idle2','raise','slam','hurt','defeat'], owl:['idle1','idle2','wings','gust','hurt','defeat'], heart:['idle1','idle2','root_charge','antler_sweep','seed_rain','rage','hurt','defeat'] };
  Object.entries(bosses).forEach(([boss,frames])=>frames.forEach((frame)=>queueImage(`boss_${boss}_${frame}`, `assets/bosses/${boss}/${frame}.png`)));
}
preloadAssets();

function showLoading(text='Carregando...', progress=null){
  $('#loadingText').textContent = text;
  if(progress!==null){ $('#loadingBarFill').style.width = `${progress}%`; $('#loadingPercent').textContent = `${Math.round(progress)}%`; }
  $('#loadingOverlay').classList.add('visible');
}
function hideLoading(){ $('#loadingOverlay').classList.remove('visible'); }
function bootLoad(){
  showLoading('Despertando a floresta...', 0);
  const keys = Object.keys(assets);
  const timer = setInterval(()=>{
    const loaded = keys.filter((k)=>assets[k].complete && assets[k].naturalWidth).length;
    const pct = Math.min(100, loaded / keys.length * 100);
    showLoading(loaded < keys.length ? 'Preparando trilhas e criaturas...' : 'Tudo pronto para a aventura!', pct);
    if(loaded >= keys.length){ clearInterval(timer); setTimeout(hideLoading, 380); }
  }, 50);
}
bootLoad();

function getCharacter(){ return characters.find((c)=>c.id===selectedCharacter) || characters[0]; }
function tone(freq=440,dur=.08,type='sine',vol=.05){ if(!save.sound) return; audioCtx ||= new (window.AudioContext||window.webkitAudioContext)(); const o=audioCtx.createOscillator(), g=audioCtx.createGain(); o.type=type; o.frequency.value=freq; g.gain.value=vol; o.connect(g); g.connect(audioCtx.destination); o.start(); g.gain.exponentialRampToValueAtTime(.001, audioCtx.currentTime+dur); o.stop(audioCtx.currentTime+dur); }
function playPattern(notes, step=.055, type='triangle', vol=.045){ if(!save.sound) return; notes.forEach((n,i)=>setTimeout(()=>tone(n, step*1.1, type, vol), i*step*1000)); }
function noiseBurst(dur=.08, vol=.018){
  if(!save.sound) return;
  audioCtx ||= new (window.AudioContext||window.webkitAudioContext)();
  const len=Math.max(1,Math.floor(audioCtx.sampleRate*dur)), buffer=audioCtx.createBuffer(1,len,audioCtx.sampleRate), data=buffer.getChannelData(0);
  for(let i=0;i<len;i++) data[i]=(Math.random()*2-1)*(1-i/len);
  const src=audioCtx.createBufferSource(), filter=audioCtx.createBiquadFilter(), gain=audioCtx.createGain();
  src.buffer=buffer; filter.type='bandpass'; filter.frequency.value=720; filter.Q.value=.8; gain.gain.value=vol; src.connect(filter); filter.connect(gain); gain.connect(audioCtx.destination); src.start();
}
const sfx = {
  shot:()=>{playPattern([300,410,520],.035,'triangle',.045);noiseBurst(.045,.009)},
  combo:()=>{playPattern([500,620,760,920],.045,'sine',.05);noiseBurst(.09,.012)},
  skill:()=>playPattern([560,700,860,1050],.05,'triangle',.05),
  win:()=>playPattern([520,650,780,920,1040],.065,'sine',.05),
  lose:()=>playPattern([260,215,170,135],.085,'sawtooth',.035),
  bossHit:()=>{playPattern([250,190,380,480],.045,'square',.045);noiseBurst(.13,.022)},
  bounce:()=>tone(190,.025,'triangle',.025),
  vine:()=>{tone(160,.08,'sawtooth',.025);noiseBurst(.08,.012)},
  water:()=>playPattern([360,470,590],.045,'sine',.035),
  wind:()=>{playPattern([520,460,400],.04,'sine',.025);noiseBurst(.12,.01)},
  stone:()=>{tone(120,.10,'square',.035);noiseBurst(.11,.025)},
  prism:()=>playPattern([620,740,890,1110],.035,'sine',.04),
  heart:()=>{playPattern([110,165,220],.07,'sine',.04);noiseBurst(.16,.015)}
};

function hexToPos(r,c){ return { x: LEFT + c*COL + (r%2?COL/2:0), y: TOP + r*ROW }; }
function posToNearest(x,y){ let r=Math.round((y-TOP)/ROW); r=Math.max(0,Math.min(15,r)); let c=Math.round((x-LEFT-(r%2?COL/2:0))/COL); c=Math.max(0,Math.min(BOARD_COLS-1,c)); return {r,c}; }
function cellKey(r,c){ return `${r},${c}`; }
function neighbors(r,c){ const even=r%2===0; const ds=even?[[-1,-1],[-1,0],[0,-1],[0,1],[1,-1],[1,0]]:[[-1,0],[-1,1],[0,-1],[0,1],[1,0],[1,1]]; return ds.map(([dr,dc])=>[r+dr,c+dc]); }
function rand(arr){ return arr[(Math.random()*arr.length)|0]; }
function bossLabel(type){ return type==='frog'?'Sapo-Ancião':type==='crab'?'Caranguejo de Pedra':type==='owl'?'Coruja Antiga':'Coração do Bosque'; }

function startLevel(index, message='Entrando na trilha...'){
  showLoading(message, 100);
  setTimeout(()=>{ buildLevel(index); showScreen('game'); hideLoading(); }, 420);
}

function buildLevel(i){
  const L=levels[i], cells=new Map();
  for(let r=0;r<L.rows;r++){
    for(let c=0;c<BOARD_COLS;c++){
      if(Math.random()<.08 && r>1) continue;
      cells.set(cellKey(r,c), {r,c,type:rand(L.colors),special:null,hp:1});
    }
  }
  const vals=[...cells.values()];
  if(L.mechanic==='vine') vals.filter((_,idx)=>idx%10===0).forEach((b)=>b.special='vine');
  if(L.mechanic==='shell') vals.filter((_,idx)=>idx%10===0).forEach((b)=>{b.special='shell'; b.hp=2;});
  if(L.mechanic==='totem') vals.filter((_,idx)=>idx%13===0).forEach((b)=>b.special='totem');
  if(i>=6) vals.filter((_,idx)=>idx%9===0).forEach((b)=>{ if(!b.special && Math.random()<.5) b.special='totem'; });

  state = {
    level:i, cells, score:0, cleared:0, moves:L.moves + save.upgrades.moves, goal:L.goal,
    shooter:{x:W/2,y:H-132}, current:rand(L.colors), next:rand(L.colors),
    projectile:null, particles:[], falling:[], effects:[], floating:[],
    bossHp:L.bossType?(L.bossHp||4):0, bossType:L.bossType||null,
    charPose:'idle', charPoseTimer:0, charPoseMax:0, bossPose:'idle1', bossPoseTimer:0,
    skillCharges:getCharacter().charges + save.upgrades.skill, skillArmed:false,
    ended:false, win:false, recoil:0, cameraShake:0, turnCount:0, phase:1,
    challenge:activeChallenge,
    stats:{dropped:0,shells:0,water:0,maxCombo:0,totems:0,elements:new Set(),bossDefeated:false},
    trailEvent:null,eventScoreMult:1,infinite:false,wave:0,waveEssence:0
  };
  if(activeChallenge==='thorns') state.moves=Math.max(8,state.moves-6);
  if(activeChallenge==='sealed') state.skillCharges=0;
  if(!activeChallenge && Math.random()<0.42){
    const ev=rand(trailEvents); state.trailEvent=ev.id; save.eventsSeen[ev.id]=true; ev.apply(state); localStorage.setItem('mystic-grove-save',JSON.stringify(save));
  }
  paused=false; pointerDown=false; aim=-Math.PI/2;
  $('#pauseOverlay').classList.add('hidden'); $('#resultOverlay').classList.add('hidden');
  toast(state.trailEvent ? `${trailEvents.find((e)=>e.id===state.trailEvent).name}: ${trailEvents.find((e)=>e.id===state.trailEvent).desc}` : (L.bossType?`Chefe: ${bossLabel(L.bossType)}!`:L.name));
  updateHud();
}

function updateHud(){
  if(!state) return;
  const progress=Math.min(100,state.cleared/state.goal*100);
  const mission=state.infinite ? `Sobreviva à onda ${state.wave}` : (missionDefs[state.level]?.text || '—');
  const L=levels[state.level];
  const char=getCharacter();
  $('#hudLevel').textContent = state.infinite ? `∞${state.wave}` : state.level+1;
  $('#hudScore').textContent = state.score;
  $('#hudMoves').textContent = state.moves;
  $('#hudGoal').textContent = `${state.cleared}/${state.goal}`;
  $('#skillBtn').textContent = `${char.name}: ${state.skillCharges}`;
  $('#goalBar').style.width = `${progress}%`;
  $('#hudMission').textContent = mission;
  if($('#sideStageName')) $('#sideStageName').textContent = state.infinite ? 'Bosque Infinito' : L.name;
  if($('#sideStageDesc')) $('#sideStageDesc').textContent = state.infinite ? `Onda ${state.wave}: sobreviva e acumule Essência.` : (L.bossType ? `Enfrente ${bossLabel(L.bossType)} e controle o tabuleiro.` : `Mecânica: ${L.stageEffect || L.mechanic}. Use as reações a seu favor.`);
  if($('#sideMission')) $('#sideMission').textContent = mission;
  if($('#sideMissionBar')) $('#sideMissionBar').style.width = `${progress}%`;
  if($('#sideCharacterImg')) $('#sideCharacterImg').src = char.preview;
  if($('#sideCharacterName')) $('#sideCharacterName').textContent = `${char.name} • ${char.title}`;
  if($('#sideCharacterSkill')) $('#sideCharacterSkill').textContent = state.challenge==='sealed' ? 'Habilidade selada neste desafio.' : `${char.skill} Cargas: ${state.skillCharges}`;
  if($('#sideCurrentOrb')) $('#sideCurrentOrb').src = `assets/orbs/${state.current}.png`;
  if($('#sideNextOrb')) $('#sideNextOrb').src = `assets/orbs/${state.next}.png`;
}
function setCharacterAction(pose,duration=.22){ if(!state) return; state.charPose=pose; state.charPoseTimer=duration; state.charPoseMax=duration; }
function setBossPose(pose,duration=.55){ if(!state||!state.bossType) return; state.bossPose=pose; state.bossPoseTimer=duration; }
function nudgeShake(amount=.8){ if(!state) return; state.cameraShake = Math.max(state.cameraShake, amount); }

function shoot(){
  if(!state||paused||state.projectile||state.moves<=0) return;
  state.moves--; const speed=640;
  state.projectile = { x:state.shooter.x, y:state.shooter.y, vx:Math.cos(aim)*speed, vy:Math.sin(aim)*speed, type:state.current, power:state.skillArmed, wobble:0 };
  state.skillArmed=false; state.current=state.next; state.next=rand(levels[state.level].colors); state.recoil=.22; setCharacterAction('action', .18);
  spawnBurst(state.shooter.x, state.shooter.y-6, state.projectile.type, .26, .74); sfx.shot(); updateHud();
}

function useSkill(){
  if(!state||paused||state.projectile||state.skillCharges<=0||state.challenge==='sealed') return;
  if(selectedCharacter==='ayla'){ [state.current,state.next]=[state.next,state.current]; toast('Ayla trocou as sementes!'); setCharacterAction('windup', .28); }
  else if(selectedCharacter==='bram'){ state.skillArmed=true; toast('Próximo tiro: Impacto de Pedra!'); setCharacterAction('windup', .34); }
  else { state.current='water'; state.skillArmed=true; toast('Lumi invocou Água Viva!'); setCharacterAction('windup', .32); spawnBurst(state.shooter.x,state.shooter.y-20,'water',.32,1.05); }
  state.skillCharges--; sfx.skill(); updateHud();
}

function attachProjectile(p){
  let {r,c}=posToNearest(p.x,p.y);
  if(state.cells.has(cellKey(r,c))){
    const opts=neighbors(r,c).filter(([rr,cc])=>rr>=0&&cc>=0&&cc<BOARD_COLS&&!state.cells.has(cellKey(rr,cc)));
    if(opts.length){ opts.sort((a,b)=>{const A=hexToPos(a[0],a[1]), B=hexToPos(b[0],b[1]); return Math.hypot(A.x-p.x,A.y-p.y)-Math.hypot(B.x-p.x,B.y-p.y);}); [r,c]=opts[0]; }
    else { state.projectile=null; return; }
  }
  const b={r,c,type:p.type,special:null,hp:1}; state.cells.set(cellKey(r,c), b); spawnBurst(hexToPos(r,c).x, hexToPos(r,c).y, p.type, .18, .55);
  if(p.power && selectedCharacter==='bram'){
    let broken=0;
    neighbors(r,c).forEach(([rr,cc])=>{
      const n=state.cells.get(cellKey(rr,cc)); if(!n) return;
      if(n.special==='shell'){ n.hp=1; broken++; }
      else if(n.r>0){ state.cells.delete(cellKey(rr,cc)); state.cleared++; state.score+=10; broken++; spawnBurst(hexToPos(rr,cc).x, hexToPos(rr,cc).y, 'wind', .28, .8); }
    });
    if(broken){ toast('Impacto de Bram!'); spawnBurst(hexToPos(r,c).x,hexToPos(r,c).y,'wind',.32,1.1); nudgeShake(1.8); }
  }
  state.projectile=null; resolveMatch(b);
}

function resolveMatch(start){
  const seen=new Set(), group=[], q=[start];
  while(q.length){ const b=q.pop(), k=cellKey(b.r,b.c); if(seen.has(k)) continue; seen.add(k); if(b.type!==start.type) continue; group.push(b); neighbors(b.r,b.c).forEach(([r,c])=>{ const n=state.cells.get(cellKey(r,c)); if(n&&!seen.has(cellKey(r,c))) q.push(n); }); }
  if(group.length>=3){ state.stats.maxCombo=Math.max(state.stats.maxCombo,group.length); state.stats.elements.add(start.type); if(group.length>=5){ save.totalCombos++; }
    let removed=0;
    group.forEach((b)=>{
      const k=cellKey(b.r,b.c);
      if(b.special==='shell' && start.type!=='stone' && b.hp>1){ b.hp--; state.stats.shells++; spawnBurst(hexToPos(b.r,b.c).x, hexToPos(b.r,b.c).y, 'wind', .18, .72); return; }
      state.cells.delete(k); removed++; spawnBurst(hexToPos(b.r,b.c).x, hexToPos(b.r,b.c).y, b.type, .32, .95);
      if(b.special==='totem'){ state.stats.totems++; state.score+=55; maybeRewardMove(hexToPos(b.r,b.c).x, hexToPos(b.r,b.c).y); }
      if(b.special==='vine' && start.type==='fire') state.score+=35;
    });
    state.cleared+=removed; state.score += removed*12 + Math.max(0,group.length-3)*18;
    if(group.length>=5){ state.score+=75; toast('COMBO NATURAL! +75'); sfx.combo(); nudgeShake(1.4); }
    applyElementReaction(start.type,start,group.length); dropUnsupported(); applyBossDamage(start,group.length);
  } else {
    if(levels[state.level].mechanic==='current' && state.moves%4===0) currentShift();
    if(levels[state.level].mechanic==='wind' && state.moves%3===0) windShift();
  }
  state.turnCount++; bossTurn(); stageMechanicTurn(); updateHud(); checkEnd();
}

function maybeRewardMove(x,y){ state.moves=Math.min(state.moves+1, levels[state.level].moves+8); state.floating.push({x,y,life:.8,label:'+1',color:'#b8f3ff'}); spawnBurst(x,y,'water',.34,1.05); toast('+1 jogada pelo totem!'); }
function applyBossDamage(start,groupLength){
  if(!levels[state.level].bossType || state.bossHp<=0) return;
  const boss=levels[state.level].bossType, valid=boss==='heart' ? groupLength>=5 : (boss!=='crab' || start.type==='stone' || groupLength>=6);
  if(groupLength>=4){
    if(valid){ state.bossHp--; setBossPose('hurt', .46); toast(boss==='frog'?'O Sapo-Ancião perdeu equilíbrio!':boss==='crab'?'A armadura do Caranguejo rachou!':boss==='owl'?'A Coruja perdeu uma pena rúnica!':'O núcleo do Coração do Bosque se partiu!'); sfx.bossHit(); nudgeShake(2.2); if(state.bossHp<=0){ state.stats.bossDefeated=true; state.cleared=Math.max(state.cleared,state.goal); setBossPose('defeat', 1.2); if(boss==='heart') save.achievements.finalHeartFlag=true; } }
    else { toast('A carapaça resiste: use Pedra ou combo 6+!'); setBossPose('raise', .44); }
  }
}
function bossTurn(){
  const L=levels[state.level]; if(!L.bossType||state.bossHp<=0) return;
  if(L.bossType==='frog' && state.moves>0 && state.moves%5===0){ shiftSpecificRow(Math.min(L.rows-1,2+((state.moves/5)|0)%4), +1); toast('O Sapo-Ancião sacudiu uma fileira!'); setBossPose('jump', .55); nudgeShake(1.6); }
  if(L.bossType==='crab' && state.moves>0 && state.moves%4===0){ const candidates=[...state.cells.values()].filter((b)=>!b.special); candidates.slice(0,3).forEach((b)=>{b.special='shell';b.hp=2;}); toast('O Caranguejo criou novas carapaças!'); setBossPose('raise', .55); sfx.stone(); }
  if(L.bossType==='owl' && state.moves>0 && state.moves%3===0){ windShift(); toast('A Coruja bateu as asas!'); setBossPose('gust', .55); sfx.wind(); }
  if(L.bossType==='heart'){
    state.phase = state.bossHp<=2?3:state.bossHp<=5?2:1;
    if(state.turnCount>0 && state.turnCount%4===0){
      if(state.phase===1){ seedRain(); setBossPose('seed_rain',.65); toast('O Coração semeou novas peças!'); }
      else if(state.phase===2){ rootSnare(); setBossPose('root_charge',.68); toast('Raízes antigas prenderam o tabuleiro!'); }
      else { prismPulse(); setBossPose('rage',.8); toast('O Coração entrou em fúria prismática!'); }
      sfx.heart(); nudgeShake(2.3);
    }
  }
}

function stageMechanicTurn(){
  if(state.challenge==='tempest' && state.turnCount>0 && state.turnCount%2===0){ windShift(); sfx.wind(); }
  const effect=levels[state.level].stageEffect;
  if(!effect || state.ended) return;
  if(effect==='pollen' && state.turnCount%5===0){ const leaves=[...state.cells.values()].filter((b)=>b.type==='leaf'&&!b.special); leaves.slice(0,2).forEach((b)=>b.special='bloom'); toast('Pólen do bosque fez novas flores nascerem.'); sfx.vine(); }
  if(effect==='mud' && state.turnCount%6===0){ const stones=[...state.cells.values()].filter((b)=>b.type==='stone'&&!b.special); stones.slice(0,2).forEach((b)=>{b.special='shell';b.hp=2;}); toast('A lama endureceu algumas peças.'); sfx.stone(); }
  if(effect==='tide' && state.turnCount%4===0){ currentShift(); sfx.water(); }
  if(effect==='rockfall' && state.turnCount%5===0){ const row=[...state.cells.values()].filter((b)=>b.r>=2&&!b.special); row.slice(0,2).forEach((b)=>{b.special='shell';b.hp=1;}); toast('Pedras caíram do desfiladeiro.'); sfx.stone(); }
  if(effect==='runes' && state.turnCount%5===0){ const candidates=[...state.cells.values()].filter((b)=>!b.special); if(candidates.length){ candidates[(Math.random()*candidates.length)|0].special='totem'; toast('Uma runa antiga despertou.'); sfx.prism(); } }
  if(effect==='storm' && state.turnCount%4===0){ windShift(); sfx.wind(); }
  if(effect==='prism' && state.turnCount%4===0){ prismBlessing(); }
  if(effect==='quakes' && state.turnCount%4===0){ quakeBoard(); }
}

function seedRain(){
  const L=levels[state.level];
  for(let n=0;n<3;n++){
    const c=(Math.random()*BOARD_COLS)|0, r=Math.min(L.rows-1,1+(Math.random()*3|0));
    if(!state.cells.has(cellKey(r,c))) state.cells.set(cellKey(r,c),{r,c,type:rand(L.colors),special:null,hp:1});
  }
}
function rootSnare(){ const targets=[...state.cells.values()].filter((b)=>!b.special); targets.slice(0,3).forEach((b)=>b.special='vine'); sfx.vine(); }
function prismPulse(){ const vals=[...state.cells.values()]; vals.forEach((b,idx)=>{ if(idx%3===0) b.type=rand(levels[state.level].colors); }); spawnBurst(W/2,TOP+250,'wind',.6,2.0); sfx.prism(); }
function prismBlessing(){ state.current=rand(levels[state.level].colors); state.next=rand(levels[state.level].colors); state.score+=25; state.floating.push({x:W/2,y:TOP+50,life:.9,label:'PRISMA +25',color:'#ffe59b'}); sfx.prism(); }
function quakeBoard(){ const vals=[...state.cells.values()]; vals.forEach((b)=>{ if(b.r>2 && Math.random()<.25){ b.special='shell'; b.hp=1; } }); toast('O chão tremeu e criou cascas de pedra.'); nudgeShake(2.2); sfx.stone(); }

function applyElementReaction(type,start,groupLength){
  if(type==='fire'){
    let bonus=0; [...state.cells.values()].forEach((b)=>{ if(b.special==='vine' && Math.abs(b.r-start.r)<=1){ state.cells.delete(cellKey(b.r,b.c)); bonus++; spawnBurst(hexToPos(b.r,b.c).x, hexToPos(b.r,b.c).y, 'fire', .26, .85); }});
    if(bonus){ state.cleared+=bonus; state.score+=bonus*25; toast('Fogo queimou cipós!'); }
  } else if(type==='water'){ state.stats.water++;
    let grow=0; neighbors(start.r,start.c).forEach(([r,c])=>{ const b=state.cells.get(cellKey(r,c)); if(b?.type==='leaf' && b.special!=='vine' && b.special!=='shell'){ b.special='bloom'; grow++; }});
    if(grow){ state.score+=grow*15; toast('A água fez a mata florescer!'); }
    if(selectedCharacter==='lumi'){ state.score+=10; }
  } else if(type==='wind'){
    const row=[...state.cells.values()].filter((b)=>b.r===start.r && !(b.r===start.r&&b.c===start.c)); const moved=row.map((b)=>({...b})); row.forEach((b)=>state.cells.delete(cellKey(b.r,b.c))); moved.forEach((b)=>{ b.c += b.c<4.5?-1:1; if(b.c>=0&&b.c<BOARD_COLS&&!state.cells.has(cellKey(b.r,b.c))) state.cells.set(cellKey(b.r,b.c), b); else if(b.c>=0&&b.c<BOARD_COLS) placeNearestAvailable(b); }); spawnBurst(hexToPos(start.r,start.c).x, hexToPos(start.r,start.c).y, 'wind', .32, 1.15);
  } else if(type==='stone'){
    neighbors(start.r,start.c).forEach(([r,c])=>{ const b=state.cells.get(cellKey(r,c)); if(b?.special==='shell'){ b.hp=1; state.stats.shells++; state.score+=20; }});
  }
  if(groupLength>=6 && type==='fire'){ state.score+=40; state.floating.push({x:hexToPos(start.r,start.c).x,y:hexToPos(start.r,start.c).y,life:.8,label:'BLAZE!',color:'#ffdb75'}); }
}

function placeNearestAvailable(b){ const opts=neighbors(b.r,b.c).filter(([rr,cc])=>rr>=0&&cc>=0&&cc<BOARD_COLS&&!state.cells.has(cellKey(rr,cc))); if(opts.length){ const [rr,cc]=opts[0]; b.r=rr; b.c=cc; state.cells.set(cellKey(rr,cc), b); } }
function shiftSpecificRow(rowIndex,dir){ const row=[...state.cells.values()].filter((b)=>b.r===rowIndex); row.forEach((b)=>state.cells.delete(cellKey(b.r,b.c))); row.forEach((b)=>{ b.c+=dir; if(b.c>=0&&b.c<BOARD_COLS&&!state.cells.has(cellKey(b.r,b.c))) state.cells.set(cellKey(b.r,b.c), b); else if(b.c>=0&&b.c<BOARD_COLS) placeNearestAvailable(b); }); }
function currentShift(){ const vals=[...state.cells.values()].map((b)=>({...b})); state.cells.clear(); vals.forEach((b)=>{ if(b.r>2) b.c+=b.r%2?1:-1; if(b.c>=0&&b.c<BOARD_COLS&&!state.cells.has(cellKey(b.r,b.c))) state.cells.set(cellKey(b.r,b.c), b); else if(b.c>=0&&b.c<BOARD_COLS) placeNearestAvailable(b); }); toast('A corrente moveu o tabuleiro!'); }
function windShift(){ const dir=state.moves%2?1:-1; const vals=[...state.cells.values()].map((b)=>({...b})); state.cells.clear(); vals.forEach((b)=>{ b.c+=dir; if(b.c>=0&&b.c<BOARD_COLS&&!state.cells.has(cellKey(b.r,b.c))) state.cells.set(cellKey(b.r,b.c), b); else if(b.c>=0&&b.c<BOARD_COLS) placeNearestAvailable(b); }); toast('Uma rajada atravessou o vale!'); }
function dropUnsupported(){
  const connected=new Set(), q=[]; [...state.cells.values()].filter((b)=>b.r===0).forEach((b)=>q.push(b));
  while(q.length){ const b=q.pop(), k=cellKey(b.r,b.c); if(connected.has(k)) continue; connected.add(k); neighbors(b.r,b.c).forEach(([r,c])=>{ const n=state.cells.get(cellKey(r,c)); if(n&&!connected.has(cellKey(r,c))) q.push(n); }); }
  let fallen=0; [...state.cells.values()].forEach((b)=>{ const k=cellKey(b.r,b.c); if(!connected.has(k)){ state.cells.delete(k); const p=hexToPos(b.r,b.c); state.falling.push({x:p.x,y:p.y,vy:40,type:b.type,size:66,spin:(Math.random()-.5)*2,rot:0}); fallen++; } });
  if(fallen){ state.stats.dropped+=fallen; state.cleared+=fallen; state.score+=fallen*22; toast(`${fallen} peças despencaram!`); nudgeShake(1.1); }
}
function spawnBurst(x,y,type,life=.32,scale=1){ const fxType=['leaf','water','fire','wind'].includes(type)?type:'wind'; state.effects.push({x,y,type:fxType,life,maxLife:life,scale}); }

function checkEnd(){
  if(!state||state.ended) return;
  if(state.cleared>=state.goal||state.cells.size===0){
    if(state.infinite){ state.ended=true; setTimeout(()=>advanceInfiniteWave(),360); return; }
    state.ended=true; state.win=true; setTimeout(()=>endLevel(true),420); return;
  }
  const danger=[...state.cells.values()].some((b)=>hexToPos(b.r,b.c).y>H-310);
  if(state.moves<=0||danger){
    state.ended=true; state.win=false;
    if(state.infinite) setTimeout(()=>endInfiniteRun(),420); else setTimeout(()=>endLevel(false),420);
  }
}
function missionComplete(){
  const m=missionDefs[state.level]; if(!m||!state) return false;
  if(m.id==='drop4') return state.stats.dropped>=4;
  if(m.id==='stone3') return state.stats.shells>=3;
  if(m.id==='water3') return state.stats.water>=3;
  if(m.id==='combo6') return state.stats.maxCombo>=6;
  if(m.id==='totem2') return state.stats.totems>=2;
  if(m.id==='bossFast') return state.stats.bossDefeated && state.moves>=8;
  if(m.id==='elements4') return state.stats.elements.size>=4;
  if(m.id==='shell5') return state.stats.shells>=5;
  if(m.id==='heart') return state.stats.bossDefeated;
  return false;
}

function evaluateAchievements(){
  let gained=[];
  achievementDefs.forEach((a)=>{
    if(!save.achievements[a.id] && a.test()){
      save.achievements[a.id]=true; save.essence+=a.reward; gained.push(a);
    }
  });
  if(gained.length){ localStorage.setItem('mystic-grove-save',JSON.stringify(save)); }
  return gained;
}

function computeStars(){
  if(!state || !state.win) return 0;
  const base = levels[state.level].moves + save.upgrades.moves;
  const ratio = base>0 ? state.moves/base : 0;
  if(ratio >= .34) return 3;
  if(ratio >= .14) return 2;
  return 1;
}
function endLevel(win){
  paused=true;
  let stars=0, essenceGain=0, scoreBonus=0;
  if(win){
    save.totalWins++; save.totalCleared+=state.cleared; if(state.stats.bossDefeated) save.totalBossWins++;
    const mult=(1 + save.upgrades.score*.10) * (state.eventScoreMult||1);
    const raw=state.score;
    state.score=Math.round(state.score*mult);
    scoreBonus=state.score-raw;
    stars=computeStars();
    const key=String(state.level);
    const oldStars=save.stars[key]||0;
    const gainedStars=Math.max(0,stars-oldStars);
    save.stars[key]=Math.max(oldStars,stars);
    save.bestScores[key]=Math.max(save.bestScores[key]||0,state.score);
    essenceGain = 18 + stars*12 + gainedStars*25 + Math.min(60, Math.floor(state.score/180));
    const mission=missionDefs[state.level]; const missionNow=missionComplete(); const missionKey=String(state.level); let missionBonus=0;
    if(missionNow && !save.missions[missionKey]){ save.missions[missionKey]=true; missionBonus=mission.reward; }
    if(state.challenge){ const c=challengeDefs[state.challenge]; const rec=save.challengeBest[state.challenge]||{wins:0,best:0}; rec.wins++; rec.best=Math.max(rec.best,state.score); save.challengeBest[state.challenge]=rec; essenceGain+=c.bonus; }
    essenceGain += missionBonus;
    const relicKey=String(state.level); let relicBonus=0;
    if(stars===3 && missionNow && !save.relics[relicKey]){ save.relics[relicKey]=true; relicBonus=50; essenceGain+=relicBonus; }
    save.essence += essenceGain;
    save.unlocked=Math.max(save.unlocked,state.level+2);
    localStorage.setItem('mystic-grove-save', JSON.stringify(save));
  }
  $('#resultTitle').textContent=win?'Vitória!':'A trilha resistiu';
  $('#resultText').textContent=win?`Você marcou ${state.score} pontos e limpou ${state.cleared} peças.`:`Faltaram ${Math.max(0,state.goal-state.cleared)} peças para concluir o objetivo.`;
  $('#resultStars').textContent = win ? '★'.repeat(stars)+'☆'.repeat(3-stars) : '☆☆☆';
  $('#resultRewards').innerHTML = win
    ? `Essência recebida: <b>+${essenceGain} ✦</b>${scoreBonus>0?`<br>Bônus de pontuação: <b>+${scoreBonus} pontos</b>`:''}${save.relics[String(state.level)]?'<br>Relíquia da região: <b>◆ conquistada</b>':''}${state.trailEvent?`<br>Evento: <b>${trailEvents.find((e)=>e.id===state.trailEvent)?.name||''}</b>`:''}<br>Melhor pontuação: <b>${save.bestScores[String(state.level)]}</b>`
    : 'Tente novamente para conquistar estrelas e Essência do Bosque.';
  const mission=missionDefs[state.level]; const mDone=win&&missionComplete(); $('#missionResult').className='mission-result '+(mDone?'success':'fail'); $('#missionResult').innerHTML=`<b>Missão:</b> ${mission.text}<br>${mDone?'✓ Concluída':'Não concluída'}${save.missions[String(state.level)]?' • salva na campanha':''}${state.challenge?`<br><b>Desafio:</b> ${challengeDefs[state.challenge].name} (+${challengeDefs[state.challenge].bonus} ✦)`:''}`; const ach=evaluateAchievements(); if(ach.length) $('#missionResult').innerHTML += `<br><b>Conquista:</b> ${ach.map(a=>a.name).join(', ')}`; $('#nextBtn').style.display=win&&state.level<levels.length-1?'block':'none';
  $('#resultOverlay').classList.remove('hidden');
  if(win) sfx.win(); else sfx.lose();
}

function toast(msg){ const t=$('#toast'); t.textContent=msg; t.classList.add('show'); clearTimeout(t._to); t._to=setTimeout(()=>t.classList.remove('show'), 1600); }

function update(dt){
  if(!state||paused) return;
  if(state.charPoseTimer>0) state.charPoseTimer-=dt;
  if(state.bossPoseTimer>0) state.bossPoseTimer-=dt;
  if(state.recoil>0) state.recoil-=dt;
  if(state.cameraShake>0) state.cameraShake=Math.max(0,state.cameraShake-dt*6);

  if(state.projectile){ const p=state.projectile; p.wobble+=dt*9; p.x+=p.vx*dt; p.y+=p.vy*dt; if(p.x<R+10){ p.x=R+10; p.vx=Math.abs(p.vx); sfx.bounce(); } if(p.x>W-R-10){ p.x=W-R-10; p.vx=-Math.abs(p.vx); sfx.bounce(); } let hit=p.y<TOP+R; if(!hit){ for(const b of state.cells.values()){ const q=hexToPos(b.r,b.c); if(Math.hypot(q.x-p.x,q.y-p.y)<R*1.8){ hit=true; break; } } } if(Math.random()<.22) state.particles.push({x:p.x,y:p.y+6,vx:(Math.random()-.5)*36,vy:16+Math.random()*30,life:.35,type:p.type}); if(hit) attachProjectile(p); }
  state.effects.forEach((e)=>e.life-=dt); state.effects=state.effects.filter((e)=>e.life>0);
  state.particles.forEach((p)=>{ p.x+=p.vx*dt; p.y+=p.vy*dt; p.vy+=140*dt; p.life-=dt; }); state.particles=state.particles.filter((p)=>p.life>0);
  state.falling.forEach((p)=>{ p.y+=p.vy*dt; p.vy+=760*dt; p.rot+=p.spin*dt; }); state.falling=state.falling.filter((p)=>p.y<H+120);
  state.floating.forEach((m)=>{ m.life-=dt; m.y-=38*dt; }); state.floating=state.floating.filter((m)=>m.life>0);
}

function roundRectPath(x,y,w,h,r){ ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); }
function drawImageCentered(img,x,y,w,h,alpha=1,rotation=0){ if(!img||!img.complete||!img.naturalWidth) return; ctx.save(); ctx.globalAlpha=alpha; ctx.translate(x,y); ctx.rotate(rotation); ctx.drawImage(img,-w/2,-h/2,w,h); ctx.restore(); }
function drawImageBottom(img,x,y,w,h,alpha=1){ if(!img||!img.complete||!img.naturalWidth) return; ctx.save(); ctx.globalAlpha=alpha; ctx.drawImage(img,x-w/2,y-h,w,h); ctx.restore(); }
function orbImage(type,special=null,hp=1){ if(special==='bloom') return assets.orb_bloom; if(special==='shell') return hp>1?assets.orb_shell:assets.orb_cracked; if(special==='vine') return assets.orb_vinecore; return assets[`orb_${type}`]; }

function drawBg(){
  const L=levels[state.level], bg=assets[`bg_${L.bgIndex}`]; if(bg?.complete) ctx.drawImage(bg,0,0,W,H);
  const g=ctx.createLinearGradient(0,0,0,H); if(L.theme==='cave'){g.addColorStop(0,'#4f6048');g.addColorStop(1,'#1f281f')} else if(L.theme==='river'){g.addColorStop(0,'#8fc7ad');g.addColorStop(1,'#456d5f')} else if(L.theme==='dry'){g.addColorStop(0,'#d0ae77');g.addColorStop(1,'#7d5a3e')} else if(L.theme==='ruins'){g.addColorStop(0,'#96b386');g.addColorStop(1,'#4e5f46')} else if(L.theme==='boss'){g.addColorStop(0,'#86a86c');g.addColorStop(1,'#263827')} else {g.addColorStop(0,'#b7d78a');g.addColorStop(1,'#587348')}
  ctx.globalAlpha=.22; ctx.fillStyle=g; ctx.fillRect(0,0,W,H); ctx.globalAlpha=1;
  const decor=decorByLevel[state.level]||[]; decor.forEach(([name,x,y,w,h,alpha])=>drawImageCentered(assets[`obj_${name}`],x,y,w,h,alpha));
  const boardY=TOP-46; roundRectPath(62,boardY,776,720,28); ctx.fillStyle='rgba(21,34,22,.60)'; ctx.fill(); ctx.strokeStyle='rgba(238,221,160,.72)'; ctx.lineWidth=4; ctx.stroke();
  ctx.save(); ctx.globalAlpha=.065; ctx.fillStyle='#f8f0ca'; for(let r=0;r<10;r++){ for(let c=0;c<BOARD_COLS;c++){ const p=hexToPos(r,c); ctx.beginPath(); ctx.arc(p.x,p.y,27,0,Math.PI*2); ctx.fill(); } } ctx.restore();
  if(L.bossType) drawBoss();
}
function drawBoss(){
  const boss=levels[state.level].bossType; let pose=state.bossHp<=0?'defeat':state.bossPoseTimer>0?state.bossPose:(Math.floor(performance.now()/540)%2===0?'idle1':'idle2'); if(!assets[`boss_${boss}_${pose}`]) pose=boss==='heart'?'rage':boss==='owl'?'wings':boss==='crab'?'raise':'jump'; const img=assets[`boss_${boss}_${pose}`]; const bob=Math.sin(performance.now()/260)*4; const bw=boss==='heart'?340:300, bh=boss==='heart'?340:320; drawImageCentered(img,W/2,112+bob,bw,bh,.98, Math.sin(performance.now()/900)*0.01);
  roundRectPath(280,28,340,40,14); ctx.fillStyle='rgba(33,26,16,.75)'; ctx.fill(); ctx.strokeStyle='rgba(236,211,145,.82)'; ctx.lineWidth=3; ctx.stroke(); ctx.fillStyle='#fff0bd'; ctx.textAlign='center'; ctx.font='bold 24px Trebuchet MS'; ctx.fillText(`${bossLabel(boss)}  ${'♥'.repeat(Math.max(0,state.bossHp))}`,W/2,56);
}
function drawBubble(b){
  const p=hexToPos(b.r,b.c);
  ctx.save(); ctx.translate(p.x,p.y); ctx.fillStyle='rgba(0,0,0,.22)'; ctx.beginPath(); ctx.ellipse(3,9,23,10,0,0,Math.PI*2); ctx.fill(); ctx.restore();
  drawImageCentered(orbImage(b.type,b.special,b.hp),p.x,p.y,68,68);
  if(b.special==='vine') drawImageCentered(assets.obj_vine_barrier,p.x,p.y+1,68,68,.64);
  if(b.special==='shell') drawImageCentered(assets.obj_shell_barrier,p.x,p.y+2,65,65,.70);
  if(b.special==='totem') drawImageBottom(assets.obj_totem,p.x,p.y+28,38,56,.82);
  if(b.special==='bloom') drawImageCentered(assets.obj_flower_cluster,p.x,p.y+1,62,62,.38);
}
function drawEffects(){ state.effects.forEach((e)=>{ const progress=1-e.life/e.maxLife; const idx=Math.max(0,Math.min(3,Math.floor(progress*4))); const img=assets[`fx_${e.type}_${idx}`]; const size=96*e.scale; drawImageCentered(img,e.x,e.y,size,size,Math.max(.1,e.life/e.maxLife)); }); state.particles.forEach((p)=>{ ctx.globalAlpha=Math.max(0,p.life*2.2); ctx.fillStyle=COLORS[p.type]||'#fff'; ctx.beginPath(); ctx.arc(p.x,p.y,4+p.life*3,0,Math.PI*2); ctx.fill(); ctx.globalAlpha=1; }); }
function drawProjectile(){ if(!state.projectile) return; const p=state.projectile, img=p.power&&p.type==='fire'?assets.orb_blaze:orbImage(p.type); drawImageCentered(img,p.x,p.y,66,66,1,Math.sin(p.wobble)*0.05); }
function drawFalling(){ state.falling.forEach((p)=>drawImageCentered(orbImage(p.type),p.x,p.y,p.size,p.size,.94,p.rot)); }
function currentCharacterFrame(){
  const char=getCharacter();
  if(state.ended&&state.win) return char.frames.victory;
  if(state.charPoseTimer>0){
    const progress=state.charPoseMax>0 ? 1-state.charPoseTimer/state.charPoseMax : 1;
    let tween=1;
    if(state.charPose==='windup') tween=progress<.5?1:2;
    else if(state.charPose==='action') tween=progress<.25?3:progress<.55?4:progress<.8?5:6;
    const path=`assets/characters/${selectedCharacter}/tween_${tween}.png`;
    if(assets[`${selectedCharacter}_tween_${tween}`]) return path;
    return state.charPose==='windup'?char.frames.windup:char.frames.action;
  }
  if(pointerDown) return aim<-Math.PI/2?char.frames.aimL:char.frames.aimR;
  return char.frames.idle[(Math.floor(performance.now()/260)%2)];
}
function drawShooter(){
  const s=state.shooter, char=getCharacter(), charImg=assets[`${selectedCharacter}_${currentCharacterFrame()}`], baseScale=char.drawScale*.92, baseW=362*baseScale, baseH=512*baseScale;
  ctx.save(); ctx.strokeStyle='rgba(255,255,255,.48)'; ctx.setLineDash([10,18]); ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(s.x,s.y-16); ctx.lineTo(s.x+Math.cos(aim)*430,s.y+Math.sin(aim)*430); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
  const recoilOffset=Math.max(0,state.recoil)*28;
  drawImageBottom(charImg,s.x-132-recoilOffset*.15,s.y+86+Math.sin(performance.now()/280)*3,baseW,baseH,1);
  roundRectPath(s.x-74,s.y-30,148,108,26); ctx.fillStyle='rgba(62,42,24,.94)'; ctx.fill(); ctx.strokeStyle='rgba(223,196,116,.95)'; ctx.lineWidth=4; ctx.stroke();
  drawImageCentered(orbImage(state.current),s.x-recoilOffset*.5,s.y+15,70,70);
  drawImageCentered(state.skillArmed?assets.orb_prism:orbImage(state.next),s.x+92,s.y+30,46,46,.98);
  ctx.fillStyle='#f6e7ad'; ctx.font='bold 16px Trebuchet MS'; ctx.textAlign='center'; ctx.fillText('próx.',s.x+92,s.y-1);
}
function drawFloatingLabels(){ state.floating.forEach((m)=>{ ctx.save(); ctx.globalAlpha=Math.max(0,m.life*1.4); ctx.fillStyle=m.color||'#b8f3ff'; ctx.font='bold 28px Trebuchet MS'; ctx.textAlign='center'; ctx.fillText(m.label,m.x,m.y); ctx.restore(); }); }
function drawTopInfo(){
  if(window.innerWidth>900){ drawImageCentered(assets.obj_relic_seed,790,156,54,54,.82); return; }
  const title=levels[state.level].name; roundRectPath(116,112,360,42,14); ctx.fillStyle='rgba(27,27,18,.66)'; ctx.fill(); ctx.strokeStyle='rgba(228,214,164,.58)'; ctx.lineWidth=2; ctx.stroke(); ctx.fillStyle='#fff2cd'; ctx.textAlign='center'; ctx.font='bold 20px Trebuchet MS'; ctx.fillText(title,296,139); drawImageCentered(assets.obj_relic_seed,790,156,54,54,.82);
}
function draw(){ if(!state) return; ctx.clearRect(0,0,W,H); const shakeX=state.cameraShake? (Math.random()-.5)*state.cameraShake*6 : 0; const shakeY=state.cameraShake? (Math.random()-.5)*state.cameraShake*6 : 0; ctx.save(); ctx.translate(shakeX, shakeY); drawBg(); drawTopInfo(); [...state.cells.values()].sort((a,b)=>a.r-b.r||a.c-b.c).forEach(drawBubble); drawEffects(); drawProjectile(); drawFalling(); drawShooter(); drawFloatingLabels(); ctx.restore(); }
let last=performance.now(); function loop(now){ const dt=Math.min(.033,(now-last)/1000); last=now; update(dt); draw(); requestAnimationFrame(loop); } requestAnimationFrame(loop);

function canvasPos(e){ const r=canvas.getBoundingClientRect(), t=e.touches?.[0]||e.changedTouches?.[0]||e; return { x:(t.clientX-r.left)/r.width*W, y:(t.clientY-r.top)/r.height*H }; }
function setAimFrom(x,y){ const s=state.shooter; let a=Math.atan2(y-s.y,x-s.x); a=Math.max(-Math.PI+.18,Math.min(-.18,a)); aim=a; }
canvas.addEventListener('pointerdown',(e)=>{ if(!state||paused) return; pointerDown=true; const p=canvasPos(e); setAimFrom(p.x,p.y); });
canvas.addEventListener('pointermove',(e)=>{ if(pointerDown&&state&&!paused){ const p=canvasPos(e); setAimFrom(p.x,p.y); } });
canvas.addEventListener('pointerup',(e)=>{ if(!state||paused) return; const p=canvasPos(e); setAimFrom(p.x,p.y); pointerDown=false; shoot(); });
window.addEventListener('keydown',(e)=>{ if(!state||paused){ if(e.key==='Escape'&&state) togglePause(); return; } if(e.key==='ArrowLeft') aim=Math.max(-Math.PI+.18,aim-.08); if(e.key==='ArrowRight') aim=Math.min(-.18,aim+.08); if(e.code==='Space'){ e.preventDefault(); shoot(); } if(e.key==='Escape') togglePause(); if(e.key==='q'||e.key==='Q') useSkill(); });

function renderLevels(){
  const grid=$('#levelGrid'); grid.innerHTML='';
  levels.forEach((L,i)=>{
    const key=String(i), stars=save.stars[key]||0, best=save.bestScores[key]||0;
    const el=document.createElement('div');
    el.className=`level-card${i+1>save.unlocked?' locked':''}`;
    el.innerHTML=`<strong>${i+1}. ${L.name}</strong><small>Objetivo: ${L.goal} • ${L.moves}+ jogadas</small><small>${L.bossType?'Encontro de chefe':'Mecânica: '+(L.stageEffect||L.mechanic)}</small>${L.bossType?'<span class="boss-tag">CHEFE</span>':''}${activeChallenge?`<span class="challenge-tag">${challengeDefs[activeChallenge].name}</span>`:''}<span class="level-stars">${'★'.repeat(stars)}${'☆'.repeat(3-stars)}</span><span class="best-score">Recorde: ${best}</span><span class="level-mission ${save.missions[key]?'done':''}">${save.missions[key]?'✓ ':''}Missão: ${missionDefs[i].text}</span>${save.relics[key]?'<span class="relic-tag">◆ Relíquia</span>':''}`;
    if(i+1<=save.unlocked) el.onclick=()=>startLevel(i, `Carregando ${L.name}...`);
    grid.appendChild(el);
  });
}

function upgradeCost(id){ const d=upgradeDefs[id], lvl=save.upgrades[id]||0; return lvl>=d.max?null:d.costs[lvl]; }
function renderUpgrades(){
  $('#essenceValue').textContent=save.essence;
  const grid=$('#upgradeGrid'); grid.innerHTML='';
  Object.entries(upgradeDefs).forEach(([id,d])=>{
    const lvl=save.upgrades[id]||0, cost=upgradeCost(id), maxed=lvl>=d.max;
    const card=document.createElement('div'); card.className='upgrade-card'+(maxed?' maxed':'');
    card.innerHTML=`<h3>${d.name}</h3><p>${d.desc}</p><div class="upgrade-level">Nível ${lvl}/${d.max}</div><button ${maxed?'disabled':''}>${maxed?'MÁXIMO':`Comprar • ${cost} ✦`}</button>`;
    const btn=card.querySelector('button');
    if(!maxed) btn.onclick=()=>buyUpgrade(id);
    grid.appendChild(card);
  });
}
function buyUpgrade(id){
  const cost=upgradeCost(id); if(cost===null) return;
  if(save.essence<cost){ toast('Essência insuficiente. Complete fases e melhore suas estrelas.'); return; }
  save.essence-=cost; save.upgrades[id]=(save.upgrades[id]||0)+1; localStorage.setItem('mystic-grove-save',JSON.stringify(save)); sfx.skill(); renderUpgrades();
}

function renderChallenges(){
  const grid=$('#challengeGrid'); grid.innerHTML='';
  Object.entries(challengeDefs).forEach(([id,c])=>{
    const rec=save.challengeBest[id]||{wins:0,best:0};
    const card=document.createElement('div'); card.className='challenge-card';
    card.innerHTML=`<div style="font-size:34px">${c.icon}</div><h3>${c.name}</h3><p>${c.desc}</p><div class="challenge-bonus">Bônus por vitória: +${c.bonus} ✦</div><div class="challenge-best">Vitórias: ${rec.wins} • Recorde: ${rec.best}</div><button>Escolher fase</button>`;
    card.querySelector('button').onclick=()=>{ activeChallenge=id; renderLevels(); showScreen('levelSelect'); };
    grid.appendChild(card);
  });
}
function renderAchievements(){
  evaluateAchievements();
  const grid=$('#achievementGrid'); grid.innerHTML='';
  const unlocked=achievementDefs.filter((a)=>save.achievements[a.id]).length;
  $('#achievementSummary').innerHTML=`Conquistas: <strong>${unlocked}/${achievementDefs.length}</strong> • Essência: <strong>${save.essence} ✦</strong>`;
  achievementDefs.forEach((a)=>{
    const ok=!!save.achievements[a.id], card=document.createElement('div'); card.className='achievement-card '+(ok?'unlocked':'locked');
    card.innerHTML=`<div class="achievement-icon">${a.icon}</div><h3>${a.name}</h3><p>${a.desc}</p><div class="achievement-reward">${ok?'✓ Desbloqueada':`Recompensa: ${a.reward} ✦`}</div>`; grid.appendChild(card);
  });
}


function renderWorldMap(){
  const grid=$('#worldMapGrid'); grid.innerHTML='';
  const starsTotal=Object.values(save.stars).reduce((a,b)=>a+(b||0),0);
  const relicTotal=Object.values(save.relics).filter(Boolean).length;
  const missionTotal=Object.values(save.missions).filter(Boolean).length;
  $('#worldSummary').innerHTML=`Estrelas: <strong>${starsTotal}/27</strong> • Missões: <strong>${missionTotal}/9</strong> • Relíquias: <strong>${relicTotal}/9 ◆</strong>`;
  levels.forEach((L,i)=>{
    const key=String(i), unlocked=i+1<=save.unlocked, stars=save.stars[key]||0;
    const node=document.createElement('div');
    node.className=`world-node${!unlocked?' locked':''}${L.bossType?' boss':''}${i===8?' final':''}`;
    node.innerHTML=`<small>TRILHA ${i+1}</small><strong>${L.name}</strong><span class="node-stars">${'★'.repeat(stars)}${'☆'.repeat(3-stars)}</span><span class="node-flags">${save.missions[key]?'📜':'·'} ${save.relics[key]?'◆':'◇'}</span>`;
    if(unlocked) node.onclick=()=>{ activeChallenge=null; startLevel(i,`Viajando para ${L.name}...`); };
    grid.appendChild(node);
  });
}

function infiniteUnlocked(){ return !!save.achievements.finalHeartFlag || save.unlocked>levels.length; }
function renderInfiniteInfo(){
  const unlocked=infiniteUnlocked();
  $('#infiniteStatus').innerHTML = unlocked
    ? `Melhor onda: <strong>${save.infiniteBest}</strong> • Incursões: <strong>${save.infiniteRuns}</strong> • Essência: <strong>${save.essence} ✦</strong>`
    : `🔒 Derrote o <strong>Coração do Bosque</strong> para desbloquear.`;
  $('#startInfiniteBtn').disabled=!unlocked;
  $('#startInfiniteBtn').textContent=unlocked?'Entrar no Bosque Infinito':'Bloqueado';
}

function createInfiniteCells(wave){
  const cells=new Map(), rows=Math.min(10,5+Math.floor((wave-1)/2));
  const colors=['leaf','water','fire','wind','stone'];
  for(let r=0;r<rows;r++) for(let c=0;c<BOARD_COLS;c++){
    if(Math.random()<Math.max(.03,.10-wave*.003)&&r>1) continue;
    const b={r,c,type:rand(colors),special:null,hp:1};
    if(wave>=2 && Math.random()<Math.min(.18,.04+wave*.01)){ b.special=wave%3===0?'shell':(wave%2===0?'vine':'totem'); if(b.special==='shell') b.hp=2; }
    cells.set(cellKey(r,c),b);
  }
  return cells;
}

function startInfiniteRun(){
  if(!infiniteUnlocked()) return;
  infiniteModeActive=true; activeChallenge=null; save.infiniteRuns++; localStorage.setItem('mystic-grove-save',JSON.stringify(save));
  showLoading('Abrindo o Bosque Infinito...',100);
  setTimeout(()=>{
    const wave=1, cells=createInfiniteCells(wave);
    state={
      level:6,cells,score:0,cleared:0,moves:26+save.upgrades.moves,goal:22,
      shooter:{x:W/2,y:H-132},current:rand(levels[6].colors),next:rand(levels[6].colors),
      projectile:null,particles:[],falling:[],effects:[],floating:[],bossHp:0,bossType:null,
      charPose:'idle',charPoseTimer:0,charPoseMax:0,bossPose:'idle1',bossPoseTimer:0,
      skillCharges:getCharacter().charges+save.upgrades.skill,skillArmed:false,ended:false,win:false,recoil:0,cameraShake:0,turnCount:0,phase:1,challenge:null,
      stats:{dropped:0,shells:0,water:0,maxCombo:0,totems:0,elements:new Set(),bossDefeated:false},
      trailEvent:null,eventScoreMult:1,infinite:true,wave,waveEssence:0
    };
    paused=false;pointerDown=false;aim=-Math.PI/2;showScreen('game');hideLoading();toast('Onda 1: o Bosque Infinito desperta.');updateHud();
  },420);
}

function advanceInfiniteWave(){
  if(!state?.infinite) return;
  const reward=10+state.wave*3; save.essence+=reward; state.waveEssence+=reward;
  state.wave++; save.infiniteBest=Math.max(save.infiniteBest,state.wave-1); localStorage.setItem('mystic-grove-save',JSON.stringify(save));
  state.cells=createInfiniteCells(state.wave); state.cleared=0; state.goal=22+(state.wave-1)*5; state.moves=Math.min(34+save.upgrades.moves, state.moves+6); state.ended=false; state.projectile=null;
  if(state.wave%3===0) state.skillCharges=Math.min(state.skillCharges+1,getCharacter().charges+save.upgrades.skill+2);
  toast(`Onda ${state.wave}! +${reward} ✦ e +6 jogadas.`); sfx.win(); updateHud();
}

function endInfiniteRun(){
  if(!state?.infinite) return;
  save.infiniteBest=Math.max(save.infiniteBest,state.wave-1); localStorage.setItem('mystic-grove-save',JSON.stringify(save));
  paused=true; $('#resultTitle').textContent='Fim da incursão'; $('#resultText').textContent=`Você alcançou a onda ${state.wave} e marcou ${state.score} pontos.`;
  $('#resultStars').textContent='∞'; $('#resultRewards').innerHTML=`Ondas concluídas: <b>${Math.max(0,state.wave-1)}</b><br>Essência conquistada: <b>+${state.waveEssence} ✦</b><br>Recorde: <b>${save.infiniteBest} ondas</b>`;
  const gained=evaluateAchievements(); $('#missionResult').className='mission-result success'; $('#missionResult').innerHTML='O Bosque Infinito fica mais difícil a cada onda.'+(gained.length?`<br><b>Conquista:</b> ${gained.map((a)=>a.name).join(', ')}`:''); $('#nextBtn').style.display='none'; $('#resultOverlay').classList.remove('hidden'); sfx.lose();
}

function renderCharacters(){ const grid=$('#characterGrid'); grid.innerHTML=''; characters.forEach((c)=>{ const el=document.createElement('div'); el.className='character-card'; el.innerHTML=`<img src="${c.preview}" alt="${c.name}"><div><strong>${c.name}</strong><b>${c.title}</b><small>${c.skill}</small></div>`; el.onclick=()=>{ selectedCharacter=c.id; save.character=c.id; localStorage.setItem('mystic-grove-save', JSON.stringify(save)); renderWorldMap(); showScreen('worldMap'); }; grid.appendChild(el); }); }
function togglePause(){ paused=!paused; $('#pauseOverlay').classList.toggle('hidden', !paused); }

$('#playBtn').onclick=()=>{ activeChallenge=null; renderCharacters(); showScreen('characterSelect'); };
$('#charBackBtn').onclick=()=>showScreen('menu');
$('#worldMapBtn').onclick=()=>{ activeChallenge=null; renderWorldMap(); showScreen('worldMap'); };
$('#worldBackBtn').onclick=()=>showScreen('menu');
$('#infiniteBtn').onclick=()=>{ renderInfiniteInfo(); showScreen('infiniteMode'); };
$('#infiniteBackBtn').onclick=()=>showScreen('menu');
$('#startInfiniteBtn').onclick=startInfiniteRun;
$('#upgradeBtn').onclick=()=>{ renderUpgrades(); showScreen('upgrades'); };
$('#upgradeBackBtn').onclick=()=>showScreen('menu');
$('#challengeBtn').onclick=()=>{ renderChallenges(); showScreen('challenges'); };
$('#challengeBackBtn').onclick=()=>showScreen('menu');
$('#achievementsBtn').onclick=()=>{ renderAchievements(); showScreen('achievements'); };
$('#achievementsBackBtn').onclick=()=>showScreen('menu');
$('#howBtn').onclick=()=>showScreen('how');
$('#howBackBtn').onclick=()=>showScreen('menu');
$('#backMenuBtn').onclick=()=>showScreen('menu');
$('#pauseBtn').onclick=togglePause; $('#resumeBtn').onclick=togglePause; $('#skillBtn').onclick=useSkill;
$('#restartBtn').onclick=()=>{ if(state?.infinite) startInfiniteRun(); else startLevel(state.level, 'Recriando a trilha...'); };
$('#quitBtn').onclick=()=>{ paused=false; if(state?.infinite){ save.infiniteBest=Math.max(save.infiniteBest,state.wave-1); localStorage.setItem('mystic-grove-save',JSON.stringify(save)); renderInfiniteInfo(); showScreen('infiniteMode'); } else { renderWorldMap(); showScreen('worldMap'); } };
$('#retryBtn').onclick=()=>{ if(state?.infinite) startInfiniteRun(); else startLevel(state.level, 'Tentando novamente...'); };
$('#resultMenuBtn').onclick=()=>{ paused=false; if(state?.infinite){ renderInfiniteInfo(); showScreen('infiniteMode'); } else { renderWorldMap(); showScreen('worldMap'); } };
$('#nextBtn').onclick=()=>startLevel(Math.min(levels.length-1, state.level+1), 'Abrindo a próxima trilha...');
$('#soundBtn').onclick=()=>{ save.sound=!save.sound; localStorage.setItem('mystic-grove-save', JSON.stringify(save)); $('#soundBtn').textContent=`Som: ${save.sound?'Ligado':'Desligado'}`; };
$('#soundBtn').textContent=`Som: ${save.sound?'Ligado':'Desligado'}`;
