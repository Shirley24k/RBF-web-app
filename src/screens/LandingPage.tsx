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
          <span className="font-description font-[500] text-black text-[24px] max-md:text-lg max-sm:text-base tracking-[-0.48px] leading-[normal] [font-style:normal]">
            We welcome all{" "}
          </span>
          <span className="font-[600] text-[#574964c7] tracking-[-0.12px] font-description [font-style:normal] leading-[normal] text-[24px] max-md:text-lg max-sm:text-base">
            Malaysia startups
          </span>
          <span className="font-description font-[500] text-black text-[24px] max-md:text-lg max-sm:text-base tracking-[-0.48px] leading-[normal] [font-style:normal]">
            {" "}
            from{" "}
          </span>
          <span className="font-[600] text-[#574964c7] tracking-[-0.48px] font-description [font-style:normal] leading-[normal] text-[24px] max-md:text-lg max-sm:text-base">
            technology
          </span>
          <span className="font-500 tracking-[0] leading-[0.1px]">&nbsp;</span>
          <span className="font-description font-[500] text-black text-[24px] max-md:text-lg max-sm:text-base tracking-[-0.48px] leading-[normal] [font-style:normal]">
            sector who have business model that generates{" "}
          </span>
          <span className="font-[600] text-[#574964c7] tracking-[-0.48px] font-description [font-style:normal] leading-[normal] text-[24px] max-md:text-lg max-sm:text-base">
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
    { icon: <PhoneIcon className="w-6 h-6 max-md:w-5 max-md:h-5 max-sm:w-4 max-sm:h-4" />, text: "+6012-345 6789" },
    { icon: <EnvelopeIcon className="w-6 h-6 max-md:w-5 max-md:h-5 max-sm:w-4 max-sm:h-4" />, text: "rbf@gmail.com" },
    {
      icon: <MapPinIcon className="w-6 h-6 max-md:w-5 max-md:h-5 max-sm:w-4 max-sm:h-4" />,
      text: "Unit 24, Revenue Road, 43000 Selangor, Malaysia.",
    },
  ];

  return (
    <main className="bg-white w-full flex flex-col items-center">
      <div className="w-full">
        <section className="relative w-full bg-light-green pb-12 max-md:pb-8">
          <div className="container mx-auto">
            {/* Header/Navigation */}
            <header className="flex justify-between items-center py-12 max-md:py-8 max-sm:py-6">
              <div className="[font-family:'Irish_Grover',Helvetica] font-normal text-5xl max-md:text-4xl max-sm:text-3xl tracking-[0] leading-[72px] whitespace-nowrap">
                <span className="text-[#073b1d]">R</span>
                <span className="text-[#574964c7]">B</span>
                <span className="text-[#073b1d]">F</span>
              </div>

              <div className="flex items-center gap-4 max-md:gap-2">
                <Button
                  variant="text"
                  className="h-12 max-md:h-10 max-sm:h-8 px-6 max-md:px-4 max-sm:px-3 py-[5px] [font-family:'Roboto',Helvetica] font-bold text-dark-plum text-sm max-md:text-xs bg-transparent hover:bg-light-purple hover:text-white capitalize"
                >
                  <a href="/register">Register</a>
                </Button>

                <Button
                  variant="outlined"
                  className="h-12 max-md:h-10 max-sm:h-8 px-6 max-md:px-4 max-sm:px-3 py-[5px] rounded-lg border border-solid border-light-purple [font-family:'Roboto',Helvetica] font-bold text-dark-plum text-sm max-md:text-xs hover:bg-light-purple hover:text-white capitalize"
                >
                  <a href="/login">Login</a>
                </Button>
              </div>
            </header>

            {/* Hero Content */}
            <div className="flex flex-col md:flex-row items-center mt-24 max-md:mt-16 max-sm:mt-12">
              {/* Image - Show on top for mobile/tablet, right side for desktop */}
              <div className="w-full md:w-1/2 mb-8 max-md:mb-6 max-sm:mb-4 md:mb-0 md:order-2">
                <img
                  className="w-full h-auto object-cover max-w-[992px]"
                  alt="Startup growth and investment"
                  src="/startup-growth-and-investment-transparent-1.png"
                />
              </div>

              {/* Content - Show below image for mobile/tablet, left side for desktop */}
              <div className="w-full md:w-1/2 space-y-12 max-md:space-y-8 max-sm:space-y-6 md:order-1">
                <h1 className="[font-family:'Lora',Helvetica] font-bold text-8xl max-lg:text-6xl max-md:text-4xl max-sm:text-3xl tracking-[-1.92px] text-black leading-tight max-w-[684px]">
                  Revenue-Based Financing
                </h1>

                <p className="[font-family:'Lato',Helvetica] font-normal text-[#000000bf] text-[32px] max-lg:text-2xl max-md:text-xl max-sm:text-lg tracking-[0] leading-[1.5] max-w-[556px]">
                  Get fast capital when you need it, pay it back as you earn -
                  no equity, no dilution
                </p>

                <Button
                  className="px-6 max-md:px-4 max-sm:px-3 py-4 max-md:py-3 max-sm:py-2 bg-dark-plum rounded-lg text-white [font-family:'Roboto',Helvetica] font-medium text-xl max-md:text-lg max-sm:text-base capitalize hover:bg-light-purple"
                  onClick={() => {
                    window.location.href = "/login";
                  }}
                >
                  Get Funded
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full bg-dark-beige py-14">
          <div className="container mx-auto">
            <h2 className="text-center mb-12 max-md:mb-8 max-sm:mb-6 font-section-title font-[600] text-black text-[48px] max-md:text-3xl max-sm:text-2xl tracking-[-0.96px] leading-[normal] [font-style:normal]">
              What is Revenue-Based Financing?
            </h2>

            <div className="flex flex-row max-md:flex-col items-center gap-[130px] max-lg:gap-8 max-sm:gap-6">
              <div className="flex-shrink-0">
                <img
                  className="w-full max-w-[400px] h-auto object-cover rounded-full"
                  alt="Revenue-Based Financing illustration"
                  src="/chatgpt-image-apr-16--2025--10-32-03-pm-photoroom-1.png"
                />
              </div>

              <div className="border-none shadow-none bg-transparent">
                <div className="p-0 space-y-8 max-md:space-y-6 max-sm:space-y-4">
                  <p className="font-description font-[500] text-[24px] max-md:text-lg max-sm:text-base tracking-[-0.48px] text-black leading-[normal] [font-style:normal]">
                    Revenue-Based Financing (RBF) is a flexible approach to fund
                    your business by paying back a percentage of your future
                    monthly revenue.
                  </p>

                  <p className="font-description font-[500] text-black text-[24px] max-md:text-lg max-sm:text-base tracking-[-0.48px] leading-[normal] [font-style:normal]">
                    Repayments in RBF are adjusted based on your business&apos;s
                    performance. When your revenue slows down, you pay less.
                    When you grow, you repay faster. This helps reduce financial
                    strain during slower periods.
                  </p>

                  <div className="font-description font-[500] text-black text-[24px] max-md:text-lg max-sm:text-base tracking-[-0.48px] leading-[normal] [font-style:normal]">
                    <p>RBF is designed to be founder-friendly:</p>
                    <ul className="mt-2 space-y-1 list-disc ml-6 max-md:ml-4">
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

        <section className="w-full bg-light-apple-green py-12 max-md:py-8 max-sm:py-6">
          <div className="container mx-auto">
            <h2 className="text-center mb-16 max-md:mb-12 max-sm:mb-8 font-section-title font-[600] text-black text-[48px] max-md:text-3xl max-sm:text-2xl tracking-[-0.96px] leading-[normal] [font-style:normal]">
              Why Choose Us?
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-md:gap-6 max-sm:gap-4">
              {featureCards.map((card) => (
                <div key={card.id} className="border-none bg-transparent">
                  <div className="flex flex-col items-center pt-6 max-md:pt-4 px-4 max-md:px-2">
                    <img
                      className="w-[120px] h-[120px] max-md:w-[100px] max-md:h-[100px] max-sm:w-[80px] max-sm:h-[80px] mb-5 max-md:mb-4 max-sm:mb-3 object-cover"
                      alt={card.imageAlt}
                      src={card.image}
                    />
                    <h3 className="mb-4 max-md:mb-3 max-sm:mb-2 [font-family:'Lora',Helvetica] font-semibold text-black text-[32px] max-md:text-2xl max-sm:text-xl text-center tracking-[-0.64px] leading-[normal]">
                      {card.title}
                    </h3>
                    <p className="font-description font-[500] text-black text-[24px] max-md:text-lg max-sm:text-base text-center tracking-[-0.48px] leading-[normal] [font-style:normal]">
                      {card.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full py-16 max-md:py-12 max-sm:py-8 bg-warm-off-white">
          <div className="container mx-auto">
            <h2 className="text-center mb-16 max-md:mb-12 max-sm:mb-8 font-section-title font-[600] text-black text-[48px] max-md:text-3xl max-sm:text-2xl tracking-[-0.96px] leading-[normal] [font-style:normal]">
              Unlock Capital in Few Steps
            </h2>

            <div className="max-w-4xl mx-auto bg-transparent border-none shadow-none">
              <div className="p-0">
                <div className="relative">
                  {/* Timeline line */}
                  <div
                    className="absolute left-[12.5px] max-md:left-[10px] max-sm:left-[8px] top-[0px] w-[5px] h-full bg-no-repeat bg-center"
                    style={{ backgroundImage: "url('/line-2.svg')" }}
                  />

                  {/* Timeline steps */}
                  <div className="flex flex-col gap-[50px] max-md:gap-8 max-sm:gap-6">
                    {fundingSteps.map((step, index) => (
                      <div key={step.id} className="flex items-start gap-12 max-md:gap-8 max-sm:gap-6">
                        {/* Timeline marker */}
                        <div
                          className={`relative my-[auto] w-[30px] h-[30px] max-md:w-[25px] max-md:h-[25px] max-sm:w-[20px] max-sm:h-[20px] bg-[#d9d9d9] rounded-[15px] max-md:rounded-[12px] max-sm:rounded-[10px] flex-shrink-0 ${
                            index === 0 ? "rotate-180" : ""
                          }`}
                        />

                        {/* Step content */}
                        <div className="flex flex-col gap-[13px] max-md:gap-2 max-sm:gap-1">
                          <h3 className="[font-family:'Lora',Helvetica] font-semibold text-black text-[32px] max-md:text-2xl max-sm:text-xl tracking-[-0.64px] leading-[normal]">
                            {step.title}
                          </h3>
                          <div
                            className={
                              typeof step.description === "string"
                                ? "font-description font-[500] text-black text-[24px] max-md:text-lg max-sm:text-base tracking-[-0.48px] leading-[normal] [font-style:normal]"
                                : "relative text-2xl max-md:text-xl max-sm:text-lg leading-6"
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
        <footer className="w-full bg-dark-plum py-12 max-md:py-8 max-sm:py-6 px-6 max-md:px-4 max-sm:px-3">
          <div className="container mx-auto ">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-md:gap-6 max-sm:gap-4">
              {/* Logo and Social Icons */}
              <div className="flex flex-col gap-8 max-md:gap-6 max-sm:gap-4">
                <div className="font-['Irish_Grover',Helvetica] font-normal text-4xl max-md:text-3xl max-sm:text-2xl leading-[54px]">
                  <span className="text-[#f7f7e8]">R</span>
                  <span className="text-[#d1c4e9]">B</span>
                  <span className="text-[#f7f7e8]">F</span>
                </div>

                <div className="flex items-start gap-2">
                  {socialIcons.map((icon, index) => (
                    <div
                      key={index}
                      className="w-10 h-10 max-md:w-8 max-md:h-8 max-sm:w-6 max-sm:h-6 rounded flex items-center justify-center"
                    >
                      <div className="w-6 h-6 max-md:w-5 max-md:h-5 max-sm:w-4 max-sm:h-4 flex items-center justify-center">
                        <img
                          className="w-5 h-5 max-md:w-4 max-md:h-4 max-sm:w-3 max-sm:h-3"
                          alt={icon.alt}
                          src={icon.src}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col md:flex-row justify-end gap-32 max-md:gap-16 max-sm:gap-8">
                <div className="flex flex-col gap-6 max-md:gap-4 max-sm:gap-3">
                  <div className="font-small-text font-semibold text-beige text-[16px] tracking-[0px] leading-[150%] font-normal">
                    Resources
                  </div>

                  {resourceLinks.map((link, index) => (
                    <div
                      key={index}
                      className="font-small-text font-medium text-beige text-[16px] tracking-[0px] leading-[150%] font-normal"
                    >
                      <a href={link.link}>{link.title}</a>
                    </div>
                  ))}
                </div>

                {/* Contact Us Section */}
                <div className="flex flex-col gap-6 max-md:gap-4 max-sm:gap-3">
                  <div className="font-small-text font-semibold text-beige text-[16px] tracking-[0px] leading-[150%] font-normal">
                    Contact Us
                  </div>

                  <div className="flex flex-col gap-8 max-md:gap-6 max-sm:gap-4">
                    {contactInfo.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-4 max-md:gap-3 max-sm:gap-2 text-white"
                      >
                        {item.icon}
                        <div className="font-small-text font-medium text-beige text-[16px] tracking-[0px] leading-[150%] font-normal">
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
