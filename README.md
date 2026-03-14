# 🤖 AI Analytics Assistant

**Ask business questions in plain English. Get SQL + insights instantly.**

Built by [Your Name] | [Your LinkedIn] | [Your Portfolio]

![Demo](demo-screenshot.png)

## 🎯 What It Does

- **Natural Language Input**: Ask questions like "What were sales by region last quarter?"
- **Auto-Generated SQL**: AI writes the query for you
- **Instant Results**: See data in clean tables
- **AI Insights**: Get business explanations, not just numbers

## 🚀 Live Demo

**Try it now**: [your-url.vercel.app]

## 💡 Use Cases

Perfect for:
- Business analysts who want faster query turnaround
- Executives who need data without waiting for analysts
- Teams democratizing data access
- Anyone learning SQL

## 🛠️ Tech Stack

- **Frontend**: React 18 + Tailwind CSS
- **AI**: Claude API (Anthropic)
- **Icons**: Lucide React
- **Hosting**: Vercel

## 🏃 Run Locally

```bash
# Clone the repo
git clone [your-repo-url]
cd ai-analytics-assistant

# Install dependencies
npm install

# Start dev server
npm run dev

# Open http://localhost:5173
```

## 🌐 Deploy Your Own

### Option 1: Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/ai-analytics-assistant)

### Option 2: Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/yourusername/ai-analytics-assistant)

### Option 3: Manual Deployment

```bash
# Build for production
npm run build

# The dist/ folder is ready to deploy
# Upload to any static host (Vercel, Netlify, GitHub Pages, etc.)
```

## 🔐 Environment Variables

To enable real AI functionality, you'll need a Claude API key:

1. Get API key from [console.anthropic.com](https://console.anthropic.com)
2. Add to your deployment platform's environment variables:
   - Variable name: `ANTHROPIC_API_KEY`
   - Value: Your API key

**Note**: The current demo uses sample data and doesn't require an API key.

## 📊 Current Features

✅ Natural language question input
✅ AI-powered SQL generation
✅ Sample database schema (customizable)
✅ Results visualization
✅ AI explanations of findings
✅ Copy SQL to clipboard
✅ Responsive design
✅ Example questions for quick testing

## 🚧 Roadmap

- [ ] Connect to real databases (PostgreSQL, MySQL, Snowflake)
- [ ] User authentication
- [ ] Save query history
- [ ] Export results to CSV/Excel
- [ ] Data visualizations (charts/graphs)
- [ ] Share queries with team
- [ ] Voice input
- [ ] Multi-language support

## 🤝 Contributing

This is a portfolio project, but suggestions are welcome! 

1. Fork the repo
2. Create a feature branch
3. Submit a pull request

## 📝 Customization

### Add Your Database Schema

Edit `src/App.jsx`, find the `SAMPLE_SCHEMA` object:

```javascript
const YOUR_SCHEMA = {
  your_table: {
    columns: ['id', 'name', 'date', 'amount'],
    sample_data: 'id: int, name: text, date: date, amount: decimal'
  }
  // Add your tables here
};
```

### Change Branding

Update:
- Colors in Tailwind classes
- Title in `index.html`
- Header text in `App.jsx`

## 📄 License

MIT License - Feel free to use for your own portfolio!

## 👤 About

Built by **[Your Name]** as a demonstration of:
- AI/LLM integration skills
- Frontend development (React)
- Business intelligence domain knowledge
- Product thinking

**Portfolio**: [your-portfolio.com]
**LinkedIn**: [linkedin.com/in/yourprofile]
**Email**: [your-email@example.com]

---

⭐ Star this repo if you found it helpful!

💼 Hiring? Let's chat about how I can bring AI innovation to your analytics team.
