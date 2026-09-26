import http from 'http';

function classifyTextLanguage(text) {
  if (!text) return 'empty';
  if (/[\u0900-\u097F]/.test(text)) return 'hindi_devanagari';

  // Romanized Hindi / Hinglish distinctive markers
  const hinglishTokens = /\b(kya|hai|hain|kyun|kyu|kaise|karna|kare|karein|karu|seekhu|seekhna|seekhe|batao|samjhao|iska|iski|iske|inke|unka|meri|mere|mera|mujhe|hum|aap|tum|mein|bhi|nahi|nhi|chahiye|hoga|hogi|hote|hota|hoti|raha|rahe|rahi|chal|farak|antar|isko|isse|pehle|karo|saath|tarah|jisse|karte|rahein)\b/i;
  
  if (hinglishTokens.test(text)) {
    return 'hinglish';
  }
  return 'english';
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

async function run() {
  console.log("==================================================");
  console.log("TESTING ALL 7 REQUIRED QUERIES FOR LANGUAGE MATCH");
  console.log("==================================================");

  const tests = [
    { num: 1, query: "What is Docker?", expected: ["english"] },
    { num: 2, query: "Docker kya hai?", expected: ["hinglish", "hindi_devanagari"] },
    { num: 3, query: "Docker kya hai aur DevOps mein iska use kyun hota hai?", expected: ["hinglish", "hindi_devanagari"] },
    { num: 4, query: "Explain Docker in exactly 3 points.", expected: ["english"] },
    { num: 5, query: "Kubernetes ke saath Docker kyun use karte hain?", expected: ["hinglish", "hindi_devanagari"] },
    { num: 6, query: "What is the difference between Docker and a VM?", expected: ["english"] },
  ];

  for (const t of tests) {
    console.log(`\n[TEST ${t.num}] Query: "${t.query}"`);
    const res = await postCopilot(t.query);
    const lang = classifyTextLanguage(res.answer);
    const pass = t.expected.includes(lang);
    console.log(`Provider: ${res.provider} | Model: ${res.model} | isLive: ${res.isLive}`);
    console.log(`Detected: ${lang} | Expected: ${t.expected.join(' or ')} -> ${pass ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Snippet: ${res.answer?.slice(0, 180).replace(/\n/g, ' ')}...`);
  }

  console.log("\n==================================================");
  console.log("[TEST 7] MULTI-TURN LANGUAGE SWITCH CONVERSATION");
  console.log("==================================================");

  // Turn 1: English
  console.log('\nTurn 1 (English): "What is Docker?"');
  const t1 = await postCopilot("What is Docker?");
  const l1 = classifyTextLanguage(t1.answer);
  console.log(`Turn 1: ${l1} (Expected: english) -> ${l1 === 'english' ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Snippet: ${t1.answer?.slice(0, 140).replace(/\n/g, ' ')}...`);

  const history = [
    { role: 'user', content: 'What is Docker?' },
    { role: 'assistant', content: t1.answer || '' },
  ];

  // Turn 2: Hinglish follow-up
  console.log('\nTurn 2 (Hinglish): "Isko Kubernetes ke saath kyun use karte hain?"');
  const t2 = await postCopilot("Isko Kubernetes ke saath kyun use karte hain?", history);
  const l2 = classifyTextLanguage(t2.answer);
  const pass2 = l2 === 'hinglish' || l2 === 'hindi_devanagari';
  console.log(`Turn 2: ${l2} (Expected: hinglish/hindi) -> ${pass2 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Snippet: ${t2.answer?.slice(0, 140).replace(/\n/g, ' ')}...`);

  history.push({ role: 'user', content: 'Isko Kubernetes ke saath kyun use karte hain?' });
  history.push({ role: 'assistant', content: t2.answer || '' });

  // Turn 3: English follow-up
  console.log('\nTurn 3 (English): "What about virtual machines?"');
  const t3 = await postCopilot("What about virtual machines?", history);
  const l3 = classifyTextLanguage(t3.answer);
  console.log(`Turn 3: ${l3} (Expected: english) -> ${l3 === 'english' ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Snippet: ${t3.answer?.slice(0, 140).replace(/\n/g, ' ')}...`);
}

run().catch(console.error);
