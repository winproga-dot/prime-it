import { spawnSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
await mkdir('.qa',{recursive:true});
const result=spawnSync('npm',['audit','--json'],{encoding:'utf8',maxBuffer:4*1024*1024});
try {
  const report=JSON.parse(result.stdout);await writeFile('.qa/npm-audit.json',JSON.stringify(report,null,2));
  console.log('DEPENDENCY_AUDIT',JSON.stringify({summary:report.metadata?.vulnerabilities,packages:Object.entries(report.vulnerabilities || {}).map(([name,item])=>({name,severity:item.severity,range:item.range,via:item.via.map(v=>typeof v === 'string' ? v : v.title),fixAvailable:item.fixAvailable}))}));
} catch {console.log('DEPENDENCY_AUDIT_UNAVAILABLE',result.stderr);}
for(const name of ['lighthouse','vite','@vitejs/plugin-react','@axe-core/playwright','playwright']) {
 const response=spawnSync('npm',['view',name,'version'],{encoding:'utf8'});
 console.log('LATEST_PACKAGE',name,response.stdout.trim());
}
