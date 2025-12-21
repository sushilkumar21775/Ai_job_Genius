import { CareerPulseLogo } from "./careerpulse-logo"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-black border-t border-white/10 py-12 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <CareerPulseLogo className="mb-4" />
            <p className="text-white/70 mb-4 max-w-md">
              Empowering millions to land their dream careers with AI-powered coaching, resume building, and interview preparation.
            </p>
            <p className="text-sm text-white/50 italic">"Your AI-Powered Career Accelerator"</p>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Product</h3>
            <ul className="space-y-2 text-white/70">
              <li>
                <Link href="#features" className="hover:text-white transition-colors">
                  AI Resume Builder
                </Link>
              </li>
              <li>
                <Link href="#features" className="hover:text-white transition-colors">
                  Mock Interviews
                </Link>
              </li>
              <li>
                <Link href="#features" className="hover:text-white transition-colors">
                  ATS Optimizer
                </Link>
              </li>
              <li>
                <Link href="#features" className="hover:text-white transition-colors">
                  Career Advisor
                </Link>
              </li>
              <li>
                <Link href="#features" className="hover:text-white transition-colors">
                  Skills Assessment
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-2 text-white/70">
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Success Stories
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-white/50 text-sm">
          <p>&copy; 2024 CareerPulse AI. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-white transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
