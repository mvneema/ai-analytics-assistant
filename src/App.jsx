import React, { useState, useRef, useEffect } from 'react';
import { Send, Database, TrendingUp, AlertCircle, Sparkles, BarChart3, Download, Copy, Check } from 'lucide-react';

// Sample database schema - replace with your actual schema
const SAMPLE_SCHEMA = {
  sales: {
    columns: ['sale_id', 'product_id', 'customer_id', 'sale_date', 'quantity', 'revenue', 'region'],
    sample_data: 'sale_id: integer, product_id: text, customer_id: text, sale_date: date, quantity: integer, revenue: decimal, region: text'
  },
  products: {
    columns: ['product_id', 'product_name', 'category', 'price', 'cost'],
    sample_data: 'product_id: text, product_name: text, category: text, price: decimal, cost: decimal'
  },
  customers: {
    columns: ['customer_id', 'customer_name', 'segment', 'join_date', 'lifetime_value'],
    sample_data: 'customer_id: text, customer_name: text, segment: text, join_date: date, lifetime_value: decimal'
  }
};

const EXAMPLE_QUESTIONS = [
  "What were total sales by region last quarter?",
  "Show me the top 10 products by revenue",
  "Which customer segment has the highest average order value?",
  "Compare year-over-year revenue growth",
];

