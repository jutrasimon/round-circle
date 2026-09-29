const {test}=require('node:test'),assert=require('node:assert/strict');
const {itchPage,exitDestination}=require('../dist/screen.js');
test('exit destination accepts an HTTPS itch project referrer',()=>{assert.equal(itchPage('https://creator.itch.io/round-circle'),'https://creator.itch.io/round-circle');});
test('exit destination rejects unrelated, forged and missing referrers',()=>{for(const u of ['', 'javascript:alert(1)','https://itch.io.evil.test/game','https://notitch.io/game','http://creator.itch.io/game'])assert.equal(itchPage(u),null);});

test('exit survives itch asset wrappers and missing referrers',()=>{
 for(const referrer of ['', 'https://html-classic.itch.zone/html/123/index.html', 'https://html.itch.zone/'])
  assert.equal(exitDestination(referrer),'https://lm-vg.itch.io/round-circle');
});
test('exit preserves an itch project secret URL when supplied by the host',()=>{
 const url='https://lm-vg.itch.io/round-circle?secret=test';
 assert.equal(exitDestination(url),url);
});
