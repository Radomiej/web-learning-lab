import {render,act} from '@testing-library/react';
import {test,expect,vi} from 'vitest';
import App from './App.jsx';
const control=vi.hoisted(()=>({state:null,onRun:null,scopeKey:null,capture:vi.fn()}));
vi.mock('./hooks/useSessionTelemetry.js',()=>({useSessionTelemetry:()=>({machineId:'test',status:'disabled',studentName:'',setStudentName:()=>{},capture:control.capture})}));
vi.mock('./hooks/usePreviewRuntime.js',async original=>{const actual=await original();return {usePreviewRuntime:(...args)=>{const result=actual.usePreviewRuntime(...args);control.onRun=args[4]?.onRun;control.scopeKey=args[3];return {...result,runId:'test-run',runtimeState:{...result.runtimeState,...control.state}};}};});
test('archives late console output using the files actually executed',()=>{
 localStorage.clear();const view=render(<App/>);
 const project={entry:'index.html',files:{'index.html':'before run'}};
 act(()=>control.onRun({project,runId:'test-run',scopeKey:control.scopeKey}));
 control.state={status:'ready',errors:[],checkResults:[],messages:[]};view.rerender(<App/>);
 control.state={...control.state,messages:[{level:'log',text:'late console result'}]};view.rerender(<App/>);
 expect(control.capture).toHaveBeenLastCalledWith('run_result',expect.objectContaining({files:{'index.html':'before run'},output:expect.stringContaining('late console result')}));
});
