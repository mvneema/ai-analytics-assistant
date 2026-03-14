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

// Demo mode responses - works without API key
const DEMO_RESPONSES = {
  "what were total sales by region last quarter?": {
    sql: `SELECT 
  region,
  SUM(revenue) as total_revenue,
  COUNT(DISTINCT sale_id) as total_orders,
  ROUND(AVG(revenue), 2) as avg_order_value
FROM sales
WHERE sale_date >= DATE_TRUNC('quarter', CURRENT_DATE - INTERVAL '3 months')
  AND sale_date < DATE_TRUNC('quarter', CURRENT_DATE)
GROUP BY region
ORDER BY total_revenue DESC;`,
    results: [
      { region: 'West', total_revenue: 1560000, total_orders: 3420, avg_order_value: 456.14 },
      { region: 'North', total_revenue: 1450000, total_orders: 3285, avg_order_value: 441.39 },
      { region: 'South', total_revenue: 1320000, total_orders: 2987, avg_order_value: 441.98 },
      { region: 'East', total_revenue: 1180000, total_orders: 2756, avg_order_value: 428.16 }
    ],
    explanation: `## Summary
Last quarter showed strong performance across all regions, with total sales of $5.51M. The West region led with $1.56M in revenue, representing 28.3% of total sales.

## Key Insights
- **West region dominance**: Generated the highest revenue ($1.56M) and order volume (3,420 orders)
- **Consistent average order values**: All regions maintained similar AOV around $440, indicating consistent pricing strategy
- **Geographic opportunity**: East region has lowest performance - potential for targeted growth initiatives

## Recommendation
Focus on scaling successful West region strategies to East region markets. Consider regional marketing campaigns to boost East region order volume by 20-25% next quarter.`
  },
  "show me the top 10 products by revenue": {
    sql: `SELECT 
  p.product_id,
  p.product_name,
  p.category,
  SUM(s.revenue) as total_revenue,
  SUM(s.quantity) as units_sold,
  ROUND(SUM(s.revenue) / SUM(s.quantity), 2) as avg_price
FROM sales s
JOIN products p ON s.product_id = p.product_id
GROUP BY p.product_id, p.product_name, p.category
ORDER BY total_revenue DESC
LIMIT 10;`,
    results: [
      { product_id: 'P001', product_name: 'Premium Laptop Pro', category: 'Electronics', total_revenue: 456000, units_sold: 380, avg_price: 1200.00 },
      { product_id: 'P045', product_name: 'Wireless Headphones X', category: 'Electronics', total_revenue: 389000, units_sold: 1945, avg_price: 200.00 },
      { product_id: 'P023', product_name: 'Smart Watch Ultra', category: 'Wearables', total_revenue: 342000, units_sold: 855, avg_price: 400.00 },
      { product_id: 'P067', product_name: 'Office Chair Deluxe', category: 'Furniture', total_revenue: 298000, units_sold: 745, avg_price: 400.00 },
      { product_id: 'P089', product_name: 'Gaming Console Pro', category: 'Electronics', total_revenue: 267000, units_sold: 534, avg_price: 500.00 },
      { product_id: 'P012', product_name: '4K Monitor 32"', category: 'Electronics', total_revenue: 234000, units_sold: 390, avg_price: 600.00 },
      { product_id: 'P056', product_name: 'Desk Lamp LED', category: 'Home', total_revenue: 187000, units_sold: 2337, avg_price: 80.00 },
      { product_id: 'P034', product_name: 'Mechanical Keyboard', category: 'Accessories', total_revenue: 156000, units_sold: 1040, avg_price: 150.00 },
      { product_id: 'P078', product_name: 'Webcam HD Pro', category: 'Electronics', total_revenue: 134000, units_sold: 670, avg_price: 200.00 },
      { product_id: 'P091', product_name: 'Mouse Wireless Pro', category: 'Accessories', total_revenue: 112000, units_sold: 1867, avg_price: 60.00 }
    ],
    explanation: `## Summary
Electronics dominate the top revenue generators, with the Premium Laptop Pro leading at $456K. The top 10 products collectively generated $2.58M in revenue.

## Key Insights
- **Electronics category strength**: 6 of top 10 products are electronics, representing 65% of top-tier revenue
- **High-value items perform well**: Premium Laptop Pro ($1,200 avg) shows strong demand for quality products
- **Volume sellers important**: Desk Lamp LED sold 2,337 units despite lower price point, demonstrating importance of accessible products
- **Price point sweet spot**: Products in $200-$600 range show consistent strong performance

## Recommendations
1. Expand premium electronics line - high revenue per unit with strong sell-through
2. Bundle complementary products (laptop + mouse + keyboard) to increase basket size
3. Stock up on Wireless Headphones X ahead of holiday season - highest volume seller`
  },
  "which customer segment has the highest average order value?": {
    sql: `SELECT 
  c.segment,
  COUNT(DISTINCT s.sale_id) as total_orders,
  COUNT(DISTINCT s.customer_id) as unique_customers,
  SUM(s.revenue) as total_revenue,
  ROUND(AVG(s.revenue), 2) as avg_order_value,
  ROUND(SUM(s.revenue) / COUNT(DISTINCT s.customer_id), 2) as revenue_per_customer
FROM sales s
JOIN customers c ON s.customer_id = c.customer_id
GROUP BY c.segment
ORDER BY avg_order_value DESC;`,
    results: [
      { segment: 'Enterprise', total_orders: 1245, unique_customers: 89, total_revenue: 2340000, avg_order_value: 1879.52, revenue_per_customer: 26292.13 },
      { segment: 'Premium', total_orders: 2890, unique_customers: 456, total_revenue: 2156000, avg_order_value: 746.02, revenue_per_customer: 4728.07 },
      { segment: 'Standard', total_orders: 5670, unique_customers: 1834, total_revenue: 1890000, avg_order_value: 333.33, revenue_per_customer: 1030.54 },
      { segment: 'Basic', total_orders: 3421, unique_customers: 2145, total_revenue: 625000, avg_order_value: 182.69, revenue_per_customer: 291.38 }
    ],
    explanation: `## Summary
Enterprise segment shows dramatically higher AOV at $1,879.52, nearly 2.5x higher than Premium segment and 10x higher than Basic segment.

## Key Insights
- **Enterprise dominates value**: Despite only 89 customers, Enterprise generates $2.34M (33% of total revenue)
- **Revenue concentration**: Enterprise customers average $26K lifetime value vs $291 for Basic
- **Volume vs. Value trade-off**: Basic segment has most customers (2,145) but lowest revenue contribution
- **Premium sweet spot**: 456 Premium customers generate nearly as much as 1,834 Standard customers

## Recommendations
1. **Prioritize Enterprise retention**: Losing even one Enterprise customer = losing 90 Basic customers in revenue
2. **Upgrade path from Premium**: Create targeted campaigns to move Premium customers to Enterprise tier
3. **Basic segment efficiency**: Automate Basic customer service to maintain profitability at lower AOV`
  },
  "compare year-over-year revenue growth": {
    sql: `SELECT 
  DATE_TRUNC('month', sale_date) as month,
  EXTRACT(YEAR FROM sale_date) as year,
  SUM(revenue) as monthly_revenue,
  LAG(SUM(revenue)) OVER (PARTITION BY EXTRACT(MONTH FROM sale_date) ORDER BY EXTRACT(YEAR FROM sale_date)) as prev_year_revenue,
  ROUND(((SUM(revenue) - LAG(SUM(revenue)) OVER (PARTITION BY EXTRACT(MONTH FROM sale_date) ORDER BY EXTRACT(YEAR FROM sale_date))) / 
         LAG(SUM(revenue)) OVER (PARTITION BY EXTRACT(MONTH FROM sale_date) ORDER BY EXTRACT(YEAR FROM sale_date))) * 100, 2) as yoy_growth_pct
FROM sales
WHERE sale_date >= CURRENT_DATE - INTERVAL '2 years'
GROUP BY DATE_TRUNC('month', sale_date), EXTRACT(YEAR FROM sale_date)
ORDER BY month DESC
LIMIT 12;`,
    results: [
      { month: '2026-02-01', year: 2026, monthly_revenue: 1245000, prev_year_revenue: 1089000, yoy_growth_pct: 14.32 },
      { month: '2026-01-01', year: 2026, monthly_revenue: 1156000, prev_year_revenue: 1023000, yoy_growth_pct: 13.00 },
      { month: '2025-12-01', year: 2025, monthly_revenue: 1523000, prev_year_revenue: 1287000, yoy_growth_pct: 18.34 },
      { month: '2025-11-01', year: 2025, monthly_revenue: 1398000, prev_year_revenue: 1198000, yoy_growth_pct: 16.69 },
      { month: '2025-10-01', year: 2025, monthly_revenue: 1287000, prev_year_revenue: 1134000, yoy_growth_pct: 13.49 },
      { month: '2025-09-01', year: 2025, monthly_revenue: 1198000, prev_year_revenue: 1067000, yoy_growth_pct: 12.28 }
    ],
    explanation: `## Summary
Strong year-over-year growth trend with consistent double-digit increases. December 2025 showed exceptional performance with 18.34% YoY growth.

## Key Insights
- **Accelerating growth**: Growth rate increased from 12.28% (Sept) to 18.34% (Dec), showing positive momentum
- **Holiday season strength**: Q4 2025 outperformed Q4 2024 by 16%+ across all months
- **Sustained performance**: All months show positive YoY growth above 12%, indicating healthy business trajectory
- **Recent trend**: First two months of 2026 maintaining 13-14% growth rate

## Recommendations
1. **Capitalize on momentum**: Current growth rate suggests opportunity to increase inventory and marketing spend
2. **Analyze December drivers**: Investigate what drove 18% growth to replicate in other periods
3. **Set realistic targets**: Based on trend, aim for 15% YoY growth for 2026 overall`
  }
};

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
    
    // Check if we have a demo response for this question
    const normalizedQuestion = question.toLowerCase().trim();
    const demoResponse = DEMO_RESPONSES[normalizedQuestion];
    
    if (demoResponse) {
      return demoResponse;
    }
    
    // Try fuzzy matching for similar questions
    for (const [key, value] of Object.entries(DEMO_RESPONSES)) {
      if (normalizedQuestion.includes(key.split(' ').slice(0, 3).join(' '))) {
        return value;
      }
    }
    
    // Default response for unmatched questions
    return {
      sql: `SELECT * FROM sales LIMIT 10;`,
      results: [
        { sale_id: 1, product_id: 'P001', customer_id: 'C123', revenue: 1200, region: 'North' },
        { sale_id: 2, product_id: 'P045', customer_id: 'C456', revenue: 200, region: 'South' },
        { sale_id: 3, product_id: 'P023', customer_id: 'C789', revenue: 400, region: 'East' }
      ],
      explanation: `This is a demo response. Try asking one of the example questions above for detailed AI-generated insights!\n\nThis demo showcases:\n✅ SQL query generation\n✅ Data visualization\n✅ AI-powered analysis\n\nFor production use with your real database, you would connect the Claude API.`
    };
  };

  const handleSubmit = async (e, customQuestion = null) => {
    e?.preventDefault();
    const question = customQuestion || input;
    if (!question.trim()) return;

    // Add user message
    const userMessage = { role: 'user', content: question };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Generate SQL and get response
    const response = await generateSQL(question);
    
    setMessages(prev => [...prev, {
      role: 'assistant',
      sql: response.sql,
      results: response.results,
      explanation: response.explanation
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
          <div className="flex items-center gap-2 text-sm">
            <div className="bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-xs border border-green-500/20">
              ✓ Demo Mode
            </div>
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
