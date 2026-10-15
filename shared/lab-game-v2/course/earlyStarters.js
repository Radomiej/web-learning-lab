// Preserve the working scene. The first task adds one behavior; later tasks remove more guidance.
export function earlyStarter(language, chapter, mode, solution) {
  if (!['scene','input','collisions','enemy-ai','projectiles'].includes(chapter)) return null;
  const java=language==='java',files={...solution.files},ext=java?'java':'js',entry=java?'GameMain.java':'game.js';
  const replace=(file,pattern,note)=>{files[file]=files[file].replace(pattern,`// TODO: ${note}\n`);};
  if(chapter==='scene') {
    if(mode==='guided')replace(entry,/player\.addComponent\(new (?:GameLab\.)?ShapeRenderer\([^\n]+\);/, 'Dodaj Player komponent wyglądu 40×30.');
    else if(mode==='modified')replace(entry,/platformB\.transform\.x \+= 40;/,'Przesuń tylko PlatformB o 40 px w prawo.');
    else replace(entry,/(?:enemy|coin)\.addComponent\(new (?:GameLab\.)?Sprite\([^\n]+\);/g,'Dodaj temu obiektowi Sprite zgodnie z poleceniem.');
  } else if(chapter==='input' && mode!=='independent') {
    if(mode==='guided')replace(`PlayerController.${ext}`,/ (?:this\.)?requireComponent\([^;]+\.move\([^;]+;/,'Przekaż x, y i speed do kontrolera.');
    else {const file=`PlayerController.${ext}`;files[file]=files[file].replace(java?'getGame().input.isKeyDown("Shift") ? speed * 2 : speed':'input.isKeyDown("Shift") ? this.speed * 2 : this.speed',java?'speed':'this.speed');files[file]=files[file].replace(java?' requireComponent(CharacterController2D.class).move':' this.requireComponent(GameLab.CharacterController2D).move', '// TODO: Shift zwiększa prędkość ze 100 do 200 px/s.\n'+(java?' requireComponent(CharacterController2D.class).move':' this.requireComponent(GameLab.CharacterController2D).move'));}
  } else if(chapter==='collisions') {
    if(mode==='guided')replace(entry,/wall\.addComponent\(new (?:GameLab\.)?Collider2D\(20,200\)\);/,'Dodaj ścianie collider 20×200.');
    else if(mode==='modified') {files[entry]=files[entry].replace(/new (?:GameLab\.)?CircleCollider2D\(12\)/,java?'new Collider2D(32,32)':'new GameLab.Collider2D(32,32)');replace(entry,/player\.transform\.scale\.set\(2,2\);/,'Zamień collider gracza na koło r=12 i podwój skalę grafiki.');}
    else {replace(entry,/(?:this\.)?setWorldBounds\(0,0,640,360\);/,'Ustaw granice świata.');replace(entry,/(?:leftWall|rightWall)\.addComponent\(new (?:GameLab\.)?Collider2D\(20,360\)\);/g,'Dodaj collider ściany 20×360.');}
  } else if(chapter==='enemy-ai' && mode==='guided') {
    replace(`EnemyAI.${ext}`,/ (?:this\.)?requireComponent\([^;]+\.move\([^;]+;/,'Uruchom pościg: move(dx, dy, speed).');
  } else if(chapter==='projectiles') {
    if(mode==='guided')replace(`ProjectileHit.${ext}`,/hp\.damage\((?:this\.)?damage\);/,'Odejmij celowi damage punktów zdrowia.');
    else if(mode==='modified') {files[entry]=files[entry].replace('ProjectileMotion(1,0,200,0.5)','ProjectileMotion(1,0,200,2)');files[entry]='// TODO: Zmień lifetime pocisku na 0.5 sekundy.\n'+files[entry];}
    else {replace(entry,/(?:Projectile2D|const) motion = projectile\.addComponent\(new (?:GameLab\.)?Projectile2D\([^\n]+\);/,'Dodaj pociskowi Projectile2D z polecenia.');replace(entry,/motion\.hitLayers=2;/,'Ustaw hitLayers na 2.');}
  } else return null; // The existing method exercise keeps a working scene for advanced tasks.
  return {files,ready:solution.ready};
}
