import { EnvelopeIcon } from "@heroicons/react/24/outline";
import { MapPinIcon, PhoneIcon } from "@heroicons/react/24/solid";
import { Button } from "@material-tailwind/react";

export const LandingPage = (): JSX.Element => {
  const rbfBenefits = [
    "No equity dilution - you keep full control of your company.",
    "No personal guarantees or collateral - No personal assets are required.",
    "Flexible repayments - your repayments scale with your revenue.",
    "Fast, data-driven approvals - no more weeks-long waits and credit checks.",
  ];

  const featureCards = [
    {
      id: 1,
      image: "/term-loan.png",
      imageAlt: "Term loan",
      title: "Flexible Repayments",
      description:
        "No fixed monthly repayment. RBF repayments are tied to your revenue.",
    },
    {
      id: 2,
      image: "/network.png",
      imageAlt: "Network",
      title: "Secure & Verified Network",
      description:
        "Connect with a network of verified investors and potential startups to ensure a trustworthy funding environment.",
    },
    {
      id: 3,
      image: "/check-1.png",
      imageAlt: "Check",
      title: "Fast & Intelligent Credit Check",
      description:
        "Our system uses machine learning to assess startup's financial health",
    },
    {
      id: 4,
      image: "/match-1.png",
      imageAlt: "Match",
      title: "Startup-Investor Matchmaking",
      description:
        "Get the right fit by matching with investors based on startup's funding needs and investors' preferences",
    },
  ];

  const fundingSteps = [
    {
      id: 1,
      title: "Check your eligibility",
      description: (
        <>
          <span className="font-description font-[500] text-black text-[24px] tracking-[-0.48px] leading-[normal] [font-style:normal]">
            We welcome all{" "}
          </span>
          <span className="font-[600] text-[#574964c7] tracking-[-0.12px] font-description [font-style:normal] leading-[normal] text-[24px]">
            Malaysia startups
          </span>
          <span className="font-description font-[500] text-black text-[24px] tracking-[-0.48px] leading-[normal] [font-style:normal]">
            {" "}
            from{" "}
          </span>
          <span className="font-[600] text-[#574964c7] tracking-[-0.48px] font-description [font-style:normal] leading-[normal] text-[24px]">
            technology
          </span>
          <span className="font-500 tracking-[0] leading-[0.1px]">&nbsp;</span>
          <span className="font-description font-[500] text-black text-[24px] tracking-[-0.48px] leading-[normal] [font-style:normal]">
            sector who have business model that generates{" "}
          </span>
          <span className="font-[600] text-[#574964c7] tracking-[-0.48px] font-description [font-style:normal] leading-[normal] text-[24px]">
            predictable revenue stream
          </span>
        </>
      ),
    },
    {
      id: 2,
      title: "Submit application online",
      description: "Submit your funding application with business proposal",
    },
    {
      id: 3,
      title: "Select investor & get approval",
      description:
        "From the list of recommended investors, you can send your application to your selected investor and wait for investor accepts your application. If your application is rejected, you can resend application to other recommended investor.",
    },
    {
      id: 4,
      title: "Negotiate funding terms",
      description:
        "Startup proceeds to negotiate funding terms with the selected investor. After negotiation, both parties sign an agreement and upload to our platform.",
    },
    {
      id: 5,
      title: "Receive funds",
      description:
        "Upon approval from administrator, fund will be disbursed automatically to your bank account.",
    },
  ];

  const socialIcons = [
    { src: "/icon-1.svg", alt: "Icon" },
    { src: "/icon-2.svg", alt: "Icon" },
    { src: "/icon.svg", alt: "Icon" },
    { src: "/icon-3.svg", alt: "Icon" },
  ];

  const resourceLinks = [
    { title: "Home", link: "/" },
    { title: "Login", link: "/login" },
  ];

  const contactInfo = [
    { icon: <PhoneIcon className="w-6 h-6" />, text: "+6012-345 6789" },
    { icon: <EnvelopeIcon className="w-6 h-6" />, text: "revenueup@gmail.com" },
    {
      icon: <MapPinIcon className="w-6 h-6" />,
      text: "Unit 24, Revenue Road, 43000 Selangor, Malaysia.",
    },
  ];

  return (
    <main className="bg-white w-full flex flex-col items-center">
      <div className="w-full">
        <section className="relative w-full bg-light-green py-12 md:py-0 min-h-[917px]">
          <div className="container mx-auto">
            {/* Header/Navigation */}
            <header className="flex justify-between items-center py-12">
              <div className="[font-family:'Irish_Grover',Helvetica] font-normal text-5xl tracking-[0] leading-[72px] whitespace-nowrap">
                <span className="text-[#073b1d]">R</span>
                <span className="text-[#574964c7]">B</span>
                <span className="text-[#073b1d]">F</span>
              </div>

              <div className="flex items-center gap-4">
                <Button
                  variant="text"
                  className="h-12 px-6 py-[5px] [font-family:'Roboto',Helvetica] font-bold text-dark-plum text-sm bg-transparent hover:bg-light-purple hover:text-white capitalize"
                >
                  <a href="/register">Register</a>
                </Button>

                <Button
                  variant="outlined"
                  className="h-12 px-6 py-[5px] rounded-lg border border-solid border-light-purple [font-family:'Roboto',Helvetica] font-bold text-dark-plum text-sm hover:bg-light-purple hover:text-white capitalize"
                >
                  <a href="/login">Login</a>
                </Button>
              </div>
            </header>

            {/* Hero Content */}
            <div className="flex flex-col md:flex-row items-center mt-12 md:mt-24">
              <div className="md:w-1/2 space-y-12">
                <h1 className="[font-family:'Lora',Helvetica] font-bold text-5xl md:text-8xl tracking-[-1.92px] text-black leading-tight max-w-[684px]">
                  Revenue-Based Financing
                </h1>

                <p className="[font-family:'Lato',Helvetica] font-normal text-[#000000bf] text-xl md:text-[32px] tracking-[0] leading-[1.5] max-w-[556px]">
                  Get fast capital when you need it, pay it back as you earn -
                  no equity, no dilution
                </p>

                <Button
                  className="px-6 py-4 bg-dark-plum rounded-lg text-white [font-family:'Roboto',Helvetica] font-medium text-xl capitalize hover:bg-light-purple"
                  onClick={() => {
                    window.location.href = "/login";
                  }}
                >
                  Get Funded
                </Button>
              </div>

              <div className="md:w-1/2 mt-8 md:mt-0">
                <img
                  className="w-full h-auto object-cover max-w-[992px]"
                  alt="Startup growth and investment"
                  src="/startup-growth-and-investment-transparent-1.png"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="w-full bg-dark-beige py-14">
          <div className="container mx-auto px-4">
            <h2 className="text-center mb-12 font-section-title font-[600] text-black text-[48px] tracking-[-0.96px] leading-[normal] [font-style:normal]">
              What is Revenue-Based Financing?
            </h2>

            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-[130px]">
              <div className="flex-shrink-0">
                <img
                  className="w-full max-w-[489px] h-auto object-cover rounded-full"
                  alt="Revenue-Based Financing illustration"
                  src="/chatgpt-image-apr-16--2025--10-32-03-pm-photoroom-1.png"
                />
              </div>

              <div className="border-none shadow-none bg-transparent">
                <div className="p-0 space-y-8">
                  <p className="font-description font-[500] text-[24px] tracking-[-0.48px] text-black leading-[normal] [font-style:normal]">
                    Revenue-Based Financing (RBF) is a flexible approach to fund
                    your business by paying back a percentage of your future
                    monthly revenue.
                  </p>

                  <p className="font-description font-[500] text-black text-[24px] tracking-[-0.48px] leading-[normal] [font-style:normal]">
                    Repayments in RBF are adjusted based on your business&apos;s
                    performance. When your revenue slows down, you pay less.
                    When you grow, you repay faster. This helps reduce financial
                    strain during slower periods.
                  </p>

                  <div className="font-description font-[500] text-black text-[24px] tracking-[-0.48px] leading-[normal] [font-style:normal]">
                    <p>RBF is designed to be founder-friendly:</p>
                    <ul className="mt-2 space-y-1 list-disc ml-6">
                      {rbfBenefits.map((benefit, index) => (
                        <li key={index}>{benefit}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full bg-light-apple-green py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-center mb-16 font-section-title font-[600] text-black text-[48px] tracking-[-0.96px] leading-[normal] [font-style:normal]">
              Why Choose Us?
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {featureCards.map((card) => (
                <div key={card.id} className="border-none bg-transparent">
                  <div className="flex flex-col items-center pt-6 px-4">
                    <img
                      className="w-[120px] h-[120px] mb-5 object-cover"
                      alt={card.imageAlt}
                      src={card.image}
                    />
                    <h3 className="mb-4 [font-family:'Lora',Helvetica] font-semibold text-black text-[32px] text-center tracking-[-0.64px] leading-[normal]">
                      {card.title}
                    </h3>
                    <p className="font-description font-[500] text-black text-[24px] text-center tracking-[-0.48px] leading-[normal] [font-style:normal]">
                      {card.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full py-16 bg-warm-off-white">
          <div className="container mx-auto px-4">
            <h2 className="text-center mb-16 font-section-title font-[600] text-black text-[48px] tracking-[-0.96px] leading-[normal] [font-style:normal]">
              Unlock Capital in Few Steps
            </h2>

            <div className="max-w-4xl mx-auto bg-transparent border-none shadow-none">
              <div className="p-0">
                <div className="relative">
                  {/* Timeline line */}
                  <div
                    className="absolute left-3.5 top-[30px] w-[5px] h-[calc(100%-60px)] bg-no-repeat bg-center"
                    style={{ backgroundImage: "url('/line-2.svg')" }}
                  />

                  {/* Timeline steps */}
                  <div className="flex flex-col gap-[50px]">
                    {fundingSteps.map((step, index) => (
                      <div key={step.id} className="flex items-start gap-12">
                        {/* Timeline marker */}
                        <div
                          className={`relative my-[auto] w-[30px] h-[30px] bg-[#d9d9d9] rounded-[15px] flex-shrink-0 ${
                            index === 0 ? "rotate-180" : ""
                          }`}
                        />

                        {/* Step content */}
                        <div className="flex flex-col gap-[13px]">
                          <h3 className="[font-family:'Lora',Helvetica] font-semibold text-black text-[32px] tracking-[-0.64px] leading-[normal]">
                            {step.title}
                          </h3>
                          <div
                            className={
                              typeof step.description === "string"
                                ? "font-description font-[500] text-black text-[24px] tracking-[-0.48px] leading-[normal] [font-style:normal]"
                                : "relative text-2xl leading-6"
                            }
                          >
                            {step.description}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <footer className="w-full bg-dark-plum py-12 px-6">
          <div className="container mx-auto ">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Logo and Social Icons */}
              <div className="flex flex-col gap-8">
                <div className="font-['Irish_Grover',Helvetica] font-normal text-4xl leading-[54px]">
                  <span className="text-[#f7f7e8]">R</span>
                  <span className="text-[#d1c4e9]">B</span>
                  <span className="text-[#f7f7e8]">F</span>
                </div>

                <div className="flex items-start gap-2">
                  {socialIcons.map((icon, index) => (
                    <div
                      key={index}
                      className="w-10 h-10 rounded flex items-center justify-center"
                    >
                      <div className="w-6 h-6 flex items-center justify-center">
                        <img
                          className="w-5 h-5"
                          alt={icon.alt}
                          src={icon.src}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col md:flex-row justify-end gap-32">
                <div className="flex flex-col gap-6">
                  <div className="font-small-text font-[number:var(--small-text-font-weight)] text-beige text-[length:var(--small-text-font-size)] tracking-[var(--small-text-letter-spacing)] leading-[var(--small-text-line-height)] [font-style:var(--small-text-font-style)]">
                    Resources
                  </div>

                  {resourceLinks.map((link, index) => (
                    <div
                      key={index}
                      className="font-small-text font-[number:var(--small-text-font-weight)] text-beige text-[length:var(--small-text-font-size)] tracking-[var(--small-text-letter-spacing)] leading-[var(--small-text-line-height)] [font-style:var(--small-text-font-style)]"
                    >
                      <a href={link.link}>{link.title}</a>
                    </div>
                  ))}
                </div>

                {/* Contact Us Section */}
                <div className="flex flex-col gap-6">
                  <div className="font-small-text font-[number:var(--small-text-font-weight)] text-beige text-[length:var(--small-text-font-size)] tracking-[var(--small-text-letter-spacing)] leading-[var(--small-text-line-height)] [font-style:var(--small-text-font-style)]">
                    Contact Us
                  </div>

                  <div className="flex flex-col gap-8">
                    {contactInfo.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-4 text-white"
                      >
                        {item.icon}
                        <div className="font-small-text font-[number:var(--small-text-font-weight)] text-beige text-[length:var(--small-text-font-size)] tracking-[var(--small-text-letter-spacing)] leading-[var(--small-text-line-height)] [font-style:var(--small-text-font-style)]">
                          {item.text}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
};
