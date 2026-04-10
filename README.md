# 🚀 Autonomous Content Factory

An AI-powered multi-agent system that generates complete marketing campaigns from raw input using Groq API.

---

## ✨ Features

- 🔍 Research Agent (Fact extraction & validation)
- ✍️ Copywriter Agent (Blog, Social, Email generation)
- 🧠 Editor Agent (Quality control & approval)
- 📊 Activity Feed (real-time pipeline tracking)
- 🎯 Structured Output (Blog, Social Thread, Email Teaser)

---

## 🏗️ Tech Stack

- Next.js (App Router)
- React
- Groq API (LLM)
- Tailwind CSS

---

## 📦 Project Structure

    app/
      api/
        pipeline/route.js
        export/route.js
      page.jsx
    
    lib/
      agents/
        researchAgent.js
        copywriterAgent.js
        editorAgent.js
      groq.js
      pipeline.js

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the repository

```bash
git clone <your-repo-url>
cd <your-project-folder>
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Setup environment variables

Create a `.env.local` file in root:

```env
GROQ_API_KEY=your_groq_api_key_here
```

👉 Get API key from: [https://console.groq.com](https://console.groq.com)

### 4️⃣ Run the project

```bash
npm run dev
```

Open in browser: `http://localhost:3000`

---

## 🧠 How It Works

1. User enters product description
2. Research Agent extracts structured facts
3. Copywriter Agent generates:
   - Blog Post
   - Social Thread
   - Email Teaser
4. Editor Agent validates content
5. Final structured output is displayed

---

## 📤 API Usage

### Endpoint

```
POST /api/pipeline
```

### Request

```json
{
  "input": "Your product description"
}
```

### Response

```json
{
  "success": true,
  "finalDeliverables": {
    "blogPost": "...",
    "socialThread": "...",
    "emailTeaser": "..."
  }
}
```

---

## ⚠️ Important Notes

- Do NOT commit `.env.local`
- Ensure Groq API key is valid
- Research agent must return valid structured output
- If output is unrelated, check agent data flow and parsing

---

## 🚀 Future Improvements

- Per-section approve/regenerate buttons
- Streaming responses
- Export to PDF/Doc
- Multi-language support
- Content scoring system

---

## 👨‍💻 Author

Your Name

---

## ⭐ If you like this project

Give it a star ⭐ on GitHub!