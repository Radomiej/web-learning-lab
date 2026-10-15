// Guided tasks expose one small change; the surrounding implementation stays readable.
export function guidedStarter(language,chapter,mode,solution) {
 if(mode!=='guided')return null;
 const ext=language==='java'?'java':'js',entry=language==='java'?'GameMain.java':'game.js';
 const rules={
  components:['Counter',/(?:this\.)?counts\+\+;/],
  time:['Mover',/(?:this\.)?transform\.x\s*\+=\s*(?:this\.)?velocityX\s*\*\s*delta;/],
  graphics:[null,/ground\.addComponent\(new (?:GameLab\.)?TileMap\([^;]+\)\);/],
  waves:['WaveSpawner',/(?:this\.)?elapsed\+=delta;/],
  health:['Health',/(?:this\.)?currentHealth=Math\.max\(0,(?:this\.)?currentHealth-amount\);/],
  weapons:['Weapon',/(?:this\.)?timer=(?:this\.)?cooldown;/],
  triggers:['Pickup',/wallet\.gold\+=(?:this\.)?value;/],
  'loot-xp':['LootOnDeath',/orb\.addComponent\(new XpOrb\(1\)\);/],
  'enemy-tactics':['EnemyAI',/if\(Math\.hypot\(dx,dy\)>150\)return;/],
  camera:[null,/camera\.getComponent\((?:GameLab\.)?Camera2D(?:\.class)?\)\.offsetX=80;/],
  'canvas-ui':[null,/hUD\.getComponent\((?:GameLab\.)?UITransform(?:\.class)?\)\.anchor="TOP_LEFT";/],
  'ui-flow':['MenuView',/if\(object(?:!=null)?\)object\.active=open;/],
  upgrades:['UpgradeController',/speed\.speed\+=30;/],
  feedback:[null,/(?:GameLab\.)?Tweens\.position\(coin,160,100,1\);/],
  'projectile-types':['Homing',/(?:this\.)?requireComponent\((?:GameLab\.)?Projectile2D(?:\.class)?\)\.direction(?:=d|\.set\(d\.x,d\.y\));/],
  composition:['EnemyFactory',/enemy\.addComponent\(new EnemyAI\([^;]+\)\);/],
  'run-state':['RunController',/(?:this\.)?state="RUNNING";/],
  performance:['LoadFixture',/(?:this\.)?shots\+\+;/],
  survivor:['RunController',/p\.getComponent\(Weapon(?:\.class)?\)\.range=240;/],
 };
 const rule=rules[chapter];if(!rule)return null;
 const [type,pattern]=rule,file=type?`${type}.${ext}`:entry,source=solution.files[file];
 if(!source||!pattern.test(source))throw new Error(`Brak miejsca zmiany prowadzonej: ${chapter}/${language}/${file}`);
 return {ready:solution.ready,files:{...solution.files,[file]:source.replace(pattern,'// TODO: Uzupełnij małą zmianę opisaną w poleceniu.\n'+(chapter==='upgrades'?';':''))}};
}
