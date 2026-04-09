const https = require('https');

const DB_URL = process.env.FIREBASE_DB_URL + '/agendas.json';
const APP_ID = process.env.ONESIGNAL_APP_ID;
const API_KEY = process.env.ONESIGNAL_API_KEY;

https.get(DB_URL, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const agendas = JSON.parse(data);
    if (!agendas) { console.log('Tidak ada agenda.'); return; }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const upcoming = Object.values(agendas).filter(a => {
      return (a.date || '').split('T')[0] === tomorrowStr;
    });

    console.log('Agenda besok:', upcoming.length);
    if (upcoming.length === 0) { console.log('Tidak ada, skip.'); return; }

    upcoming.forEach(agenda => {
      const payload = JSON.stringify({
        app_id: APP_ID,
        included_segments: ['All'],
        headings: { en: '📅 Reminder Agenda OSIS' },
        contents: { en: 'Besok: ' + agenda.title + ' — Jangan lupa hadir!' },
        url: 'https://smpnegeri48.github.io'
      });

      const req = https.request({
        hostname: 'onesignal.com',
        path: '/api/v1/notifications',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + API_KEY
        }
      }, (res) => {
        let body = '';
        res.on('data', d => body += d);
        res.on('end', () => console.log('Response:', body));
      });

      req.on('error', e => console.error('Error:', e));
      req.write(payload);
      req.end();
    });
  });
}).on('error', e => console.error('Firebase error:', e));
