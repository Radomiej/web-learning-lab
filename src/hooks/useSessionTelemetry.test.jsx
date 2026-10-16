import {test,expect,vi} from 'vitest';
import {renderHook,act} from '@testing-library/react';
import {useSessionTelemetry} from './useSessionTelemetry.js';
test('remembers optional student name locally and keeps editor independent of storage failure',()=>{
 localStorage.clear();
 const snapshot={lessonId:'one',lessonTitle:'Lesson',taskId:'task',activeFile:'query.sql',files:{'query.sql':'SELECT 1'},runnerStatus:'idle',output:'',passed:null,visibility:'visible'};
 const first=renderHook(()=>useSessionTelemetry(snapshot));
 act(()=>first.result.current.setStudentName('Ola · 3A'));
 expect(localStorage.getItem('lab-student-name-v1')).toBe('Ola · 3A');first.unmount();
 const next=renderHook(()=>useSessionTelemetry(snapshot));expect(next.result.current.studentName).toBe('Ola · 3A');
 const spy=vi.spyOn(Storage.prototype,'setItem').mockImplementation(()=>{throw new Error('blocked');});
 expect(()=>act(()=>next.result.current.setStudentName('Jan'))).not.toThrow();expect(next.result.current.studentName).toBe('Jan');spy.mockRestore();
});
