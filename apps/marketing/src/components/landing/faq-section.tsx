'use client';

import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import React, { useState } from 'react';

interface FAQ {
  question: string;
  answer: React.ReactNode;
}

const FAQ_ITEMS: FAQ[] = [
  {
    question: 'How is this different from other templates?',
    answer:
      'Most templates hand you a basic skeleton and expect you to wire everything up yourself. With Blitzpack, you get authentication, OAuth, admin dashboard, email infrastructure, and much more - all configured and working out of the box. You can expect signifcantly less friction when developing and deploying your product.',
  },
  {
    question: 'Can I modify everything in the codebase?',
    answer:
      'You have full control. Blitzpack is fully open source and you can do whatever you want with the codebase. You can modify any part of the codebase to your liking.',
  },
  {
    question: 'What if I want to selectively choose which features to include?',
    answer: `As of now, we ship the whole template as-is with all the features. We're planning on adding support for selective feature inclusion in the future.`,
  },
  {
    question: 'Do I need Docker to run the project?',
    answer:
      'Yes, Docker is required to run PostgreSQL for development. Make sure Docker is installed and running before starting.',
  },
  {
    question: 'Do I need any third-party services or API keys?',
    answer:
      'Some features like the email system and OAuth require API keys. However, these are optional and are only enabled if you provide the necessary keys in the environment variables.',
  },
  {
    question: 'How do I deploy Blitzpack to production?',
    answer: (
      <>
        Blitzpack includes production-ready Docker configs with multi-stage
        builds and docker-compose.prod.yml for deployment. You can deploy to any
        platform that supports Docker (AWS, GCP, DigitalOcean, Railway, etc.).
        <br />
        <br />
        <span className="text-primary font-medium">
          We recommend using Railway for deployment.
        </span>
      </>
    ),
  },
  {
    question: 'Do AI agents work well with Blitzpack?',
    answer:
      "Yes, AI agents work extremely well with Blitzpack.  We've carefully picked the tech stack so it works seamlessly with them. We've bundled a CLAUDE.md file that is automatically used by Claude Code. In case you wish to use any other agent besides Claude Code, you can reuse the content of this file.",
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
