const {test}=require('node:test');
const assert=require('node:assert/strict');
const {migrate,migrateStorage}=require('../dist/english-migration.js');
test('English migration preserves custom text, identifiers and balancing',()=>{
 const original={id:'partie-temoin',name:'Gardien',custom:'My custom guardian',stats:{hp:220,speed:.8},nested:[{text:'Nous voulions un endroit où rentrer.'}]};
 const result=migrate(original);
 assert.equal(result.name,'Guardian');assert.equal(result.nested[0].text,'We wanted somewhere to come back to.');
 assert.equal(result.id,original.id);assert.equal(result.custom,original.custom);assert.deepEqual(result.stats,original.stats);assert.equal(original.name,'Gardien');
 assert.deepEqual(migrate(result),result);
});
test('English migration handles embedded JSON editors without altering numeric preferences',()=>{
 const result=migrate({dialogueEditor:JSON.stringify({name:'LA LOCATAIRE',text:'Je garderai la clé.'}),volume:.08});
 assert.deepEqual(JSON.parse(result.dialogueEditor),{name:'THE TENANT',text:'I will keep the key.'});assert.equal(result.volume,.08);
});
test('storage migration tolerates corrupt entries and leaves unrelated settings untouched',()=>{
 const entries=new Map([['round-circle-waves-v1','broken'],['round-circle-gym',JSON.stringify({name:'Cassette interdite',visual:{zoom:29}})],['round-circle-audio-v1','{"music":0.12}']]);
 const storage={getItem:key=>entries.get(key),setItem:(key,value)=>entries.set(key,value)};
 migrateStorage(storage);assert.equal(entries.get('round-circle-waves-v1'),'broken');assert.equal(JSON.parse(entries.get('round-circle-gym')).name,'Forbidden Tape');assert.equal(entries.get('round-circle-audio-v1'),'{"music":0.12}');
});
