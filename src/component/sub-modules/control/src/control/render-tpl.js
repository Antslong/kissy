/*
  Generated by kissy-tpl2mod.
*/
KISSY.add('component/control/render-tpl',
'<div id="{{id}}"\n class="{{getBaseCssClasses ""}}\n{{#each elCls}}\n {{.}}  \n{{/each}}\n"\n\n{{#each elAttrs}} \n {{xindex}}="{{.}}"\n{{/each}}\n\nstyle="\n{{#each elStyle}} \n {{xindex}}:{{.}};\n{{/each}}\n">');