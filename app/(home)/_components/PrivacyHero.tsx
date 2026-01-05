"use client";

import { Home } from "lucide-react";

export default function PrivacyHero() {
  return (
    <section className="bg-gray-200 flex flex-col items-center min-h-screen overflow-x-hidden">
      <div className="flex flex-col items-center py-20 px-4 sm:px-10 md:px-[140px] space-y-20 w-full">

        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 pb-5 text-sm sm:text-base w-full max-w-[1026px]">
          <button><Home className="text-primary" /></button>
          <p>/</p>
          <button className="text-[#142141]">Search</button>
          <p>/</p>
          <button>Privacy Policy</button>
        </div>

        {/* Content */}
        <div className="w-full max-w-[1026px] space-y-5">
          <div className="flex flex-col lg:flex-row lg:space-x-20 space-y-10 lg:space-y-0">

            {/* Table of Content */}
            <div className="space-y-5 w-full lg:w-auto">
              <h2>Table of Content</h2>
              <div>Introduction</div>
              <div>Information we collect</div>
              <div>How We Use Your Information</div>
              <div>How we share your Information</div>
              <div>Data Security</div>
              <div>Your Rights</div>
              <div>Changes to This Policy</div>
              <div>Contact</div>
            </div>

            {/* Main Policy Content */}
            <div className="w-full lg:w-[726px] space-y-5">
              <div className="space-y-5">
                <h2 className="text-[#0F0202] text-[30px]">
                  Privacy Policy - Momentev
                </h2>
                <p>
                  At Momentev, we value your privacy and trust above all. This policy
                  explains how we collect, use, and safeguard the information you
                  share with us while using our platform. Our aim is to be transparent,
                  so you can enjoy Momentev’s services with confidence and peace of mind.
                </p>
              </div>

              <ol className="space-y-5">
                <li>
                  <h4 className="font-semibold">Introduction</h4>
                  <p className="pl-15 space-y-2 w-full lg:w-[676px]">
                    Your privacy is important to us. This Privacy Policy explains how we
                    collect, use, and protect your personal information when you use our
                    services. By using our platform, you agree to the terms outlined here.
                  </p>
                </li>

                <li>
                  <h4 className="font-semibold">Informations we collect</h4>
                  <ul className="list-disc pl-20 space-y-2 w-full lg:w-[676px]">
                    <li>
                      <span className="underline">Personal Information:</span> Name,
                      email, phone number, and other information you provide when
                      registering or contacting us.
                    </li>
                    <li>
                      <span className="underline">Usage Data:</span> How you interact
                      with our services, including pages visited, features used, and
                      device information.
                    </li>
                    <li>
                      <span className="underline">Cookies & Tracking:</span> We use
                      cookies and similar technologies to improve your experience.
                    </li>
                  </ul>
                </li>

                <li>
                  <h4 className="font-semibold">How we use your Information</h4>
                  <ul className="list-disc pl-20 space-y-2 w-full lg:w-[676px]">
                    <li>To provide, maintain, and improve our services.</li>
                    <li>To communicate with you about updates, promotions, and support.</li>
                    <li>To personalize your experience and provide relevant content.</li>
                    <li>To comply with legal obligations and prevent fraud.</li>
                  </ul>
                </li>

                <li>
                  <h4 className="font-semibold">How we share your Information</h4>
                  <ul className="list-disc pl-20 space-y-2 w-full lg:w-[676px]">
                    <li>We do not sell your personal information.</li>
                    <li>
                      We may share information with trusted third-party service providers
                      who help us operate our services.
                    </li>
                    <li>
                      We may disclose information when required by law or to protect
                      rights, safety, or property.
                    </li>
                  </ul>
                </li>

                <li>
                  <h4 className="font-semibold">Data Security</h4>
                  <p className="pl-20">
                    We implement reasonable security measures to protect your data, but
                    no method is 100% secure.
                  </p>
                </li>

                <li>
                  <h4 className="font-semibold">Your Right</h4>
                  <ul className="list-disc pl-20 space-y-2 w-full lg:w-[676px]">
                    <li>Access, correct, or delete your personal data.</li>
                    <li>Opt out of promotional communications.</li>
                    <li>Contact us for questions about your privacy.</li>
                  </ul>
                </li>

                <li>
                  <h4 className="font-semibold">Changes To this Policy</h4>
                  <p className="pl-20">
                    We may update this policy from time to time. Changes will be posted
                    here with the updated effective date.
                  </p>
                </li>

                <li>
                  <h4 className="font-semibold">Contact Us</h4>
                  <p className="pl-20">
                    For any questions about this Privacy Policy, please contact us.
                  </p>
                </li>
              </ol>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
