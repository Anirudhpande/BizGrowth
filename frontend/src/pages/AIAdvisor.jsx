import { useState, useEffect, useRef } from 'react';
import { api } from '../utils/api';
import AdvisorGrid from '../components/ai/AdvisorGrid';
import DynamicAdvisorForm from '../components/ai/DynamicAdvisorForm';
import AdvisorResult from '../components/ai/AdvisorResult';

// ── Fallback 18 Specialized Business Tools (MD3 Schema compliant) ──
const FALLBACK_TOOLS = [
  // Growth Category
  {
    id: 'market-entry',
    name: 'Market Entry Strategy Planner',
    description: 'Create a localized market entry and expansion framework for launch planning.',
    category: 'Growth',
    icon: 'explore',
    fields: [
      { name: 'targetCountry', label: 'Target Country', type: 'text', placeholder: 'e.g. Germany, UAE, Singapore', required: true },
      { name: 'productCategory', label: 'Product / Service Description', type: 'textarea', placeholder: 'Describe what you are selling...', required: true },
      { name: 'growthStage', label: 'Current Growth Stage', type: 'select', options: ['Ideation', 'Pre-revenue Startup', 'Scaling SME', 'Established Enterprise'], required: true },
      { name: 'budget', label: 'Expansion Budget (USD)', type: 'number', placeholder: 'e.g. 50000', required: true }
    ]
  },
  {
    id: 'valuation',
    name: 'Startup Valuation Estimator',
    description: 'Get an estimated pre-money valuation range based on ARR, margins, and market metrics.',
    category: 'Growth',
    icon: 'calculate',
    fields: [
      { name: 'arr', label: 'Annual Recurring Revenue (USD)', type: 'number', placeholder: 'e.g. 150000', required: true },
      { name: 'growthRate', label: 'Annual Growth Rate (%)', type: 'number', placeholder: 'e.g. 45', required: true },
      { name: 'grossMargin', label: 'Gross Margins (%)', type: 'number', placeholder: 'e.g. 75', required: true },
      { name: 'tam', label: 'Total Addressable Market (TAM) ($)', type: 'text', placeholder: 'e.g. $10 Billion', required: true }
    ]
  },
  {
    id: 'customer-acquisition',
    name: 'Customer Acquisition Plan',
    description: 'Evaluate unit economics, target CAC, and construct primary customer channels.',
    category: 'Growth',
    icon: 'ads_click',
    fields: [
      { name: 'cac', label: 'Target Customer Acquisition Cost (CAC)', type: 'number', placeholder: 'e.g. 40', required: true },
      { name: 'ltv', label: 'Estimated Customer Lifetime Value (LTV)', type: 'number', placeholder: 'e.g. 600', required: true },
      { name: 'channel', label: 'Primary Marketing Channel', type: 'select', options: ['SEO & Organic Search', 'Paid Ads (Google/Social)', 'Cold B2B Email Outbound', 'Influencer & Content Marketing', 'Referral Partnerships'], required: true }
    ]
  },

  // Marketing Category
  {
    id: 'seo-content',
    name: 'SEO Content & Keyword Planner',
    description: 'Map out keyword strategies, primary pillar pages, and content schedules.',
    category: 'Marketing',
    icon: 'pageview',
    fields: [
      { name: 'focusKeyword', label: 'Focus Keyword or Niche Topic', type: 'text', placeholder: 'e.g. cross-border trade compliance tools', required: true },
      { name: 'audience', label: 'Target Audience Profile', type: 'text', placeholder: 'e.g. Indian SME exporters looking to ship to US', required: true },
      { name: 'competitor', label: 'Top Competitor Site (Optional)', type: 'text', placeholder: 'e.g. competitor.com', required: false }
    ]
  },
  {
    id: 'social-calendar',
    name: 'Social Media Calendar Planner',
    description: 'Create a tailored content strategy and posting schedule for your business.',
    category: 'Marketing',
    icon: 'calendar_today',
    fields: [
      { name: 'niche', label: 'Business Niche', type: 'text', placeholder: 'e.g. B2B fintech consulting', required: true },
      { name: 'platform', label: 'Primary Platform', type: 'select', options: ['LinkedIn', 'Instagram', 'Twitter / X', 'YouTube', 'TikTok'], required: true },
      { name: 'voice', label: 'Brand Voice / Tone', type: 'select', options: ['Professional & Authoritative', 'Witty & Casual', 'Educational & Informative', 'Inspirational & Bold'], required: true }
    ]
  },
  {
    id: 'cold-pitch',
    name: 'Cold Email Pitch Writer',
    description: 'Draft high-converting outbound sequences tailored to specific ICP personas.',
    category: 'Marketing',
    icon: 'mail',
    fields: [
      { name: 'recipientRole', label: 'Recipient Job Title', type: 'text', placeholder: 'e.g. VP of Procurement, CTO', required: true },
      { name: 'valueProp', label: 'Product Value Proposition', type: 'textarea', placeholder: 'Describe how you save time or money for them...', required: true },
      { name: 'cta', label: 'Call to Action', type: 'text', placeholder: 'e.g. book a 10-minute calendar sync next Wednesday', required: true }
    ]
  },

  // Sales Category
  {
    id: 'sales-script',
    name: 'Outbound Sales Script Creator',
    description: 'Create an objective-handling cold calling or sales pitch script.',
    category: 'Sales',
    icon: 'record_voice_over',
    fields: [
      { name: 'product', label: 'Product/Service Name', type: 'text', placeholder: 'e.g. BizGrowth Trade Analytics', required: true },
      { name: 'painPoint', label: 'Target Customer Pain Point', type: 'text', placeholder: 'e.g. struggling to clear customs in USA without agents', required: true },
      { name: 'objection', label: 'Common Sales Objection', type: 'text', placeholder: 'e.g. the pricing is higher than manual options', required: true }
    ]
  },
  {
    id: 'pricing-opt',
    name: 'Pricing Tier Optimizer',
    description: 'Structure pricing packages, margins, and tiers to maximize sales conversions.',
    category: 'Sales',
    icon: 'payments',
    fields: [
      { name: 'cogs', label: 'Unit Cost or Service Delivery Cost (USD)', type: 'number', placeholder: 'e.g. 15', required: true },
      { name: 'competitorPricing', label: 'Average Competitor Pricing (USD)', type: 'number', placeholder: 'e.g. 60', required: true },
      { name: 'pricingModel', label: 'Target Pricing Model', type: 'select', options: ['SaaS Subscription', 'One-time Transaction Fee', 'Freemium with Pro Upgrades', 'Usage-based Pay-As-You-Go'], required: true }
    ]
  },
  {
    id: 'partnership',
    name: 'Strategic Partnership Proposal',
    description: 'Draft a compelling mutual-benefit proposal to hook target partner organizations.',
    category: 'Sales',
    icon: 'handshake',
    fields: [
      { name: 'targetPartner', label: 'Target Partner Name / Industry', type: 'text', placeholder: 'e.g. Blue Dart Logistics', required: true },
      { name: 'mutualValue', label: 'Proposed Mutual Value', type: 'textarea', placeholder: 'How does this partnership help both companies grow...', required: true }
    ]
  },

  // Finance Category
  {
    id: 'cashflow',
    name: 'Cash Flow Runway Planner',
    description: 'Estimate burn rate and capital runway with adjustable sales forecasts.',
    category: 'Finance',
    icon: 'trending_up',
    fields: [
      { name: 'balance', label: 'Starting Cash Balance (USD)', type: 'number', placeholder: 'e.g. 80000', required: true },
      { name: 'burnRate', label: 'Average Monthly Operating Burn (USD)', type: 'number', placeholder: 'e.g. 6000', required: true },
      { name: 'expectedSales', label: 'Expected Monthly Sales Revenue (USD)', type: 'number', placeholder: 'e.g. 2500', required: true }
    ]
  },
  {
    id: 'unit-economics',
    name: 'Unit Economics Modeler',
    description: 'Deconstruct order-level revenues, transaction fees, and contribution margins.',
    category: 'Finance',
    icon: 'balance',
    fields: [
      { name: 'aov', label: 'Average Order Value (AOV) ($)', type: 'number', placeholder: 'e.g. 120', required: true },
      { name: 'cac', label: 'Customer Acquisition Cost (CAC) ($)', type: 'number', placeholder: 'e.g. 35', required: true },
      { name: 'servicing', label: 'Order Fulfillment & Support Cost ($)', type: 'number', placeholder: 'e.g. 20', required: true }
    ]
  },
  {
    id: 'tax-credit',
    name: 'R&D Tax Credit Estimator',
    description: 'Estimate eligible R&D tax benefits and export subsidies.',
    category: 'Finance',
    icon: 'receipt_long',
    fields: [
      { name: 'spend', label: 'Annual Technical R&D Spend (USD)', type: 'number', placeholder: 'e.g. 90000', required: true },
      { name: 'staff', label: 'Number of Devs/Researchers Involved', type: 'number', placeholder: 'e.g. 4', required: true }
    ]
  },

  // Strategy Category
  {
    id: 'pitch-deck',
    name: 'Pitch Deck Outline Builder',
    description: 'Generate an executive 10-slide outline tailored for angel/VC pitch presentations.',
    category: 'Strategy',
    icon: 'presentation_play',
    fields: [
      { name: 'startupName', label: 'Startup Name', type: 'text', placeholder: 'e.g. BizGrowth', required: true },
      { name: 'elevatorPitch', label: 'One-Sentence Elevator Pitch', type: 'textarea', placeholder: 'We help startups...', required: true },
      { name: 'targetRaise', label: 'Target Funding Raise Amount (USD)', type: 'number', placeholder: 'e.g. 500000', required: true }
    ]
  },
  {
    id: 'swot-analysis',
    name: 'Competitor SWOT Analyzer',
    description: 'Produce a comprehensive SWOT grid mapping a primary competitor.',
    category: 'Strategy',
    icon: 'troubleshoot',
    fields: [
      { name: 'competitorName', label: 'Competitor Name', type: 'text', placeholder: 'e.g. TradeIndia.com', required: true },
      { name: 'strengths', label: 'Their Strengths', type: 'textarea', placeholder: 'What do they do exceptionally well...', required: true },
      { name: 'weaknesses', label: 'Their Weaknesses', type: 'textarea', placeholder: 'Where do they fall short...', required: true }
    ]
  },
  {
    id: 'pivot-eval',
    name: 'Business Pivot Evaluator',
    description: 'Evaluate core pivot strategies and risks before shifting resources.',
    category: 'Strategy',
    icon: 'published_with_changes',
    fields: [
      { name: 'currentModel', label: 'Current Business Model', type: 'textarea', placeholder: 'Describe what you do now...', required: true },
      { name: 'pivotModel', label: 'Proposed New Business Model', type: 'textarea', placeholder: 'Describe what you want to pivot to...', required: true },
      { name: 'reason', label: 'Primary Reason for Pivot', type: 'textarea', placeholder: 'Why is the current model not scaling...', required: true }
    ]
  },

  // Operations Category
  {
    id: 'biz-canvas',
    name: 'Business Model Canvas Planner',
    description: 'Map out the 9-segment business model canvas structure.',
    category: 'Operations',
    icon: 'dashboard_customize',
    fields: [
      { name: 'valueProp', label: 'Core Value Proposition', type: 'textarea', placeholder: 'What unique values do we deliver...', required: true },
      { name: 'segments', label: 'Key Customer Segments', type: 'text', placeholder: 'e.g. global trade startups, SMEs', required: true },
      { name: 'channels', label: 'Channels to Reach Customers', type: 'text', placeholder: 'e.g. cold emailing, Google organic search', required: true }
    ]
  },
  {
    id: 'hiring-roadmap',
    name: 'Hiring & Team Scaling Advisor',
    description: 'Construct a priority roadmap for team scaling based on funding stage.',
    category: 'Operations',
    icon: 'groups',
    fields: [
      { name: 'teamSize', label: 'Current Team Size', type: 'number', placeholder: 'e.g. 5', required: true },
      { name: 'keyHires', label: 'Next 3 Key Roles Needed', type: 'text', placeholder: 'e.g. Senior Backend, Product Manager, Growth Marketer', required: true },
      { name: 'monthlySalaryBudget', label: 'Target Monthly Hiring Budget ($)', type: 'number', placeholder: 'e.g. 15000', required: true }
    ]
  },
  {
    id: 'sla-draft',
    name: 'SLA Drafting Assistant',
    description: 'Build a standard customer Service Level Agreement (SLA) checklist.',
    category: 'Operations',
    icon: 'gavel',
    fields: [
      { name: 'serviceOffered', label: 'Service Provided', type: 'text', placeholder: 'e.g. strategic tax auditing dashboard access', required: true },
      { name: 'uptimeGuarantee', label: 'Uptime / Availability Target', type: 'text', placeholder: 'e.g. 99.9% uptime, 2-hour critical bug response', required: true },
      { name: 'breachRemedies', label: 'Breach Remedy / Credits', type: 'textarea', placeholder: 'e.g. refunding 5% of monthly invoice per hour of downtime...', required: true }
    ]
  }
];

