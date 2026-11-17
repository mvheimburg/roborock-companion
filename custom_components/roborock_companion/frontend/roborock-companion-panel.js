/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t$2=globalThis,e$3=t$2.ShadowRoot&&(void 0===t$2.ShadyCSS||t$2.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s$2=Symbol(),o$3=new WeakMap;let n$2 = class n{constructor(t,e,o){if(this._$cssResult$=true,o!==s$2)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e;}get styleSheet(){let t=this.o;const s=this.t;if(e$3&&void 0===t){const e=void 0!==s&&1===s.length;e&&(t=o$3.get(s)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),e&&o$3.set(s,t));}return t}toString(){return this.cssText}};const r$3=t=>new n$2("string"==typeof t?t:t+"",void 0,s$2),i$4=(t,...e)=>{const o=1===t.length?t[0]:e.reduce((e,s,o)=>e+(t=>{if(true===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+t[o+1],t[0]);return new n$2(o,t,s$2)},S$1=(s,o)=>{if(e$3)s.adoptedStyleSheets=o.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const e of o){const o=document.createElement("style"),n=t$2.litNonce;void 0!==n&&o.setAttribute("nonce",n),o.textContent=e.cssText,s.appendChild(o);}},c$2=e$3?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const s of t.cssRules)e+=s.cssText;return r$3(e)})(t):t;

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:i$3,defineProperty:e$2,getOwnPropertyDescriptor:h$1,getOwnPropertyNames:r$2,getOwnPropertySymbols:o$2,getPrototypeOf:n$1}=Object,a$1=globalThis,c$1=a$1.trustedTypes,l$2=c$1?c$1.emptyScript:"",p$2=a$1.reactiveElementPolyfillSupport,d$1=(t,s)=>t,u$1={toAttribute(t,s){switch(s){case Boolean:t=t?l$2:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t);}return t},fromAttribute(t,s){let i=t;switch(s){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t);}catch(t){i=null;}}return i}},f$1=(t,s)=>!i$3(t,s),b$1={attribute:true,type:String,converter:u$1,reflect:false,useDefault:false,hasChanged:f$1};Symbol.metadata??=Symbol("metadata"),a$1.litPropertyMetadata??=new WeakMap;let y$1 = class y extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t);}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,s=b$1){if(s.state&&(s.attribute=false),this._$Ei(),this.prototype.hasOwnProperty(t)&&((s=Object.create(s)).wrapped=true),this.elementProperties.set(t,s),!s.noAccessor){const i=Symbol(),h=this.getPropertyDescriptor(t,i,s);void 0!==h&&e$2(this.prototype,t,h);}}static getPropertyDescriptor(t,s,i){const{get:e,set:r}=h$1(this.prototype,t)??{get(){return this[s]},set(t){this[s]=t;}};return {get:e,set(s){const h=e?.call(this);r?.call(this,s),this.requestUpdate(t,h,i);},configurable:true,enumerable:true}}static getPropertyOptions(t){return this.elementProperties.get(t)??b$1}static _$Ei(){if(this.hasOwnProperty(d$1("elementProperties")))return;const t=n$1(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties);}static finalize(){if(this.hasOwnProperty(d$1("finalized")))return;if(this.finalized=true,this._$Ei(),this.hasOwnProperty(d$1("properties"))){const t=this.properties,s=[...r$2(t),...o$2(t)];for(const i of s)this.createProperty(i,t[i]);}const t=this[Symbol.metadata];if(null!==t){const s=litPropertyMetadata.get(t);if(void 0!==s)for(const[t,i]of s)this.elementProperties.set(t,i);}this._$Eh=new Map;for(const[t,s]of this.elementProperties){const i=this._$Eu(t,s);void 0!==i&&this._$Eh.set(i,t);}this.elementStyles=this.finalizeStyles(this.styles);}static finalizeStyles(s){const i=[];if(Array.isArray(s)){const e=new Set(s.flat(1/0).reverse());for(const s of e)i.unshift(c$2(s));}else void 0!==s&&i.push(c$2(s));return i}static _$Eu(t,s){const i=s.attribute;return  false===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=false,this.hasUpdated=false,this._$Em=null,this._$Ev();}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this));}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.();}removeController(t){this._$EO?.delete(t);}_$E_(){const t=new Map,s=this.constructor.elementProperties;for(const i of s.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t);}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return S$1(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(true),this._$EO?.forEach(t=>t.hostConnected?.());}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.());}attributeChangedCallback(t,s,i){this._$AK(t,i);}_$ET(t,s){const i=this.constructor.elementProperties.get(t),e=this.constructor._$Eu(t,i);if(void 0!==e&&true===i.reflect){const h=(void 0!==i.converter?.toAttribute?i.converter:u$1).toAttribute(s,i.type);this._$Em=t,null==h?this.removeAttribute(e):this.setAttribute(e,h),this._$Em=null;}}_$AK(t,s){const i=this.constructor,e=i._$Eh.get(t);if(void 0!==e&&this._$Em!==e){const t=i.getPropertyOptions(e),h="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:u$1;this._$Em=e;const r=h.fromAttribute(s,t.type);this[e]=r??this._$Ej?.get(e)??r,this._$Em=null;}}requestUpdate(t,s,i,e=false,h){if(void 0!==t){const r=this.constructor;if(false===e&&(h=this[t]),i??=r.getPropertyOptions(t),!((i.hasChanged??f$1)(h,s)||i.useDefault&&i.reflect&&h===this._$Ej?.get(t)&&!this.hasAttribute(r._$Eu(t,i))))return;this.C(t,s,i);} false===this.isUpdatePending&&(this._$ES=this._$EP());}C(t,s,{useDefault:i,reflect:e,wrapped:h},r){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,r??s??this[t]),true!==h||void 0!==r)||(this._$AL.has(t)||(this.hasUpdated||i||(s=void 0),this._$AL.set(t,s)),true===e&&this._$Em!==t&&(this._$Eq??=new Set).add(t));}async _$EP(){this.isUpdatePending=true;try{await this._$ES;}catch(t){Promise.reject(t);}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,s]of this._$Ep)this[t]=s;this._$Ep=void 0;}const t=this.constructor.elementProperties;if(t.size>0)for(const[s,i]of t){const{wrapped:t}=i,e=this[s];true!==t||this._$AL.has(s)||void 0===e||this.C(s,void 0,i,e);}}let t=false;const s=this._$AL;try{t=this.shouldUpdate(s),t?(this.willUpdate(s),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(s)):this._$EM();}catch(s){throw t=false,this._$EM(),s}t&&this._$AE(s);}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=true,this.firstUpdated(t)),this.updated(t);}_$EM(){this._$AL=new Map,this.isUpdatePending=false;}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return  true}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM();}updated(t){}firstUpdated(t){}};y$1.elementStyles=[],y$1.shadowRootOptions={mode:"open"},y$1[d$1("elementProperties")]=new Map,y$1[d$1("finalized")]=new Map,p$2?.({ReactiveElement:y$1}),(a$1.reactiveElementVersions??=[]).push("2.1.2");

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t$1=globalThis,i$2=t=>t,s$1=t$1.trustedTypes,e$1=s$1?s$1.createPolicy("lit-html",{createHTML:t=>t}):void 0,h="$lit$",o$1=`lit$${Math.random().toFixed(9).slice(2)}$`,n="?"+o$1,r$1=`<${n}>`,l$1=document,c=()=>l$1.createComment(""),a=t=>null===t||"object"!=typeof t&&"function"!=typeof t,u=Array.isArray,d=t=>u(t)||"function"==typeof t?.[Symbol.iterator],f="[ \t\n\f\r]",v=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,_=/-->/g,m$1=/>/g,p$1=RegExp(`>|${f}(?:([^\\s"'>=/]+)(${f}*=${f}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),g=/'/g,$=/"/g,y=/^(?:script|style|textarea|title)$/i,x=t=>(i,...s)=>({_$litType$:t,strings:i,values:s}),b=x(1),w=x(2),E=Symbol.for("lit-noChange"),A=Symbol.for("lit-nothing"),C=new WeakMap,P=l$1.createTreeWalker(l$1,129);function V(t,i){if(!u(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==e$1?e$1.createHTML(i):i}const N=(t,i)=>{const s=t.length-1,e=[];let n,l=2===i?"<svg>":3===i?"<math>":"",c=v;for(let i=0;i<s;i++){const s=t[i];let a,u,d=-1,f=0;for(;f<s.length&&(c.lastIndex=f,u=c.exec(s),null!==u);)f=c.lastIndex,c===v?"!--"===u[1]?c=_:void 0!==u[1]?c=m$1:void 0!==u[2]?(y.test(u[2])&&(n=RegExp("</"+u[2],"g")),c=p$1):void 0!==u[3]&&(c=p$1):c===p$1?">"===u[0]?(c=n??v,d=-1):void 0===u[1]?d=-2:(d=c.lastIndex-u[2].length,a=u[1],c=void 0===u[3]?p$1:'"'===u[3]?$:g):c===$||c===g?c=p$1:c===_||c===m$1?c=v:(c=p$1,n=void 0);const x=c===p$1&&t[i+1].startsWith("/>")?" ":"";l+=c===v?s+r$1:d>=0?(e.push(a),s.slice(0,d)+h+s.slice(d)+o$1+x):s+o$1+(-2===d?i:x);}return [V(t,l+(t[s]||"<?>")+(2===i?"</svg>":3===i?"</math>":"")),e]};class S{constructor({strings:t,_$litType$:i},e){let r;this.parts=[];let l=0,a=0;const u=t.length-1,d=this.parts,[f,v]=N(t,i);if(this.el=S.createElement(f,e),P.currentNode=this.el.content,2===i||3===i){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes);}for(;null!==(r=P.nextNode())&&d.length<u;){if(1===r.nodeType){if(r.hasAttributes())for(const t of r.getAttributeNames())if(t.endsWith(h)){const i=v[a++],s=r.getAttribute(t).split(o$1),e=/([.?@])?(.*)/.exec(i);d.push({type:1,index:l,name:e[2],strings:s,ctor:"."===e[1]?I:"?"===e[1]?L:"@"===e[1]?z:H}),r.removeAttribute(t);}else t.startsWith(o$1)&&(d.push({type:6,index:l}),r.removeAttribute(t));if(y.test(r.tagName)){const t=r.textContent.split(o$1),i=t.length-1;if(i>0){r.textContent=s$1?s$1.emptyScript:"";for(let s=0;s<i;s++)r.append(t[s],c()),P.nextNode(),d.push({type:2,index:++l});r.append(t[i],c());}}}else if(8===r.nodeType)if(r.data===n)d.push({type:2,index:l});else {let t=-1;for(;-1!==(t=r.data.indexOf(o$1,t+1));)d.push({type:7,index:l}),t+=o$1.length-1;}l++;}}static createElement(t,i){const s=l$1.createElement("template");return s.innerHTML=t,s}}function M(t,i,s=t,e){if(i===E)return i;let h=void 0!==e?s._$Co?.[e]:s._$Cl;const o=a(i)?void 0:i._$litDirective$;return h?.constructor!==o&&(h?._$AO?.(false),void 0===o?h=void 0:(h=new o(t),h._$AT(t,s,e)),void 0!==e?(s._$Co??=[])[e]=h:s._$Cl=h),void 0!==h&&(i=M(t,h._$AS(t,i.values),h,e)),i}class R{constructor(t,i){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=i;}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:i},parts:s}=this._$AD,e=(t?.creationScope??l$1).importNode(i,true);P.currentNode=e;let h=P.nextNode(),o=0,n=0,r=s[0];for(;void 0!==r;){if(o===r.index){let i;2===r.type?i=new k(h,h.nextSibling,this,t):1===r.type?i=new r.ctor(h,r.name,r.strings,this,t):6===r.type&&(i=new Z(h,this,t)),this._$AV.push(i),r=s[++n];}o!==r?.index&&(h=P.nextNode(),o++);}return P.currentNode=l$1,e}p(t){let i=0;for(const s of this._$AV) void 0!==s&&(void 0!==s.strings?(s._$AI(t,s,i),i+=s.strings.length-2):s._$AI(t[i])),i++;}}class k{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,i,s,e){this.type=2,this._$AH=A,this._$AN=void 0,this._$AA=t,this._$AB=i,this._$AM=s,this.options=e,this._$Cv=e?.isConnected??true;}get parentNode(){let t=this._$AA.parentNode;const i=this._$AM;return void 0!==i&&11===t?.nodeType&&(t=i.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,i=this){t=M(this,t,i),a(t)?t===A||null==t||""===t?(this._$AH!==A&&this._$AR(),this._$AH=A):t!==this._$AH&&t!==E&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):d(t)?this.k(t):this._(t);}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t));}_(t){this._$AH!==A&&a(this._$AH)?this._$AA.nextSibling.data=t:this.T(l$1.createTextNode(t)),this._$AH=t;}$(t){const{values:i,_$litType$:s}=t,e="number"==typeof s?this._$AC(t):(void 0===s.el&&(s.el=S.createElement(V(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===e)this._$AH.p(i);else {const t=new R(e,this),s=t.u(this.options);t.p(i),this.T(s),this._$AH=t;}}_$AC(t){let i=C.get(t.strings);return void 0===i&&C.set(t.strings,i=new S(t)),i}k(t){u(this._$AH)||(this._$AH=[],this._$AR());const i=this._$AH;let s,e=0;for(const h of t)e===i.length?i.push(s=new k(this.O(c()),this.O(c()),this,this.options)):s=i[e],s._$AI(h),e++;e<i.length&&(this._$AR(s&&s._$AB.nextSibling,e),i.length=e);}_$AR(t=this._$AA.nextSibling,s){for(this._$AP?.(false,true,s);t!==this._$AB;){const s=i$2(t).nextSibling;i$2(t).remove(),t=s;}}setConnected(t){ void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t));}}class H{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,i,s,e,h){this.type=1,this._$AH=A,this._$AN=void 0,this.element=t,this.name=i,this._$AM=e,this.options=h,s.length>2||""!==s[0]||""!==s[1]?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=A;}_$AI(t,i=this,s,e){const h=this.strings;let o=false;if(void 0===h)t=M(this,t,i,0),o=!a(t)||t!==this._$AH&&t!==E,o&&(this._$AH=t);else {const e=t;let n,r;for(t=h[0],n=0;n<h.length-1;n++)r=M(this,e[s+n],i,n),r===E&&(r=this._$AH[n]),o||=!a(r)||r!==this._$AH[n],r===A?t=A:t!==A&&(t+=(r??"")+h[n+1]),this._$AH[n]=r;}o&&!e&&this.j(t);}j(t){t===A?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"");}}class I extends H{constructor(){super(...arguments),this.type=3;}j(t){this.element[this.name]=t===A?void 0:t;}}class L extends H{constructor(){super(...arguments),this.type=4;}j(t){this.element.toggleAttribute(this.name,!!t&&t!==A);}}class z extends H{constructor(t,i,s,e,h){super(t,i,s,e,h),this.type=5;}_$AI(t,i=this){if((t=M(this,t,i,0)??A)===E)return;const s=this._$AH,e=t===A&&s!==A||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,h=t!==A&&(s===A||e);e&&this.element.removeEventListener(this.name,this,s),h&&this.element.addEventListener(this.name,this,t),this._$AH=t;}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t);}}class Z{constructor(t,i,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=i,this.options=s;}get _$AU(){return this._$AM._$AU}_$AI(t){M(this,t);}}const B=t$1.litHtmlPolyfillSupport;B?.(S,k),(t$1.litHtmlVersions??=[]).push("3.3.3");const D=(t,i,s)=>{const e=s?.renderBefore??i;let h=e._$litPart$;if(void 0===h){const t=s?.renderBefore??null;e._$litPart$=h=new k(i.insertBefore(c(),t),t,void 0,s??{});}return h._$AI(t),h};

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const s=globalThis;let i$1 = class i extends y$1{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0;}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const r=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=D(r,this.renderRoot,this.renderOptions);}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(true);}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(false);}render(){return E}};i$1._$litElement$=true,i$1["finalized"]=true,s.litElementHydrateSupport?.({LitElement:i$1});const o=s.litElementPolyfillSupport;o?.({LitElement:i$1});(s.litElementVersions??=[]).push("4.2.2");

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t={ATTRIBUTE:1,PROPERTY:3,BOOLEAN_ATTRIBUTE:4},e=t=>(...e)=>({_$litDirective$:t,values:e});class i{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,i){this._$Ct=t,this._$AM=e,this._$Ci=i;}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}}

/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const r=o=>void 0===o.strings,m={},p=(o,t=m)=>o._$AH=t;

/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const l=e(class extends i{constructor(r$1){if(super(r$1),r$1.type!==t.PROPERTY&&r$1.type!==t.ATTRIBUTE&&r$1.type!==t.BOOLEAN_ATTRIBUTE)throw Error("The `live` directive is not allowed on child or event bindings");if(!r(r$1))throw Error("`live` bindings can only contain a single expression")}render(r){return r}update(i,[t$1]){if(t$1===E||t$1===A)return t$1;const o=i.element,l=i.name;if(i.type===t.PROPERTY){if(t$1===o[l])return E}else if(i.type===t.BOOLEAN_ATTRIBUTE){if(!!t$1===o.hasAttribute(l))return E}else if(i.type===t.ATTRIBUTE&&o.getAttribute(l)===t$1+"")return E;return p(i),t$1}});

const en = {
    start: "Start cleaning",
    pause: "Pause",
    stop: "Stop",
    home: "Return to dock",
    locate: "Find robot",
    configure: "Configure",
    unavailable: "Robot unavailable",
    loading: "Loading…",
    failed: "The request failed. Check the connection and try again.",
    pending: "Waiting for Home Assistant…",
    confirmed: "Changes confirmed",
    unconfirmed: "Request sent; the robot has not confirmed the change. Refresh before trying again.",
    settings: "Robot and dock",
    rooms: "Rooms",
    maps: "Maps and rooms",
    history: "Cleaning history",
    schedules: "Schedules",
    save: "Save changes",
    cancel: "Cancel",
    refresh: "Refresh",
    retry: "Try again",
    close: "Close",
    selectRobot: "Choose robot",
    noRobots: "Add Roborock Companion under Settings → Devices & services to configure a robot here.",
    noMap: "No map is available yet",
    companion: "Advanced settings need Roborock Companion",
    noSettings: "No configurable entities are available. Enable the relevant entities in the integration.",
    noRooms: "Room information is not available",
    allRooms: "Whole home",
    selected: "Selected rooms",
    cleanRooms: "Clean selected rooms",
    suction: "Suction power",
    title: "Title",
    appearance: "Appearance",
    default: "Default",
    bubble: "Bubble",
    showMap: "Show map",
    showMaintenance: "Show maintenance",
    entities: "Additional entities",
    maintenance: "Readings and maintenance",
    docked: "Docked",
    cleaning: "Cleaning",
    returning: "Returning to dock",
    paused: "Paused",
    idle: "Ready",
    error: "Needs attention",
    unknown: "Unknown",
    map: "Map",
    chooseMap: "Choose map",
    view: "View",
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    resetView: "Reset view",
    panLeft: "Move map left",
    panRight: "Move map right",
    panUp: "Move map up",
    panDown: "Move map down",
    goTo: "Go here",
    zone: "Clean zone",
    wall: "Virtual wall",
    noGo: "No-go zone",
    split: "Split room",
    merge: "Merge rooms",
    material: "Floor material",
    wood: "Wood",
    tile: "Tile",
    direction: "Direction in degrees",
    drawHelp: "Choose two points on the map. Use the coordinate fields for precise or keyboard input.",
    x1: "First X",
    y1: "First Y",
    x2: "Second X",
    y2: "Second Y",
    add: "Add to draft",
    remove: "Remove",
    undo: "Undo last change",
    dirty: "Unsaved changes",
    discard: "Discard changes",
    discardHelp: "Your unsaved changes will be lost.",
    confirm: "Confirm",
    confirmMap: "Apply this map change? Existing restrictions not removed in the draft will be preserved.",
    blocked: "This operation is unavailable until the map and model support can be verified.",
    preservation: "Some map details cannot be preserved safely. Map replacement is disabled.",
    modelUnverified: "This command has not been verified for the model.",
    conflict: "The robot settings or map changed. Reload the current data; your draft is retained.",
    readback: "The change is not yet confirmed by the robot.",
    wrongMap: "Choose the currently active floor and wait until the robot is idle.",
    local: "Direct local connection available",
    serverLocal: "Configured custom server",
    serverCloud: "Roborock cloud",
    transportHelp: "HA owns the connection. A local connection does not prove the route of every command.",
    nativeSchedules: "Native robot schedules are not guaranteed by the local server. Use Home Assistant automations for reliable local scheduling.",
    openAutomations: "Open Home Assistant automations",
    emptyHistory: "No cleaning sessions were returned",
    loadHistory: "Load cleaning history",
    next: "Next",
    previous: "Previous",
    duration: "Duration",
    area: "Area",
    session: "Cleaning session",
    backup: "Back up current map",
    restore: "Restore map backup",
    buildMap: "Start a mapping run",
    confirmPhysical: "This sends a command to the robot. Continue?",
    admin: "Administrator access is required for configuration.",
    settingsHelp: "Edit a draft, then Save. Cancel leaves saved settings unchanged.",
    roomHelp: "Use the large map to choose rooms and edit supported details. Changing floors or robots discards no edits without confirmation.",
    floor: "Floor",
    invalid: "Check the entered values.",
    partial: "Some changes were applied before an error. Review the current settings before retrying.",
    setup: "Open integration settings",
    battery: "Battery",
    moreInfo: "More information",
    mapUpdated: "Map updated",
    readonly: "Read only",
    keyboardMap: "Keyboard alternative: enter coordinates below the map.",
    advanced: "Advanced map tools",
    cleanCount: "Cleaning passes",
    noSelection: "Choose a room first",
    plan: "Cleaning choices",
    toggle: "Toggle",
    rename: "Display name",
    roomName: "Room name",
    saveRoom: "Save room name",
};
const nb = {
    start: "Start rengjøring",
    pause: "Pause",
    stop: "Stopp",
    home: "Til ladestasjonen",
    locate: "Finn roboten",
    configure: "Konfigurer",
    unavailable: "Roboten er utilgjengelig",
    loading: "Laster…",
    failed: "Forespørselen mislyktes. Kontroller forbindelsen og prøv igjen.",
    pending: "Venter på Home Assistant…",
    confirmed: "Endringene er bekreftet",
    unconfirmed: "Forespørselen er sendt, men roboten har ikke bekreftet endringen. Oppdater før du prøver igjen.",
    settings: "Robot og dokk",
    rooms: "Rom",
    maps: "Kart og rom",
    history: "Rengjøringshistorikk",
    schedules: "Tidsplaner",
    save: "Lagre endringer",
    cancel: "Avbryt",
    refresh: "Oppdater",
    retry: "Prøv igjen",
    close: "Lukk",
    selectRobot: "Velg robot",
    noRobots: "Legg til Roborock Companion under Innstillinger → Enheter og tjenester for å konfigurere en robot her.",
    noMap: "Ingen kart er tilgjengelige ennå",
    companion: "Avanserte innstillinger krever Roborock Companion",
    noSettings: "Ingen innstillingsentiteter er tilgjengelige. Aktiver relevante entiteter i integrasjonen.",
    noRooms: "Rominformasjon er ikke tilgjengelig",
    allRooms: "Hele boligen",
    selected: "Valgte rom",
    cleanRooms: "Rengjør valgte rom",
    suction: "Sugestyrke",
    title: "Tittel",
    appearance: "Utseende",
    default: "Standard",
    bubble: "Bubble",
    showMap: "Vis kart",
    showMaintenance: "Vis vedlikehold",
    entities: "Ekstra entiteter",
    maintenance: "Målinger og vedlikehold",
    docked: "I ladestasjonen",
    cleaning: "Rengjør",
    returning: "På vei til ladestasjonen",
    paused: "På pause",
    idle: "Klar",
    error: "Trenger tilsyn",
    unknown: "Ukjent",
    map: "Kart",
    chooseMap: "Velg kart",
    view: "Visning",
    zoomIn: "Zoom inn",
    zoomOut: "Zoom ut",
    resetView: "Tilbakestill visning",
    panLeft: "Flytt kart mot venstre",
    panRight: "Flytt kart mot høyre",
    panUp: "Flytt kart opp",
    panDown: "Flytt kart ned",
    goTo: "Kjør hit",
    zone: "Rengjør sone",
    wall: "Virtuell vegg",
    noGo: "Forbudssone",
    split: "Del rom",
    merge: "Slå sammen rom",
    material: "Gulvmateriale",
    wood: "Tre",
    tile: "Fliser",
    direction: "Retning i grader",
    drawHelp: "Velg to punkter i kartet. Bruk koordinatfeltene for presis plassering eller tastatur.",
    x1: "Første X",
    y1: "Første Y",
    x2: "Andre X",
    y2: "Andre Y",
    add: "Legg til i utkast",
    remove: "Fjern",
    undo: "Angre siste endring",
    dirty: "Ulagrede endringer",
    discard: "Forkast endringer",
    discardHelp: "De ulagrede endringene går tapt.",
    confirm: "Bekreft",
    confirmMap: "Lagre denne kartendringen? Eksisterende avgrensninger som ikke er fjernet i utkastet, bevares.",
    blocked: "Handlingen er utilgjengelig til kartet og modellstøtten kan verifiseres.",
    preservation: "Enkelte kartdetaljer kan ikke bevares sikkert. Overskriving av kart er deaktivert.",
    modelUnverified: "Kommandoen er ikke verifisert for modellen.",
    conflict: "Robotinnstillingene eller kartet er endret. Last inn gjeldende data; utkastet beholdes.",
    readback: "Endringen er ikke bekreftet av roboten ennå.",
    wrongMap: "Velg den aktive etasjen og vent til roboten er ledig.",
    local: "Direkte lokal forbindelse tilgjengelig",
    serverLocal: "Valgt egendefinert server",
    serverCloud: "Roborock-skyen",
    transportHelp: "HA eier forbindelsen. En lokal forbindelse beviser ikke veien hver kommando tar.",
    nativeSchedules: "Lokalserveren garanterer ikke støtte for robotens egne tidsplaner. Bruk HA-automasjoner for pålitelig lokal tidsstyring.",
    openAutomations: "Åpne HA-automasjoner",
    emptyHistory: "Ingen rengjøringer ble returnert",
    loadHistory: "Hent rengjøringshistorikk",
    next: "Neste",
    previous: "Forrige",
    duration: "Varighet",
    area: "Areal",
    session: "Rengjøring",
    backup: "Sikkerhetskopier gjeldende kart",
    restore: "Gjenopprett kartkopi",
    buildMap: "Start kartlegging",
    confirmPhysical: "Dette sender en kommando til roboten. Vil du fortsette?",
    admin: "Administratorrettigheter kreves for konfigurering.",
    settingsHelp: "Rediger et utkast og velg Lagre. Avbryt lar lagrede innstillinger være urørt.",
    roomHelp: "Bruk det store kartet til å velge rom og redigere støttede detaljer. Ulagrede endringer forkastes ikke uten bekreftelse.",
    floor: "Etasje",
    invalid: "Kontroller verdiene du har fylt inn.",
    partial: "Noen endringer ble utført før en feil. Kontroller gjeldende innstillinger før du prøver igjen.",
    setup: "Åpne integrasjonsinnstillinger",
    battery: "Batteri",
    moreInfo: "Mer informasjon",
    mapUpdated: "Kartet er oppdatert",
    readonly: "Kun visning",
    keyboardMap: "Tastaturalternativ: fyll inn koordinatene under kartet.",
    advanced: "Avanserte kartverktøy",
    cleanCount: "Antall rengjøringer",
    noSelection: "Velg et rom først",
    plan: "Rengjøringsvalg",
    toggle: "Bytt",
    rename: "Visningsnavn",
    roomName: "Romnavn",
    saveRoom: "Lagre romnavn",
};
function language(hass) {
    const raw = (hass?.language || hass?.locale?.language || "en")
        .replaceAll("_", "-")
        .toLowerCase();
    return ["nb", "no", "nn"].includes(raw.split("-")[0]) ? "nb" : "en";
}
function strings(hass) {
    return language(hass) === "nb" ? nb : en;
}
function locale(hass) {
    let value = (hass?.locale?.language || hass?.language || "en").replaceAll("_", "-");
    if (/^(no|nn)(-|$)/i.test(value))
        value = value.replace(/^(no|nn)/i, "nb");
    try {
        return Intl.getCanonicalLocales(value)[0] || "en";
    }
    catch {
        return language(hass) === "nb" ? "nb-NO" : "en";
    }
}
function number(hass, value, digits = 1) {
    if (!Number.isFinite(value))
        return strings(hass).unknown;
    const preference = hass?.locale?.number_format;
    const target = preference === "comma_decimal"
        ? "de"
        : preference === "decimal_period"
            ? "en-US"
            : preference === "space_comma"
                ? "fr"
                : preference === "system"
                    ? undefined
                    : locale(hass);
    return new Intl.NumberFormat(target, {
        useGrouping: preference !== "none",
        maximumFractionDigits: digits,
    }).format(value);
}
function errorText(hass, code) {
    const t = strings(hass);
    return ({
        conflict: t.conflict,
        readback_pending: t.readback,
        preservation_unverified: t.preservation,
        model_unverified: t.modelUnverified,
        wrong_map_or_busy: t.wrongMap,
        unauthorized: t.admin,
        invalid_setting: t.invalid,
        invalid_coordinates: t.invalid,
        confirmation_required: t.confirmPhysical,
    }[code || ""] || t.failed);
}
function optionLabel(hass, value) {
    const key = value.toLowerCase().replaceAll("_", " ");
    const en = {
        silent: "Quiet",
        balanced: "Balanced",
        turbo: "Turbo",
        max: "Max",
        off: "Off",
        standard: "Standard",
        deep: "Deep",
        custom: "Custom",
        smart: "Smart",
    };
    const nb = {
        silent: "Stille",
        balanced: "Balansert",
        turbo: "Turbo",
        max: "Maks",
        off: "Av",
        standard: "Standard",
        deep: "Grundig",
        custom: "Tilpasset",
        smart: "Smart",
    };
    return (language(hass) === "nb" ? nb : en)[key] || value;
}

const styles = i$4 `
  :host {
    display: block;
    color: var(--primary-text-color, #212121);
    font-family: var(--ha-font-family-body, Roboto, system-ui, sans-serif);
    --rr-primary: var(--primary-color, #03a9f4);
    --rr-muted: var(--secondary-text-color, #727272);
    --rr-border: var(--divider-color, #e0e0e0);
    --rr-surface: var(--card-background-color, #fff);
    --rr-error: var(--error-color, #db4437);
  }
  * {
    box-sizing: border-box;
    scrollbar-width: thin;
    scrollbar-color: var(--rr-muted) transparent;
  }
  *::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  *::-webkit-scrollbar-thumb {
    background: var(--rr-muted);
    border-radius: 4px;
  }
  ha-card {
    display: block;
  }
  ha-card,
  .surface {
    background: var(--rr-surface);
    border: 1px solid var(--rr-border);
    border-radius: var(--ha-card-border-radius, 12px);
    padding: 20px;
    overflow: visible;
  }
  :host([appearance="bubble"]) ha-card {
    border-radius: 24px;
    background: var(--bubble-card-background, var(--rr-surface));
    border: 0;
  }
  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 16px;
  }
  h1,
  h2,
  h3,
  p {
    margin: 0;
  }
  h1 {
    font-size: 24px;
    font-weight: 500;
  }
  h2 {
    font-size: 20px;
    font-weight: 500;
  }
  h3 {
    font-size: 16px;
    font-weight: 500;
  }
  .muted,
  small {
    color: var(--rr-muted);
  }
  .hint {
    font-size: 14px;
    line-height: 1.5;
    color: var(--rr-muted);
    margin: 8px 0;
  }
  button,
  a.button {
    font: inherit;
    color: inherit;
    min-height: 44px;
    padding: 10px 16px;
    border: 1px solid var(--rr-border);
    border-radius: 22px;
    background: transparent;
    cursor: pointer;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  button:hover:not(:disabled),
  a.button:hover {
    background: var(--secondary-background-color, #f5f5f5);
  }
  button:disabled {
    opacity: 0.5;
    cursor: default;
  }
  button:focus-visible,
  a:focus-visible,
  input:focus-visible,
  select:focus-visible {
    outline: 2px solid var(--rr-primary);
    outline-offset: 3px;
  }
  .primary,
  button[aria-pressed="true"] {
    background: var(--rr-primary);
    color: var(--text-primary-color, #fff);
    border-color: var(--rr-primary);
  }
  .cog {
    width: 44px;
    height: 44px;
    padding: 10px;
    border-radius: 50%;
  }
  .actions,
  .chips,
  .toolbar {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin: 12px 0;
  }
  .actions .primary {
    flex: 1;
  }
  .feedback {
    min-height: 24px;
    font-size: 14px;
    margin-top: 8px;
  }
  [role="alert"] {
    color: var(--rr-error);
  }
  label {
    display: grid;
    gap: 6px;
    font-size: 14px;
    margin: 12px 0;
  }
  input,
  select {
    font: inherit;
    color: inherit;
    background: var(--rr-surface);
    border: 1px solid var(--rr-border);
    border-radius: 8px;
    min-height: 44px;
    padding: 8px 12px;
    min-width: 0;
    width: 100%;
  }
  input[type="checkbox"] {
    width: 22px;
    min-height: 22px;
    accent-color: var(--rr-primary);
  }
  .fields {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px 16px;
  }
  .measurements {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .reading {
    display: grid;
    gap: 3px;
    text-align: left;
  }
  .reading strong {
    font-variant-numeric: tabular-nums;
  }
  .section {
    margin-top: 20px;
    padding-top: 16px;
    border-top: 1px solid var(--rr-border);
  }
  a {
    color: var(--rr-primary);
  }
  dialog {
    background: var(--rr-surface);
    color: inherit;
    border: 1px solid var(--rr-border);
    border-radius: 16px;
    max-width: min(560px, calc(100vw - 32px));
    max-height: calc(100dvh - 40px);
    overflow: auto;
    padding: 24px;
  }
  dialog::backdrop {
    background: rgba(0, 0, 0, 0.45);
  }
  dialog h3 {
    margin-bottom: 12px;
  }
  .danger {
    color: var(--rr-error);
  }
  .workspace {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 340px;
    gap: 24px;
    align-items: start;
  }
  .sidebar {
    min-width: 0;
  }
  .panel {
    padding: 24px;
    max-width: 1600px;
    margin: auto;
  }
  .tabs {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin: 20px 0;
  }
  .status {
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;
  }
  .map-frame {
    background: var(--secondary-background-color, #f5f5f5);
    border-radius: 12px;
    min-height: 280px;
    overflow: hidden;
  }
  .room-list {
    display: grid;
    gap: 8px;
  }
  .summary {
    display: grid;
    gap: 8px;
  }
  .history-row {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    padding: 12px 0;
    border-bottom: 1px solid var(--rr-border);
  }
  @media (max-width: 900px) {
    .workspace {
      grid-template-columns: 1fr;
    }
    .panel {
      padding: 16px;
    }
  }
  @media (max-width: 400px) {
    ha-card {
      display: block;
    }
    ha-card,
    .surface {
      padding: 16px;
    }
    .fields {
      grid-template-columns: 1fr;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    * {
      scroll-behavior: auto;
    }
  }
`;

async function snapshot(hass, entity_id) {
    const result = await hass.callWS({
        type: "roborock_companion/snapshot",
        entity_id,
    });
    if (result.api_version !== 1 || result.entity_id !== entity_id)
        throw new Error("incompatible_api");
    return result;
}
function execute(hass, s, operation, params) {
    return hass.callWS({
        type: "roborock_companion/execute",
        entity_id: s.entity_id,
        operation,
        params,
        expected_revision: s.revision,
        request_id: crypto.randomUUID(),
    });
}

function affine(calibration) {
    if (!calibration || calibration.length !== 3)
        return undefined;
    const [p, q, r] = calibration;
    const x = q.vacuum.x - p.vacuum.x, y = q.vacuum.y - p.vacuum.y, u = r.vacuum.x - p.vacuum.x, v = r.vacuum.y - p.vacuum.y;
    const det = x * v - y * u;
    if (!Number.isFinite(det) || Math.abs(det) < 1e-9)
        return undefined;
    const mx = q.map.x - p.map.x, my = q.map.y - p.map.y, nx = r.map.x - p.map.x, ny = r.map.y - p.map.y;
    const a = (mx * v - nx * y) / det, b = (nx * x - mx * u) / det, d = (my * v - ny * y) / det, e = (ny * x - my * u) / det;
    const c = p.map.x - a * p.vacuum.x - b * p.vacuum.y, f = p.map.y - d * p.vacuum.x - e * p.vacuum.y;
    const inverse = a * e - b * d;
    if (![a, b, c, d, e, f, inverse].every(Number.isFinite) ||
        Math.abs(inverse) < 1e-12)
        return undefined;
    return {
        toMap: (p) => ({
            x: a * p.x + b * p.y + c,
            y: d * p.x + e * p.y + f,
        }),
        toRobot: (p) => ({
            x: Math.round((e * (p.x - c) - b * (p.y - f)) / inverse),
            y: Math.round((-d * (p.x - c) + a * (p.y - f)) / inverse),
        }),
    };
}
class RoborockMap extends i$1 {
    constructor() {
        super(...arguments);
        this.selected = [];
        this.points = [];
        this.draftWalls = [];
        this.draftZones = [];
        this.pointMode = false;
        this.disabled = false;
        this.zoom = 1;
        this.panX = 0;
        this.panY = 0;
        this.image = "";
        this.failure = false;
        this.epoch = 0;
    }
    static { this.properties = {
        hass: { attribute: false },
        map: { attribute: false },
        selected: { attribute: false },
        points: { attribute: false },
        draftWalls: { attribute: false },
        draftZones: { attribute: false },
        pointMode: { type: Boolean },
        disabled: { type: Boolean },
        zoom: { state: true },
        panX: { state: true },
        panY: { state: true },
        image: { state: true },
        failure: { state: true },
    }; }
    static { this.styles = [
        styles,
        i$4 `
      :host {
        display: block;
      }
      .viewport {
        overflow: hidden;
        position: relative;
        border-radius: 12px;
        background: var(--secondary-background-color, #f5f5f5);
      }
      .world {
        position: relative;
        transform-origin: center;
      }
      .world img {
        display: block;
        width: 100%;
        height: auto;
        object-fit: contain;
      }
      .world svg {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        touch-action: pan-y;
      }
      .room {
        position: absolute;
        transform: translate(-50%, -50%);
        font-size: 12px;
        min-height: 32px;
        padding: 5px 9px;
        max-width: 130px;
        white-space: normal;
        background: var(--rr-surface);
      }
      .empty {
        min-height: 280px;
        padding: 40px 20px;
        text-align: center;
      }
      .toolbar {
        justify-content: flex-end;
      }
    `,
    ]; }
    updated(changes) {
        if (changes.has("map") &&
            changes.get("map")?.image_url !==
                this.map?.image_url)
            void this.loadImage();
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.epoch++;
        if (this.image.startsWith("blob:"))
            URL.revokeObjectURL(this.image);
    }
    async loadImage() {
        const ticket = ++this.epoch;
        const old = this.image;
        this.image = "";
        this.failure = false;
        if (old.startsWith("blob:"))
            URL.revokeObjectURL(old);
        if (!this.map?.image_url || !this.hass?.fetchWithAuth)
            return;
        try {
            const response = await this.hass.fetchWithAuth(this.map.image_url);
            if (!response.ok)
                throw Error("image");
            const blob = await response.blob();
            if (ticket === this.epoch && this.isConnected)
                this.image = URL.createObjectURL(blob);
        }
        catch {
            if (ticket === this.epoch)
                this.failure = true;
        }
    }
    mark(point) {
        return affine(this.map?.calibration || null)?.toMap(point);
    }
    pointsString(values) {
        const p = [];
        for (let i = 0; i < values.length; i += 2) {
            const m = this.mark({ x: values[i], y: values[i + 1] });
            if (m)
                p.push(`${m.x},${m.y}`);
        }
        return p.join(" ");
    }
    choosePoint(event) {
        if (!this.pointMode ||
            this.disabled ||
            !this.map ||
            !this.image ||
            this.failure)
            return;
        const target = event.currentTarget;
        const bounds = target.getBoundingClientRect();
        if (!bounds.width || !bounds.height)
            return;
        const point = affine(this.map.calibration)?.toRobot({
            x: ((event.clientX - bounds.left) / bounds.width) * this.map.width,
            y: ((event.clientY - bounds.top) / bounds.height) * this.map.height,
        });
        if (point &&
            point.x >= 0 &&
            point.y >= 0 &&
            point.x <= 51200 &&
            point.y <= 51200)
            this.dispatchEvent(new CustomEvent("map-point", {
                detail: point,
                bubbles: true,
                composed: true,
            }));
    }
    render() {
        const t = strings(this.hass), m = this.map;
        return b `<div class="toolbar" aria-label=${t.view}>
        <button
          type="button"
          aria-label=${t.zoomOut}
          @click=${() => (this.zoom = Math.max(1, this.zoom - 0.25))}
        >
          −</button
        ><button
          type="button"
          @click=${() => {
            this.zoom = 1;
            this.panX = 0;
            this.panY = 0;
        }}
        >
          ${t.resetView}</button
        ><button
          type="button"
          aria-label=${t.zoomIn}
          @click=${() => (this.zoom = Math.min(3, this.zoom + 0.25))}
        >
          +</button
        ><button
          type="button"
          aria-label=${t.refresh}
          @click=${() => void this.loadImage()}
        >
          ↻
        </button>
      </div>
      ${this.zoom > 1
            ? b `<div class="toolbar">
              ${[
                ["panLeft", -40, 0],
                ["panRight", 40, 0],
                ["panUp", 0, -40],
                ["panDown", 0, 40],
            ].map(([label, x, y]) => b `<button
                    type="button"
                    aria-label=${t[label]}
                    @click=${() => {
                this.panX += x;
                this.panY += y;
            }}
                  >
                    ${label === "panLeft" ? "←" : label === "panRight" ? "→" : label === "panUp" ? "↑" : "↓"}
                  </button>`)}
            </div>`
            : A}
      <div
        class="viewport"
        style=${`touch-action:${this.zoom > 1 && !this.pointMode ? "none" : "pan-y"}`}
        @pointerdown=${(e) => {
            if (this.zoom > 1 && !this.pointMode) {
                this.drag = {
                    x: e.clientX,
                    y: e.clientY,
                    panX: this.panX,
                    panY: this.panY,
                };
                e.currentTarget.setPointerCapture(e.pointerId);
            }
        }}
        @pointermove=${(e) => {
            if (this.drag) {
                this.panX = this.drag.panX + e.clientX - this.drag.x;
                this.panY = this.drag.panY + e.clientY - this.drag.y;
            }
        }}
        @pointerup=${() => {
            this.drag = undefined;
        }}
        @pointercancel=${() => {
            this.drag = undefined;
        }}
      >
        <div
          class="world"
          style=${`transform:translate(${this.panX}px,${this.panY}px) scale(${this.zoom})`}
        >
          ${this.image ? b `<img src=${this.image} alt=${m?.name || t.map} />` : b `<div class="empty muted">${this.failure ? t.failed : t.noMap}</div>`}${m && m.width > 0 && m.height > 0
            ? w `<svg viewBox=${`0 0 ${m.width} ${m.height}`} role="img" aria-label=${m.name} @pointerup=${(e) => this.choosePoint(e)}><g fill="none" stroke="var(--rr-primary)" stroke-width="2">${(m.path || []).map((path) => w `<polyline points=${path
                .map((p) => this.mark(p))
                .filter(Boolean)
                .map((p) => `${p.x},${p.y}`)
                .join(" ")}></polyline>`)}${[...(m.walls || []), ...this.draftWalls].map((w$1) => w `<polyline points=${this.pointsString(w$1)} stroke="var(--rr-error)"></polyline>`)}${[...(m.no_go || []), ...this.draftZones].map((z) => w `<polygon points=${this.pointsString(z)} fill="var(--rr-error)" fill-opacity=".12" stroke="var(--rr-error)"></polygon>`)}</g>${this.points.map((p) => {
                const q = this.mark(p);
                return q
                    ? w `<circle cx=${q.x} cy=${q.y} r="5" fill="var(--rr-primary)"></circle>`
                    : A;
            })}${m.robot
                ? (() => {
                    const p = this.mark(m.robot);
                    return p
                        ? w `<circle cx=${p.x} cy=${p.y} r="7" fill="var(--rr-primary)" stroke="var(--rr-surface)" stroke-width="2"></circle>`
                        : A;
                })()
                : A}</svg>`
            : A}${m?.rooms.map((r) => {
            if (r.x === undefined || r.y === undefined || !m.width || !m.height)
                return A;
            const p = this.mark({ x: r.x, y: r.y });
            return p
                ? b `<button
                  type="button"
                  class="room"
                  style=${`left:${(100 * p.x) / m.width}%;top:${(100 * p.y) / m.height}%`}
                  aria-pressed=${String(this.selected.includes(r.id))}
                  ?disabled=${this.disabled || this.pointMode}
                  @click=${() => this.dispatchEvent(new CustomEvent("room-select", { detail: r.id, bubbles: true, composed: true }))}
                >
                  ${r.name}
                </button>`
                : A;
        })}
        </div>
      </div>`;
    }
}
if (!customElements.get("roborock-map"))
    customElements.define("roborock-map", RoborockMap);

class RoborockPanel extends i$1 {
    constructor() {
        super(...arguments);
        this.initialized = false;
        this.epoch = 0;
        this.robots = [];
        this.entity = "";
        this.tab = "maps";
        this.pending = false;
        this.loading = false;
        this.error = "";
        this.message = "";
        this.selected = [];
        this.tool = "view";
        this.points = [];
        this.draft = {};
        this.draftRevision = "";
        this.uncertain = false;
        this.records = [];
        this.historyOffset = 0;
        this.historyNext = null;
        this.historyTotal = 0;
        this.roomName = "";
        this.material = 3;
        this.direction = -1;
        this.beforeUnload = (event) => {
            if (this.dirty) {
                event.preventDefault();
                event.returnValue = "";
            }
        };
    }
    static { this.properties = {
        robots: { state: true },
        entity: { state: true },
        data: { state: true },
        tab: { state: true },
        pending: { state: true },
        loading: { state: true },
        error: { state: true },
        message: { state: true },
        selected: { state: true },
        tool: { state: true },
        points: { state: true },
        draft: { state: true },
        mapDraft: { state: true },
        floorId: { state: true },
        confirmation: { state: true },
        uncertain: { state: true },
        records: { state: true },
        historyOffset: { state: true },
        historyTotal: { state: true },
        historyNext: { state: true },
        roomName: { state: true },
    }; }
    static { this.styles = styles; }
    get hass() {
        return this.ha;
    }
    set hass(value) {
        this.ha = value;
        if (value && this.isConnected && !this.initialized)
            void this.initialize();
        this.requestUpdate();
    }
    connectedCallback() {
        super.connectedCallback();
        window.addEventListener("beforeunload", this.beforeUnload);
        if (this.ha && !this.initialized)
            void this.initialize();
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.epoch++;
        this.initialized = false;
        this.unsubscribe?.();
        window.removeEventListener("beforeunload", this.beforeUnload);
    }
    get dirty() {
        return (!!Object.keys(this.draft).length || !!this.mapDraft || !!this.roomName);
    }
    get map() {
        return (this.mapDraft ||
            this.data?.maps.find((m) => m.id === (this.floorId ?? this.data?.current_map)) ||
            this.data?.maps[0]);
    }
    get canAct() {
        return (!!this.ha?.user?.is_admin &&
            !!this.data?.available &&
            !this.pending &&
            !this.uncertain);
    }
    async initialize() {
        const h = this.ha;
        if (!h)
            return;
        this.initialized = true;
        this.loading = true;
        const epoch = ++this.epoch;
        try {
            const list = await h.callWS({ type: "roborock_companion/list" });
            if (epoch !== this.epoch)
                return;
            this.robots = list.robots;
            const desired = new URLSearchParams(window.location.search).get("entity_id");
            this.entity =
                this.robots.find((r) => r.entity_id === desired)?.entity_id ||
                    this.robots[0]?.entity_id ||
                    "";
            if (this.entity)
                await this.load();
        }
        catch {
            if (epoch === this.epoch)
                this.error = strings(h).failed;
        }
        finally {
            if (epoch === this.epoch)
                this.loading = false;
        }
    }
    async load() {
        if (!this.ha || !this.entity)
            return;
        const epoch = ++this.epoch, id = this.entity;
        this.unsubscribe?.();
        this.unsubscribe = undefined;
        this.loading = true;
        try {
            const value = await snapshot(this.ha, id);
            if (epoch !== this.epoch)
                return;
            this.data = value;
            this.floorId = value.current_map ?? value.maps[0]?.id;
            this.uncertain = false;
            if (!this.dirty)
                this.draftRevision = value.revision;
            if (this.ha.connection) {
                const unsub = await this.ha.connection.subscribeMessage((s) => {
                    if (epoch === this.epoch &&
                        s.entity_id === id &&
                        s.api_version === 1) {
                        this.data = s;
                        if (!this.dirty)
                            this.draftRevision = s.revision;
                    }
                }, { type: "roborock_companion/subscribe", entity_id: id });
                if (epoch === this.epoch)
                    this.unsubscribe = unsub;
                else
                    unsub();
            }
        }
        catch {
            if (epoch === this.epoch)
                this.error = strings(this.ha).failed;
        }
        finally {
            if (epoch === this.epoch)
                this.loading = false;
        }
    }
    resetDraft() {
        this.draft = {};
        this.roomName = "";
        this.mapDraft = undefined;
        this.points = [];
        this.selected = [];
        this.tool = "view";
        this.uncertain = false;
        this.draftRevision = this.data?.revision || "";
        this.error = "";
        this.message = "";
    }
    guard(action) {
        if (this.pending)
            return;
        if (!this.dirty) {
            action();
            return;
        }
        this.confirmation = {
            text: strings(this.ha).discardHelp,
            action: () => {
                this.resetDraft();
                this.closeConfirmation();
                action();
            },
        };
        void this.showConfirmation();
    }
    async showConfirmation() {
        await this.updateComplete;
        this.renderRoot.querySelector("#confirm")?.showModal();
    }
    closeConfirmation() {
        this.renderRoot.querySelector("#confirm")?.close();
        this.confirmation = undefined;
    }
    confirm(text, action) {
        this.confirmation = { text, action };
        void this.showConfirmation();
    }
    setDraft(field, value) {
        if (!this.dirty)
            this.draftRevision = this.data.revision;
        this.draft = { ...this.draft, [field.entity_id]: value };
        this.message = "";
    }
    async run(operation, params, revision = this.draftRevision) {
        if (!this.canAct || !this.ha || !this.data)
            return;
        const epoch = this.epoch;
        this.pending = true;
        this.error = "";
        this.message = "";
        try {
            const result = await execute(this.ha, { ...this.data, revision: revision || this.data.revision }, operation, params);
            if (epoch !== this.epoch)
                return;
            await this.handleResult(result);
        }
        catch {
            if (epoch === this.epoch) {
                this.error = strings(this.ha).unconfirmed;
                this.uncertain = true;
            }
        }
        finally {
            if (this.isConnected)
                this.pending = false;
        }
    }
    async handleResult(result) {
        const t = strings(this.ha);
        if (result.status === "confirmed") {
            this.resetDraft();
            this.message = t.confirmed;
            this.closeConfirmation();
            if (this.data)
                this.data = { ...this.data, revision: result.revision };
            if (result.data &&
                typeof result.data === "object" &&
                "records" in result.data) {
                const page = result.data;
                this.records = page.records;
                this.historyOffset = page.offset;
                this.historyTotal = page.total;
                this.historyNext = page.next_offset;
            }
            await this.load();
        }
        else {
            this.error = result.completed_steps.length
                ? t.partial
                : errorText(this.ha, result.error);
            if (result.status === "unconfirmed" || result.status === "pending") {
                this.uncertain = true;
                this.error = t.unconfirmed;
            }
        }
    }
    saveSettings() {
        void this.run("settings_save", {
            changes: Object.entries(this.draft).map(([entity_id, value]) => ({
                entity_id,
                value,
            })),
        });
    }
    addPoint(point) {
        if (!this.canAct)
            return;
        this.points = this.points.length >= 2 ? [point] : [...this.points, point];
    }
    addGeometry() {
        if (this.points.length !== 2 || !this.map)
            return;
        const [a, b] = this.points;
        if (a.x === b.x && a.y === b.y) {
            this.error = strings(this.ha).invalid;
            return;
        }
        if (!this.dirty)
            this.draftRevision = this.data.revision;
        const base = this.mapDraft || structuredClone(this.map);
        if (this.tool === "wall")
            base.walls = [...base.walls, [a.x, a.y, b.x, b.y]];
        else if (this.tool === "noGo") {
            const x1 = Math.min(a.x, b.x), x2 = Math.max(a.x, b.x), y1 = Math.min(a.y, b.y), y2 = Math.max(a.y, b.y);
            base.no_go = [...base.no_go, [x1, y1, x1, y2, x2, y2, x2, y1]];
        }
        this.mapDraft = base;
        this.points = [];
    }
    mapSave() {
        if (!this.mapDraft)
            return;
        const m = this.mapDraft;
        this.confirm(strings(this.ha).confirmMap, () => void this.run("map_restrictions_save", {
            map_id: m.id,
            walls: m.walls,
            no_go: m.no_go,
        }));
    }
    mapOperation(operation, params) {
        if (!this.map)
            return;
        this.confirm(strings(this.ha).confirmPhysical, () => void this.run(operation, { map_id: this.map.id, ...params }, this.data.revision));
    }
    cap(operation) {
        return this.data?.capabilities[operation]?.status === "available";
    }
    roomSelect(id) {
        this.selected = this.selected.includes(id)
            ? this.selected.filter((r) => r !== id)
            : [...this.selected, id];
    }
    setting(field) {
        const value = this.draft[field.entity_id] ?? field.value;
        return b `<label
      >${field.name}${field.unit ? b `<small>${field.unit}</small>` : A}${field.kind === "select"
            ? b `<select
              .value=${l(String(value))}
              ?disabled=${!field.available || !this.canAct}
              @change=${(e) => this.setDraft(field, e.target.value)}
            >
              ${field.options.map((option) => b `<option value=${option}>${optionLabel(this.ha, option)}</option>`)}
            </select>`
            : field.kind === "switch"
                ? b `<input
                type="checkbox"
                .checked=${Boolean(value)}
                ?disabled=${!field.available || !this.canAct}
                @change=${(e) => this.setDraft(field, e.target.checked)}
              />`
                : b `<input
                type=${field.kind === "number" ? "number" : "time"}
                .value=${l(String(value))}
                min=${field.min ?? A}
                max=${field.max ?? A}
                step=${field.step ?? 1}
                ?disabled=${!field.available || !this.canAct}
                @input=${(e) => this.setDraft(field, field.kind === "number" ? Number(e.target.value) : e.target.value)}
              />`}</label
    >`;
    }
    settingsView() {
        const t = strings(this.ha);
        return b `<section class="surface">
      <h2>${t.settings}</h2>
      <p class="hint">${t.settingsHelp}</p>
      <form
        novalidate
        @submit=${(e) => {
            e.preventDefault();
            this.saveSettings();
        }}
      >
        <div class="fields">
          ${this.data?.settings.length ? this.data.settings.map((f) => this.setting(f)) : b `<p>${t.noSettings}</p>`}
        </div>
        <div class="actions">
          <button
            class="primary"
            type="submit"
            data-action="save-settings"
            ?disabled=${!this.canAct || !Object.keys(this.draft).length}
          >
            ${t.save}</button
          ><button
            type="button"
            ?disabled=${this.pending || !this.dirty}
            @click=${() => this.resetDraft()}
          >
            ${t.cancel}
          </button>
        </div>
      </form>
    </section>`;
    }
    coordinateInputs() {
        const t = strings(this.ha);
        return b `<p class="hint">${t.drawHelp}</p>
      <div class="fields">
        ${["x1", "y1", "x2", "y2"].map((key, index) => {
            const i = Math.floor(index / 2), axis = index % 2 ? "y" : "x";
            return b `<label
            >${t[key]}<input
              type="number"
              inputmode="numeric"
              min="0"
              max="51200"
              step="1"
              .value=${this.points[i]?.[axis] === undefined ? "" : String(this.points[i][axis])}
              ?disabled=${!this.canAct}
              @input=${(e) => {
                const value = Number(e.target.value);
                if (!Number.isInteger(value) || value < 0 || value > 51200) {
                    this.error = t.invalid;
                    return;
                }
                const points = [...this.points];
                points[i] = { ...(points[i] || { x: 0, y: 0 }), [axis]: value };
                this.points = points;
            }}
          /></label>`;
        })}
      </div>`;
    }
    roomNameView() {
        const t = strings(this.ha), room = this.map?.rooms.find((r) => r.id === this.selected[0]);
        if (this.selected.length !== 1 || !room)
            return A;
        return b `<form
      novalidate
      @submit=${(e) => {
            e.preventDefault();
            void this.run("room_display_save", {
                map_id: this.map.id,
                room_id: room.id,
                name: this.roomName,
            });
        }}
    >
      <label
        >${t.rename}<input
          type="text"
          maxlength="80"
          .value=${l(this.roomName || room.name)}
          ?disabled=${!this.canAct}
          @input=${(e) => {
            if (!this.dirty)
                this.draftRevision = this.data.revision;
            this.roomName = e.target.value;
        }} /></label
      ><button type="submit" ?disabled=${!this.canAct || !this.roomName.trim()}>
        ${t.saveRoom}
      </button>
    </form>`;
    }
    restrictionsView() {
        const m = this.map, t = strings(this.ha);
        if (!m)
            return A;
        return b `${[
            ["walls", "wall"],
            ["no_go", "noGo"],
        ].map(([key, label]) => b `<details>
          <summary>${t[label]} (${m[key]?.length || 0})</summary>
          ${m[key]?.map((_, index) => b `<div class="actions">
                <span>${t[label]} ${number(this.ha, index + 1, 0)}</span
                ><button
                  type="button"
                  ?disabled=${!this.canAct || !m.active || !this.cap("map_restrictions_save")}
                  @click=${() => {
            if (!this.dirty)
                this.draftRevision = this.data.revision;
            const draft = structuredClone(this.map);
            draft[key] = draft[key].filter((_, i) => i !== index);
            this.mapDraft = draft;
        }}
                >
                  ${t.remove}
                </button>
              </div>`)}
        </details>`)}`;
    }
    mapsView() {
        const t = strings(this.ha), m = this.map;
        return b `<div class="workspace">
      <section class="surface">
        <header>
          <h2>${t.maps}</h2>
          <button
            type="button"
            ?disabled=${!this.canAct}
            @click=${() => this.guard(() => void this.run("map_refresh", {}, this.data.revision))}
          >
            ${t.refresh}
          </button>
        </header>
        <p class="hint">${t.roomHelp}</p>
        ${this.data?.maps.length
            ? b `<label
                >${t.chooseMap}<select
                  .value=${String(m?.id ?? "")}
                  @change=${(e) => {
                const select = e.target, next = Number(select.value);
                select.value = String(m?.id ?? "");
                this.guard(() => {
                    this.floorId = next;
                    this.selected = [];
                    this.points = [];
                });
            }}
                >
                  ${this.data.maps.map((map) => b `<option value=${map.id}>${map.name}${map.active ? " •" : ""}</option>`)}
                </select></label
              >`
            : A}<roborock-map
          .hass=${this.ha}
          .map=${m}
          .selected=${this.selected}
          .points=${this.points}
          .pointMode=${this.tool !== "view"}
          .disabled=${!this.canAct || !m?.active}
          @room-select=${(e) => this.roomSelect(e.detail)}
          @map-point=${(e) => this.addPoint(e.detail)}
        ></roborock-map
        >${this.tool !== "view" ? this.coordinateInputs() : A}
      </section>
      <aside class="sidebar">
        <section class="surface">
          <h3>${t.rooms}</h3>
          ${this.roomNameView()}
          <div class="room-list">
            ${m?.rooms.length ? m.rooms.map((room) => b `<button type="button" aria-pressed=${String(this.selected.includes(room.id))} @click=${() => this.roomSelect(room.id)}>${room.name}</button>`) : b `<p class="hint">${t.noRooms}</p>`}
          </div>
          <div class="actions">
            <button
              type="button"
              ?disabled=${!this.canAct || !m?.active || !this.selected.length}
              @click=${() => void this.publicAction("vacuum", "send_command", { entity_id: this.entity, command: "app_segment_clean", params: [{ segments: this.selected, repeat: 1 }] })}
            >
              ${t.cleanRooms}
            </button>
          </div>
        </section>
        <section class="surface section">
          <h3>${t.advanced}</h3>
          <label
            >${t.advanced}<select
              .value=${this.tool}
              @change=${(e) => {
            this.tool = e.target.value;
            this.points = [];
        }}
            >
              ${["view", "wall", "noGo", "split", "goTo", "zone"].map((tool) => b `<option value=${tool} ?disabled=${!m?.active || (tool !== "view" && !m.calibration) || (["wall", "noGo"].includes(tool) && !this.cap("map_restrictions_save")) || (tool === "split" && !this.cap("room_split"))}>${t[tool]}</option>`)}
            </select></label
          >${this.restrictionsView()}${m?.edit_blocker ? b `<p class="hint">${t.preservation}</p>` : A}${this.tool === "wall" || this.tool === "noGo" ? b `<button type="button" ?disabled=${!this.canAct || this.points.length !== 2} @click=${() => this.addGeometry()}>${t.add}</button>` : this.tool === "split" ? b `<button type="button" ?disabled=${!this.canAct || this.points.length !== 2 || this.selected.length !== 1 || !this.cap("room_split")} @click=${() => this.mapOperation("room_split", { room_id: this.selected[0], line: [this.points[0].x, this.points[0].y, this.points[1].x, this.points[1].y] })}>${t.split}</button>` : this.tool === "goTo" ? b `<button type="button" ?disabled=${!this.canAct || !this.points.length || !m?.active} @click=${() => void this.publicAction("roborock", "set_vacuum_goto_position", { entity_id: this.entity, ...this.points[0] })}>${t.goTo}</button>` : this.tool === "zone" ? b `<button type="button" ?disabled=${!this.canAct || this.points.length !== 2 || !m?.active} @click=${() => void this.publicAction("roborock", "set_vacuum_zoned_cleaning", { entity_id: this.entity, x1: Math.min(this.points[0].x, this.points[1].x), y1: Math.min(this.points[0].y, this.points[1].y), x2: Math.max(this.points[0].x, this.points[1].x), y2: Math.max(this.points[0].y, this.points[1].y), repeats: 0 })}>${t.zone}</button>` : A}
          <div class="actions">
            <button
              type="button"
              ?disabled=${!this.canAct || this.selected.length !== 2 || !this.cap("room_merge")}
              @click=${() => this.mapOperation("room_merge", { rooms: this.selected })}
            >
              ${t.merge}
            </button>
          </div>
          <label
            >${t.material}<select
              @change=${(e) => (this.material = Number(e.target.value))}
            >
              <option value="3">${t.wood}</option>
              <option value="4">${t.tile}</option>
            </select></label
          ><label
            >${t.direction}<input
              type="number"
              min="-1"
              max="359"
              value="-1"
              @input=${(e) => (this.direction = Number(e.target.value))} /></label
          ><button
            type="button"
            ?disabled=${!this.canAct || this.selected.length !== 1 || !this.cap("floor_material")}
            @click=${() => this.mapOperation("floor_material", { room_id: this.selected[0], material: this.material, direction: this.material === 3 ? this.direction : -1 })}
          >
            ${t.save}</button
          >${this.mapDraft
            ? b `<div class="section">
                  <strong>${t.dirty}</strong>
                  <p>
                    ${t.wall}: ${this.mapDraft.walls.length} · ${t.noGo}:
                    ${this.mapDraft.no_go.length}
                  </p>
                  <div class="actions">
                    <button
                      type="button"
                      class="primary"
                      ?disabled=${!this.canAct}
                      @click=${() => this.mapSave()}
                    >
                      ${t.save}</button
                    ><button
                      type="button"
                      ?disabled=${this.pending}
                      @click=${() => this.resetDraft()}
                    >
                      ${t.cancel}
                    </button>
                  </div>
                </div>`
            : A}
        </section>
        <section class="surface section">
          <h3>${t.map}</h3>
          ${[
            ["map_backup", "backup"],
            ["map_restore", "restore"],
            ["map_build", "buildMap"],
        ].map(([operation, label]) => b `<div class="actions">
                <button
                  type="button"
                  ?disabled=${!this.canAct || !m?.active || !this.cap(operation)}
                  @click=${() => this.mapOperation(operation, { confirm: true })}
                >
                  ${t[label]}
                </button>
              </div>`)}
        </section>
      </aside>
    </div>`;
    }
    async publicAction(domain, service, data) {
        if (!this.canAct || !this.ha || !this.map?.active)
            return;
        this.pending = true;
        this.error = "";
        const epoch = this.epoch;
        try {
            await this.ha.callService(domain, service, data);
        }
        catch {
            if (epoch === this.epoch)
                this.error = strings(this.ha).failed;
        }
        finally {
            if (this.isConnected)
                this.pending = false;
        }
    }
    sessionDate(value) {
        if (value === null || !Number.isFinite(value))
            return strings(this.ha).unknown;
        try {
            return new Intl.DateTimeFormat(locale(this.ha), {
                dateStyle: "medium",
                timeStyle: "short",
                hour12: this.ha?.locale?.time_format === "12"
                    ? true
                    : this.ha?.locale?.time_format === "24"
                        ? false
                        : undefined,
            }).format(new Date(value * 1000));
        }
        catch {
            return strings(this.ha).unknown;
        }
    }
    historyView() {
        const t = strings(this.ha);
        return b `<section class="surface">
      <header>
        <h2>${t.history}</h2>
        <button
          type="button"
          ?disabled=${!this.canAct}
          @click=${() => void this.run("history_read", { offset: 0, limit: 5 }, this.data.revision)}
        >
          ${t.loadHistory}
        </button>
      </header>
      ${this.records.length ? this.records.map((r) => b `<div class="history-row"><span>${this.sessionDate(r.begin)}</span><span>${r.duration === null ? t.unknown : number(this.ha, r.duration / 60)} min · ${r.area === null ? t.unknown : number(this.ha, r.area / 1000000)} m²</span></div>`) : b `<p class="hint">${t.emptyHistory}</p>`}
      <nav class="actions" aria-label=${t.history}>
        <button
          type="button"
          ?disabled=${!this.canAct || this.historyOffset === 0}
          @click=${() => void this.run("history_read", { offset: Math.max(0, this.historyOffset - 5), limit: 5 }, this.data.revision)}
        >
          ${t.previous}</button
        ><span>${number(this.ha, this.historyTotal, 0)}</span
        ><button
          type="button"
          ?disabled=${!this.canAct || this.historyNext === null}
          @click=${() => void this.run("history_read", { offset: this.historyNext, limit: 5 }, this.data.revision)}
        >
          ${t.next}
        </button>
      </nav>
    </section>`;
    }
    render() {
        const t = strings(this.ha);
        return b `<main class="panel">
      <header>
        <div>
          <h1>Roborock</h1>
          <p class="hint">
            ${this.data?.connection.server_kind === "custom_server" ? t.serverLocal : this.data?.connection.server_kind === "roborock_cloud" ? t.serverCloud : ""}
          </p>
        </div>
        <a
          class="button"
          href="/config/integrations/integration/roborock_companion"
          >${t.setup}</a
        >
      </header>
      ${this.loading ? b `<p role="status">${t.loading}</p>` : A}${!this.robots.length && !this.loading ? b `<p>${t.noRobots}</p>` : A}${this.robots.length
            ? b `<label
              >${t.selectRobot}<select
                .value=${this.entity}
                @change=${(e) => {
                const el = e.target, value = el.value;
                el.value = this.entity;
                this.guard(() => {
                    this.entity = value;
                    this.data = undefined;
                    this.records = [];
                    void this.load();
                });
            }}
              >
                ${this.robots.map((r) => b `<option value=${r.entity_id}>${r.name}</option>`)}
              </select></label
            >`
            : A}${this.ha?.user && !this.ha.user.is_admin ? b `<p role="alert">${t.admin}</p>` : A}
      <nav class="tabs" aria-label="Roborock">
        ${["maps", "settings", "schedules", "history"].map((tab) => b `<button
              type="button"
              data-tab=${tab}
              aria-pressed=${String(this.tab === tab)}
              @click=${() => this.guard(() => {
            this.tab = tab;
        })}
            >
              ${t[tab]}
            </button>`)}
      </nav>
      <div
        class="feedback"
        role=${this.error ? "alert" : "status"}
        aria-live="polite"
      >
        ${this.error || (this.pending ? t.pending : this.message)}
      </div>
      ${this.uncertain ? b `<button type="button" @click=${() => this.guard(() => void this.load())}>${t.refresh}</button>` : A}${this.data
            ? this.tab === "settings"
                ? this.settingsView()
                : this.tab === "maps"
                    ? this.mapsView()
                    : this.tab === "history"
                        ? this.historyView()
                        : b `<section class="surface">
                    <h2>${t.schedules}</h2>
                    <p class="hint">${t.nativeSchedules}</p>
                    <a class="button" href="/config/automation/dashboard"
                      >${t.openAutomations}</a
                    >
                  </section>`
            : A}
      <dialog
        id="confirm"
        aria-labelledby="confirmation-title"
        @cancel=${() => {
            this.confirmation = undefined;
        }}
      >
        <h3 id="confirmation-title">${t.confirm}</h3>
        <p>${this.confirmation?.text}</p>
        ${this.error ? b `<p role="alert">${this.error}</p>` : A}
        <div class="actions">
          <button
            type="button"
            class="primary"
            ?disabled=${this.pending || this.uncertain}
            @click=${() => this.confirmation?.action()}
          >
            ${t.confirm}</button
          ><button
            type="button"
            ?disabled=${this.pending}
            @click=${() => this.closeConfirmation()}
          >
            ${t.cancel}
          </button>
        </div>
      </dialog>
    </main>`;
    }
}
if (!customElements.get("roborock-companion-panel"))
    customElements.define("roborock-companion-panel", RoborockPanel);

export { RoborockPanel };
//# sourceMappingURL=roborock-companion-panel.js.map
