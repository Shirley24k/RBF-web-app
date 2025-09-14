export interface IndustryOption {
  value: string;
  label: string;
}

export const industryOptions: IndustryOption[] = [
  { value: 'SaaS', label: 'SaaS (Software as a Service)' },
  { value: 'FinTech', label: 'FinTech (Financial Technology)' },
  { value: 'HealthTech', label: 'HealthTech (Healthcare Technology)' },
  { value: 'EdTech', label: 'EdTech (Educational Technology)' },
  { value: 'AI_ML', label: 'AI & Machine Learning' },
  { value: 'Blockchain', label: 'Blockchain & Cryptocurrency' },
  { value: 'IoT', label: 'IoT (Internet of Things)' },
  { value: 'Cybersecurity', label: 'Cybersecurity' },
  { value: 'Cloud_Computing', label: 'Cloud Computing' },
  { value: 'Data_Analytics', label: 'Data Analytics & BI' },
  { value: 'AR_VR', label: 'AR/VR (Augmented/Virtual Reality)' },
  { value: 'Robotics', label: 'Robotics & Automation' },
  { value: 'Quantum_Computing', label: 'Quantum Computing' },
  { value: 'Biotech', label: 'Biotechnology' },
  { value: 'CleanTech', label: 'CleanTech & Sustainability' },
  { value: 'AgriTech', label: 'AgriTech (Agricultural Technology)' },
  { value: 'Logistics_Tech', label: 'Logistics & Supply Chain Tech' },
  { value: 'E_Commerce', label: 'E-Commerce & Retail Tech' },
  { value: 'Gaming', label: 'Gaming & Entertainment Tech' },
  { value: 'Social_Media', label: 'Social Media & Communication' },
  { value: 'Other_Tech', label: 'Other Technology' },
];

export const getIndustryLabel = (value: string): string => {
  const option = industryOptions.find(opt => opt.value === value);
  return option ? option.label : value;
};

