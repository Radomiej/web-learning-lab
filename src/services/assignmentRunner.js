import {buildPreviewDocument} from './previewDocument.js';
export async function runAssignment(assignment,files){
  return {html:buildPreviewDocument({entry:'index.html',files},{track:assignment.templateId.startsWith('js-')?'js':'html',requestedSignals:[]})};
}
