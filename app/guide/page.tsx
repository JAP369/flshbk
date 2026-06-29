"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Key,
  ExternalLink,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Zap,
  ShoppingBag,
  Globe,
  Database,
  Shield,
  Clock,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Code,
  Terminal,
  Settings,
} from "lucide-react";

// -----------------------------------------------------------------------------
// TYPES
// -----------------------------------------------------------------------------

interface ApiKeyCard {
  id: string;
  name: string;
  envVar: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  free: boolean;
  time: string;
  required: boolean;
  steps: Step[];
  tips: string[];
  rateLimits: string;
}

interface Step {
  title: string;
  description: string;
  url?: string;
  urlLabel?: string;
  code?: string;
  image?: string;
}

// -----------------------------------------------------------------------------
// DATA
// -----------------------------------------------------------------------------

const API_KEYS: ApiKeyCard[] = [
  {
    id: "pokemontcg",
    name: "Pokémon TCG API",
    envVar: "POKEMON_TCG_API_KEY",
    description:
      "Source of truth for card metadata, images, and TCGPlayer market pricing. Used as the baseline reference for all arbitrage calculations.",
    icon: <Database className='w-5 h-5' />,
    color: "text-sky-400",
    bgColor: "bg-sky-500/10",
    borderColor: "border-sky-500/30",
    free: true,
    time: "2 min",
    required: false,
    rateLimits: "~1,000 requests/day without key. Higher with key.",
    steps: [
      {
        title: "Create an account",
        description: "Go to pokemontcg.io/signup and register with your email.",
        url: "https://pokemontcg.io/signup",
        urlLabel: "pokemontcg.io/signup",
      },
      {
        title: "Verify your email",
        description:
          "Check your inbox and click the verification link from pokemontcg.io.",
      },
      {
        title: "Get your API key",
        description:
          "Log in and navigate to your dashboard. Copy the API key shown.",
        url: "https://pokemontcg.io/dashboard",
        urlLabel: "pokemontcg.io/dashboard",
      },
      {
        title: "Add to Vercel",
        description:
          "Go to your Vercel project → Settings → Environment Variables. Add a new variable:",
        code: "POKEMON_TCG_API_KEY=your_key_here",
      },
    ],
    tips: [
      "Without a key, the API still works but at lower rate limits (~1,000/day)",
      "The free tier is sufficient for development and prototyping",
      "For commercial use, contact them about higher limits",
    ],
  },
  {
    id: "ebay",
    name: "eBay Developer Program",
    envVar: "EBAY_CLIENT_ID + EBAY_CLIENT_SECRET",
    description:
      "Fetches live marketplace listings and sold data. Essential for finding undervalued cards in real-time. The Buy API searches active listings; the Finding API checks completed sales.",
    icon: <ShoppingBag className='w-5 h-5' />,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    free: true,
    time: "10 min",
    required: true,
    rateLimits: "5,000 calls/day per API (Buy + Finding combined).",
    steps: [
      {
        title: "Register as a developer",
        description:
          "Create a personal account at developer.ebay.com. You don't need a seller account.",
        url: "https://developer.ebay.com",
        urlLabel: "developer.ebay.com",
      },
      {
        title: "Create an application keyset",
        description:
          'Go to My Account → Application Keys (left sidebar). Click "Create a keyset". Choose "Production" (not Sandbox).',
      },
      {
        title: "Fill in application details",
        description:
          'Set Application Title to "FlashBK" (or any name). Environment: Production. OAuth scopes can stay at defaults.',
      },
      {
        title: "Copy your keys",
        description: "You'll receive two keys — these are what you need:",
        code: "EBAY_CLIENT_ID=Prod-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx\nEBAY_CLIENT_SECRET=Prod-yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy",
      },
      {
        title: "Wait for auto-approval",
        description:
          "eBay auto-approves Client Credentials OAuth within a few minutes. No manual review needed for read-only Browse API access.",
      },
    ],
    tips: [
      "Use Production keys, not Sandbox — Sandbox has no real listings",
      "The Client Credentials grant we use doesn't require user consent",
      "Keep your Cert ID secret — it's equivalent to a password",
      "If you hit rate limits, the app falls back to demo mode automatically",
    ],
  },
  {
    id: "apify",
    name: "Apify (Carousell Scraper)",
    envVar: "APIFY_API_KEY + APIFY_ACTOR_ID",
    description:
      "Carousell has no public API. Apify provides a headless browser service that scrapes Carousell HK search results. This is how we get local HK marketplace prices.",
    icon: <Globe className='w-5 h-5' />,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    free: true,
    time: "15 min",
    required: true,
    rateLimits: "$5 free compute/month on Free plan. Enough for ~500 scrapes.",
    steps: [
      {
        title: "Create an Apify account",
        description:
          "Sign up at console.apify.com using Google or email. Verify your email.",
        url: "https://console.apify.com",
        urlLabel: "console.apify.com",
      },
      {
        title: "Get your API token",
        description:
          "Click your avatar (top right) → Settings → API & integrations. Copy your Personal API Token.",
        code: "APIFY_API_KEY=apify_api_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      },
      {
        title: "Find a Carousell scraper actor",
        description:
          'In the Apify console, click "Explore" → search "carousell". Look for actors like "Carousell Product Scraper". Note the Actor ID from the URL.',
        url: "https://console.apify.com/actors",
        urlLabel: "console.apify.com/actors",
      },
      {
        title: "Or create your own scraper",
        description:
          "If no good actor exists, click 'Create new actor' → 'Blank Actor'. Use the Cheerio template and adapt it for carousell.com.hk search pages. The guide below has a starter template.",
      },
      {
        title: "Add both values to Vercel",
        description:
          "Add the API token and the Actor ID as environment variables:",
        code: "APIFY_API_KEY=apify_api_xxxxxxxxxxxx\nAPIFY_ACTOR_ID=your-username/carousell-scraper",
      },
    ],
    tips: [
      "Free plan gives $5 compute/month — enough for prototyping",
      "Each scrape run uses ~$0.01-0.05 in compute",
      "You can also use Google Sheets as a manual bridge if scraping is too complex",
      "The app works without Carousell data — it just shows eBay results only",
    ],
  },
];

// -----------------------------------------------------------------------------
// MAIN PAGE
// -----------------------------------------------------------------------------

export default function GuidePage() {
  const [expandedKey, setExpandedKey] = useState<string | null>("pokemontcg");
  const [showVercelSteps, setShowVercelSteps] = useState(false);
  const [showCliSteps, setShowCliSteps] = useState(false);

  return (
    <div className='min-h-screen bg-background'>
      <div className='w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24'>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='mb-10'
        >
          <div className='flex items-center gap-3 mb-3'>
            <div className='w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center'>
              <Key className='w-5 h-5 text-accent' />
            </div>
            <h1 className='font-serif text-3xl sm:text-4xl text-foreground'>
              API Key Setup Guide
            </h1>
          </div>
          <p className='text-slate-400 max-w-2xl'>
            Complete guide to configuring API keys for live Pokémon TCG
            arbitrage scanning. Works in{" "}
            <strong className='text-foreground'>demo mode</strong> without any
            keys — this guide is for enabling live marketplace data.
          </p>
        </motion.div>

        {/* Quick Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className='mb-8 p-4 rounded-xl bg-surface-elevated border border-border'
        >
          <h3 className='text-sm font-semibold text-foreground mb-3 flex items-center gap-2'>
            <Zap className='w-4 h-4 text-amber-400' />
            Current Status
          </h3>
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
            <StatusCard
              label='Demo Mode'
              status='active'
              description='Works out of the box with simulated marketplace data'
            />
            <StatusCard
              label='Live eBay'
              status='inactive'
              description='Requires EBAY_CLIENT_ID + EBAY_CLIENT_SECRET'
            />
            <StatusCard
              label='Live Carousell'
              status='inactive'
              description='Requires APIFY_API_KEY + APIFY_ACTOR_ID'
            />
          </div>
        </motion.div>

        {/* Architecture Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className='mb-8'
        >
          <h2 className='text-lg font-semibold text-foreground mb-4 flex items-center gap-2'>
            <Settings className='w-4 h-4 text-accent' />
            How It Works
          </h2>
          <div className='p-4 rounded-xl bg-surface-elevated border border-border'>
            <div className='flex flex-col sm:flex-row items-center gap-3 text-sm'>
              <ArchStep
                icon={<Database className='w-4 h-4 text-sky-400' />}
                label='pokemontcg.io'
                desc='Card catalog + baseline price'
              />
              <ArrowRight className='w-4 h-4 text-slate-600 rotate-90 sm:rotate-0' />
              <ArchStep
                icon={<Code className='w-4 h-4 text-accent' />}
                label='Arbitrage Engine'
                desc='Compare prices across markets'
              />
              <ArrowRight className='w-4 h-4 text-slate-600 rotate-90 sm:rotate-0' />
              <ArchStep
                icon={<ShoppingBag className='w-4 h-4 text-emerald-400' />}
                label='eBay + Carousell'
                desc='Live listings (requires keys)'
              />
            </div>
          </div>
        </motion.div>

        {/* API Key Cards */}
        <div className='space-y-4 mb-10'>
          <h2 className='text-lg font-semibold text-foreground flex items-center gap-2'>
            <Key className='w-4 h-4 text-accent' />
            API Keys
          </h2>

          {API_KEYS.map((key) => (
            <ApiKeySection
              key={key.id}
              apiKey={key}
              isExpanded={expandedKey === key.id}
              onToggle={() =>
                setExpandedKey(expandedKey === key.id ? null : key.id)
              }
            />
          ))}
        </div>

        {/* Vercel Setup */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className='mb-10'
        >
          <h2 className='text-lg font-semibold text-foreground mb-4 flex items-center gap-2'>
            <Shield className='w-4 h-4 text-accent' />
            Setting Environment Variables in Vercel
          </h2>

          {/* Tab selector */}
          <div className='flex items-center gap-1 p-1 bg-surface-rounded-xl border border-border mb-4'>
            <button
              onClick={() => {
                setShowVercelSteps(true);
                setShowCliSteps(false);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                showVercelSteps || (!showVercelSteps && !showCliSteps)
                  ? "bg-accent/10 text-accent border border-accent/30"
                  : "text-slate-400 hover:text-foreground"
              }`}
            >
              <Globe className='w-4 h-4' />
              Vercel Dashboard
            </button>
            <button
              onClick={() => {
                setShowCliSteps(true);
                setShowVercelSteps(false);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                showCliSteps
                  ? "bg-accent/10 text-accent border border-accent/30"
                  : "text-slate-400 hover:text-foreground"
              }`}
            >
              <Terminal className='w-4 h-4' />
              Vercel CLI
            </button>
          </div>

          <AnimatePresence mode='wait'>
            {showCliSteps ? (
              <motion.div
                key='cli'
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className='space-y-4'
              >
                <Step number={1} title='Install Vercel CLI'>
                  <CodeBlock code='npm install -g vercel' />
                </Step>
                <Step number={2} title='Link your project'>
                  <CodeBlock code='vercel link' />
                </Step>
                <Step number={3} title='Add environment variables'>
                  <CodeBlock
                    code={`vercel env add EBAY_CLIENT_ID\nvercel env add EBAY_CLIENT_SECRET\nvercel env add APIFY_API_KEY\nvercel env add APIFY_ACTOR_ID\nvercel env add POKEMON_TCG_API_KEY`}
                  />
                  <p className='text-xs text-slate-400 mt-2'>
                    When prompted: select all environments (Production + Preview
                    + Development) and paste each value.
                  </p>
                </Step>
                <Step number={4} title='Redeploy'>
                  <CodeBlock code='vercel --prod' />
                </Step>
              </motion.div>
            ) : (
              <motion.div
                key='dashboard'
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className='space-y-4'
              >
                <Step
                  number={1}
                  title='Open Vercel Dashboard'
                  description='Go to vercel.com/dashboard and click on your FlashBK project.'
                  url='https://vercel.com/dashboard'
                  urlLabel='vercel.com/dashboard'
                />
                <Step
                  number={2}
                  title='Navigate to Environment Variables'
                  description='Click the "Settings" tab in the left sidebar, then find "Environment Variables" in the settings menu.'
                />
                <Step number={3} title='Add each API key'>
                  <div className='overflow-x-auto'>
                    <table className='w-full text-sm border-collapse'>
                      <thead>
                        <tr className='border-b border-border'>
                          <th className='text-left py-2 pr-4 text-slate-400 font-medium'>
                            Key
                          </th>
                          <th className='text-left py-2 pr-4 text-slate-400 font-medium'>
                            Value
                          </th>
                          <th className='text-left py-2 text-slate-400 font-medium'>
                            Required?
                          </th>
                        </tr>
                      </thead>
                      <tbody className='text-xs font-mono'>
                        {[
                          ["POKEMON_TCG_API_KEY", "your_key_here", "Optional"],
                          ["EBAY_CLIENT_ID", "Prod-xxxxxxxx-...", "Yes"],
                          ["EBAY_CLIENT_SECRET", "Prod-yyyyyyyy-...", "Yes"],
                          ["APIFY_API_KEY", "apify_api_xxxxxxxx...", "Yes"],
                          ["APIFY_ACTOR_ID", "user/actor-name", "Yes"],
                        ].map(([k, v, req]) => (
                          <tr key={k} className='border-b border-border/50'>
                            <td className='py-2 pr-4 text-foreground'>{k}</td>
                            <td className='py-2 pr-4 text-slate-400'>{v}</td>
                            <td className='py-2'>
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  req === "Yes"
                                    ? "bg-emerald-500/20 text-emerald-400"
                                    : "bg-slate-500/20 text-slate-400"
                                }`}
                              >
                                {req}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Step>
                <Step
                  number={4}
                  title='Select environments'
                  description='Make sure to check ✓ Production, ✓ Preview, and ✓ Development for each variable. Click "Save".'
                />
                <Step
                  number={5}
                  title='Redeploy'
                  description='Go to the "Deployments" tab, find the latest deployment, click the three dots menu → "Redeploy". This ensures the new env vars are picked up.'
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Verification */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className='mb-10'
        >
          <h2 className='text-lg font-semibold text-foreground mb-4 flex items-center gap-2'>
            <CheckCircle2 className='w-4 h-4 text-emerald-400' />
            Verify It Works
          </h2>
          <div className='space-y-4'>
            <div className='p-4 rounded-xl bg-surface-elevated border border-border'>
              <p className='text-sm text-foreground mb-2'>
                After deploying, test the arbitrage endpoint:
              </p>
              <CodeBlock code='curl https://your-app.vercel.app/api/arbitrage' />
            </div>
            <div className='p-4 rounded-xl bg-surface-elevated border border-border'>
              <p className='text-sm text-foreground mb-2'>
                Check the response. If keys are detected correctly:
              </p>
              <ul className='text-xs text-slate-400 space-y-1 ml-4 list-disc'>
                <li>
                  If you see{" "}
                  <code className='text-emerald-400 bg-emerald-500/10 px-1 rounded'>
                    scanId: "demo-..."
                  </code>{" "}
                  — keys are NOT detected. Check your Vercel env vars.
                </li>
                <li>
                  If you see{" "}
                  <code className='text-emerald-400 bg-emerald-500/10 px-1 rounded'>
                    scanId: "live-..."
                  </code>{" "}
                  or real card data with actual eBay listings — it's working!
                </li>
                <li>
                  The endpoint always returns data (demo mode is the fallback),
                  so a 200 response means the API is healthy.
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Troubleshooting */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className='text-lg font-semibold text-foreground mb-4 flex items-center gap-2'>
            <AlertCircle className='w-4 h-4 text-amber-400' />
            Troubleshooting
          </h2>
          <div className='space-y-3'>
            {[
              {
                q: '"GitHub user not found" on Vercel',
                a: 'Your Git commit author email doesn\'t match your GitHub account. Run:\ngit config user.email "your-github-email@example.com"\ngit commit --amend --reset-author --no-edit\ngit push --force-with-lease',
              },
              {
                q: "eBay returns 401 Unauthorized",
                a: "Double-check your Client ID and Secret. Make sure you created Production keys (not Sandbox). Wait 5 minutes for eBay auto-approval.",
              },
              {
                q: "Apify returns 403 Forbidden",
                a: "Verify your API token is correct. Check if your free compute credits haven't run out in the Apify console.",
              },
              {
                q: "Still seeing demo data after adding keys",
                a: "You must redeploy after adding env vars. Vercel bakes env vars into the build. Go to Deployments → Redeploy.",
              },
              {
                q: "Rate limit errors",
                a: "eBay: 5,000/day. pokemontcg.io: ~1,000/day without key. The app caches results for 5 minutes to avoid hitting limits.",
              },
            ].map((item) => (
              <div
                key={item.q}
                className='p-4 rounded-xl bg-surface-elevated border border-border'
              >
                <p className='text-sm font-medium text-foreground mb-1'>
                  {item.q}
                </p>
                <p className='text-xs text-slate-400 whitespace-pre-line'>
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <div className='mt-12 pt-6 border-t border-border text-center'>
          <p className='text-xs text-slate-500'>
            The app works in demo mode without any API keys. This guide is for
            enabling live marketplace data.
          </p>
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// SUB-COMPONENTS
// -----------------------------------------------------------------------------

function StatusCard({
  label,
  status,
  description,
}: {
  label: string;
  status: "active" | "inactive";
  description: string;
}) {
  return (
    <div className='p-3 rounded-lg bg-surface-elevated/50 border border-border/50'>
      <div className='flex items-center gap-2 mb-1'>
        <div
          className={`w-2 h-2 rounded-full ${
            status === "active" ? "bg-emerald-400" : "bg-slate-500"
          }`}
        />
        <span className='text-xs font-medium text-foreground'>{label}</span>
      </div>
      <p className='text-[10px] text-slate-400'>{description}</p>
    </div>
  );
}

function ArchStep({
  icon,
  label,
  desc,
}: {
  icon: React.ReactNode;
  label: string;
  desc: string;
}) {
  return (
    <div className='flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-elevated/50 border border-border/50'>
      {icon}
      <div>
        <p className='text-xs font-medium text-foreground'>{label}</p>
        <p className='text-[10px] text-slate-500'>{desc}</p>
      </div>
    </div>
  );
}

function ApiKeySection({
  apiKey,
  isExpanded,
  onToggle,
}: {
  apiKey: ApiKeyCard;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={`rounded-xl border overflow-hidden transition-colors ${apiKey.borderColor}`}
    >
      {/* Header */}
      <button
        onClick={onToggle}
        className={`w-full flex items-center gap-4 p-4 transition-colors ${apiKey.bgColor} hover:brightness-110`}
      >
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${apiKey.bgColor} ${apiKey.color}`}
        >
          {apiKey.icon}
        </div>
        <div className='flex-1 text-left'>
          <div className='flex items-center gap-2'>
            <h3 className='text-sm font-semibold text-foreground'>
              {apiKey.name}
            </h3>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                apiKey.required
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-slate-500/20 text-slate-400"
              }`}
            >
              {apiKey.required ? "Required" : "Optional"}
            </span>
            {apiKey.free && (
              <span className='text-[10px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 font-bold'>
                Free
              </span>
            )}
          </div>
          <p className='text-xs text-slate-400 mt-0.5'>{apiKey.description}</p>
        </div>
        <div className='flex items-center gap-3'>
          <div className='hidden sm:flex items-center gap-2 text-xs text-slate-400'>
            <Clock className='w-3 h-3' />
            {apiKey.time}
          </div>
          {isExpanded ? (
            <ChevronDown className='w-4 h-4 text-slate-400' />
          ) : (
            <ChevronRight className='w-4 h-4 text-slate-400' />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className='overflow-hidden'
          >
            <div className='p-4 bg-surface-elevated/50 space-y-4'>
              {/* Rate Limits */}
              <div className='flex items-center gap-2 text-xs text-slate-400'>
                <Clock className='w-3 h-3' />
                <span>
                  <strong className='text-foreground'>Rate Limits:</strong>{" "}
                  {apiKey.rateLimits}
                </span>
              </div>

              {/* Steps */}
              <div className='space-y-3'>
                {apiKey.steps.map((step, idx) => (
                  <Step key={idx} number={idx + 1} title={step.title}>
                    <p className='text-xs text-slate-400 mb-2'>
                      {step.description}
                    </p>
                    {step.url && (
                      <a
                        href={step.url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='inline-flex items-center gap-1 text-xs text-accent hover:text-accent/80 transition-colors mb-2'
                      >
                        {step.urlLabel}
                        <ExternalLink className='w-3 h-3' />
                      </a>
                    )}
                    {step.code && <CodeBlock code={step.code} />}
                  </Step>
                ))}
              </div>

              {/* Tips */}
              {apiKey.tips.length > 0 && (
                <div className='p-3 rounded-lg bg-surface-elevated border border-border/50'>
                  <p className='text-xs font-medium text-foreground mb-2 flex items-center gap-1'>
                    <Sparkles className='w-3 h-3 text-amber-400' />
                    Tips
                  </p>
                  <ul className='space-y-1'>
                    {apiKey.tips.map((tip, idx) => (
                      <li
                        key={idx}
                        className='text-xs text-slate-400 flex items-start gap-2'
                      >
                        <span className='text-slate-600 mt-0.5'>•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Step({
  number,
  title,
  description,
  url,
  urlLabel,
  children,
}: {
  number: number;
  title: string;
  description?: string;
  url?: string;
  urlLabel?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className='flex gap-3'>
      <div className='w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5'>
        <span className='text-[10px] font-bold text-accent'>{number}</span>
      </div>
      <div className='flex-1 min-w-0'>
        <p className='text-sm font-medium text-foreground mb-1'>{title}</p>
        {description && (
          <p className='text-xs text-slate-400 mb-2'>{description}</p>
        )}
        {url && (
          <a
            href={url}
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex items-center gap-1 text-xs text-accent hover:text-accent/80 transition-colors mb-2'
          >
            {urlLabel}
            <ExternalLink className='w-3 h-3' />
          </a>
        )}
        {children}
      </div>
    </div>
  );
}

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className='relative group'>
      <pre className='p-3 rounded-lg bg-black/40 border border-border/50 text-xs font-mono text-slate-300 overflow-x-auto'>
        {code}
      </pre>
      <button
        onClick={handleCopy}
        className='absolute top-2 right-2 p-1.5 rounded-md bg-surface-elevated border border-border/50 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-surface-elevated/80'
        title='Copy'
      >
        {copied ? (
          <Check className='w-3 h-3 text-emerald-400' />
        ) : (
          <Copy className='w-3 h-3 text-slate-400' />
        )}
      </button>
    </div>
  );
}
