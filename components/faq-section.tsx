"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { ChevronDown } from "lucide-react"

const faqs = [
  {
    question: "What is CareerPulse AI and how does it work?",
    answer:
      "CareerPulse AI is an AI-powered career coaching platform designed to help students, freshers, and experienced professionals land their dream jobs. Our AI analyzes your profile, skills, and goals to provide personalized resume building, mock interviews, ATS optimization, and career path recommendations.",
  },
  {
    question: "How does the AI Resume Builder create professional resumes?",
    answer:
      "Our AI Resume Builder uses advanced natural language processing to analyze your experience and skills, then generates ATS-optimized content tailored to your target role. It suggests powerful action verbs, quantifies achievements, and formats everything using industry-standard templates that pass through applicant tracking systems.",
  },
  {
    question: "What happens in an AI mock interview session?",
    answer:
      "During a mock interview, our AI presents you with role-specific questions via video. It analyzes your responses for content relevance, communication clarity, confidence levels, and body language. After each session, you receive detailed feedback with improvement suggestions and sample answers for weak areas.",
  },
  {
    question: "What is ATS and why does my resume need to be ATS-optimized?",
    answer:
      "ATS (Applicant Tracking System) is software used by 90%+ of companies to filter resumes before human review. An unoptimized resume may never reach a recruiter. Our ATS Score Analyzer checks keyword matching, formatting compatibility, and content structure to ensure your resume passes these systems.",
  },
  {
    question: "Can CareerPulse AI help me switch careers?",
    answer:
      "Absolutely! Our Career Path Advisor is specifically designed for career transitions. It identifies transferable skills, recommends upskilling paths, suggests bridge roles, and helps you reframe your experience for new industries. Many successful career switchers have used our platform.",
  },
  {
    question: "Is my data secure on this platform?",
    answer:
      "Security is our top priority. We use bank-level encryption (AES-256) for all data, comply with GDPR and SOC 2 standards, and never share your personal information with third parties. You can export or delete your data at any time from your account settings.",
  },
  {
    question: "Can I get a refund if I'm not satisfied?",
    answer:
      "Yes! We offer a 14-day money-back guarantee for all paid plans. If CareerPulse AI doesn't meet your expectations within the first 14 days, contact our support team for a full refund. No questions asked.",
  },
  {
    question: "Do you offer discounts for students?",
    answer:
      "Yes! Students with a valid .edu email address get 50% off on our Pro plan. We also partner with universities to provide free access through career services departments. Contact us if you'd like to bring CareerPulse AI to your institution.",
  },
]

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section id="faq" className="py-20 px-4 bg-background">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-16">
          <motion.h2
            className="text-4xl font-bold text-white mb-4"
            style={{ fontFamily: "var(--font-playfair)" }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Frequently Asked Questions
          </motion.h2>
          <motion.p
            className="text-xl text-gray-300 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Everything you need to know about CareerPulse AI. Can't find what you're looking for? Contact our support team.
          </motion.p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              className="border border-border/20 rounded-lg bg-card/50 backdrop-blur-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <button
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-white/5 transition-colors rounded-lg"
                onClick={() => toggleFAQ(index)}
              >
                <span className="text-lg font-medium text-white pr-4">{faq.question}</span>
                <ChevronDown
                  className={`h-5 w-5 text-gray-400 transition-transform flex-shrink-0 ${openIndex === index ? "rotate-180" : ""
                    }`}
                />
              </button>

              <motion.div
                initial={false}
                animate={{
                  height: openIndex === index ? "auto" : 0,
                  opacity: openIndex === index ? 1 : 0,
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-4">
                  <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >


        </motion.div>
      </div>
    </section>
  )
}
