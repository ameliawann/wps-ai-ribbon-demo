/* 文档级专家演示。方案为全局演示偏好，当前专家跟随各文档保存。 */
(function () {
  'use strict';
  var experts = [
    {id:'business',name:'经营分析专家',role:'把业务数据变成经营判断',desc:'围绕销售、成本和利润梳理关键指标，比较业务表现，定位变化与异常，帮助你形成可汇报的分析结论。',tags:['指标拆解','经营复盘','趋势分析'],scene:'销售台账、经营月报、渠道与产品分析',skills:['按时间、地区、产品等维度汇总核心指标','对比目标与实际，拆解增长、下滑和异常','整理关键发现，形成经营复盘要点'],prompts:['按产品分析本月销售额与毛利，找出值得关注的变化','对比各区域目标完成率，整理三条经营建议']},
    {id:'finance',name:'财务报表专家',role:'让收支与报表清晰可核对',desc:'协助整理收支流水、核对账目与汇总财务指标，把分散数据组织成便于核查和展示的报表。',tags:['收支汇总','账目核对','财务分析'],scene:'收支流水、费用明细、应收账款与月度财务报表',skills:['按科目与部门汇总收入、成本和费用','检查重复记录、金额异常与账目差异','分析应收账龄、现金流与费用结构'],prompts:['按部门汇总本月费用，并标出超预算的项目','将应收账款按账龄分组，列出需要关注的记录']},
    {id:'clean',name:'数据清洗专家',role:'先把杂乱数据整理可靠',desc:'从重复、缺失、格式不一致等常见问题入手，帮助统一数据口径，为后续计算与分析准备整洁的数据。',tags:['去重补全','格式统一','拆分提取'],scene:'导出明细、客户名单、跨来源合并的数据',skills:['识别重复、空值和格式不一致的字段','按规则拆分、提取或合并文本字段','给出清洗规则与待确认的异常记录'],prompts:['检查这份客户名单的重复手机号，统一日期格式','将地址拆成省市区，并列出无法识别的记录']},
    {id:'visual',name:'图表可视化专家',role:'让数据重点一眼可见',desc:'根据比较、趋势和构成等表达目标选择图表，整理标题、标注和排版，帮助读者快速理解数据重点。',tags:['选图建议','图表制作','视觉表达'],scene:'汇报图表、经营看板、季度复盘与分析报告',skills:['根据数据结构和表达目的推荐图表','制作对比、趋势或构成图并突出重点','统一图表标题、配色与数字展示格式'],prompts:['用合适的图表展示各渠道销售占比，并突出前三名','把月度收入和利润做成便于汇报的组合图']},
    {id:'hr',name:'人事薪酬专家',role:'把人员与薪酬数据理清楚',desc:'围绕人员台账、考勤和薪酬明细进行整理与汇总，帮助核对规则、检查差异并形成清晰的人事报表。',tags:['人员统计','考勤汇总','薪酬核对'],scene:'员工花名册、考勤明细、薪酬台账',skills:['按部门与岗位汇总人员结构和变动','按明确规则汇总考勤与薪酬字段','检查缺失、重复和需要人工确认的差异'],prompts:['按部门汇总员工人数，标出缺少入职日期的记录','按给定规则汇总本月考勤，并列出异常明细']},
    {id:'project',name:'项目管理专家',role:'让进度、成本和风险有据可查',desc:'把项目计划、任务进度和预算数据联系起来，整理延期、超支与资源安排，帮助团队持续跟进项目。',tags:['进度跟踪','预算对比','风险识别'],scene:'项目台账、任务清单、预算与工时明细',skills:['按项目与负责人汇总任务进度','比较计划与实际日期、预算和工时','整理逾期事项、风险和下一步跟进行动'],prompts:['找出本周逾期任务，按负责人整理跟进清单','对比各项目预算和实际支出，标出超支项目']}
  ];
  var extraTasks = {
    business: [['看销售趋势','按月汇总销售额，找出增长或下滑明显的月份'],['检查目标达成','按地区比较销售目标与实际完成情况，列出重点问题']],
    finance: [['分析费用结构','按费用类别汇总支出，找出占比最高的项目'],['核对收支流水','检查收支明细中的重复记录和金额异常，列出待核对项']],
    clean: [['处理缺失信息','检查表格中的空值，列出需要补充的字段和记录'],['整理杂乱文本','清理文本中的多余空格和换行，统一数据格式']],
    visual: [['比较产品表现','生成柱状图，比较各产品的销售额'],['推荐合适图表','根据数据结构推荐图表，突出最值得关注的信息']],
    hr: [['整理人员结构','按部门和岗位统计员工人数，形成结构汇总'],['检查人事台账','检查员工编号重复和关键信息缺失，列出待核对记录']],
    project: [['汇总任务进度','按项目和负责人汇总任务完成情况'],['整理项目风险','汇总延期、超支和资源冲突，形成跟进清单']]
  };
  var taskTitles = {
    business:['分析销售与毛利','比较目标完成率'], finance:['汇总部门费用','分析应收账龄'],
    clean:['检查客户名单','拆分地址信息'], visual:['展示渠道占比','制作收入利润图'],
    hr:['汇总人员信息','汇总考勤异常'], project:['跟进逾期任务','检查预算超支']
  };
  var mode='transition', root=null, tab=null, originalContent='', normalMode='', menu=null, anchor=null, previewId='', menuSource='ribbon';
  try { if(localStorage.getItem('wps-ai-edit.et.expert-scheme')==='final')mode='final'; } catch(e){}
  function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function find(id){return experts.find(function(e){return e.id===id;})||experts[0];}
  function documentById(id){return window.App&&App.tabs.find(function(t){return t.id===id;});}
  function ensureDocument(doc){
    if(!doc.doc.aiRecommendedExpertId){
      var name=doc.name||doc.title||'';
      doc.doc.aiRecommendedExpertId=/薪酬|考勤|员工|人事/.test(name)?'hr':/财务|费用|账|收支/.test(name)?'finance':/项目|任务|进度/.test(name)?'project':/清洗|名单/.test(name)?'clean':'business';
    }
    if(!doc.doc.aiExpertId)doc.doc.aiExpertId=doc.doc.aiRecommendedExpertId;
    return find(doc.doc.aiExpertId);
  }
  function active(){return ensureDocument(tab);}
  function portrait(e,size){return '<span class="et-expert-avatar et-expert-avatar-'+e.id+' '+(size||'')+'" role="img" aria-label="'+e.name+'头像"></span>';}
  function arrow(){return window.icon('arrow_down_s',12);}
  function mainButton(e,composer){return '<button type="button" class="'+(composer?'et-expert-composer-main':'rb-large-split-main')+'" data-et-ai-capability="assistant" aria-label="打开'+e.name+'" title="打开灵犀">'+(composer?portrait(e,'is-small')+'<span>'+e.name+'</span>':'<span class="rb-large-icon">'+portrait(e)+'</span>')+'</button>';}
  function triggerButton(e,composer){return '<button type="button" class="'+(composer?'et-expert-composer-menu':'rb-large-split-menu')+'" data-et-expert-trigger="'+(composer?'composer':'ribbon')+'" aria-label="'+(composer?'输入框':'功能区')+'专家库：'+e.name+'" aria-haspopup="menu" aria-expanded="false" aria-controls="et-expert-menu">'+(composer?'<span>专家库</span>'+arrow():'<span class="rb-large-label">'+e.name+arrow()+'</span>')+'</button>';}
  function renderEntry(){
    if(!root||!tab)return;
    var group=root.querySelector('.rb-et-assistant');if(!group)return;
    var content=group.querySelector('.rb-group-content');
    if(mode==='transition'){content.innerHTML=originalContent;group.querySelector('.rb-group-label').textContent='智能助手';}
    else{var e=active();content.innerHTML='<div class="rb-large-split rb-et-expert-split" role="group" aria-label="'+e.name+'">'+mainButton(e,false)+triggerButton(e,false)+'</div>';group.querySelector('.rb-group-label').textContent='推荐专家';}
    root.querySelectorAll('[data-expert-scheme]').forEach(function(btn){var on=btn.getAttribute('data-expert-scheme')===mode;btn.classList.toggle('is-active',on);btn.setAttribute('aria-pressed',String(on));});
  }
  function renderComposer(aside,doc){
    if(!aside)return;
    var old=aside.querySelector('.et-expert-composer, .ag-mode');if(!old)return;
    if(mode==='transition'){
      if(old.classList.contains('et-expert-composer')){var t=document.createElement('template');t.innerHTML=normalMode;old.replaceWith(t.content.firstChild);}
      return;
    }
    var e=ensureDocument(doc),box=document.createElement('div');box.className='et-expert-composer';box.setAttribute('role','group');box.setAttribute('aria-label','输入框当前专家');box.innerHTML=mainButton(e,true)+triggerButton(e,true);old.replaceWith(box);
  }
  function syncAll(resetWelcome){
    renderEntry();if(root&&tab){renderComposer(root.querySelector('.agent-sidebar'),tab);if(window.Agent&&Agent.refreshEtExpert)Agent.refreshEtExpert(tab.id,resetWelcome);}
  }
  function closeMenu(returnFocus){
    var previous=anchor;if(menu)menu.remove();menu=null;anchor=null;
    if(previous&&previous.isConnected){previous.setAttribute('aria-expanded','false');var split=previous.closest('.rb-et-expert-split, .et-expert-composer');if(split)split.classList.remove('is-open');if(returnFocus)previous.focus();}
  }
  function position(){
    if(!menu||!anchor||!anchor.isConnected){closeMenu(false);return;}
    var target=menuSource==='composer'?anchor.closest('.et-expert-composer'):anchor;
    var r=target.getBoundingClientRect(),width=menu.offsetWidth,height=menu.offsetHeight;
    var top=menuSource==='composer'?r.top-height-8:r.bottom+8;
    if(top<8)top=r.bottom+8;
    if(top+height>innerHeight-8)top=r.top-height-8;
    menu.style.left=Math.max(8,Math.min(r.left,innerWidth-width-8))+'px';menu.style.top=Math.max(8,Math.min(top,innerHeight-height-8))+'px';
  }
  function renderPreview(id){
    previewId=id;var e=find(id),isCurrent=e.id===active().id;
    menu.querySelector('.et-experts-preview').innerHTML='<div class="et-experts-profile">'+portrait(e,'is-profile')+'<div><span class="et-experts-eyebrow">'+(isCurrent?'当前专家':'专家介绍')+'</span><h3>'+e.name+'</h3></div></div><p class="et-experts-role">'+e.role+'</p><p>'+e.desc+'</p><div class="et-experts-tags">'+e.tags.map(function(t){return '<span>'+t+'</span>';}).join('')+'</div><h4>适用文档</h4><p>'+e.scene+'</p><h4>可以帮你</h4><ul>'+e.skills.map(function(t){return '<li>'+t+'</li>';}).join('')+'</ul>';
  }
  function renderList(){
    var query=menu.querySelector('input').value.trim().toLowerCase();var items=experts.filter(function(e){return(e.name+e.tags.join('')+e.scene).toLowerCase().indexOf(query)>=0;});
    menu.querySelector('[role="menu"]').innerHTML=items.length?items.map(function(e){var current=e.id===active().id;return '<button type="button" role="menuitemradio" aria-checked="'+String(current)+'" class="kd-menu-item et-experts-row '+(current?'is-selected':'')+'" data-expert-id="'+e.id+'">'+portrait(e,'is-list')+'<span class="et-experts-row-copy"><strong>'+e.name+'</strong><small>'+e.tags.slice(0,2).join(' · ')+'</small></span>'+(current?'<span class="et-experts-state">当前</span>':e.id===tab.doc.aiRecommendedExpertId?'<span class="et-experts-state">推荐</span>':'')+'</button>';}).join(''):'<p class="et-experts-empty">没有找到匹配的专家</p>';
  }
  function openMenu(button,focusItem){
    if(menu&&anchor===button){closeMenu(true);return;}closeMenu(false);anchor=button;menuSource=button.getAttribute('data-et-expert-trigger');
    menu=document.createElement('section');menu.className='kd-menu et-experts-menu';menu.id='et-expert-menu';menu.setAttribute('role','region');menu.setAttribute('aria-label','专家库');
    menu.innerHTML='<header><div><h3>专家库</h3><p>为当前文档选择一位专家</p></div><button type="button" class="kd-button kd-button-light kd-button-icon kd-button-sm" aria-label="关闭专家库">'+window.icon('symbol_cross_two',16)+'</button></header><label class="kd-input kd-input-large"><span class="kd-input-wrap"><input type="search" class="kd-input-inner" aria-label="搜索专家" placeholder="搜索名称或擅长领域"></span></label><div class="et-experts-menu-body"><div class="et-experts-library" role="menu" aria-label="切换专家"></div><aside class="et-experts-preview" aria-label="专家说明"></aside></div><footer>悬停查看介绍，点击切换当前文档专家</footer>';
    document.body.appendChild(menu);button.setAttribute('aria-expanded','true');var split=button.closest('.rb-et-expert-split, .et-expert-composer');if(split)split.classList.add('is-open');
    renderList();renderPreview(active().id);position();
    menu.querySelector('input').addEventListener('input',renderList);
    menu.addEventListener('pointerover',function(e){var item=e.target.closest('[data-expert-id]');if(item&&!item.contains(e.relatedTarget))renderPreview(item.getAttribute('data-expert-id'));});
    menu.addEventListener('focusin',function(e){var item=e.target.closest('[data-expert-id]');if(item)renderPreview(item.getAttribute('data-expert-id'));});
    menu.addEventListener('click',function(e){
      if(e.target.closest('[aria-label="关闭专家库"]')){closeMenu(true);return;}
      var item=e.target.closest('[data-expert-id]');if(!item)return;
      tab.doc.aiExpertId=item.getAttribute('data-expert-id');var source=menuSource;closeMenu(false);syncAll(true);root.querySelector('[data-et-expert-trigger="'+source+'"]').focus();
    });
    menu.addEventListener('keydown',function(e){
      if(e.key==='Escape'){e.preventDefault();e.stopPropagation();closeMenu(true);return;}
      if(e.key==='Tab'){closeMenu(false);return;}
      if(['ArrowDown','ArrowUp','Home','End'].indexOf(e.key)<0)return;
      if(e.target.tagName==='INPUT'&&e.key!=='ArrowDown')return;
      e.preventDefault();var items=Array.from(menu.querySelectorAll('[role="menuitemradio"]'));if(!items.length)return;var i=items.indexOf(document.activeElement);
      if(e.key==='Home')i=0;else if(e.key==='End')i=items.length-1;else i=(i+(e.key==='ArrowDown'?1:-1)+items.length)%items.length;items[i].focus();
    });
    if(focusItem)menu.querySelector('[aria-checked="true"]')?.focus();else menu.querySelector('input').focus();
  }
  function welcomeHeader(id){var doc=documentById(id);if(!doc)return '';var e=ensureDocument(doc);return '<div class="ag-expert-hero">'+portrait(e,'is-welcome')+'<span>当前文档专家</span><h3>'+e.name+'</h3><p>'+e.role+'</p></div>';}
  function renderWelcome(welcome,id){
    var doc=documentById(id);if(!doc||!welcome)return;var e=ensureDocument(doc);
    welcome.classList.remove('is-record-welcome');welcome.classList.add('is-expert-welcome');welcome.innerHTML=welcomeHeader(id)+'<div class="ag-try">你可以试试</div>';
    var tasks=e.prompts.map(function(p,i){return[taskTitles[e.id][i],p];}).concat(extraTasks[e.id]);
    tasks.forEach(function(task){var button=document.createElement('button');button.type='button';button.className='ag-card ag-capability-card';button.innerHTML='<span class="ag-card-title">'+esc(task[0])+'</span><span class="ag-card-desc">'+esc(task[1])+'</span>';button.addEventListener('click',function(){if(window.Agent&&Agent.fillEtSuggestion)Agent.fillEtSuggestion(id,task[1]);});welcome.appendChild(button);});
  }
  window.EtExperts={
    isFinal:function(){return mode==='final';},welcomeHeader:welcomeHeader,renderWelcome:renderWelcome,
    mountSidebar:function(aside,doc){var standard=aside.querySelector('.ag-mode');if(standard)normalMode=standard.outerHTML;ensureDocument(doc);renderComposer(aside,doc);},
    init:function(editorRoot,docTab){
      closeMenu(false);root=editorRoot;tab=docTab;ensureDocument(tab);var group=root.querySelector('.rb-et-assistant');if(!group)return;originalContent=group.querySelector('.rb-group-content').innerHTML;
      var standard=root.querySelector('.ag-mode');if(standard)normalMode=standard.outerHTML;
      var control=document.createElement('div');control.className='skills-demo-switch et-experts-scheme';control.setAttribute('role','group');control.setAttribute('aria-label','专家入口方案');control.innerHTML='<span class="skills-demo-label">入口方案</span><button type="button" data-expert-scheme="transition">过渡态</button><button type="button" data-expert-scheme="final">最终态</button>';root.appendChild(control);
      control.addEventListener('click',function(e){var button=e.target.closest('[data-expert-scheme]');if(!button)return;closeMenu(false);mode=button.getAttribute('data-expert-scheme');try{localStorage.setItem('wps-ai-edit.et.expert-scheme',mode);}catch(err){}syncAll(false);});syncAll(false);
    }
  };
  document.addEventListener('click',function(e){var button=e.target.closest('[data-et-expert-trigger]');if(button&&root&&root.contains(button)){openMenu(button,false);return;}if(menu&&!menu.contains(e.target))closeMenu(false);});
  document.addEventListener('keydown',function(e){var button=e.target.closest('[data-et-expert-trigger]');if(button&&(e.key==='ArrowDown'||e.key==='Enter'&&button.getAttribute('aria-expanded')==='false')){e.preventDefault();openMenu(button,true);}});
  window.addEventListener('resize',position);document.addEventListener('scroll',function(e){if(menu&&!menu.contains(e.target))position();},true);
})();
