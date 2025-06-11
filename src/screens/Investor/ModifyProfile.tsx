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

export const EditProfile = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Initial values from previous page
  const prevData = location.state || {};

  const [selectedIndustries, setSelectedIndustries] = useState<string[]>(
    prevData.preferredIndustry || []
  );
  const [investmentRange, setInvestmentRange] = useState(
    prevData.investmentAmount || ""
  );
  const [selectedStage, setSelectedStage] = useState<string[]>(
    prevData.fundingStage || []
  );
  const [revenueShare, setRevenueShare] = useState<number>(
    prevData.revenueShare || 5
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

  const handleSave = () => {
    const updatedPreferences = {
      preferredIndustry: selectedIndustries,
      investmentAmount: investmentRange,
      fundingStage: selectedStage,
      revenueShare: revenueShare,
    };
    // Pass back the data and go to previous page
    navigate("/investor-profile", { state: updatedPreferences });
  };

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
                  <Option value="Less than RM 10,000">
                    Less than RM 10,000
                  </Option>
                  <Option value="RM 10,000 - 20,000">RM 10,000 - 20,000</Option>
                  <Option value="RM 20,000 - 50,000">RM 20,000 - 50,000</Option>
                  <Option value="RM 50,000 - 100,000">
                    RM 50,000 - 100,000
                  </Option>
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
