var ot=Object.defineProperty;var rt=(v,t,s)=>t in v?ot(v,t,{enumerable:!0,configurable:!0,writable:!0,value:s}):v[t]=s;var w=(v,t,s)=>rt(v,typeof t!="symbol"?t+"":t,s);(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))i(n);new MutationObserver(n=>{for(const r of n)if(r.type==="childList")for(const h of r.addedNodes)h.tagName==="LINK"&&h.rel==="modulepreload"&&i(h)}).observe(document,{childList:!0,subtree:!0});function s(n){const r={};return n.integrity&&(r.integrity=n.integrity),n.referrerPolicy&&(r.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?r.credentials="include":n.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function i(n){if(n.ep)return;n.ep=!0;const r=s(n);fetch(n.href,r)}})();var q={exports:{}},Z;function lt(){return Z||(Z=1,function(v){(function(){var t=["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"],s=["ㅏ","ㅐ","ㅑ","ㅒ","ㅓ","ㅔ","ㅕ","ㅖ","ㅗ",["ㅗ","ㅏ"],["ㅗ","ㅐ"],["ㅗ","ㅣ"],"ㅛ","ㅜ",["ㅜ","ㅓ"],["ㅜ","ㅔ"],["ㅜ","ㅣ"],"ㅠ","ㅡ",["ㅡ","ㅣ"],"ㅣ"],i=["","ㄱ","ㄲ",["ㄱ","ㅅ"],"ㄴ",["ㄴ","ㅈ"],["ㄴ","ㅎ"],"ㄷ","ㄹ",["ㄹ","ㄱ"],["ㄹ","ㅁ"],["ㄹ","ㅂ"],["ㄹ","ㅅ"],["ㄹ","ㅌ"],["ㄹ","ㅍ"],["ㄹ","ㅎ"],"ㅁ","ㅂ",["ㅂ","ㅅ"],"ㅅ","ㅆ","ㅇ","ㅈ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"],n=44032,r=["ㄱ","ㄲ","ㄳ","ㄴ","ㄵ","ㄶ","ㄷ","ㄸ","ㄹ","ㄺ","ㄻ","ㄼ","ㄽ","ㄾ","ㄿ","ㅀ","ㅁ","ㅂ","ㅃ","ㅄ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"],h=["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"],M=["ㅏ","ㅐ","ㅑ","ㅒ","ㅓ","ㅔ","ㅕ","ㅖ","ㅗ","ㅘ","ㅙ","ㅚ","ㅛ","ㅜ","ㅝ","ㅞ","ㅟ","ㅠ","ㅡ","ㅢ","ㅣ"],I=["","ㄱ","ㄲ","ㄳ","ㄴ","ㄵ","ㄶ","ㄷ","ㄹ","ㄺ","ㄻ","ㄼ","ㄽ","ㄾ","ㄿ","ㅀ","ㅁ","ㅂ","ㅄ","ㅅ","ㅆ","ㅇ","ㅈ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"],E=[["ㄱ","ㅅ","ㄳ"],["ㄴ","ㅈ","ㄵ"],["ㄴ","ㅎ","ㄶ"],["ㄹ","ㄱ","ㄺ"],["ㄹ","ㅁ","ㄻ"],["ㄹ","ㅂ","ㄼ"],["ㄹ","ㅅ","ㄽ"],["ㄹ","ㅌ","ㄾ"],["ㄹ","ㅍ","ㄿ"],["ㄹ","ㅎ","ㅀ"],["ㅂ","ㅅ","ㅄ"]],B=[["ㅗ","ㅏ","ㅘ"],["ㅗ","ㅐ","ㅙ"],["ㅗ","ㅣ","ㅚ"],["ㅜ","ㅓ","ㅝ"],["ㅜ","ㅔ","ㅞ"],["ㅜ","ㅣ","ㅟ"],["ㅡ","ㅣ","ㅢ"]],a,b,c,T,R,k;function K(e){for(var o=e.length,p={0:0},l=0;l<o;l++)e[l]&&(p[e[l].charCodeAt(0)]=l);return p}a=K(r),b=K(h),c=K(M),T=K(I);function G(e){for(var o=e.length,p={},l,d,f=0;f<o;f++)l=e[f][0].charCodeAt(0),d=e[f][1].charCodeAt(0),typeof p[l]>"u"&&(p[l]={}),p[l][d]=e[f][2].charCodeAt(0);return p}R=G(E),k=G(B);function j(e){return typeof a[e]<"u"}function N(e){return typeof b[e]<"u"}function P(e){return typeof c[e]<"u"}function X(e){return typeof T[e]<"u"}function _(e){return 44032<=e&&e<=55203}function U(e,o){return k[e]&&k[e][o]?k[e][o]:!1}function W(e,o){return R[e]&&R[e][o]?R[e][o]:!1}var O=function(e,o){if(e===null)throw new Error("Arguments cannot be null");typeof e=="object"&&(e=e.join(""));for(var p=[],l=e.length,d,f,A,S,g,x=0;x<l;x++){var u=[];S=e.charCodeAt(x),_(S)?(S-=n,A=S%28,f=(S-A)/28%21,d=parseInt((S-A)/28/21),u.push(t[d]),typeof s[f]=="object"?u=u.concat(s[f]):u.push(s[f]),A>0&&(typeof i[A]=="object"?u=u.concat(i[A]):u.push(i[A]))):j(S)?(N(S)?g=t[b[S]]:g=i[T[S]],typeof g=="string"?u.push(g):u=u.concat(g)):P(S)?(g=s[c[S]],typeof g=="string"?u.push(g):u=u.concat(g)):u.push(e.charAt(x)),o?p.push(u):p=p.concat(u)}return p},$=function(e){return typeof e!="string"?"":(e=O(e),e.join(""))},Y=function(e){typeof e=="string"&&(e=O(e));var o=[],p=e.length,l,d=0,f=-1,A,S=!1;function g(u){var m,C,V,L=0,J,F="";if(S=!1,!(f+1>u))for(var y=1;;y++){if(y===1){if(m=e[f+y].charCodeAt(0),P(m))if(f+y+1<=u&&P(C=e[f+y+1].charCodeAt(0))){o.push(String.fromCharCode(U(m,C))),f=u;return}else{o.push(e[f+y]),f=u;return}else if(!N(m)){o.push(e[f+y]),f=u;return}F=e[f+y]}else if(y===2)if(C=e[f+y].charCodeAt(0),N(C)){m=W(m,C),F=String.fromCharCode(m),o.push(F),f=u;return}else F=String.fromCharCode((b[m]*21+c[C])*28+n);else y===3?(V=e[f+y].charCodeAt(0),U(C,V)?C=U(C,V):L=V,F=String.fromCharCode((b[m]*21+c[C])*28+T[L]+n)):y===4?(J=e[f+y].charCodeAt(0),W(L,J)?L=W(L,J):L=J,F=String.fromCharCode((b[m]*21+c[C])*28+T[L]+n)):y===5&&(J=e[f+y].charCodeAt(0),L=W(L,J),F=String.fromCharCode((b[m]*21+c[C])*28+T[L]+n));if(f+y>=u){o.push(F),f=u;return}}}for(var x=0;x<p;x++){if(l=e[x].charCodeAt(0),!N(l)&&!P(l)&&!X(l)){g(x-1),g(x),d=0;continue}d===0?N(l)?d=1:P(l)&&(d=4):d==1?P(l)?d=2:W(A,l)?d=5:g(x-1):d==2?X(l)?d=3:P(l)?U(A,l)||(g(x-1),d=4):(g(x-1),d=1):d==3?X(l)?!S&&W(A,l)?S=!0:(g(x-1),d=1):N(l)?(g(x-1),d=1):P(l)&&(g(x-2),d=2):d==4?P(l)?U(A,l)?(g(x),d=0):g(x-1):(g(x-1),d=1):d==5&&(P(l)?(g(x-2),d=2):(g(x-1),d=1)),A=l}return g(x-1),o.join("")},tt=function(e,o){var p=O(e).join(""),l=O(o).join("");return p.indexOf(l)},et=function(e,o){var p=O(e).join(""),l=O(o).join(""),d=O(e,!0),f=new RegExp(l,"gi"),A=[],S;if(!o.length)return[];for(;S=f.exec(p);)A.push(S.index);function g(u){for(var m=0,C=0;m<d.length;++m)if(C+=d[m].length,u<C)return m}function x(u){for(var m=0,C=0;m<d.length;++m)if(C+=d[m].length,u+l.length<=C)return m}return A.map(function(u){return[g(u),x(u)]})};function Q(e){this.string=e,this.disassembled=O(e).join("")}Q.prototype.search=function(e){return O(e).join("").indexOf(this.disassembled)};var st=function(e){typeof e=="object"&&(e=e.join(""));var o=e.charCodeAt(e.length-1);if(_(o)){o-=n;var p=o%28;if(p>0)return!0}else if(j(o))return!0;return!1},it=function(e,o){return O(e).pop()===o},nt={disassemble:O,d:O,disassembleToString:$,ds:$,assemble:Y,a:Y,search:tt,rangeSearch:et,Searcher:Q,endsWithConsonant:st,endsWith:it,isHangul:function(e){return typeof e=="string"&&(e=e.charCodeAt(0)),_(e)},isComplete:function(e){return typeof e=="string"&&(e=e.charCodeAt(0)),_(e)},isConsonant:function(e){return typeof e=="string"&&(e=e.charCodeAt(0)),j(e)},isVowel:function(e){return typeof e=="string"&&(e=e.charCodeAt(0)),P(e)},isCho:function(e){return typeof e=="string"&&(e=e.charCodeAt(0)),N(e)},isJong:function(e){return typeof e=="string"&&(e=e.charCodeAt(0)),X(e)},isHangulAll:function(e){if(typeof e!="string")return!1;for(var o=0;o<e.length;o++)if(!_(e.charCodeAt(o)))return!1;return!0},isCompleteAll:function(e){if(typeof e!="string")return!1;for(var o=0;o<e.length;o++)if(!_(e.charCodeAt(o)))return!1;return!0},isConsonantAll:function(e){if(typeof e!="string")return!1;for(var o=0;o<e.length;o++)if(!j(e.charCodeAt(o)))return!1;return!0},isVowelAll:function(e){if(typeof e!="string")return!1;for(var o=0;o<e.length;o++)if(!P(e.charCodeAt(o)))return!1;return!0},isChoAll:function(e){if(typeof e!="string")return!1;for(var o=0;o<e.length;o++)if(!N(e.charCodeAt(o)))return!1;return!0},isJongAll:function(e){if(typeof e!="string")return!1;for(var o=0;o<e.length;o++)if(!X(e.charCodeAt(o)))return!1;return!0}};v.exports=nt})()}(q)),q.exports}var z=lt();const H=class H{constructor(t,s){w(this,"canvas");w(this,"context");w(this,"value");w(this,"selection");w(this,"isFocused");w(this,"selectionPos");w(this,"blinkTimer");w(this,"maxLength");w(this,"assemblePos");w(this,"startPos");w(this,"wasOver");w(this,"settings");this.canvas=s,this.context=s.getContext("2d"),this.settings=Object.assign({},H.defaultSettings,t),this.value=this.settings.defaultValue,this.selection=[0,0],this.isFocused=!1,this.blinkTimer=0,this.maxLength=this.settings.maxLength,this.resetSelectionPos(),this.resetAssembleMode(),this.startPos=0,this.wasOver=!1,document.addEventListener("keydown",this.onKeyDown.bind(this)),this.canvas.addEventListener("mousemove",this.onMouseMove.bind(this),!0),this.canvas.addEventListener("mousedown",this.onMouseDown.bind(this),!0),document.addEventListener("mouseup",this.onMouseUp.bind(this),!0),this.canvas.addEventListener("dblclick",this.onDoubleClick.bind(this),!0),this.canvas.addEventListener("copy",async i=>this.onCopy.call(this,i)),this.canvas.addEventListener("paste",async i=>this.onPaste.call(this,i)),this.canvas.addEventListener("cut",async i=>this.onCut.call(this,i))}draw(){this.context.font=`${this.settings.fontSize}px ${this.settings.font}`,this.context.textAlign="left",this.context.textBaseline="middle";const t=this.getStartX(),s=this.getStartY(),i=this.area(),n=Math.round(s+Math.round(this.settings.fontSize/2)+1);if(this.context.save(),this.context.beginPath(),this.context.rect(i.x,i.y,i.w+1,i.h+1),this.context.clip(),this.disabled&&(this.context.fillStyle=this.settings.disabledColor,this.context.fillRect(this.settings.bounds.x-this.settings.padding.left,this.settings.bounds.y-this.settings.padding.top,i.w,i.h)),this.isFocused){if(this.isSelected()){const a=this.measureText(this.getSubText(0,Math.min(this.selection[0],this.selection[1]))),b=this.measureText(this.getSelectionText());this.context.fillStyle=this.settings.selectionColor,this.context.fillRect(a+t,s-1,b,this.settings.fontSize+3)}else if(this.cursorBlink()){const a=this.measureText(this.getSubText(0,this.selection[0]));this.context.fillStyle=this.settings.fontColor,this.context.fillRect(a+t,s,1,this.settings.fontSize)}}const[r,h]=this.getSelectionOutside(),M=this.getSelectionText(),I=this.getDrawText(r),E=this.getDrawText(M),B=this.getDrawText(h);this.context.fillStyle=this.disabled?this.settings.disabledFontColor:this.settings.fontColor,this.context.fillText(I,t,n),this.context.fillStyle=this.disabled?this.settings.disabledFontColor:this.settings.selectionFontColor,this.context.fillText(E,t+this.measureText(r),n),this.context.fillStyle=this.disabled?this.settings.disabledFontColor:this.settings.fontColor,this.context.fillText(B,t+this.measureText(r+M),n),this.isEmpty()&&(this.context.fillStyle=this.settings.placeHolderColor,this.context.fillText(this.settings.placeHolder,t,n)),this.isFocused&&this.isAssembleMode()&&this.drawUnderline(),this.drawRect(i.x,i.y,i.w,i.h),this.context.restore()}update(t){this.blinkTimer+=t}moveSelection(t){this.setSelection(t,t)}setSelection(t,s){t=this.clamp(t,0,this.value.length),s=this.clamp(s,0,this.value.length),this.selection[0]=t,this.selection[1]=s,this.blinkTimer=this.settings.caretBlinkRate}isSelected(){return this.selection[0]!==this.selection[1]}isEmpty(){return this.getLength()===0}getLength(){return this.value.length}getMaxLength(){return this.settings.maxLength}set text(t){this.value=t}get text(){return this.value}get focus(){return this.isFocused}set focus(t){t&&!this.disabled?(this.isFocused=!0,this.blinkTimer=this.settings.caretBlinkRate,this.settings.focusCallback(!0)):(this.onStartOfSelection(),this.resetAssembleMode(),this.resetSelectionPos(),this.isFocused=!1,this.settings.focusCallback(!1))}get disabled(){return this.settings.disabled}set disabled(t){this.settings.disabled=t,this.focus=!1}get type(){return this.settings.type}set type(t){this.settings.type=t,this.resetAssembleMode(),this.onCancelOfSelectionEnd()}getDrawText(t){return this.type==="password"?this.settings.passwordChar.repeat(t.length):t}drawUnderline(){const t=this.getStartX(),s=this.getStartY()+this.settings.fontSize-2;this.context.fillStyle=this.settings.underlineColor;const i=this.measureText(this.getAssemblePosBefore()),n=this.measureText(this.getAssemblePosChar());this.context.fillRect(i+t,s,n,2)}getStartX(){return this.settings.bounds.x+this.settings.padding.left+this.settings.border.left}getStartY(){return this.settings.bounds.y+this.settings.padding.top+this.settings.border.top}measureText(t){return this.context.font=`${this.settings.fontSize}px ${this.settings.font}`,this.context.textAlign="left",this.context.textBaseline="middle",this.context.measureText(this.getDrawText(t)).width}cursorBlink(){return Math.floor(this.blinkTimer/this.settings.caretBlinkRate)%2}getSelectionText(){return this.getSubText(this.selection[0],this.selection[1])}getSubText(t,s){return this.value.substring(t,s)}extendSelection(t,s){this.setSelection(t,s)}moveRightBoundary(){const t=Math.max(this.selection[0],this.selection[1]);this.moveSelection(t)}moveLeftBoundary(){const t=Math.min(this.selection[0],this.selection[1]);this.moveSelection(t)}extendRightBoundary(){const t=Math.min(this.selection[0],this.selection[1]);this.extendSelection(t,this.value.length)}extendLeftBoundary(){const t=Math.max(this.selection[0],this.selection[1]);this.extendSelection(t,0)}onRight(t){t.preventDefault();const s=t.altKey,i=t.shiftKey,n=t.metaKey,r=t.ctrlKey;if(this.resetAssembleMode(),this.isSelected()){if(i)if(n||r)this.extendRightBoundary();else if(s){const h=this.getNearestWordIndex(this.selection[1])[1];this.extendSelection(this.selection[0],h)}else this.extendSelection(this.selection[0],this.selection[1]+1);else n||r?this.onEndOfSelection():this.moveRightBoundary();return}if(s){const h=this.getNearestWordIndex(this.selection[1])[1];i?this.extendSelection(this.selection[0],h):this.moveSelection(h);return}if(n||r){i?this.extendSelection(this.selection[0],this.value.length):this.onEndOfSelection();return}i?this.extendSelection(this.selection[0],this.selection[1]+1):this.moveSelection(this.selection[1]+1)}onLeft(t){t.preventDefault();const s=t.altKey,i=t.shiftKey,n=t.metaKey,r=t.ctrlKey;if(this.resetAssembleMode(),this.isSelected()){if(i)if(n||r)this.extendLeftBoundary();else if(s){const h=this.getNearestWordIndex(this.selection[1]-1)[0];this.extendSelection(this.selection[0],h)}else this.extendSelection(this.selection[0],this.selection[1]-1);else n||r?this.onStartOfSelection():this.moveLeftBoundary();return}if(s){const h=this.getNearestWordIndex(this.selection[0]-1)[0];i?this.extendSelection(this.selection[1],h):this.moveSelection(h);return}if(n||r){i?this.extendSelection(this.selection[1],0):this.onStartOfSelection();return}i?this.extendSelection(this.selection[0],this.selection[1]-1):this.moveSelection(this.selection[1]-1)}onHome(t){if(t.preventDefault(),t.shiftKey){const i=Math.max(this.selection[0],this.selection[1]);this.extendSelection(i,0)}else this.onStartOfSelection()}onEnd(t){if(t.preventDefault(),t.shiftKey){const i=Math.min(this.selection[0],this.selection[1]);this.extendSelection(i,this.value.length)}else this.onEndOfSelection()}onStartOfSelection(){this.moveSelection(0)}onEndOfSelection(){this.moveSelection(this.value.length)}onCancelOfSelectionStart(){this.moveSelection(this.selection[0])}onCancelOfSelectionEnd(){this.moveSelection(this.selection[1])}createClipboardEvent(t){return new ClipboardEvent(t,{bubbles:!0,cancelable:!0,clipboardData:null})}handleMetaInput(t){const s=t.key,i=t.metaKey;return i&&(s==="c"||s==="C"||s==="ㅊ")?(this.canvas.dispatchEvent(this.createClipboardEvent("copy")),!0):i&&(s==="v"||s==="V"||s==="ㅍ")?(this.canvas.dispatchEvent(this.createClipboardEvent("paste")),!0):i&&(s==="x"||s==="X"||s==="ㅌ")?(this.canvas.dispatchEvent(this.createClipboardEvent("cut")),!0):i&&(s==="a"||s==="A"||s==="ㅁ")?(t.preventDefault(),this.selectAllText(),!0):!!(i&&(s==="r"||s==="R"||s==="ㄱ"))}handleTypedText(t){const s=t.key;this.handleMetaInput(t)||s.length>1||this.appendValue(s)}isMaxLengthOverflow(t=""){return this.maxLength===-1?!1:this.value.length+t.length>this.maxLength}isNumeric(t){return/^-?\d+$/.test(t)}appendValue(t,s=!1){if(this.type==="number"&&!this.isNumeric(t))return;const[i,n]=this.getSelectionOutside();if(this.isMaxLengthOverflow(t)){const r=this.settings.maxLength-(i.length+n.length),h=t.substring(0,r);h.length>0&&this.handleNonHangul(i,h,n);return}this.isHangul(t)?(this.handleHangul(i,t,n),s&&this.resetAssembleMode()):this.handleNonHangul(i,t,n)}handleHangul(t,s,i){if(this.type==="password"){this.assembleHangul(t,this.convertKoreanToEnglish(s),i);return}this.isAssembleMode()?this.assembleHangul(this.getAssemblePosBefore(),z.a(z.d(this.getAssemblePosChar()+s)),i):this.assembleHangul(t,z.a(z.d(s)),i)}assembleHangul(t,s,i){this.text=t+s+i;const n=t.length+s.length;this.moveSelection(n),this.setAssemblePos(n-1)}handleNonHangul(t,s,i){const n=t.length+s.length;this.text=t+s+i,this.moveSelection(n),this.resetAssembleMode()}onRemove(t){t.preventDefault();const s=t.metaKey;if(this.isSelected()){const[h,M]=this.getSelectionOutside();this.text=h+M,this.moveSelection(h.length);return}if(this.isAssembleMode()&&!s){const h=this.getAssemblePosBefore(),M=z.d(this.getAssemblePosChar()),I=this.getAssemblePosAfter(),E=z.a(M.slice(0,-1));E===""&&this.resetAssembleMode();const B=h+E;this.text=B+I,this.moveSelection(B.length);return}const[i,n]=this.getSelectionOutside(),r=i.slice(0,s?i.length*-1:-1);this.text=r+n,this.moveSelection(r.length)}setAssemblePos(t){this.assemblePos=t}resetAssembleMode(){this.assemblePos=-1}isAssembleMode(){return this.assemblePos!==-1}isHangul(t){const s=t.charCodeAt(0);return s>=4352&&s<=4607||s>=12592&&s<=12687||s>=44032&&s<=55203}isSelectionStart(){return this.selectionPos>=0}resetSelectionPos(){this.selectionPos=-1}textPos(t,s){const i=t-this.area().x;let n=0,r=this.value.length;if(i<this.measureText(this.value)){for(let h=0;h<this.value.length;h++)if(n+=this.measureText(this.value[h]),n>=i){r=h;break}}return r}getMousePos(t){const i=t.target.getBoundingClientRect(),n=t.clientX-i.left,r=t.clientY-i.top;return{x:n,y:r}}onKeyDown(t){if(!this.isFocused)return;switch(t.key){case"Meta":case"Alt":case"Shift":case"Control":case"Tab":case"ArrowUp":case"ArrowDown":break;case"Enter":this.settings.enterCallback(t);break;case"Backspace":this.onRemove(t);break;case"ArrowRight":this.onRight(t);break;case"ArrowLeft":this.onLeft(t);break;case"Escape":this.onCancelOfSelectionEnd();break;case"Home":this.onHome(t);break;case"End":this.onEnd(t);break;case" ":t.preventDefault();default:this.handleTypedText(t);break}}onMouseMove(t){const s=this.getMousePos(t);if(this.contains(s.x,s.y)&&!this.disabled?(this.settings.hoverCallback(!0),this.canvas.style.cursor="text",this.wasOver=!0):(this.settings.hoverCallback(!1),this.wasOver&&(this.canvas.style.cursor="default",this.wasOver=!1)),!this.isFocused||!this.isSelectionStart())return;const i=this.textPos(s.x,s.y),n=Math.min(this.selectionPos,i),r=Math.max(this.selectionPos,i);this.extendSelection(n,r)}onMouseDown(t){t.preventDefault();const s=t.button===0,i=this.getMousePos(t);if(this.resetAssembleMode(),s&&this.contains(i.x,i.y)&&!this.disabled){this.focus=!0;const n=this.textPos(i.x,i.y);if(t.detail===3&&n>=this.selection[0]&&n<=this.selection[1]){this.selectAllText();return}this.moveSelection(n),this.selectionPos=n;return}this.focus=!1}onMouseUp(t){this.isFocused&&this.resetSelectionPos()}onDoubleClick(t){if(!this.isFocused)return;t.preventDefault();const s=t.button===0,i=this.getMousePos(t);if(s&&this.contains(i.x,i.y)){const n=this.textPos(i.x,i.y),[r,h]=this.getNearestWordIndex(n);this.extendSelection(r,h)}}async onCopy(t){!this.isFocused||this.type==="password"||this.isEmpty()||await navigator.clipboard.writeText(this.getSelectionText())}async onPaste(t){if(!this.isFocused)return;const s=await navigator.clipboard.readText();this.appendValue(s,!0)}async onCut(t){if(!this.isFocused||this.type==="password"||this.isEmpty())return;await navigator.clipboard.writeText(this.getSelectionText());const[s,i]=this.getSelectionOutside();this.text=s+i,this.moveSelection(s.length)}getNearestWordIndex(t){let s=0,i=this.value.length;for(let n=t-1;n>0;n--)if(H.DELIMITERS.has(this.value[n])){s=n+1;break}for(let n=t+1;n<this.value.length;n++)if(H.DELIMITERS.has(this.value[n])){i=n;break}return[s,i]}selectAllText(){this.extendSelection(0,this.value.length),this.resetAssembleMode()}getSelectionOutside(){const t=Math.min(this.selection[0],this.selection[1]),s=Math.max(this.selection[0],this.selection[1]),i=this.getSubText(0,t),n=this.getSubText(s,this.value.length);return[i,n]}getAssemblePosBefore(){return this.getSubText(0,this.assemblePos)}getAssemblePosChar(){return this.getSubText(this.assemblePos,Math.min(this.assemblePos+1,this.value.length))}getAssemblePosAfter(){return this.getSubText(Math.min(this.assemblePos+1,this.value.length),this.value.length)}area(){return{x:this.settings.bounds.x-this.settings.padding.left-this.settings.border.left,y:this.settings.bounds.y-this.settings.padding.top-this.settings.border.top,w:this.settings.bounds.w+this.settings.padding.right+this.settings.border.right,h:this.settings.fontSize+4+this.settings.padding.bottom+this.settings.border.bottom}}contains(t,s){const i=this.area();return t>=i.x&&t<=this.settings.bounds.x+i.w&&s>=i.y&&s<=this.settings.bounds.y+i.h}drawRect(t,s,i,n){this.context.beginPath();const r=1;this.context.strokeStyle=this.isFocused?this.settings.focusBoxColor:this.disabled?this.settings.disabledBorderColor:this.settings.boxColor,this.context.lineWidth=this.isFocused?this.settings.focusBorder.left:this.settings.border.left,this.context.moveTo(t+.5,s+r),this.context.lineTo(t+.5,s+n),this.context.lineWidth=this.isFocused?this.settings.focusBorder.right:this.settings.border.right,this.context.moveTo(t+i+.5,s+r),this.context.lineTo(t+i+.5,s+n),this.context.lineWidth=this.isFocused?this.settings.focusBorder.top:this.settings.border.top,this.context.moveTo(t+r,s+.5),this.context.lineTo(t+i,s+.5),this.context.lineWidth=this.isFocused?this.settings.focusBorder.bottom:this.settings.border.bottom,this.context.moveTo(t+r,s+n+.5),this.context.lineTo(t+i,s+n+.5),this.context.stroke()}clamp(t,s,i){return Math.min(Math.max(t,s),i)}convertKoreanToEnglish(t){return H.KOREAN_TO_ENGLISH[t]??t}};w(H,"DELIMITERS",new Set([" ",",",".",";",":","/","[","]","-","\\","?"])),w(H,"KOREAN_TO_ENGLISH",{ㅁ:"a",ㄴ:"s",ㅇ:"d",ㄹ:"f",ㅎ:"g",ㅗ:"h",ㅓ:"j",ㅏ:"k",ㅣ:"l",ㅂ:"q",ㅈ:"w",ㄷ:"e",ㄱ:"r",ㅅ:"t",ㅛ:"y",ㅕ:"u",ㅑ:"i",ㅐ:"o",ㅔ:"p",ㅋ:"z",ㅌ:"x",ㅊ:"c",ㅍ:"v",ㅠ:"b",ㅜ:"n",ㅡ:"m",ㅃ:"Q",ㅉ:"W",ㄸ:"E",ㄲ:"R",ㅆ:"T",o:"ㅒ",p:"ㅖ"}),w(H,"defaultSettings",{font:"Apple SD Gothic Neo",fontColor:"#000",selectionFontColor:"#FFF",selectionColor:"#0D0577",boxColor:"#767676",focusBoxColor:"#000",underlineColor:"#000",fontSize:13,maxLength:-1,caretBlinkRate:.5,defaultValue:"",placeHolder:"",placeHolderColor:"rgb(111, 111, 111)",type:"text",disabled:!1,disabledColor:"rgb(247, 247, 247)",disabledFontColor:"#545454",disabledBorderColor:"rgb(204, 204, 204)",passwordChar:"●",bounds:{x:0,y:0,w:100},padding:{top:1,left:1,right:1,bottom:2},border:{top:1,left:1,right:1,bottom:1},focusBorder:{top:3,left:3,right:3,bottom:3},enterCallback:t=>{},hoverCallback:t=>{},focusCallback:t=>{}});let D=H;function ht(){const v=document.getElementById("myCanvas"),t=v.getContext("2d"),s=document.getElementById("show"),i=document.getElementById("enable"),n=[new D({bounds:{x:10,y:20,w:300},maxLength:8},v),new D({fontSize:30,bounds:{x:10,y:50,w:300},placeHolder:"한글을 입력해주세요"},v),new D({bounds:{x:10,y:110,w:300},type:"number",placeHolder:"숫자",maxLength:8},v),new D({bounds:{x:10,y:150,w:300},type:"password",placeHolder:"암호",maxLength:15},v),new D({bounds:{x:10,y:180,w:300},disabled:!0},v)];s.addEventListener("click",()=>{const a=n[n.length-2];a.type==="password"?(a.type="text",s.textContent="Hide"):(a.type="password",s.textContent="Show")}),i.addEventListener("click",()=>{const a=n[n.length-1];a.disabled?(a.disabled=!1,i.textContent="Enable"):(a.disabled=!0,i.textContent="Disable")}),document.addEventListener("keydown",a=>{const b=a.key,c=a.shiftKey;if(b==="Tab"&&!c){M();return}b==="Tab"&&c&&I()});const r=document.getElementById("show2"),h=document.getElementById("enable2");r.addEventListener("click",()=>{const a=document.getElementById("password");a.type==="password"?(a.type="text",r.textContent="Hide"):(a.type="password",r.textContent="Show")}),h.addEventListener("click",()=>{const a=document.getElementById("disabled");a.disabled?(a.disabled=!1,h.textContent="Enable"):(a.disabled=!0,h.textContent="Disable")});function M(){const a=n.findIndex(T=>T.focus),b=a===-1?0:a;let c=(b+1)%n.length;for(;n[c].disabled&&(c=(c+1)%n.length,c!==b););n[b].focus=!1,n[c].focus=!0,n[c].selectAllText()}function I(){const a=n.findIndex(T=>T.focus),b=a===-1?0:a;let c=(b-1+n.length)%n.length;for(;n[c].disabled&&(c=(c-1+n.length)%n.length,c!==b););n[b].focus=!1,n[c].focus=!0,n[c].selectAllText()}let E=0;function B(a){const b=(a-E)/1e3;t.clearRect(0,0,v.width,v.height),n.forEach(c=>c.update(b)),n.forEach(c=>c.draw()),n.forEach(c=>{const{x:T,y:R,w:k}=c.area(),K=c.getMaxLength();if(K===-1)return;t.font="12px Monospaced",t.textAlign="left",t.textBaseline="middle",t.fillStyle="gray";const G=`${K-c.getLength()} remain`,j=t.measureText(G).width;t.fillText(G,T+k-j-8,R-7)}),E=a,window.requestAnimationFrame(B)}requestAnimationFrame(B)}document.addEventListener("DOMContentLoaded",ht);
