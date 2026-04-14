const fs = require('fs');
const path = require('path');

function replaceInFiles(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== 'node_modules' && file !== 'dist' && file !== '.git' && file !== '.venv' && file !== 'venv') {
                replaceInFiles(fullPath);
            }
        } else if (
            fullPath.endsWith('.tsx') || 
            fullPath.endsWith('.ts') || 
            fullPath.endsWith('.jsx') || 
            fullPath.endsWith('.js') || 
            fullPath.endsWith('.html') ||
            fullPath.endsWith('.md') ||
            fullPath.endsWith('.py') ||
            fullPath.endsWith('.ps1') ||
            fullPath.endsWith('.yaml') ||
            fullPath.endsWith('.yml') ||
            fullPath.endsWith('.json')
        ) {
            if (file === 'package-lock.json') continue;
            
            let content = fs.readFileSync(fullPath, 'utf8');
            const originalContent = content;
            
            content = content.replace(/Neuro\s*Sense\s*AI/gi, 'NeuroLab');
            content = content.replace(/Neuro\s*Sense/gi, 'NeuroLab');
            content = content.replace(/Neurosense/gi, 'NeuroLab');
            content = content.replace(/NEUROSENSE/g, 'NEUROLAB');
            content = content.replace(/neurosense/g, 'neurolab');
            
            if (content !== originalContent) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Renamed project inside ${fullPath}`);
            }
        }
    }
}

replaceInFiles(process.cwd());
