/**
 * Centralized Professional NDA Legal Template & Configuration
 * Modeled after Magic Scale Restaurant Consultant / trueHR Corporate Agreement Architecture.
 */

export const NDA_THEME = {
  primary: "#1b1cfe",
  fontFamily: "Poppins",
};

export const NDA_WHEREAS = [
  "The Company is engaged in specialized restaurant consultancy, food & beverage enterprise solutions, proprietary business operations, digital marketing, and workforce management, possessing valuable trade secrets, software assets, customer pipelines, and confidential operational methods.",
  "The Receiving Party is being engaged by the Company in a trusted position of employment, consulting, sales, marketing, technical support, customer support, or other assigned duties, and will have direct access to, receive, or generate highly confidential, proprietary, and commercial information vital to the business competitiveness of the Company.",
  "The parties desire to formally enter into this legally binding Non-Disclosure Agreement to define their respective rights and legal obligations regarding confidentiality, non-compete, non-solicitation, intellectual property ownership, liquidated damages, and statutory compliance under the laws of India.",
];

export const NDA_SECTIONS = [
  {
    number: "1. Purpose & Scope of Engagement",
    paragraphs: [
      "The Receiving Party will have access to confidential and proprietary information belonging to the Company while performing employment, consulting, sales, technical support, marketing, customer support, or any other assigned duties.",
      "The Receiving Party agrees to protect all confidential information and use it solely and strictly for authorized official business purposes in furtherance of the Company's bona fide interests.",
    ],
  },
  {
    number: "2. Definition of Confidential Information",
    intro: "For the purposes of this Agreement, \"Confidential Information\" includes, but is not limited to, all non-public, proprietary, or sensitive technical, operational, and commercial information disclosed by the Company to the Receiving Party, whether shared verbally, digitally, in writing, or in printed form:",
    bullets: [
      "Customer Database, Lead Database, CRM Data, and Restaurant Owner Contact Details.",
      "Sales Pipeline, Pricing Structures, Commercial Margin Models, and Billing Software Information.",
      "Proprietary Source Code, Database Schemas, Software Architecture, System APIs, and Technical Credentials.",
      "Standard Operating Procedures (SOPs), Training Materials, Sales Scripts, and Internal Playbooks.",
      "Marketing Strategies, Advertisement Campaigns (including Facebook Ads, Google Ads, and Performance Marketing Matrices).",
      "WhatsApp Marketing Templates, Messaging Workflows, and Lead Generation Funnels.",
      "Vendor Information, Financial Information, Revenue Reports, Profit Margins, and Compensation Records.",
      "Business Plans, Future Product Roadmaps, Passwords, Login Credentials, and any document marked Confidential.",
    ],
    note: "Any information shared with the Receiving Party that is not publicly known or that a reasonable person would understand to be proprietary shall be treated as Confidential Information.",
  },
  {
    number: "3. Obligations of the Receiving Party",
    intro: "The Receiving Party covenants, agrees, and undertakes that throughout their engagement and thereafter, they shall:",
    bullets: [
      "Keep all Confidential Information strictly confidential and apply reasonable and customary corporate security precautions.",
      "Not disclose, leak, publish, or transmit any Confidential Information to any third party without prior written authorization.",
      "Not copy, download, export, forward, or store Company information or databases for personal use or unauthorized distribution.",
      "Not use Company information, data, or client pipelines for any business or venture other than authorized Company work.",
      "Diligently safeguard all system passwords, access tokens, and administrative credentials against unauthorized access.",
      "Promptly notify the Company in writing immediately upon discovering any loss, security breach, unauthorized disclosure, or data leak.",
    ],
  },
  {
    number: "4. Non-Compete Covenants",
    intro: "During the term of employment or engagement with the Company, the Receiving Party shall not directly or indirectly:",
    bullets: [
      "Start, operate, manage, invest in, or consult for any competing restaurant consultancy or F&B solutions business.",
      "Work for, render services to, or assist any direct competitor of the Company without prior written permission from executive management.",
      "Copy, replicate, or appropriate the Company's business model, service packages, pricing formulas, SOPs, proprietary software, marketing materials, or operational processes.",
    ],
  },
  {
    number: "5. Non-Solicitation Covenants",
    intro: "The Receiving Party agrees that during the term of engagement and for a period of twenty-four (24) months following separation from the Company for any reason whatsoever, they shall not:",
    bullets: [
      "Contact or solicit Company clients, restaurant partners, or leads for competing products or services.",
      "Solicit, divert, or attempt to divert business from any customer or client of the Company.",
      "Hire, recruit, or induce any Company employee, freelancer, or consultant to terminate their relationship with the Company.",
      "Encourage, advise, or induce any client, vendor, or partner to cease or diminish doing business with the Company.",
    ],
  },
  {
    number: "6. Intellectual Property & Work-for-Hire Assignment",
    paragraphs: [
      "All work created, authored, conceived, or developed during the course of employment or engagement—including but not limited to designs, documents, sales materials, videos, training modules, software improvements, source code, marketing content, templates, databases, reports, and presentations—shall remain the exclusive property of the Company.",
      "All such creations constitute \"Works Made for Hire\" under applicable intellectual property laws. The Receiving Party hereby irrevocably and unconditionally assigns and transfers to the Company all worldwide rights, title, copyright, patents, and interest without limitation of duration or jurisdiction. No ownership rights or licenses are transferred to the Receiving Party.",
    ],
  },
  {
    number: "7. Return of Company Property & Digital Asset Deletion",
    intro: "Immediately upon termination of employment or engagement, or at any time upon written demand by the Company, the Receiving Party shall:",
    bullets: [
      "Surrender and return all Company hardware, laptops, mobile devices, files, hard drives, documents, customer lists, and marketing assets.",
      "Surrender all passwords, access credentials, CRM logins, and software accounts associated with Company operations.",
      "Permanently delete all Company information, databases, and client records from all personal devices, mobile phones, and private cloud storage, and certify compliance in writing.",
    ],
  },
  {
    number: "8. Term & Survival of Obligations",
    paragraphs: [
      "This Agreement remains in full force and effect throughout the Receiving Party's employment or engagement and continues in effect for five (5) years after the relationship ends with respect to Confidential Information, unless applicable law mandates a longer period or the information lawfully enters the public domain through no breach by the Receiving Party.",
      "Proprietary software, trade secrets, algorithms, and source code shall remain strictly confidential in perpetuity.",
    ],
  },
  {
    number: "9. Breach of Confidentiality, Liquidated Damages & Legal Remedies",
    paragraphs: [
      "If the Receiving Party breaches this Agreement by disclosing, copying, using, or misappropriating Company Confidential Information without prior written authorization, the Receiving Party shall be liable for all losses, damages, and legal expenses incurred by the Company.",
    ],
    intro: "The Company shall have the absolute right to seek and enforce:",
    bullets: [
      "Immediate ex-parte injunctive relief or specific performance to halt further disclosure, misuse, or trade secret infringement without posting a bond.",
      "Recovery of actual damages, loss of business profits, and legal costs as determined by a competent court or arbitral forum.",
      "Liquidated damages of ₹2,00,000 (Rupees Two Lakhs Only) for each material breach, without prejudice to the Company's right to claim higher actual damages if the total financial loss exceeds this amount, to the extent permitted by law.",
      "Initiation of appropriate civil and criminal proceedings under the laws of India. If customer databases, software code, credentials, or trade secrets are stolen or leaked, statutory criminal provisions—including the Bharatiya Nyaya Sanhita (BNS) and Section 43, 66 & 72 of the Information Technology Act, 2000—may apply, punishable with fines and imprisonment as adjudicated by a competent court.",
    ],
  },
  {
    number: "10. Governing Law & Dispute Jurisdiction",
    paragraphs: [
      "This Agreement shall be governed by, construed, and enforced in accordance with the laws of India. Any dispute, claim, or controversy arising out of or relating to this Agreement, including its interpretation, performance, breach, validity, or termination, shall be subject to the exclusive jurisdiction of the competent courts at New Delhi, Delhi (or the location of the Company's registered office).",
    ],
  },
  {
    number: "11. Entire Agreement & Electronic Signature Enforceability",
    paragraphs: [
      "This Agreement constitutes the entire and comprehensive understanding between the parties regarding confidentiality, proprietary rights, and restrictive covenants, and supersedes all prior oral or written agreements, representations, and negotiations.",
      "In accordance with Section 10A of the Information Technology Act, 2000, execution of this Agreement via electronic signature is legally binding, admissible in a court of law, and holds the same legal validity and enforceability as a physical handwritten wet-ink signature.",
    ],
  },
];