export default function AnalyticsAssistant() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateSQL = async (question) => {
    setLoading(true);
    
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `You are a SQL expert for a business analytics database. Generate a SQL query to answer the following question.

Database Schema:
${Object.entries(SAMPLE_SCHEMA).map(([table, info]) => 
  `Table: ${table}\nColumns: ${info.sample_data}`
).join('\n\n')}

Question: ${question}

Respond with ONLY the SQL query, no explanation. Make it PostgreSQL compatible.`
          }]
        })
      });

      const data = await response.json();
      const sqlQuery = data.content.find(c => c.type === 'text')?.text.trim() || '';
      
      // Clean up SQL query (remove markdown code blocks if present)
      const cleanSQL = sqlQuery.replace(/```sql\n?/g, '').replace(/```\n?/g, '').trim();
      
      return cleanSQL;
    } catch (error) {
      console.error('Error generating SQL:', error);
      return null;
    }
  };

  const explainResults = async (question, sql, mockResults) => {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `You are a business analyst. Provide a concise, insightful explanation of these query results.

Original Question: ${question}

SQL Query: ${sql}

Results: ${JSON.stringify(mockResults, null, 2)}

Provide:
1. A brief summary (2-3 sentences)
2. Key insights or patterns
3. One actionable recommendation

Be concise and business-focused.`
          }]
        })
      });

      const data = await response.json();
      return data.content.find(c => c.type === 'text')?.text || 'Analysis complete.';
    } catch (error) {
      console.error('Error explaining results:', error);
      return 'Query executed successfully.';
    }
  };

  const handleSubmit = async (e, customQuestion = null) => {
    e?.preventDefault();
    const question = customQuestion || input;
    if (!question.trim()) return;

    // Add user message
    const userMessage = { role: 'user', content: question };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Generate SQL
    const sql = await generateSQL(question);
    
    if (!sql) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I had trouble generating a query for that question. Could you rephrase it?',
        error: true
      }]);
      setLoading(false);
      return;
    }

    // Mock results (in production, you'd execute the SQL against your database)
    const mockResults = [
      { region: 'North', total_sales: 145000, pct_growth: 12.5 },
      { region: 'South', total_sales: 132000, pct_growth: 8.3 },
      { region: 'East', total_sales: 118000, pct_growth: 15.2 },
      { region: 'West', total_sales: 156000, pct_growth: 10.1 }
    ];

    // Get AI explanation
    const explanation = await explainResults(question, sql, mockResults);

    setMessages(prev => [...prev, {
      role: 'assistant',
      sql,
      results: mockResults,
      explanation
    }]);

    setLoading(false);
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 font-sans">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Analytics Assistant</h1>
              <p className="text-xs text-slate-400">Ask questions, get SQL + insights</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Database className="w-4 h-4" />
            <span className="hidden sm:inline">Connected to Demo DB</span>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        {messages.length === 0 && (
          <div className="mb-12 animate-fadeIn">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-cyan-500/10 text-cyan-400 px-4 py-2 rounded-full text-sm mb-4 border border-cyan-500/20">
                <TrendingUp className="w-4 h-4" />
                AI-Powered Business Intelligence
              </div>
              <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Ask anything about your data
              </h2>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                Natural language to SQL. Instant insights. Built for BI professionals.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {EXAMPLE_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={(e) => handleSubmit(e, q)}
                  className="text-left p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-cyan-500/50 hover:bg-slate-800 transition-all duration-200 group"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="flex items-start gap-3">
                    <BarChart3 className="w-5 h-5 text-cyan-400 mt-0.5 group-hover:scale-110 transition-transform" />
                    <span className="text-slate-300 text-sm">{q}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Database className="w-4 h-4 text-cyan-400" />
                Sample Schema
              </h3>
              <div className="space-y-2 text-sm font-mono">
                {Object.entries(SAMPLE_SCHEMA).map(([table, info]) => (
                  <div key={table} className="text-slate-400">
                    <span className="text-cyan-400">{table}</span>: {info.columns.join(', ')}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="space-y-6 mb-6">
          {messages.map((msg, idx) => (
            <div key={idx} className="animate-fadeIn">
              {msg.role === 'user' ? (
                <div className="flex justify-end">
                  <div className="bg-cyan-600 text-white px-5 py-3 rounded-2xl rounded-tr-sm max-w-2xl shadow-lg">
                    {msg.content}
                  </div>
                </div>
              ) : msg.error ? (
                <div className="bg-red-900/20 border border-red-800/50 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <span className="text-red-300">{msg.content}</span>
                </div>
              ) : (
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 space-y-4">
                  {/* SQL Query */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-sm text-cyan-400">Generated SQL</h4>
                      <button
                        onClick={() => copyToClipboard(msg.sql, `sql-${idx}`)}
                        className="text-slate-400 hover:text-white transition-colors p-1"
                      >
                        {copied === `sql-${idx}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <pre className="bg-slate-950 p-4 rounded-lg overflow-x-auto text-sm font-mono border border-slate-800">
                      <code className="text-green-400">{msg.sql}</code>
                    </pre>
                  </div>

                  {/* Results */}
                  {msg.results && (
                    <div>
                      <h4 className="font-semibold text-sm text-cyan-400 mb-2">Results ({msg.results.length} rows)</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-slate-700">
                              {Object.keys(msg.results[0]).map(key => (
                                <th key={key} className="text-left py-2 px-3 font-medium text-slate-300">
                                  {key.replace(/_/g, ' ').toUpperCase()}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {msg.results.map((row, i) => (
                              <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                                {Object.values(row).map((val, j) => (
                                  <td key={j} className="py-2 px-3 text-slate-300">
                                    {typeof val === 'number' ? val.toLocaleString() : val}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* AI Explanation */}
                  {msg.explanation && (
                    <div className="bg-gradient-to-br from-cyan-950/30 to-blue-950/30 border border-cyan-800/30 rounded-lg p-4">
                      <h4 className="font-semibold text-sm text-cyan-300 mb-2 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        AI Insights
                      </h4>
                      <div className="text-slate-300 text-sm whitespace-pre-line leading-relaxed">
                        {msg.explanation}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-3 text-slate-400">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              <span className="text-sm">Analyzing your question...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="sticky bottom-6 max-w-4xl mx-auto">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl flex items-center gap-3 p-2 focus-within:border-cyan-500/50 transition-colors">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about your data..."
              className="flex-1 bg-transparent px-4 py-3 outline-none text-slate-100 placeholder-slate-500"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-3 rounded-xl hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