// Stable uid helper (avoids impure Date.now() calls during renders)
function uid() {
  return Math.random().toString(36).slice(2, 10);
}

// Read local history from localStorage
function readLocalHistory() {
  try {
    const local = localStorage.getItem('bizgrowth_ai_history');
    return local ? JSON.parse(local) : [];
  } catch {
    return [];
  }
}

export default function AIAdvisor() {
  const [tools, setTools] = useState([]);
  const [loadingTools, setLoadingTools] = useState(true);
  const [selectedTool, setSelectedTool] = useState(null);

  // Generation state
  const [generating, setGenerating] = useState(false);
  const [activeResult, setActiveResult] = useState(null);

  // History state
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const resultRef = useRef(null);

  // Load tools and history on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoadingTools(true);
      setLoadingHistory(true);

      // 1. Fetch Features
      try {
        const res = await api.get('/api/ai-advisor/features');
        if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
          setTools(res.data);
        } else {
          setTools(FALLBACK_TOOLS);
        }
      } catch (err) {
        console.warn('API error fetching features, loading fallbacks:', err.message);
        setTools(FALLBACK_TOOLS);
      } finally {
        setLoadingTools(false);
      }

      // 2. Fetch History
      try {
        const res = await api.get('/api/ai-advisor/history');
        if (res && res.success && Array.isArray(res.data)) {
          setHistory(res.data);
        } else {
          setHistory(readLocalHistory());
        }
      } catch (err) {
        console.warn('API error fetching history, loading localStorage:', err.message);
        setHistory(readLocalHistory());
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchInitialData();
  }, []);

  const saveToLocalHistory = (newHistoryItem) => {
    try {
      const list = readLocalHistory();
      const updated = [newHistoryItem, ...list].slice(0, 50);
      localStorage.setItem('bizgrowth_ai_history', JSON.stringify(updated));
      setHistory(updated);
    } catch (err) {
      console.error('Failed to write history item locally', err);
    }
  };

  // Submit dynamic form to generate advisor report
  const handleGenerate = async (inputs) => {
    if (!selectedTool) return;
    setGenerating(true);

    try {
      const res = await api.post('/api/ai-advisor/generate', {
        featureId: selectedTool.id,
        inputs
      });

      if (res && res.success && res.data) {
        const newResult = {
          id: res.data.id || `gen-${uid()}`,
          toolId: selectedTool.id,
          toolName: selectedTool.name,
          resultText: res.data.resultText || res.data.text || '',
          created_at: new Date().toISOString()
        };
        setActiveResult(newResult);
        // Refresh API history if possible, or append locally
        try {
          const histRes = await api.get('/api/ai-advisor/history');
          if (histRes && histRes.success && Array.isArray(histRes.data)) {
            setHistory(histRes.data);
          } else {
            saveToLocalHistory(newResult);
          }
        } catch {
          saveToLocalHistory(newResult);
        }
      } else {
        triggerSimulatedGeneration(inputs);
      }
    } catch (err) {
      console.warn('API generation failed, launching local simulation model:', err.message);
      triggerSimulatedGeneration(inputs);
    } finally {
      setGenerating(false);
      // Smooth scroll to result
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  // Dynamic simulation if endpoint is not fully online
  const triggerSimulatedGeneration = (inputs) => {
    if (!selectedTool) return;

    let responseString = `# ${selectedTool.name} Blueprint Report\n\n`;
    responseString += `## Executive Strategy Analysis\nBased on the variables supplied, our strategic intelligence engine has generated a roadmap for your operation. Below are customized operational checkpoints.\n\n`;
    
    // Add specific inputs as formatted markdown
    responseString += `### Submitted Core Variables:\n`;
    Object.keys(inputs).forEach(key => {
      const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      responseString += `- **${formattedKey}**: ${inputs[key]}\n`;
    });
    responseString += `\n`;

    // Category specific details
    if (selectedTool.category === 'Growth') {
      responseString += `## Key Strategic Recommendations\n`;
      responseString += `1. **Target Market Focus**: Establish local partnerships in target markets. Coordinate compliance and product localization schedules before scaling outbound spend.\n`;
      responseString += `2. **Valuation Improvement**: Focus on increasing high-margin recurring items to boost multiples. Maintain customer retention above 85% to demonstrate product market fit.\n`;
      responseString += `3. **CAC Efficiency**: Repartition channels towards high-intent organic or direct trade referrals to scale traffic without increasing digital ads burn.`;
    } else if (selectedTool.category === 'Marketing') {
      responseString += `## Content & Channel Recommendations\n`;
      responseString += `1. **Pillar Strategy**: Group target queries under broad SEO hubs to establish domain authority. Prioritize user pain point resolutions rather than feature lists.\n`;
      responseString += `2. **Engagement & Frequency**: Standardize postings during high-activity windows on your selected channel. Keep tone highly educational and lead with real industry data.\n`;
      responseString += `3. **Outbound Personalization**: Align email hooks to address direct operational issues immediately. Focus the CTA on low-friction conversations rather than direct sales pitches.`;
    } else if (selectedTool.category === 'Sales') {
      responseString += `## Sales Enablement Blueprint\n`;
      responseString += `1. **Objection Framework**: Pivot objections regarding setup time or pricing to return-on-investment (ROI) timelines. Show case studies proving quick integration.\n`;
      responseString += `2. **Packaging Structure**: Package tools into clear, tier-based value pools. Use decoy pricing on intermediate options to push enterprise bundles.\n`;
      responseString += `3. **Partnership Hooks**: Structure proposals around co-marketing webinars and distribution extensions that minimize setup friction for partners.`;
    } else if (selectedTool.category === 'Finance') {
      responseString += `## Financial Runways & Economic Outlook\n`;
      responseString += `1. **Cash Flow Checkpoint**: Optimize accounts receivable terms to compress cash conversion cycles. Align variable staff budgets with weekly sales volume.\n`;
      responseString += `2. **Unit Margins**: Audit operational delivery pipelines to reduce fulfillment costs. Target a contribution margin of at least 60% per unit order.\n`;
      responseString += `3. **Subsidy & Subsistence**: Explore local government grants and digital development tax credits. Keep logs of developer hours mapped to research initiatives.`;
    } else if (selectedTool.category === 'Strategy') {
      responseString += `## Competitor & Strategic Pivot Outline\n`;
      responseString += `1. **Market Positioning**: Emphasize unique capabilities that competitors fail to provide. Position services as high-value, tailored strategic solutions.\n`;
      responseString += `2. **Slide Structure**: Ensure VC pitch decks lead with a clear Problem-Solution story. Dedicate 2 full slides to the bottom-line metrics and financial model.\n`;
      responseString += `3. **Pivot Milestones**: Shift focus iteratively. Retain legacy cash cows while validating new models with quick, high-margin strategic contracts.`;
    } else { // Operations
      responseString += `## Operational Execution Framework\n`;
      responseString += `1. **Operational Roadmap**: Set key operational checkpoints for core values. Ensure customer channels are documented in standard playbooks.\n`;
      responseString += `2. **Team Scalability**: Schedule developer hires only after confirming funding runways. Use vetted contractors for temporary work to preserve cash.\n`;
      responseString += `3. **Service Agreements**: Define strict service windows, but limit remedies to service credits rather than direct refunds. Preserve support window definitions to avoid disputes.`;
    }

    const newResult = {
      id: `sim-${uid()}`,
      toolId: selectedTool.id,
      toolName: selectedTool.name,
      resultText: responseString,
      created_at: new Date().toISOString()
    };

    setActiveResult(newResult);
    saveToLocalHistory(newResult);
  };

  const handleSelectHistoryItem = (item) => {
    // Find matching tool if available, or construct mock
    const matchedTool = tools.find(t => t.id === item.toolId) || {
      id: item.toolId,
      name: item.toolName,
      description: 'Saved advisory report.',
      fields: [],
      category: 'Operations',
      icon: 'description'
    };

    setSelectedTool(matchedTool);
    setActiveResult(item);

    // Scroll to the active workspace view
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-8 space-y-8">
      
      {/* 1. Hero Banner */}
      <div className="bg-gradient-to-r from-primary-container to-secondary text-white p-8 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
        <div className="space-y-2 max-w-xl z-10">
          <h2 className="font-headline-xl text-headline-xl font-bold tracking-tight">AI Business Advisor</h2>
          <p className="text-body-md text-white/85">
            Get instant, actionable expert analysis and strategic blueprints powered by AI. Select a specialized business tool below to begin.
          </p>
        </div>
        <div className="bg-white/10 border border-white/20 px-4 py-2.5 rounded-2xl flex items-center gap-2 z-10 text-white shrink-0">
          <span className="material-symbols-outlined text-[24px] icon-fill">smart_toy</span>
          <span className="font-bold text-body-sm">AI Engine Active</span>
        </div>
      </div>

      {/* 2. Workspace Form (If tool is active) */}
      {selectedTool && (
        <div className="space-y-6">
          {/* Breadcrumb navigator */}
          <div className="flex items-center">
            <button
              onClick={() => {
                setSelectedTool(null);
                // Do not clear the active result so the user can still read it when going back
              }}
              className="text-secondary hover:text-secondary/80 font-bold text-body-sm flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              Back to Advisor Tools list
            </button>
          </div>

          <DynamicAdvisorForm
            tool={selectedTool}
            onSubmit={handleGenerate}
            onCancel={() => setSelectedTool(null)}
            loading={generating}
          />
        </div>
      )}

      {/* 3. Grid area (Displayed when no tool is active, or user is browsing) */}
      {!selectedTool && (
        <>
          {loadingTools ? (
            <div className="flex items-center justify-center py-20 gap-2 text-on-surface-variant">
              <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
              <span className="font-semibold text-body-md">Loading strategic tools...</span>
            </div>
          ) : (
            <AdvisorGrid
              tools={tools}
              onSelectTool={(tool) => {
                setSelectedTool(tool);
                // Reset current active result context if we change to a new tool (to avoid showing old results)
                if (activeResult && activeResult.toolId !== tool.id) {
                  setActiveResult(null);
                }
              }}
            />
          )}
        </>
      )}

      {/* 4. Result Area (Scroll anchor) */}
      <div ref={resultRef} className="pt-2">
        {activeResult && (
          <AdvisorResult
            toolName={activeResult.toolName}
            resultText={activeResult.resultText}
            timestamp={activeResult.created_at}
          />
        )}
      </div>

      {/* 5. History Section */}
      <div className="bg-surface-container-low border border-outline-variant/30 p-6 md:p-8 rounded-2xl shadow-sm space-y-6 max-w-[800px] mx-auto">
        <div className="flex items-center gap-2 pb-4 border-b border-outline-variant/20">
          <span className="material-symbols-outlined text-secondary text-[24px]">history</span>
          <h3 className="font-headline-md text-headline-md font-bold text-primary">
            Recent Generations
          </h3>
        </div>

        {loadingHistory ? (
          <div className="flex items-center justify-center py-10 gap-2 text-on-surface-variant">
            <div className="w-6 h-6 border-3 border-secondary border-t-transparent rounded-full animate-spin"></div>
            <span className="font-semibold text-body-sm">Loading history...</span>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-12 text-on-surface-variant bg-surface rounded-xl border border-dashed border-outline-variant/60">
            <span className="material-symbols-outlined text-5xl opacity-35 mb-2">history_toggle_off</span>
            <p className="text-body-sm font-semibold text-primary">No previous reports found</p>
            <p className="text-body-sm text-on-surface-variant mt-0.5">
              Generate strategic advice above to see your recent logs here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
            {history.map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelectHistoryItem(item)}
                className="bg-surface-container-lowest border border-outline-variant/40 hover:border-secondary/40 p-4 rounded-xl shadow-none hover:shadow-sm cursor-pointer transition-all flex justify-between items-center group"
              >
                <div className="space-y-1 pr-4 truncate flex-grow">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-body-md text-primary group-hover:text-secondary transition-colors truncate">
                      {item.toolName}
                    </h4>
                    <span className="text-[10px] text-on-surface-variant/50 font-semibold shrink-0">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-body-sm text-on-surface-variant/70 line-clamp-1 italic">
                    {item.resultText ? item.resultText.replace(/[#*`\n]/g, ' ').substring(0, 100) : 'View report...'}
                  </p>
                </div>
                <span className="material-symbols-outlined text-secondary opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-[20px] shrink-0">
                  chevron_right
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
