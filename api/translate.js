export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Subtitle text is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    // මෙතන gemini-2.5-flash (හෝ gemini-1.5-flash වෙනුවට නිවැරදි එක) පාවිච්චි කරමු
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const prompt = `You are an expert subtitle translator. Translate the following English subtitle text into natural, conversational Sinhala. Keep the SRT formatting, numbers, and timestamps intact if present, and only translate the dialogue text accurately:\n\n${text}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();
    
    if (data.candidates && data.candidates[0].content.parts[0].text) {
      const translatedText = data.candidates[0].content.parts[0].text;
      return res.status(200).json({ success: true, translatedText });
    } else {
      throw new Error(JSON.stringify(data));
    }

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
