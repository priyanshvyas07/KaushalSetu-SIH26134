import http from 'http';

function detectLang(text) {
  if (!text) return 'unknown';
  if (/[\u0900-\u097F]/.test(text)) return 'hindi';
  const hinglishKeywords = /\b(kya|hai|hain|kyun|kyu|kaise|karna|kare|karein|seekhu|seekhe|batao|samjhao|iska|iski|iske|inke|unka|meri|mere|mera|mujhe|hum|aap|tum|mein|me|pe|par|se|ko|ki|ke|ka|aur|or|nahi|nhi|chahiye|hoga|hogi|hote|hota|hoti|raha|rahe|rahi|chal|farak|antar|isko|isse|pehle)\b/i;
  return hinglishKeywords.test(text) ? 'hinglish/hindi' : 'english';
}

async function postCopilot(query, history = []) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query, history });
    const req = http.request(
      'http://localhost:3000/api/student/copilot',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            resolve({ raw: body });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function runLanguageTests() {
  const tests = [
    { id: 1, query: "What is Docker?", expectedLang: "english" },
    { id: 2, query: "Docker kya hai?", expectedLang: "hinglish/hindi" },
    { id: 3, query: "Docker kya hai aur DevOps mein iska use kyun hota hai?", expectedLang: "hinglish/hindi" },
    { id: 4, query: "Explain Docker in exactly 3 points.", expectedLang: "english" },
    { id: 5, query: "Kubernetes ke saath Docker kyun use karte hain?", expectedLang: "hinglish/hindi" },
    { id: 6, query: "What is the difference between Docker and a VM?", expectedLang: "english" },
  ];

  console.log("==================================================");
  console.log("RUNNING SINGLE QUERY LANGUAGE TESTS (1-6)");
  console.log("==================================================");

  for (const t of tests) {
    console.log(`\n[TEST ${t.id}] Query: "${t.query}"`);
    console.log(`Expected Language: ${t.expectedLang}`);
    const res = await postCopilot(t.query);
    const detected = detectLang(res.answer);
    console.log(`Provider: ${res.provider} | Model: ${res.model} | isLive: ${res.isLive}`);
    console.log(`Detected Response Language: ${detected}`);
    console.log(`Response Snippet:\n${res.answer?.slice(0, 260)}...`);
    const passed = (t.expectedLang === 'english' && detected === 'english') ||
                   (t.expectedLang === 'hinglish/hindi' && detected === 'hinglish/hindi');
    console.log(`Result: ${passed ? '✅ PASS' : '❌ FAIL'}`);
  }

  console.log("\n==================================================");
  console.log("RUNNING MULTI-TURN LANGUAGE SWITCH TEST (7)");
  console.log("==================================================");

  // Turn 1: English
  console.log('\nTurn 1 (English): "What is Docker?"');
  const t1 = await postCopilot("What is Docker?");
  const d1 = detectLang(t1.answer);
  console.log(`Turn 1 Provider: ${t1.provider} | Model: ${t1.model}`);
  console.log(`Turn 1 Response Lang: ${d1} (${d1 === 'english' ? '✅ PASS' : '❌ FAIL'})`);
  console.log(`Snippet: ${t1.answer?.slice(0, 180)}...`);

  const history = [
    { role: 'user', content: 'What is Docker?' },
    { role: 'assistant', content: t1.answer || '' },
  ];

  // Turn 2: Hinglish
  console.log('\nTurn 2 (Hinglish): "Isko Kubernetes ke saath kyun use karte hain?"');
  const t2 = await postCopilot("Isko Kubernetes ke saath kyun use karte hain?", history);
  const d2 = detectLang(t2.answer);
  console.log(`Turn 2 Provider: ${t2.provider} | Model: ${t2.model}`);
  console.log(`Turn 2 Response Lang: ${d2} (${d2 === 'hinglish/hindi' ? '✅ PASS' : '❌ FAIL'})`);
  console.log(`Snippet: ${t2.answer?.slice(0, 180)}...`);

  history.push({ role: 'user', content: 'Isko Kubernetes ke saath kyun use karte hain?' });
  history.push({ role: 'assistant', content: t2.answer || '' });

  // Turn 3: English
  console.log('\nTurn 3 (English): "What about virtual machines?"');
  const t3 = await postCopilot("What about virtual machines?", history);
  const d3 = detectLang(t3.answer);
  console.log(`Turn 3 Provider: ${t3.provider} | Model: ${t3.model}`);
  console.log(`Turn 3 Response Lang: ${d3} (${d3 === 'english' ? '✅ PASS' : '❌ FAIL'})`);
  console.log(`Snippet: ${t3.answer?.slice(0, 180)}...`);
}

runLanguageTests().catch(console.error);
