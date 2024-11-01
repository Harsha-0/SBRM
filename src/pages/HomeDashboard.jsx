import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card.jsx";
import supabase from "../utils/SupabaseClient.js";
import Layout from "../components/Layout.jsx";
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function Dashboard() {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [totalProjects, setTotalProjects] = useState(0);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const categories = [
    "Billable Resources",
    "Delivery Management",
    "Sales",
    "Overhead Resources",
  ];
  const [monthlySalary, setMonthlySalary] = useState([0, 0, 0, 0]);
  const [averageSalary, setAverageSalary] = useState([0, 0, 0, 0]);
  const [resourceCount, setResourceCount] = useState([0, 0, 0, 0]);
  const [averageERBurdenPercentage, setAverageERBurdenPercentage] = useState([
    0, 0, 0, 0,
  ]);
  const [erBurdenSummary, setERBurdenSummary] = useState([
    { total_er_burden: 0, average_er_burden: 0 },
    { total_er_burden: 0, average_er_burden: 0 },
    { total_er_burden: 0, average_er_burden: 0 },
    { total_er_burden: 0, average_er_burden: 0 },
  ]);
  const [grossMarginData, setGrossMarginData] = useState({});
  const [averageBillRate, setAverageBillRate] = useState({});
  const [averageEffectiveHourlyRate, setAverageEffectiveHourlyRate] = useState(
    {}
  );
  const [sumAnnualSalary, setSumAnnualSalary] = useState({});
  const [averageAnnualSalary, setAverageAnnualSalary] = useState({});
  const [sumMonthlyCTC, setSumMonthlyCTC] = useState({});
  const [averageMonthlyCTC, setAverageMonthlyCTC] = useState({});
  const [sumAnnualCTC, setSumAnnualCTC] = useState({});
  const [averageAnnualCTC, setAverageAnnualCTC] = useState({});
  const [averagePaidTimeOffRate, setAveragePaidTimeOffRate] = useState({});
  const [averagePercentageToTarget, setAveragePercentageToTarget] = useState(
    {}
  );

  // {{ edit_1 }}
  const categoryMapping = {
    1: "Billable Resources",
    2: "Delivery Management",
    3: "Sales",
    4: "Overhead Resources",
  };

  useEffect(() => {
    const fetchTotalProjects = async () => {
      const { data, error } = await supabase
        .schema("resource_management")
        .from("total_projects_count")
        .select("total_projects")
        .single();

      if (error) {
        console.error("Error fetching total projects:", error);
      } else {
        console.log(data.total_projects);
        setTotalProjects(data.total_projects);
      }
    };

    const fetchTotalEmployees = async () => {
      const { data, error } = await supabase
        .schema("resource_management")
        .from("total_employees_count")
        .select("total_employees")
        .single();

      if (error) {
        console.error("Error fetching total employees:", error);
      } else {
        console.log(data.total_employees);
        setTotalEmployees(data.total_employees);
      }
    };

    // Function to fetch Monthly Salary data
    const fetchMonthlySalary = async () => {
      const { data, error } = await supabase
        .schema("resource_management")
        .from("total_employee_monthly_salary_by_category")
        .select("total_salary");

      if (error) {
        console.error("Error fetching monthly salary data:", error);
      } else {
        console.log("Fetched Monthly Salary Data:", data);
        // Map the fetched total_salary values to the corresponding categories
        const salaries = data.map((item) => item.total_salary);
        setMonthlySalary(salaries);
      }
    };

    const fetchAverageSalary = async () => {
      const { data, error } = await supabase
        .schema("resource_management")
        .from("average_salary_by_category")
        .select("average_salary");

      if (error) {
        console.error("Error fetching average salary data:", error);
      } else {
        console.log("Fetched Average Salary Data:", data); // Add this line for debugging
        const averages = data.map((item) => item.average_salary);
        setAverageSalary(averages);
      }
    };

    const fetchResourceCount = async () => {
      const { data, error } = await supabase
        .schema("resource_management")
        .from("total_employees_by_resource_category")
        .select(
          "billable_count, delivery_management_count, sales_count, overhead_catagory"
        ); // {{ edit_1 }}

      if (error) {
        console.error("Error fetching resource counts:", error);
      } else {
        console.log("Fetched Resource Counts:", data);
        if (data.length > 0) {
          setResourceCount([
            data[0].billable_count || 0,
            data[0].delivery_management_count || 0,
            data[0].sales_count || 0,
            data[0].overhead_catagory || 0,
          ]);
        }
      }
    };

    // Function to fetch Average ER Burden Percentage data
    const fetchAverageERBurdenPercentage = async () => {
      const { data, error } = await supabase
        .schema("resource_management")
        .from("avg_er_burden_percentage_by_category")
        .select("average_er_burden_percentage");

      if (error) {
        console.error("Error fetching average ER burden percentage:", error);
      } else {
        console.log("Fetched Average ER Burden Percentage:", data);
        const averages = data.map((item) => item.average_er_burden_percentage);
        setAverageERBurdenPercentage(averages);
      }
    };

    // Function to fetch ER Burden Summary data
    const fetchERBurdenSummary = async () => {
      const { data, error } = await supabase
        .schema("resource_management")
        .from("er_burden_summary_by_category")
        .select("total_er_burden, average_er_burden");

      if (error) {
        console.error("Error fetching ER burden summary:", error);
      } else {
        console.log("Fetched ER Burden Summary:", data);
        const summaries = data.map((item) => ({
          total_er_burden: item.total_er_burden || 0,
          average_er_burden: item.average_er_burden || 0,
        }));
        setERBurdenSummary(summaries);
      }
    };

    // Function to fetch Gross Margin data
    const fetchGrossMargin = async () => {
      const { data, error } = await supabase
        .schema("resource_management")
        .from("avg_gross_margin_by_category")
        .select("category, average_gross_margin");

      if (error) {
        console.error("Error fetching gross margin data:", error);
      } else {
        console.log("Fetched Gross Margin Data:", data);
        if (data.length > 0) {
          const margins = {};
          data.forEach((item) => {
            margins[categoryMapping[item.category]] =
              item.average_gross_margin || 0; // {{ edit_2 }}
          });
          setGrossMarginData(margins);
        }
      }
    };

    // {{ edit_4 }}
    const fetchAverageBillRate = async () => {
      const { data, error } = await supabase
        .schema("resource_management")
        .from("avg_bill_rate_by_category")
        .select("category, average_bill_rate");

      if (error) {
        console.error("Error fetching average bill rate data:", error);
      } else {
        console.log("Fetched Average Bill Rate Data:", data);
        if (data.length > 0) {
          const rates = {};
          data.forEach((item) => {
            rates[categoryMapping[item.category]] = item.average_bill_rate ?? 0;
          });
          setAverageBillRate(rates);
        }
      }
    };
    const fetchAverageEffectiveHourlyRate = async () => {
      const { data, error } = await supabase
        .schema("resource_management")
        .from("avg_effective_hourly_rate_by_category")
        .select("category, average_effective_hourly_rate");

      if (error) {
        console.error(
          "Error fetching average effective hourly rate data:",
          error
        );
      } else {
        console.log("Fetched Average Effective Hourly Rate Data:", data);
        if (data.length > 0) {
          const rates = {};
          data.forEach((item) => {
            rates[categoryMapping[item.category]] =
              item.average_effective_hourly_rate ?? 0;
          });
          setAverageEffectiveHourlyRate(rates);
        }
      }
    };
    const fetchSumAnnualSalary = async () => {
      const { data, error } = await supabase
        .schema("resource_management")
        .from("sum_annual_salary_by_category")
        .select("category, total_annual_salary");

      if (error) {
        console.error("Error fetching total annual salary data:", error);
      } else {
        console.log("Fetched Sum Annual Salary Data:", data);
        if (data.length > 0) {
          const sums = {};
          data.forEach((item) => {
            sums[categoryMapping[item.category]] =
              item.total_annual_salary ?? 0;
          });
          setSumAnnualSalary(sums);
        }
      }
    };

    const fetchAverageAnnualSalary = async () => {
      const { data, error } = await supabase
        .schema("resource_management")
        .from("average_annual_salary_by_category")
        .select("category, average_annual_salary");

      if (error) {
        console.error("Error fetching average annual salary data:", error);
      } else {
        console.log("Fetched Average Annual Salary Data:", data);
        if (data.length > 0) {
          const averages = {};
          data.forEach((item) => {
            averages[categoryMapping[item.category]] =
              item.average_annual_salary ?? 0; // Replace null with 0
          });
          setAverageAnnualSalary(averages);
        }
      }
    };

    // {{ edit_21 }}
    const fetchSumMonthlyCTC = async () => {
      const { data, error } = await supabase
        .schema("resource_management")
        .from("sum_avg_monthly_ctc_by_category")
        .select("category, total_monthly_ctc");

      if (error) {
        console.error("Error fetching total monthly CTC data:", error);
      } else {
        console.log("Fetched Sum Monthly CTC Data:", data);
        if (data.length > 0) {
          const sums = {};
          data.forEach((item) => {
            sums[categoryMapping[item.category]] = item.total_monthly_ctc ?? 0; // Replace null with 0
          });
          setSumMonthlyCTC(sums);
        }
      }
    };

    const fetchAverageMonthlyCTC = async () => {
      const { data, error } = await supabase
        .schema("resource_management")
        .from("sum_avg_monthly_ctc_by_category")
        .select("category, average_monthly_ctc");

      if (error) {
        console.error("Error fetching average monthly CTC data:", error);
      } else {
        console.log("Fetched Average Monthly CTC Data:", data);
        if (data.length > 0) {
          const averages = {};
          data.forEach((item) => {
            averages[categoryMapping[item.category]] =
              item.average_monthly_ctc ?? 0; // Replace null with 0
          });
          setAverageMonthlyCTC(averages);
        }
      }
    };

    // Fetch Sum Annual CTC data
    const fetchSumAnnualCTC = async () => {
      const { data, error } = await supabase
        .schema("resource_management")
        .from("sum_avg_annual_ctc_by_category")
        .select("category, total_annual_ctc");

      if (error) {
        console.error("Error fetching sum annual CTC data:", error);
      } else {
        console.log("Fetched Sum Annual CTC Data:", data);
        if (data.length > 0) {
          const sums = {};
          data.forEach((item) => {
            sums[categoryMapping[item.category]] = item.total_annual_ctc ?? 0;
          });
          setSumAnnualCTC(sums);
        }
      }
    };

    // Fetch Average Annual CTC data
    const fetchAverageAnnualCTC = async () => {
      const { data, error } = await supabase
        .schema("resource_management")
        .from("sum_avg_annual_ctc_by_category")
        .select("category, average_annual_ctc");

      if (error) {
        console.error("Error fetching average annual CTC data:", error);
      } else {
        console.log("Fetched Average Annual CTC Data:", data);
        if (data.length > 0) {
          const averages = {};
          data.forEach((item) => {
            averages[categoryMapping[item.category]] =
              item.average_annual_ctc ?? 0;
          });
          setAverageAnnualCTC(averages);
        }
      }
    };

    // Add function to fetch Average Paid Time Off Rate
    const fetchAveragePaidTimeOffRate = async () => {
      // {{ add_fetch_average_paid_time_off_rate }}
      const { data, error } = await supabase
        .schema("resource_management") // Corrected schema name
        .from("avg_paid_time_off_rate_by_category")
        .select("category, average_paid_time_off_rate");

      if (error) {
        console.error("Error fetching average paid time off rate data:", error);
      } else {
        console.log("Fetched Average Paid Time Off Rate Data:", data);
        if (data.length > 0) {
          const rates = {};
          data.forEach((item) => {
            rates[categoryMapping[item.category]] =
              item.average_paid_time_off_rate ?? 0;
          });
          setAveragePaidTimeOffRate(rates);
        }
      }
    };

    // Add function to fetch Average Percentage to Target
    const fetchAveragePercentageToTarget = async () => {
      // {{ add_fetch_average_percentage_to_target }}
      const { data, error } = await supabase
        .schema("resource_management")
        .from("avg_percentage_to_target_by_category")
        .select("category, average_percentage_to_target");

      if (error) {
        console.error(
          "Error fetching average percentage to target data:",
          error
        );
      } else {
        console.log("Fetched Average Percentage to Target Data:", data);
        if (data.length > 0) {
          const percentages = {};
          data.forEach((item) => {
            percentages[categoryMapping[item.category]] =
              item.average_percentage_to_target ?? 0;
          });
          setAveragePercentageToTarget(percentages);
        }
      }
    };

    fetchTotalProjects();
    fetchTotalEmployees();
    fetchMonthlySalary();
    fetchAverageSalary();
    fetchResourceCount();
    fetchAverageERBurdenPercentage();
    fetchERBurdenSummary();
    fetchGrossMargin();
    fetchAverageBillRate(); // {{ edit_5 }}
    fetchAverageEffectiveHourlyRate(); // Fetch Average Effective Hourly Rate data
    fetchSumAnnualSalary(); // {{ edit_18 }}
    fetchAverageAnnualSalary(); // {{ edit_18 }}
    fetchSumMonthlyCTC(); // Fetch Sum Monthly CTC data
    fetchAverageMonthlyCTC(); // Fetch Average Monthly CTC data
    fetchSumAnnualCTC(); // {{ call_fetch_sum_annual_ctc }}
    fetchAverageAnnualCTC(); // {{ call_fetch_average_annual_ctc }}

    // Call the new fetch functions
    fetchAveragePaidTimeOffRate(); // {{ call_fetch_average_paid_time_off_rate }}
    fetchAveragePercentageToTarget(); // {{ call_fetch_average_percentage_to_target }}
  }, []);

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/login"); // Redirect to login page after logout
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  };

  return (
    <Layout>
      <main className="flex-1 overflow-auto p-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Employees</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{totalEmployees}</p>
              <p className="text-sm text-gray-500">Total Employees</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{totalProjects}</p>
              <p className="text-sm text-gray-500">Total Projects</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Resources based on Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {categories.map(
                  (category, index) =>
                    resourceCount[index] !== 0 && (
                      <div key={category} className="flex justify-between">
                        <span className="capitalize">{category}</span>
                        <span className="font-medium">
                          {resourceCount[index]}
                        </span>
                      </div>
                    )
                )}
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-full">
            <CardHeader>
              <CardTitle>Monthly Salary</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 lg:flex-row">
              <div className="flex-1 space-y-4">
                {categories.map((category, index) =>
                  monthlySalary[index] !== 0 ||
                  averageSalary[index] !== 0 ||
                  resourceCount[index] !== 0 ? (
                    <div key={category} className="space-y-2">
                      <h4 className="font-semibold capitalize">{category}</h4>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        {monthlySalary[index] !== 0 && (
                          <div>
                            <p className="text-gray-500">Total Salary</p>
                            <p className="font-medium">
                              ${monthlySalary[index]?.toLocaleString() || 0}
                            </p>
                          </div>
                        )}
                        {averageSalary[index] !== 0 && (
                          <div>
                            <p className="text-gray-500">Salary Average</p>
                            <p className="font-medium">
                              ${averageSalary[index]?.toLocaleString() || 0}
                            </p>
                          </div>
                        )}
                        {/* Removed Resources Section */}
                      </div>
                    </div>
                  ) : null
                )}
              </div>
              <div className="w-full lg:w-64">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={categories.map((category, index) => ({
                        name: category,
                        value: monthlySalary[index] || 0,
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categories.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <p className="mt-2 text-center text-sm font-medium">
                  Grand Total: $
                  {monthlySalary
                    .reduce((sum, value) => sum + (value || 0), 0)
                    .toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
          {/* Annual Salary Card */}
          <Card className="col-span-full">
            <CardHeader>
              <CardTitle>Annual Salary</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 lg:flex-row">
              <div className="flex-1 space-y-4">
                {categories.map((category) => (
                  <div key={category} className="space-y-2">
                    <h4 className="font-semibold capitalize">{category}</h4>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <p className="text-gray-500">Total Annual Salary</p>
                        <p className="font-medium">
                          ${sumAnnualSalary[category]?.toLocaleString() || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Average Annual Salary</p>
                        <p className="font-medium">
                          $
                          {averageAnnualSalary[category]?.toLocaleString() || 0}
                        </p>
                      </div>
                      {/* <div>
                          <p className="text-gray-500">Resources</p>
                          <p className="font-medium">
                            {resourceCount[categories.indexOf(category)] || 0} 
                          </p>
                        </div> */}
                    </div>
                  </div>
                ))}
              </div>
              <div className="w-full lg:w-64">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={categories.map((category) => ({
                        name: category,
                        value: sumAnnualSalary[category] || 0,
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#82ca9d"
                      dataKey="value"
                    >
                      {categories.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <p className="mt-2 text-center text-sm font-medium">
                  Grand Total: $
                  {categories
                    .reduce(
                      (sum, category) => sum + (sumAnnualSalary[category] || 0),
                      0
                    )
                    .toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-full">
            <CardHeader>
              <CardTitle>Monthly CTC</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 lg:flex-row">
              <div className="flex-1 space-y-4">
                {categories.map((category, index) => (
                  <div key={category} className="space-y-2">
                    <h4 className="font-semibold capitalize">{category}</h4>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <p className="text-gray-500">Total Monthly CTC</p>
                        <p className="font-medium">
                          ${sumMonthlyCTC[category]?.toLocaleString() || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Average Monthly CTC</p>
                        <p className="font-medium">
                          ${averageMonthlyCTC[category]?.toLocaleString() || 0}
                        </p>
                      </div>
                      {/* <div>
                          <p className="text-gray-500">Resources</p>
                          <p className="font-medium">
                            {resourceCount[index] || 0} 
                          </p>
                        </div> */}
                    </div>
                  </div>
                ))}
              </div>
              <div className="w-full lg:w-64">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={categories.map((category) => ({
                        name: category,
                        value: sumMonthlyCTC[category] || 0,
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#82ca9d"
                      dataKey="value"
                    >
                      {categories.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <p className="mt-2 text-center text-sm font-medium">
                  Grand Total: $
                  {categories
                    .reduce(
                      (sum, category) => sum + (sumMonthlyCTC[category] || 0),
                      0
                    )
                    .toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Add Annual CTC Card */}
          <Card className="col-span-full">
            <CardHeader>
              <CardTitle>Annual CTC</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 lg:flex-row">
              <div className="flex-1 space-y-4">
                {categories.map((category, index) => (
                  <div key={category} className="space-y-2">
                    <h4 className="font-semibold capitalize">{category}</h4>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <p className="text-gray-500">Total Annual CTC</p>
                        <p className="font-medium">
                          ${sumAnnualCTC[category]?.toLocaleString() || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Average Annual CTC</p>
                        <p className="font-medium">
                          ${averageAnnualCTC[category]?.toLocaleString() || 0}
                        </p>
                      </div>
                      {/* <div>
                          <p className="text-gray-500">Resources</p>
                          <p className="font-medium">
                            {resourceCount[index] || 0} 
                          </p>
                        </div> */}
                    </div>
                  </div>
                ))}
              </div>
              <div className="w-full lg:w-64">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={categories.map((category) => ({
                        name: category,
                        value: sumAnnualCTC[category] || 0,
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#82ca9d"
                      dataKey="value"
                    >
                      {categories.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <p className="mt-2 text-center text-sm font-medium">
                  Grand Total: $
                  {categories
                    .reduce(
                      (sum, category) => sum + (sumAnnualCTC[category] || 0),
                      0
                    )
                    .toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Employer Burden Graph */}
          <Card className="col-span-full">
            <CardHeader>
              <CardTitle>Employer Burden</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 lg:flex-row">
              <div className="w-full lg:w-1/3">
                <h3 className="text-lg font-semibold mb-2">
                  Average ER Burden Percentage
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categories.map((category, index) => ({
                        name: category,
                        value: averageERBurdenPercentage[index] || 0,
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#82ca9d"
                      dataKey="value"
                    >
                      {categories.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {categories.map((category, index) => (
                    <div
                      key={category}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center">
                        <div
                          className="h-3 w-3 mr-2"
                          style={{
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        ></div>
                        <span className="capitalize">{category}</span>
                      </div>
                      <span>
                        {averageERBurdenPercentage[index].toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">
                  Total and Average ER Burden per Month
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={categories.map((category, index) => ({
                      name: category,
                      total: erBurdenSummary[index]?.total_er_burden || 0,
                      average: erBurdenSummary[index]?.average_er_burden || 0,
                    }))}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="#82ca9d"
                    />
                    <Tooltip />
                    <Bar
                      yAxisId="left"
                      dataKey="total"
                      fill="#8884d8"
                      name="Total ER Burden"
                    />
                    <Bar
                      yAxisId="right"
                      dataKey="average"
                      fill="#82ca9d"
                      name="Average ER Burden"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Gross Margin Card */}
          <Card>
            <CardHeader>
              <CardTitle>Average Gross Margin</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {categories.map(
                  (category) =>
                    grossMarginData[category] &&
                    grossMarginData[category] !== 0 && (
                      <div
                        key={category}
                        className="flex justify-between text-sm"
                      >
                        <span className="capitalize">
                          {category.replace(/([A-Z])/g, " $1").trim()}
                        </span>
                        <span className="font-medium">
                          ${grossMarginData[category].toFixed(2)}
                        </span>
                      </div>
                    )
                )}
                <div className="flex justify-between font-semibold pt-2">
                  <span>Gross Margin percentage Target</span>
                  <span>35%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bill Rate Card */}
          <Card>
            <CardHeader>
              <CardTitle>Average Bill Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {categories.map(
                  (category) =>
                    typeof averageBillRate[category] === "number" &&
                    averageBillRate[category] !== 0 && (
                      <div key={category} className="flex justify-between">
                        <span className="capitalize">{category}</span>
                        <span className="font-medium">
                          {averageBillRate[category].toFixed(2)}$
                        </span>
                      </div>
                    )
                )}
              </div>
            </CardContent>
          </Card>

          {/* Effective Hourly Rate Card */}
          <Card>
            <CardHeader>
              <CardTitle>Effective Hourly Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="capitalize">Billable Resources</span>
                  <span className="font-medium">
                    {typeof averageEffectiveHourlyRate["Billable Resources"] ===
                    "number"
                      ? `$${averageEffectiveHourlyRate[
                          "Billable Resources"
                        ].toFixed(2)}`
                      : "0.00"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Add Average Paid Time Off Rate Card */}
          <Card>
            <CardHeader>
              <CardTitle>Average Paid Time Off Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {categories.map(
                  (category) =>
                    typeof averagePaidTimeOffRate[category] === "number" &&
                    averagePaidTimeOffRate[category] !== 0 && (
                      <div key={category} className="flex justify-between">
                        <span className="capitalize">{category}</span>
                        <span className="font-medium">
                          ${averagePaidTimeOffRate[category].toFixed(2)}
                        </span>
                      </div>
                    )
                )}
              </div>
            </CardContent>
          </Card>

          {/* Add Average Percentage to Target Card */}
          <Card>
            <CardHeader>
              <CardTitle>Average Percentage to Target</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {categories
                  .filter((category) => averagePercentageToTarget[category] > 0)
                  .map((category) => (
                    <div key={category} className="flex justify-between">
                      <span className="capitalize">{category}</span>
                      <span className="font-medium">
                        {averagePercentageToTarget[category]
                          ? `${averagePercentageToTarget[category].toFixed(2)}%`
                          : "0.00%"}
                      </span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </Layout>
  );
}
