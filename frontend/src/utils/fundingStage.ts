export interface FundingStageOption {
    value: string;
    label: string;
}

export const fundingStageOptions: FundingStageOption[] = [
    { value: "seed", label: "Seed" },
    { value: "series_a", label: "Series A" },
    { value: "series_b", label: "Series B" },
];

export const getFundingStageLabel = (value: string): string => {
    const option = fundingStageOptions.find(opt => opt.value === value);
    return option ? option.label : value;
  };