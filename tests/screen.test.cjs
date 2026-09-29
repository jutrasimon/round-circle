const {test}=require('node:test'),assert=require('node:assert/strict');
const {itchPage}=require('../dist/screen.js');
test('exit destination accepts an HTTPS itch project referrer',()=>{assert.equal(itchPage('https://creator.itch.io/round-circle'),'https://creator.itch.io/round-circle');});
test('exit destination rejects unrelated, forged and missing referrers',()=>{for(const u of ['', 'javascript:alert(1)','https://itch.io.evil.test/game','https://notitch.io/game','http://creator.itch.io/game'])assert.equal(itchPage(u),null);});
