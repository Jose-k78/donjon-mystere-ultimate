// ============================================================
//  sprite_config.json (format des planches de sprites et portraits)
//  Portraits : planche de 5 colonnes de 40 × 40 px, une case par émotion
//  (dans l'ordre de « emotions » ; les 4 dernières lignes = versions retournées « ^ »).
//  Le jeu s'en sert pour changer l'expression des portraits dans les dialogues.
// ============================================================
const SPRITE_CONFIG = {
  portrait_size: 40, portrait_tile_x: 5, portrait_tile_y: 8,
  completion_emotions: [[0], [0], [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 16, 17]],
  emotions: ["Normal", "Happy", "Pain", "Angry", "Worried", "Sad", "Crying", "Shouting", "Teary-Eyed", "Determined", "Joyous", "Inspired", "Surprised", "Dizzy", "Special0", "Special1", "Sigh", "Stunned", "Special2", "Special3"],
  completion_actions: [[0], [0, 1, 2, 3, 4, 5, 39, 40, 41, 42], [0, 1, 2, 3, 4, 5, 39, 40, 41, 42, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66]],
  actions: ["Idle", "Walk", "Sleep", "Hurt", "Attack", "Charge", "Shoot", "Strike", "Chop", "Scratch", "Punch", "Slap", "Slice", "MultiScratch", "MultiStrike", "Uppercut", "Ricochet", "Bite", "Shake", "Jab", "Kick", "Lick", "Slam", "Stomp", "Appeal", "Dance", "Twirl", "TailWhip", "Sing", "Sound", "Rumble", "FlapAround", "Gas", "Shock", "Emit", "SpAttack", "Withdraw", "RearUp", "Swell", "Swing", "Double", "Rotate", "Hop", "Hover", "QuickStrike", "EventSleep", "Wake", "Eat", "Tumble", "Pose", "Pull", "Pain", "Float", "DeepBreath", "Nod", "Sit", "LookUp", "Sink", "Trip", "Laying", "LeapForth", "Head", "Cringe", "LostBalance", "TumbleBack", "HitGround", "Faint", "Fainted", "StandingUp", "DigIn", "DigOut", "Wiggle", "Yawn", "RaiseArms", "CarefulWalk", "Injured", "Jump", "Roar", "Wave", "Cry", "Bow"].concat(Array.from({ length: 32 }, (_, i) => "Special" + i)),
  dungeon_actions: ["Idle", "Walk", "Sleep", "Hurt", "Attack", "Charge", "Shoot", "Strike", "Chop", "Scratch", "Punch", "Slap", "Slice", "MultiScratch", "MultiStrike", "Uppercut", "Ricochet", "Bite", "Shake", "Jab", "Kick", "Lick", "Slam", "Stomp", "Appeal", "Dance", "Twirl", "TailWhip", "Sing", "Sound", "Rumble", "FlapAround", "Gas", "Shock", "Emit", "SpAttack", "Withdraw", "RearUp", "Swell", "Swing", "Double", "Rotate", "Hop", "Hover", "QuickStrike"],
  starter_actions: ["EventSleep", "Wake", "Eat", "Tumble", "Pose", "Pull", "Pain", "Float", "DeepBreath", "Nod", "Sit", "LookUp", "Sink", "Trip", "Laying", "LeapForth", "Head", "Cringe", "LostBalance", "TumbleBack", "HitGround"],
  action_map: { "0": "Walk", "1": "Attack", "5": "Sleep", "6": "Hurt", "7": "Idle", "8": "Swing", "9": "Double", "10": "Hop", "11": "Charge", "12": "Rotate" }
};
const EMO_FR = { Normal: "Normal", Happy: "Content", Pain: "Douleur", Angry: "En colère", Worried: "Inquiet", Sad: "Triste", Crying: "En pleurs", Shouting: "Crie", "Teary-Eyed": "Larmes aux yeux", Determined: "Déterminé", Joyous: "Joyeux", Inspired: "Inspiré", Surprised: "Surpris", Dizzy: "Étourdi", Sigh: "Soupir", Stunned: "Stupéfait" };
// position d'une émotion sur la planche de portraits
function emotionTile(emo, imgW, imgH) {
  const C = SPRITE_CONFIG, sz = C.portrait_size;
  let i = C.emotions.indexOf(emo); if (i < 0) i = 0;
  const cols = Math.max(1, Math.floor(imgW / sz)), rows = Math.max(1, Math.floor(imgH / sz));
  let x = (i % C.portrait_tile_x) * sz, y = Math.floor(i / C.portrait_tile_x) * sz;
  if (cols < C.portrait_tile_x || y / sz >= rows) { x = 0; y = 0; }
  return { x, y, sz };
}