/**
 * Normalizes dynamic data for rendering the agreement.
 */
export function getAgreementData({ formData = {}, organization = null, companyDetails = null, date = new Date() }) {
  const formattedDate = new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date instanceof Date ? date : new Date(date));

  const clientName = `${formData.firstName || ""} ${formData.lastName || ""}`.trim() || "Employee / Consultant";
  const clientAddress = [
    formData.currentStreet,
    formData.currentCity,
    formData.currentState,
    formData.currentPostalCode,
    formData.currentCountry || "India",
  ]
    .filter(Boolean)
    .join(", ") || "Residential Address on File";

  const logoUrl =
    organization?.imageUrl ||
    organization?.logo ||
    (companyDetails?.logo && companyDetails.logo !== "/assets/icons/logo.png" ? companyDetails.logo : null) ||
    companyDetails?.logo ||
    "/assets/icons/logo.png";

  const company = {
    name: companyDetails?.name || organization?.name || "Magic Scale Restaurant Consultant",
    address: companyDetails?.address || "Registered Corporate Office, New Delhi, India",
    phone: companyDetails?.phone || "+91 92895 07882",
    website: companyDetails?.website || "https://kravy.in",
    representative: companyDetails?.representative || (organization?.name ? `${organization.name} Operations` : "Director / Authorized Signatory"),
    designation: companyDetails?.designation || "Authorized Signatory",
    logo: logoUrl,
  };

  const client = {
    name: clientName,
    representative: `${clientName} (${formData.designation || "Employee / Consultant"})`,
    address: clientAddress,
    department: formData.department || "Operations & Consulting",
    designation: formData.designation || "Consultant",
    email: formData.email || "Confidential",
    phone: formData.phone || "Confidential",
  };

  return {
    date: formattedDate,
    company,
    client,
    agreement: {
      date: formattedDate,
      start: formattedDate,
      duration: "Permanent / Full-Time",
    },
  };
}
