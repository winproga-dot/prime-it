import { readFile } from 'node:fs/promises';
export async function evidenceBlob(name, bytes) {
  if (!process.env.GITHUB_TOKEN || !process.env.GITHUB_REPOSITORY) return;
  const response = await fetch('https://api.github.com/repos/' + process.env.GITHUB_REPOSITORY + '/git/blobs', {
    method:'POST',
    headers:{Authorization:'Bearer ' + process.env.GITHUB_TOKEN,'Content-Type':'application/json','X-GitHub-Api-Version':'2022-11-28'},
    body:JSON.stringify(name === 'package-lock.json' ? {content:bytes.toString('utf8'),encoding:'utf-8'} : {content:JSON.stringify({mime:'image/webp',base64:bytes.toString('base64')}),encoding:'utf-8'}),
  });
  const body = await response.json();
  console.log('EVIDENCE_BLOB',name,response.status,body.sha || body.message);
}
if (process.argv[2] === 'lock') await evidenceBlob('package-lock.json',await readFile('package-lock.json'));
