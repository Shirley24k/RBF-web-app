import {
  Button,
  Option,
  Select,
  Slider,
  Typography,
} from "@material-tailwind/react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Sidenav } from "../../components/sidenav";
import axios from "axios";

export const EditProfile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Initial values from previous page
  const investment_preferences = location.state || {};

  const [selectedIndustries, setSelectedIndustries] = useState<string[]>(
    investment_preferences.preferred_industry || []
  );
  const [investmentRange, setInvestmentRange] = useState(
    investment_preferences.investment_amount_range || ""
  );
  const [selectedStage, setSelectedStage] = useState<string[]>(
    investment_preferences.preferred_funding_stage || []
  );
  const [revenueShare, setRevenueShare] = useState<number>(
    investment_preferences.revenue_share_percentage || 0
  );

  const toggleMultiSelect = (
    value: string,
    selected: string[],
    setSelected: (val: string[]) => void
  ) => {
    if (selected.includes(value)) {
      setSelected(selected.filter((item) => item !== value));
    } else {
      setSelected([...selected, value]);
    }
  };

  const handleSave = async () => {
    const investment_preferences = {
      preferred_industry: selectedIndustries,
      investment_amount_range: investmentRange,
      preferred_funding_stage: selectedStage,
      revenue_share_percentage: revenueShare,
    }
    await axios.patch(`${API_BASE_URL}/investor/update-preferences`, {investment_preferences}, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
    .then((response) => {
      navigate("/investor-profile");
    })
    .catch((error) => {
      console.log(error);
    });
  };

  const investmentAmountOptions = [
    "Less than RM 100,000",
    "RM 100,000 - RM 500,000",
    "RM 500,000 - RM 1,000,000",
    "RM 1,000,000 - RM 2,000,000",
    "RM 2,000,000 - RM 5,000,000",
    "More than RM 5,000,000"
  ];

  return (
    <div className="flex justify-center w-full bg-white">
      <div className="relative h-[982px] w-[1512px] bg-white">
        <div className="flex justify-center bg-white py-10">
          <div className="w-full max-w-2xl p-8">
            <Typography variant="h4" color="blue-gray" className="mb-6">
              Edit Investment Preferences
            </Typography>

            <div className="space-y-6">
              {/* Preferred Industry */}
              <div>
                <Typography variant="h6" color="blue-gray" className="mb-2">
                  Preferred Industry
                </Typography>
                <Select
                  variant="outlined"
                  label="Select preferred industries"
                  labelProps={{
                    className: selectedIndustries.length ? "hidden" : "",
                  }}
                  selected={(element) =>
                    selectedIndustries.length
                      ? selectedIndustries.map((item) => (
                          <span
                            key={item}
                            className="inline-block bg-blue-gray-100 text-blue-gray-800 text-xs px-2 py-1 rounded-full mr-1"
                          >
                            {item}
                          </span>
                        ))
                      : element
                  }
                >
                  {["FinTech", "HealthTech", "AgriTech", "EdTech", "SaaS"].map(
                    (industry) => (
                      <Option
                        key={industry}
                        onClick={() =>
                          toggleMultiSelect(
                            industry,
                            selectedIndustries,
                            setSelectedIndustries
                          )
                        }
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedIndustries.includes(industry)}
                            readOnly
                          />
                          {industry}
                        </div>
                      </Option>
                    )
                  )}
                </Select>
              </div>

              {/* Investment Amount Range */}
              <div>
                <Typography variant="h6" color="blue-gray" className="mb-2">
                  Investment Amount Range
                </Typography>
                <Select
                  label="Select amount range"
                  value={investmentRange}
                  onChange={(val) => setInvestmentRange(val || "")}
                >
                  {investmentAmountOptions.map((option) => (
                    <Option key={option} value={option}>
                      {option}
                    </Option>
                  ))}
                </Select>
              </div>

              {/* Funding Stage */}
              <div>
                <Typography variant="h6" color="blue-gray" className="mb-2">
                  Funding Stage
                </Typography>
                <Select
                  variant="outlined"
                  label="Select funding stages"
                  labelProps={{
                    className: selectedStage.length ? "hidden" : "",
                  }}
                  selected={(element) =>
                    selectedStage.length
                      ? selectedStage.map((item) => (
                          <span
                            key={item}
                            className="inline-block bg-blue-gray-100 text-blue-gray-800 text-xs px-2 py-1 rounded-full mr-1"
                          >
                            {item}
                          </span>
                        ))
                      : element
                  }
                >
                  {["Seed", "Series A", "Series B"].map((stage) => (
                    <Option
                      key={stage}
                      onClick={() =>
                        toggleMultiSelect(
                          stage,
                          selectedStage,
                          setSelectedStage
                        )
                      }
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedStage.includes(stage)}
                          readOnly
                        />
                        {stage}
                      </div>
                    </Option>
                  ))}
                </Select>
              </div>

              {/* Revenue Share Percentage */}
              <div>
                <Typography variant="h6" color="blue-gray" className="mb-2">
                  Revenue Share Percentage
                </Typography>
                <div className="grid grid-cols-[1fr_auto] items-center gap-4">
                  <Slider
                    value={revenueShare}
                    onChange={(e) => setRevenueShare(e.target.valueAsNumber)}
                    min={1}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <Typography className="text-sm text-center w-[40px]">
                    {revenueShare}%
                  </Typography>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <Button
                className="text-dark-plum hover:bg-light-purple hover:text-white border-none capitalize"
                variant="outlined"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button
                className="bg-dark-plum text-white hover:bg-light-purple capitalize"
                onClick={handleSave}
              >
                Save
              </Button>
            </div>
          </div>
        </div>

        <div className="fixed w-[311px] h-full left-0 top-0">
          <Sidenav active="profile" />
        </div>
      </div>
    </div>
  );
};
