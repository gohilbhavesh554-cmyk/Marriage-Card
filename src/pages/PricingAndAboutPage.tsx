import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import { useVowora } from '../context/VoworaContext';

export const PricingAndAboutPage: React.FC<{ mode: 'pricing' | 'about' }> = ({ mode }) => {
  const navigate = useNavigate();
  const { userProfile, updateSubscriptionPlan } = useVowora();
  const [planNotice, setPlanNotice] = useState('');

  const currentPlan = userProfile?.subscriptionPlan || 'free';

  const handleSelectPlan = async (plan: 'free' | 'premium') => {
    await updateSubscriptionPlan(plan);
    setPlanNotice(
      plan === 'premium'
        ? 'Your workspace entitlement is now set to VOWORA Premium.'
        : 'Your workspace entitlement is set to the Free Plan.'
    );
    setTimeout(() => setPlanNotice(''), 3500);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F4] text-[#292720] py-14 px-6 lg:px-12">
      <div className="max-w-[1200px] mx-auto space-y-20">
        {mode === 'about' && (
          <section className="space-y-12 border-b border-[#EAE5DC] pb-16">
            <div className="max-w-2xl space-y-4">
              <p className="text-xs uppercase tracking-[0.22em] text-[#B99A6A]">
                How VOWORA Works · Editorial Craftsmanship
              </p>
              <h1
                className="font-display text-4xl sm:text-6xl font-normal text-[#292720]"
                style={{ textWrap: 'balance' }}
              >
                Where Bespoke Print Tradition Meets the Digital Wedding Experience.
              </h1>
              <p className="text-sm sm:text-base text-[#77746B] leading-relaxed">
                VOWORA was created for couples and wedding planners who care deeply about
                typography, cultural authenticity, and effortless hospitality. Every invitation
                combines an interactive envelope reveal with a complete multi-event wedding website.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  num: '01. Choose an Original Architecture',
                  title: 'Eight Art-Directed Suites',
                  body: 'Whether you are hosting a three-day palace wedding in Udaipur, a vineyard dinner in Tuscany, or a black-tie evening in New York, each template has its own bespoke border geometry and typographic rhythm.',
                },
                {
                  num: '02. Personalize in Real Time',
                  title: 'Guided Wizard & 3-Panel Studio Editor',
                  body: 'Customize names, family blessings, ceremony timelines, attire palettes, and photographs with instant mobile and desktop previews.',
                },
                {
                  num: '03. Compose in English, Hindi & Gujarati',
                  title: 'Vowora Studio Copywriting',
                  body: 'Generate or translate warm, culturally resonant wedding wording using only your real names, dates, and venues—never generic placeholders.',
                },
                {
                  num: '04. Seamless Guest Hospitality',
                  title: 'Event-Wise RSVPs & Door QR Check-In',
                  body: 'Collect meal preferences, plus-ones, and ceremony attendance on your `/i/couple-slug` website, and issue encrypted QR entry passes for venue check-in.',
                },
              ].map((step) => (
                <div key={step.num} className="bg-white border border-[#EAE5DC] p-8 space-y-3">
                  <div className="text-xs font-medium text-[#B99A6A]">{step.num}</div>
                  <h2 className="font-display text-2xl font-semibold text-[#292720]">
                    {step.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#77746B] leading-relaxed">{step.body}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Pricing & Entitlement Comparison */}
        <section className="space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <p className="text-xs uppercase tracking-[0.22em] text-[#B99A6A]">
              Transparent Plans &amp; Access
            </p>
            <h1 className="font-display text-4xl sm:text-5xl font-normal text-[#292720]">
              Simple Pricing for Every Celebration
            </h1>
            <p className="text-sm text-[#77746B]">
              Begin creating and testing your wedding invitation for free, or switch to the Premium
              suite for unlimited wedding functions, custom slugs, and high-resolution stationery
              exports.
            </p>
          </div>

          {planNotice && (
            <div className="max-w-xl mx-auto p-4 bg-white border border-[#B99A6A] text-center text-xs font-medium text-[#292720]">
              {planNotice}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
            {/* Free Plan */}
            <div className="bg-white border border-[#EAE5DC] p-8 sm:p-10 flex flex-col justify-between">
              <div className="space-y-6">
                <div>
                  <span className="text-xs uppercase tracking-[0.2em] text-[#77746B]">
                    For Intimate Celebrations
                  </span>
                  <h2 className="font-display text-3xl font-semibold mt-1">Free Suite</h2>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="font-display text-5xl font-semibold tabular-nums">$0</span>
                    <span className="text-xs text-[#77746B]">forever · no credit card required</span>
                  </div>
                </div>

                <ul className="space-y-3 text-xs sm:text-sm text-[#292720] border-t border-[#EAE5DC] pt-6">
                  {[
                    'Create and customize a digital wedding invitation',
                    'Access selected free templates (Modern Ivory, Botanical Romance, Blush Garden, Mehndi Celebration)',
                    'Customize couple names, dates, and family hosts',
                    'Real-time mobile & desktop invitation preview',
                    'Basic guest RSVP collection & shareable link',
                  ].map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-[#B99A6A] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8">
                <button
                  type="button"
                  onClick={() => handleSelectPlan('free')}
                  className={`w-full py-3.5 px-6 text-xs uppercase tracking-[0.2em] font-medium border transition-colors cursor-pointer ${
                    currentPlan === 'free'
                      ? 'bg-[#FAF8F4] text-[#292720] border-[#292720]'
                      : 'bg-white text-[#292720] border-[#EAE5DC] hover:border-[#292720]'
                  }`}
                >
                  {currentPlan === 'free' ? 'Current Active Plan' : 'Switch to Free Plan'}
                </button>
              </div>
            </div>

            {/* Premium Plan */}
            <div className="bg-white border-2 border-[#B99A6A] p-8 sm:p-10 flex flex-col justify-between">
              <div className="space-y-6">
                <div>
                  <span className="text-xs uppercase tracking-[0.2em] text-[#B99A6A]">
                    For Multi-Day &amp; Destination Weddings
                  </span>
                  <h2 className="font-display text-3xl font-semibold mt-1">Premium Studio</h2>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="font-display text-5xl font-semibold tabular-nums">$49</span>
                    <span className="text-xs text-[#77746B]">one-time per wedding project</span>
                  </div>
                </div>

                <ul className="space-y-3 text-xs sm:text-sm text-[#292720] border-t border-[#EAE5DC] pt-6">
                  {[
                    'Unlock all 8 templates including Royal Heritage, Black Tie, Destination & Pastel Romance',
                    'Animated digital envelope reveal & ambient musical scores',
                    'Custom wedding website URL (/i/your-custom-names)',
                    'Unlimited wedding ceremony & function sections',
                    'Guest analytics, dietary overview & CSV export',
                    'Server-verified QR check-in passes for guests',
                    'High-resolution PNG artwork download & print view',
                    'Vowora Studio AI wording & Hindi / Gujarati translation',
                  ].map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-[#B99A6A] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8 space-y-2">
                <button
                  type="button"
                  onClick={() => handleSelectPlan('premium')}
                  className="w-full py-3.5 px-6 bg-[#292720] hover:bg-[#34453A] text-white text-xs uppercase tracking-[0.2em] font-medium transition-colors cursor-pointer"
                >
                  {currentPlan === 'premium'
                    ? 'Premium Entitlement Active'
                    : 'Enable Premium Studio Tier'}
                </button>
                <p className="text-[11px] text-[#77746B] text-center">
                  Preview mode entitlement switcher — no live payment gateway charge is made.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center pt-6">
            <button
              type="button"
              onClick={() => navigate('/create')}
              className="px-7 py-4 bg-[#292720] text-white text-xs uppercase tracking-[0.2em] inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Start Designing Your Invitation</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
