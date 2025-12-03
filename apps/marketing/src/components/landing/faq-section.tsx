'use client';

import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import React, { useState } from 'react';

interface FAQ {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQ[] = [
  {
    question: 'How is this different from other templates?',
    answer:
      "Most templates give you a skeleton and leave you to configure everything. Blitzpack ships with battle-tested features already working: authentication with OAuth, admin dashboard, email system, API documentation, and more. It's not just setup—it's production-ready infrastructure.",
  },
  {
    question: 'Do I need to eject or can I customize everything?',
    answer:
      "You have full control. Blitzpack isn't a framework—it's your code. Modify anything, add features, remove what you don't need. No proprietary abstractions, no lock-in. Just clean, well-organized TypeScript you can understand and extend.",
  },
  {
    question: "What if I don't need all these features?",
    answer:
      "Every feature is modular and can be removed. Don't need authentication? Delete the auth routes. Don't want the admin dashboard? Remove that package. The monorepo structure makes it easy to strip out what you don't need without breaking everything else.",
  },
  {
    question: 'Is this production-ready or just a starter?',
    answer:
      'Production-ready. Security headers configured, rate limiting in place, structured logging with Pino, environment validation with Zod, Docker configs, and CI/CD workflows. This is what you want before deploying, not after.',
  },
  {
    question: "How do I get help if I'm stuck?",
    answer:
      'Comprehensive documentation in the README, inline code comments for complex logic, and CLAUDE.md for AI assistant context. For bugs or feature requests, open an issue on GitHub. The codebase is designed to be self-explanatory.',
  },
  {
    question: "What's the license? Can I use this commercially?",
    answer:
      'MIT License. Use it for anything—personal projects, commercial products, client work. No restrictions, no attribution required (though appreciated). Build and ship without legal concerns.',
  },
  {
    question: 'Does this support [specific feature]?',
    answer:
      'Check the tech stack and "What\'s Included" sections. Built on modern, stable technologies: Next.js 16, React 19, Fastify 5, Prisma 7, PostgreSQL. OAuth ready (Google, GitHub), email system with React Email and Resend, S3 integration for uploads, session management, and more.',
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
    },
  },
};

interface FAQItemProps {
  faq: FAQ;
  isOpen: boolean;
  onToggle: () => void;
}

function FAQItem({ faq, isOpen, onToggle }: FAQItemProps) {
  return (
    <motion.div variants={item} className="border-border group border-b">
      <button
        onClick={onToggle}
        className="flex w-full cursor-pointer items-start justify-between gap-4 py-5 text-left transition-all"
      >
        <div className="flex-1">
          <h3 className="text-foreground text-base font-medium">
            {faq.question}
          </h3>
          <motion.div
            initial={false}
            animate={{
              height: isOpen ? 'auto' : 0,
              opacity: isOpen ? 1 : 0,
              marginTop: isOpen ? 12 : 0,
            }}
            transition={{
              duration: 0.3,
              ease: [0.4, 0, 0.2, 1],
            }}
            className="overflow-hidden"
          >
            <p className="text-muted-foreground text-sm leading-relaxed">
              {faq.answer}
            </p>
          </motion.div>
        </div>

        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="text-muted-foreground group-hover:text-primary flex shrink-0 transition-colors"
        >
          <ChevronDown className="h-4 w-4" strokeWidth={2.5} />
        </motion.div>
      </button>
    </motion.div>
  );
}

export function FAQSection(): React.ReactElement {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-12">
      <div className="text-center">
        <h2 className="text-foreground mb-4 flex items-center justify-center gap-3 text-3xl font-semibold tracking-tight lg:text-5xl">
          <span>Frequently Asked Questions</span>
        </h2>
        <p className="text-muted-foreground mx-auto max-w-2xl text-lg leading-relaxed">
          Everything you need to know about Blitzpack
        </p>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-100px' }}
        className="mx-auto max-w-3xl"
      >
        {FAQ_ITEMS.map((faq, index) => (
          <FAQItem
            key={index}
            faq={faq}
            isOpen={openIndex === index}
            onToggle={() => handleToggle(index)}
          />
        ))}
      </motion.div>
    </div>
  );
}
