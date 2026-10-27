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
  var mode = 'transition', root = null, tab = null, original = '', modal = null, opener = null;
  try { if (localStorage.getItem('wps-ai-edit.et.expert-scheme') === 'final') mode = 'final'; } catch(e) {}
  function esc(s) { return s.replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
  function find(id) { return experts.find(function(x){return x.id===id;}) || experts[0]; }
  function portrait(expert, size) { return '<span class="et-expert-avatar et-expert-avatar-'+expert.id+' '+(size||'')+'" role="img" aria-label="'+expert.name+'头像"></span>'; }
  function active() { return find(tab.doc.aiExpertId); }
  function renderEntry() {
    var group=root.querySelector('.rb-et-assistant'), button=group.querySelector('button');
    if (mode==='transition') {
      button.innerHTML=original; button.setAttribute('aria-label','AI 表格助手'); button.title='AI 表格助手'; button.setAttribute('data-et-ai-capability','assistant'); button.removeAttribute('data-et-expert-entry'); group.querySelector('.rb-group-label').textContent='智能助手';
    } else {
      var expert=active(); button.innerHTML='<span class="rb-large-icon">'+portrait(expert)+'</span><span class="rb-large-label">'+expert.name+'</span>'; button.setAttribute('aria-label',expert.name); button.title=expert.name+' · 查看专家库'; button.removeAttribute('data-et-ai-capability'); button.setAttribute('data-et-expert-entry',''); group.querySelector('.rb-group-label').textContent='推荐专家';
    }
    root.querySelectorAll('[data-expert-scheme]').forEach(function(btn){var on=btn.getAttribute('data-expert-scheme')===mode;btn.classList.toggle('is-active',on);btn.setAttribute('aria-pressed',String(on));});
  }
  function close() { if(modal)modal.remove();modal=null;if(opener&&opener.isConnected)opener.focus(); }
  function open(button) {
    if(modal)close();opener=button;var selected=active().id;
    modal=document.createElement('div');modal.className='et-experts-layer';
    modal.innerHTML='<!-- [Modal: lg C3a] 左侧专家库与右侧专家说明，两张白卡片 --><div class="kd-modal-wrap"><section class="kd-modal kd-modal-lg" role="dialog" aria-modal="true" aria-labelledby="et-experts-title"><div class="kd-modal-content"><header class="kd-modal-header"><h2 class="kd-modal-title" id="et-experts-title">文档专家库</h2><button type="button" class="kd-modal-close" aria-label="关闭专家库">'+window.icon('symbol_cross_two',16)+'</button></header><div class="kd-modal-body-wrap-c3"><div class="et-experts-intro">为当前文档选择一位专家，让每次提问更贴合你的工作。</div><div class="et-experts-layout"><section class="kd-modal-body-card et-experts-library" aria-label="专家列表"><div class="et-experts-library-heading"><h3>全部专家</h3><span>6 位</span></div><label class="kd-input kd-input-large"><span class="kd-input-wrap"><input class="kd-input-inner" type="search" aria-label="搜索专家" placeholder="搜索名称或擅长领域"></span></label><div class="et-experts-list"></div></section><section class="kd-modal-body-card et-experts-detail" aria-label="专家说明"></section></div></div><footer class="kd-modal-footer has-left"><span class="et-experts-current"></span><div class="kd-modal-footer-right"><button type="button" class="kd-button kd-button-secondary kd-button-lg" data-expert-cancel>取消</button><button type="button" class="kd-button kd-button-primary kd-button-lg" data-expert-apply>设为当前专家</button></div></footer></div></section></div>';
    document.getElementById('modal-root').appendChild(modal);
    function renderList() {
      var query=modal.querySelector('input').value.trim().toLowerCase();
      var filtered=experts.filter(function(e){return (e.name+e.tags.join('')+e.scene).toLowerCase().indexOf(query)>=0;});
      modal.querySelector('.et-experts-list').innerHTML=filtered.length?filtered.map(function(e){return '<button type="button" class="et-experts-row '+(e.id===selected?'is-selected':'')+'" data-expert-id="'+e.id+'" aria-pressed="'+String(e.id===selected)+'">'+portrait(e,'is-list')+'<span class="et-experts-row-copy"><strong>'+e.name+'</strong><small>'+e.tags.slice(0,2).join(' · ')+'</small></span>'+(e.id==='business'?'<span class="et-experts-recommend">推荐</span>':'')+'</button>';}).join(''):'<p class="et-experts-empty">没有找到匹配的专家</p>';
    }
    function renderDetail() {
      var e=find(selected);
      modal.querySelector('.et-experts-detail').innerHTML='<div class="et-experts-profile">'+portrait(e,'is-profile')+'<div><div class="et-experts-eyebrow">'+(e.id===active().id?'当前文档专家':'专家介绍')+'</div><h3>'+e.name+'</h3><p>'+e.role+'</p></div></div><div class="et-experts-tags">'+e.tags.map(function(t){return '<span>'+t+'</span>';}).join('')+'</div><p class="et-experts-description">'+e.desc+'</p>'+(e.id==='business'?'<div class="et-experts-reason"><strong>为什么推荐</strong><span>适合从销售、利润等常见经营数据开始分析，本 Demo 默认推荐。</span></div>':'')+'<section><h4>适用文档</h4><p>'+e.scene+'</p></section><section><h4>可以帮你</h4><ul>'+e.skills.map(function(s){return '<li>'+s+'</li>';}).join('')+'</ul></section><section><h4>试试这样问</h4><div class="et-experts-prompts">'+e.prompts.map(function(p){return '<div>'+esc(p)+'</div>';}).join('')+'</div></section>';
      modal.querySelector('.et-experts-current').textContent='当前：'+active().name;
      modal.querySelector('[data-expert-apply]').textContent=e.id===active().id?'保持当前专家':'设为当前专家';
    }
    modal.querySelector('input').addEventListener('input',renderList);
    modal.addEventListener('click',function(e){
      if(e.target.closest('[aria-label="关闭专家库"], [data-expert-cancel]')||e.target.classList.contains('kd-modal-wrap')){close();return;}
      var item=e.target.closest('[data-expert-id]');if(item){selected=item.getAttribute('data-expert-id');renderList();renderDetail();modal.querySelector('[data-expert-id="'+selected+'"]').focus();return;}
      if(e.target.closest('[data-expert-apply]')){tab.doc.aiExpertId=selected;renderEntry();close();}
    });
    modal.addEventListener('keydown',function(e){if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close();return;}if(e.key!=='Tab')return;var list=Array.from(modal.querySelectorAll('button,input')),first=list[0],last=list[list.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}});
    renderList();renderDetail();modal.querySelector('[data-expert-id="'+selected+'"]').focus();
  }
  window.EtExperts={init:function(editorRoot,docTab){
    close();root=editorRoot;tab=docTab;var button=root.querySelector('.rb-et-assistant button');if(!button)return;original=button.innerHTML;
    var control=document.createElement('div');control.className='skills-demo-switch et-experts-scheme';control.setAttribute('role','group');control.setAttribute('aria-label','专家入口方案');control.innerHTML='<span class="skills-demo-label">入口方案</span><button type="button" data-expert-scheme="transition">过渡态</button><button type="button" data-expert-scheme="final">最终态</button>';root.appendChild(control);
    control.addEventListener('click',function(e){var btn=e.target.closest('[data-expert-scheme]');if(!btn)return;mode=btn.getAttribute('data-expert-scheme');try{localStorage.setItem('wps-ai-edit.et.expert-scheme',mode);}catch(err){}renderEntry();});renderEntry();
  }};
  document.addEventListener('click',function(e){var button=e.target.closest('[data-et-expert-entry]');if(button&&root&&root.contains(button))open(button);});
})();
