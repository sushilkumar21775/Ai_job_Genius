"use client"

import { motion } from "framer-motion"
import { Button } from "./ui/button"
import { Check, ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"

const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    period: "/forever",
    description: "Perfect for students exploring career options",
    features: [
      "3 Resume builds/month",
      "5 AI mock interviews",
      "Basic ATS scoring",
      "Email support",
      "Community access",
      "Career assessment quiz",
    ],
    popular: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    description: "Best for active job seekers",
    features: [
      "Unlimited resume builds",
      "Unlimited mock interviews",
      "Advanced ATS optimization",
      "Priority support",
      "LinkedIn profile optimization",
      "Career path roadmap",
      "Skills assessment & courses",
      "Interview question bank",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For colleges & organizations",
    features: [
      "Everything in Pro",
      "Bulk licenses",
      "Admin dashboard & analytics",
      "Custom branding",
      "Dedicated success manager",
      "API access",
      "SLA guarantee",
      "On-premise deployment option",
    ],
    popular: false,
  },
]

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 px-4 bg-black">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <motion.h2
            className="text-4xl font-bold text-white mb-4"
            style={{ fontFamily: "var(--font-playfair)" }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Simple, Transparent Pricing
          </motion.h2>
          <motion.p
            className="text-xl text-gray-300 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Start free, upgrade when you're ready. No hidden fees.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={plan.name}
              className={`relative bg-card border rounded-lg p-8 ${plan.popular ? "border-white/30 bg-white/5" : "border-border/20 bg-background/50"
                }`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-white text-black px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-400">{plan.period}</span>
                </div>
                <p className="text-gray-300">{plan.description}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center text-gray-300">
                    <Check className="h-5 w-5 text-white mr-3 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full ${plan.popular
                  ? "bg-white text-black hover:bg-white/90"
                  : "bg-transparent border border-white/20 text-white hover:bg-white/10"
                  } group`}
                size="lg"
                asChild
              >
                <Link href={plan.name === "Enterprise" ? "#contact" : "/auth/signup"}>
                  {plan.name === "Enterprise" ? "Contact Sales" : plan.name === "Free" ? "Get Started Free" : "Start Pro Trial"}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
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
          <p className="text-gray-400 mb-4">Pro plan includes 14-day free trial • Cancel anytime</p>
          <p className="text-sm text-gray-500">
            Student discount available!{" "}
            <a href="#" className="text-white hover:underline">
              Verify with your .edu email
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  )
}
