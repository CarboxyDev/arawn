import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@repo/packages-ui/accordion';
import { HelpCircle } from 'lucide-react';
import React from 'react';

const FAQ_ITEMS = [
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
] as const;

export function FAQSection(): React.ReactElement {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-full">
            <HelpCircle className="h-6 w-6" />
          </div>
        </div>
        <h2 className="text-foreground mb-4 text-3xl font-semibold tracking-tight lg:text-4xl">
          Frequently Asked Questions
        </h2>
        <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
          Everything you need to know about Blitzpack
        </p>
      </div>

      <div className="mx-auto max-w-3xl">
        <Accordion type="single" collapsible className="w-full">
          {FAQ_ITEMS.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-foreground text-left">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
