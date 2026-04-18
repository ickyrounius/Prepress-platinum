import os
import re

directories = ['ctp', 'ctcp', 'flexo', 'screen', 'etching']
base_path = r'h:\00_CODE_X\SM_APPS\prepress-app\src\app\(dashboard)\panel\production'

for dir_name in directories:
    file_path = os.path.join(base_path, dir_name, 'page.tsx')
    if not os.path.exists(file_path):
        continue
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Detect the primary color theme used in this panel by looking at "shadow-lg shadow-XXX" or text-XXX-500
    color_match = re.search(r'bg-([a-z]+)-500 text-white rounded', content)
    theme_color = color_match.group(1) if color_match else 'indigo'

    # Add imports
    if 'useAuth' not in content:
        content = re.sub(
            r"import React(.*?)(?:;|\n)",
            r"import React, { useEffect } from 'react';\nimport { useAuth } from '@/lib/AuthContext';",
            content,
            count=1
        )
    
    # Clean up double useEffect if existed
    content = content.replace("import React, { useEffect } from 'react';\nimport { useEffect } from 'react';", "import React, { useEffect } from 'react';")

    # Inject useAuth hook and useEffect inside the component
    if 'const { role } = useAuth();' not in content:
        component_match = re.search(r"export default function \w+\(\) {\n\s+const { updateFormField, formData } = useFormStore\(\);", content)
        if component_match:
            replacement = component_match.group(0).replace(
                "const { updateFormField, formData } = useFormStore();",
                "const { role } = useAuth();\n  const { updateFormField, formData } = useFormStore();\n\n  useEffect(() => {\n    if (role) {\n      updateFormField('role_type', role.toUpperCase());\n    }\n  }, [role, updateFormField]);"
            )
            content = content.replace(component_match.group(0), replacement)

    # Inject visual element into grid-cols-2 immediately before 'Status Prepress' (or similar Status dropdown)
    visual_box = f"""
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-{theme_color}-500">Bekerja Sebagai</label>
                <div className="w-full p-4 border-2 border-{theme_color}-100 rounded-2xl bg-{theme_color}-50 cursor-default text-sm font-black text-{theme_color}-600 shadow-sm flex items-center justify-between">
                  <span className="uppercase tracking-wider">{{role || 'MEMUAT...'}}</span>
                  <span className="text-[9px] text-{theme_color}-400 font-bold bg-white px-2 py-0.5 rounded-full border border-{theme_color}-100 tracking-widest uppercase">Auto</span>
                </div>
              </div>
"""
    if "Bekerja Sebagai" not in content:
        # Search for the label containing 'Status Prepress' or 'Status Produksi' or 'Status'
        content = re.sub(
            r"(\s+<div className=\"space-y-1\">\s+<label className=\"(?:[^\"]+)\">\s*Status )",
            visual_box + r"\1",
            content
        )
        
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Updated {dir_name}/page.tsx with {theme_color} theme")
