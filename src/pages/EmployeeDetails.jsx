import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Layout from "../components/Layout.jsx";
import supabase from "../utils/SupabaseClient.js";

const TARGET_PERCENTAGE = 100;

const getPercentageColor = (percentage) => {
  if (percentage === 0) {
    return "text-red-900";
  } else if (percentage === "N/A") {
    return "text-red-900";
  } else if (percentage < 60) {
    return "text-red-500";
  } else if (percentage < 80) {
    return "text-yellow-500";
  } else if (percentage < 90) {
    return "text-green-500";
  } else if (percentage > 100) {
    return "text-green-700";
  } else {
    return "text-gray-500";
  }
};

export default function EmployeeDetails() {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [weeksSinceLastIncrease, setWeeksSinceLastIncrease] = useState(null);
  const [annualSalary, setAnnualSalary] = useState(null);
  const [socialSecurityContribution, setSocialSecurityContribution] =
    useState(null);
  const [medicareContribution, setMedicareContribution] = useState(null);
  const [erBurdenTotal, setErBurdenTotal] = useState(null);
  const [erBurdenPercentage, setErBurdenPercentage] = useState(null);
  const [monthlyCtc, setMonthlyCtc] = useState(null);
  const [annualCtc, setAnnualCtc] = useState(null);
  const [paidTimeOffRates, setPaidTimeOffRates] = useState(null);
  const [effectiveHourlyRate, setEffectiveHourlyRate] = useState(null);
  const [grossMarginInValue, setGrossMarginInValue] = useState(null);
  const [grossMargin, setGrossMargin] = useState(null);
  const [currentGrossMargin, setCurrentGrossMargin] = useState(null);
  const [percentageToTarget, setPercentageToTarget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchEmployeeData = async () => {
      try {
        const [
          { data: employeeData, error: employeeError },
          { data: weeksData, error: weeksError },
          { data: salaryData, error: salaryError },
          { data: ssData, error: ssError },
          { data: medicareData, error: medicareError },
          { data: erBurdenData, error: erBurdenError },
          { data: erBurdenPercentageData, error: erBurdenPercentageError },
          { data: monthlyCtcData, error: monthlyCtcError },
          { data: annualCtcData, error: annualCtcError },
          { data: paidTimeOffRatesData, error: paidTimeOffRatesError },
          { data: effectiveHourlyRateData, error: effectiveHourlyRateError },
          { data: grossMarginData, error: grossMarginError },
          { data: currentGrossMarginData, error: currentGrossMarginError },
          { data: percentageToTargetData, error: percentageToTargetError },
        ] = await Promise.all([
          supabase
            .schema("resource_management")
            .from("employees")
            .select(
              `
              employee_id,
              first_name,
              last_name,
              employee_title(title),
              resource_categories(category_name),
              start_date,
              date_of_last_pay_increase,
              monthly_salary,
              bill_rate,
              projects_list(project_name),
              project_type(billing_type),
              employer_burden(
                er_insurance,
                er_retirement,
                hsa,
                futa,
                ss,
                med,
                sui
              )
            `
            )
            .eq("employee_id", id)
            .maybeSingle(),

          supabase
            .schema("resource_management")
            .from("employees_weeks_since_increase")
            .select("weeks_since_last_increase")
            .eq("employee_id", id)
            .maybeSingle(),

          supabase
            .schema("resource_management")
            .from("employee_annual_salaries")
            .select("annual_salary")
            .eq("employee_id", id)
            .maybeSingle(),

          supabase
            .schema("resource_management")
            .from("employee_social_security")
            .select("social_security_contribution")
            .eq("employee_id", id)
            .maybeSingle(),

          supabase
            .schema("resource_management")
            .from("employee_medicare")
            .select("medicare_contribution")
            .eq("employee_id", id)
            .maybeSingle(),

          supabase
            .schema("resource_management")
            .from("employee_er_burden_per_month")
            .select("er_burden_total")
            .eq("employee_id", id)
            .maybeSingle(),

          supabase
            .schema("resource_management")
            .from("employer_burden_percentage")
            .select("er_burden_percentage")
            .eq("employee_id", id)
            .maybeSingle(),

          supabase
            .schema("resource_management")
            .from("employee_monthly_ctc")
            .select("monthly_ctc")
            .eq("employee_id", id)
            .maybeSingle(),

          supabase
            .schema("resource_management")
            .from("employee_annual_ctc")
            .select("annual_ctc")
            .eq("employee_id", id)
            .maybeSingle(),

          supabase
            .schema("resource_management")
            .from("employee_paid_time_off_rates")
            .select("paid_time_off_rates")
            .eq("employee_id", id)
            .maybeSingle(),

          supabase
            .schema("resource_management")
            .from("employee_effective_hourly_rates")
            .select("effective_hourly_rate")
            .eq("employee_id", id)
            .maybeSingle(),

          supabase
            .schema("resource_management")
            .from("gross_margin_in_value")
            .select("gross_margin")
            .eq("employee_id", id)
            .maybeSingle(),

          supabase
            .schema("resource_management")
            .from("employee_current_gross_margin")
            .select("current_gross_margin")
            .eq("employee_id", id)
            .maybeSingle(),

          supabase
            .schema("resource_management")
            .from("employee_target_percentage")
            .select("percentage_to_target")
            .eq("employee_id", id)
            .maybeSingle(),
        ]);
        if (
          employeeError ||
          weeksError ||
          salaryError ||
          ssError ||
          medicareError ||
          erBurdenError ||
          erBurdenPercentageError ||
          monthlyCtcError ||
          annualCtcError ||
          paidTimeOffRatesError ||
          effectiveHourlyRateError ||
          grossMarginError ||
          currentGrossMarginError ||
          percentageToTargetError
        ) {
          throw new Error(
            employeeError?.message ||
              weeksError?.message ||
              salaryError?.message ||
              ssError?.message ||
              medicareError?.message ||
              erBurdenError?.message ||
              erBurdenPercentageError?.message ||
              monthlyCtcError?.message ||
              annualCtcError?.message ||
              paidTimeOffRatesError?.message ||
              effectiveHourlyRateError?.message ||
              grossMarginError?.message ||
              currentGrossMarginError?.message ||
              percentageToTargetError?.message ||
              "Unknown error occurred"
          );
        }
        setEmployee(employeeData);
        setWeeksSinceLastIncrease(
          weeksData?.weeks_since_last_increase || "N/A"
        );
        setAnnualSalary(salaryData?.annual_salary?.toLocaleString() || "N/A");
        setSocialSecurityContribution(
          ssData?.social_security_contribution?.toLocaleString() || "N/A"
        );
        setMedicareContribution(
          medicareData?.medicare_contribution?.toLocaleString() || "N/A"
        );
        setErBurdenTotal(
          erBurdenData?.er_burden_total?.toLocaleString() || "N/A"
        );
        setErBurdenPercentage(
          erBurdenPercentageData?.er_burden_percentage?.toLocaleString() ||
            "N/A"
        );
        setMonthlyCtc(monthlyCtcData?.monthly_ctc?.toLocaleString() || "N/A");
        setAnnualCtc(annualCtcData?.annual_ctc?.toLocaleString() || "N/A");
        setPaidTimeOffRates(
          paidTimeOffRatesData?.paid_time_off_rates?.toLocaleString() || "N/A"
        );
        setEffectiveHourlyRate(
          effectiveHourlyRateData?.effective_hourly_rate?.toLocaleString() ||
            "N/A"
        );
        setGrossMarginInValue(
          grossMarginData?.gross_margin_in_value?.toLocaleString() || "N/A"
        );
        setGrossMargin(
          grossMarginData?.gross_margin?.toLocaleString() || "N/A"
        );
        setCurrentGrossMargin(
          currentGrossMarginData?.current_gross_margin?.toLocaleString() ||
            "N/A"
        );
        setPercentageToTarget(
          percentageToTargetData?.percentage_to_target || "N/A"
        );
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeData();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="p-4 flex justify-center">
          <span>Loading...</span>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <p className="p-4 text-red-500">Error: {error}</p>
      </Layout>
    );
  }

  if (!employee) {
    return (
      <Layout>
        <p className="p-4">Employee not found.</p>
      </Layout>
    );
  }

  const employerBurden = employee.employer_burden?.[0] || {};

  return (
    <Layout>
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold mb-5">Employee Details</h1>
        <div className="bg-white p-6 rounded-md shadow-md">
          <h2 className="text-xl font-semibold mt-4">
            Employee Profile Summary
          </h2>
          <p>
            <strong>Name:</strong> {employee.first_name} {employee.last_name}
          </p>
          <p>
            <strong>Title:</strong> {employee.employee_title?.title || "N/A"}
          </p>
          <p>
            <strong>Department:</strong>{" "}
            {employee.resource_categories?.category_name || "N/A"}
          </p>
          <p>
            <strong>Start Date:</strong> {employee.start_date || "N/A"}
          </p>
          <p>
            <strong>Last Hike Date:</strong>{" "}
            {employee.date_of_last_pay_increase || "N/A"}
          </p>
          <p>
            <strong>Weeks Since Last Hike:</strong> {weeksSinceLastIncrease}
          </p>
          <p>
            <strong>Monthly Salary:</strong> $
            {employee.monthly_salary?.toLocaleString() || "0"}
          </p>
          {annualSalary && (
            <p>
              <strong>Annual Salary:</strong> ${annualSalary}{" "}
            </p>
          )}
          <p>
            <strong>Bill Rate:</strong> $
            {employee.bill_rate?.toLocaleString() || "0"}
          </p>
          <p>
            <strong>Current Project:</strong>{" "}
            {employee.projects_list?.project_name || "N/A"}
          </p>
          <p>
            <strong>Type:</strong>{" "}
            {employee.project_type?.billing_type || "N/A"}
          </p>
          <h2 className="text-xl font-semibold mt-4">Employer Burden</h2>
          <p>
            <strong>ER Insurance:</strong> $
            {employerBurden.er_insurance || "N/A"}
          </p>
          <p>
            <strong>ER Retirement:</strong> $
            {employerBurden.er_retirement || "N/A"}
          </p>
          <p>
            <strong>HSA:</strong> ${employerBurden.hsa || "N/A"}
          </p>
          <p>
            <strong>FUTA:</strong> ${employerBurden.futa || "N/A"}
          </p>
          {socialSecurityContribution && (
            <p>
              <strong>SS Contribution:</strong> ${socialSecurityContribution}{" "}
            </p>
          )}
          {medicareContribution && (
            <p>
              <strong>Medicare Contribution:</strong> ${medicareContribution}{" "}
            </p>
          )}
          <p>
            <strong>IN SUI</strong> ${employerBurden.sui || "N/A"}
          </p>
          {erBurdenTotal && (
            <p>
              <strong>ER Burden Total:</strong> ${erBurdenTotal}{" "}
            </p>
          )}
          {erBurdenPercentage && (
            <p>
              <strong>ER Burden Percentage:</strong> {erBurdenPercentage}%
            </p>
          )}
          <h2 className="text-xl font-semibold mt-4">CTC and Hourly Metrics</h2>
          {monthlyCtc && (
            <p>
              <strong>Monthly CTC:</strong> ${monthlyCtc}{" "}
            </p>
          )}
          {annualCtc && (
            <p>
              <strong>Annual CTC:</strong> ${annualCtc}{" "}
            </p>
          )}
          {paidTimeOffRates && (
            <p>
              <strong>Paid Time Off Rates:</strong> {paidTimeOffRates}{" "}
            </p>
          )}
          {effectiveHourlyRate && (
            <p>
              <strong>Effective Hourly Rate:</strong> ${effectiveHourlyRate}{" "}
            </p>
          )}
          <h2 className="text-xl font-semibold mt-4">Gross Margin Analysis</h2>
          <p>
            <strong>Gross Margin:</strong> {grossMargin}%
          </p>
          <p>
            <strong>Current Gross Margin:</strong> ${currentGrossMargin}{" "}
          </p>
          {currentGrossMargin === 0 ? (
            <p>
              <strong>Percentage to Target:</strong> Target Margin cannot be
              calculated for this employee.
            </p>
          ) : (
            <p>
              <strong>Percentage to Target:</strong>{" "}
              <span
                className={`${getPercentageColor(
                  percentageToTarget
                )} font-bold`}
              >
                {percentageToTarget !== "N/A"
                  ? percentageToTarget.toLocaleString()
                  : percentageToTarget}
                %
              </span>
            </p>
          )}
        </div>
      </div>
    </Layout>
  );
}
