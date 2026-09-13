import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const url='https://unpkg.com/babylonjs@9.26.0/babylon.js';
const expected='f4d7e6800fa23a969f970dcdfacdf015d18a220fa9e589800a24f2dd531fe677';
const file=new URL('../dist/babylon.js',import.meta.url);
const hash=data=>createHash('sha256').update(data).digest('hex');
try {if(hash(await readFile(file))===expected){console.log('Babylon.js 9.26.0 prêt.');process.exit(0);}}catch{}
const response=await fetch(url);if(!response.ok)throw Error('Téléchargement du moteur : '+response.status);
const data=Buffer.from(await response.arrayBuffer());if(hash(data)!==expected)throw Error('Le moteur ne correspond pas à la version vérifiée.');
await mkdir(new URL('../dist/',import.meta.url),{recursive:true});await writeFile(file,data);console.log('Babylon.js 9.26.0 téléchargé et vérifié.');
