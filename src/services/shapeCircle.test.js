import { createGameLab } from './gameRuntime.js';
import { createRenderer } from '../../shared/lab-game-v2/renderer.js';

test('circle renders around its center with camera, visual scale and independent collider',()=>{
 const calls=[];const context=new Proxy({}, {get:(o,k)=>o[k]??((...args)=>calls.push([k,...args]))});
 const canvas=document.createElement('canvas');canvas.getContext=()=>context;
 const lab=createGameLab({window,document,requestAnimationFrame:()=>1,cancelAnimationFrame:()=>{},skipAssetLoading:true});
 class Scene extends lab.Game {onCreate(){
 const p=this.createObject('Circle').setPosition(100,80);p.addComponent(lab.ShapeRenderer.circle(12,'#f00'));p.addComponent(new lab.CircleCollider2D(7));p.transform.scale.set(2,3);
 this.createObject('Box').setPosition(40,30).addComponent(new lab.ShapeRenderer(40,20,'#fff'));
 const cam=this.createObject('Camera').addComponent(new lab.Camera2D());cam.offsetX=20;cam.offsetY=10;
 }}
 try {lab.run(Scene,{canvas});lab.current.step(0);
 expect(lab.current.canvas.commands.find(c=>c.op==='circle')).toMatchObject({x:100,y:80,screenX:80,screenY:70,radius:12,scaleX:2,scaleY:3,color:'#f00'});
 expect(calls).toContainEqual(['arc',0,0,12,0,Math.PI*2]);expect(calls).toContainEqual(['translate',80,70]);
 expect(lab.current.find('Circle').getComponent(lab.CircleCollider2D).radius).toBe(7);
 expect(lab.current.canvas.commands.find(c=>c.op==='rect')).toMatchObject({width:40,height:20});
 }finally{lab.dispose();}
});
test.each([-1,NaN,Infinity])('rejects invalid circle radius %s',radius=>{
 const lab=createGameLab({window,document,skipAssetLoading:true});expect(()=>lab.ShapeRenderer.circle(radius)).toThrow();
});
test('controller exposes a normalized last direction and protects it from callers',()=>{
 const lab=createGameLab({window,document,skipAssetLoading:true});const c=new lab.CharacterController2D();
 expect(c.getDirection()).toMatchObject({x:1,y:0});c.move(3,4,120);expect(c.getDirection()).toMatchObject({x:.6,y:.8});
 c.move(0,0,120);const d=c.getDirection();d.x=99;expect(c.getDirection()).toMatchObject({x:.6,y:.8});
});
