"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card.jsx";
import { Input } from "../components/ui/input.jsx";
import { Label } from "../components/ui/label.jsx";
import { Button } from "../components/ui/button.jsx";
import { ArrowRight, DollarSign, Percent, Info, RefreshCw } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table.jsx";
import Layout from "../components/Layout.jsx";

export default function GrossMarginCalculation() {
  // Salary Margin State
  const [salaryMargin, setSalaryMargin] = useState({
    salary: 45000,
    burdenRatePercentage: 19.9,
    netAvailableHours: 1888,
    grossMarginPercentage: 35,
  });

  // Rate Margin State
  const [rateMargin, setRateMargin] = useState({
    burdenRatePercentage: 19.9,
    grossMarginPercentage: 35,
    hourlyBillRate: 80,
    netAvailableHours: 1888,
  });

  // Salary Rate State
  const [salaryRate, setSalaryRate] = useState({
    salary: 45000,
    burdenRatePercentage: 19.9,
    hourlyBillRate: 50,
    netAvailableHours: 1888,
  });

  // Salary Margin Calculations
  const [salaryMarginCalc, setSalaryMarginCalc] = useState({
    burden: 0,
    hourlyCost: 0,
    hourlyBillRate: 0,
    monthlyPay: 0,
  });

  // Rate Margin Calculations
  const [rateMarginCalc, setRateMarginCalc] = useState({
    hourlyCost: 0,
    burden: 0,
    salary: 0,
    monthlyPay: 0,
  });

  // Salary Rate Calculations
  const [salaryRateCalc, setSalaryRateCalc] = useState({
    burden: 0,
    hourlyCost: 0,
    grossMarginPercentage: 0,
    monthlyPay: 0,
  });

  const ResultField = ({ label, value, icon }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
          {icon}
        </span>
        <Input value={value.toFixed(2)} readOnly className="pl-10 bg-muted" />
      </div>
    </div>
  );

  // Functions to update state for salary, rate, and salary rate margin calculations
  const updateSalaryMargin = (field, value) => {
    setSalaryMargin((prev) => ({
      ...prev,
      [field]: parseFloat(value),
    }));
  };

  const updateRateMargin = (field, value) => {
    setRateMargin((prev) => ({
      ...prev,
      [field]: parseFloat(value),
    }));
  };

  const updateSalaryRate = (field, value) => {
    setSalaryRate((prev) => ({
      ...prev,
      [field]: parseFloat(value),
    }));
  };

  // Salary Margin Calculations
  useEffect(() => {
    const burden =
      salaryMargin.salary * (1 + salaryMargin.burdenRatePercentage / 100);
    const hourlyCost = burden / salaryMargin.netAvailableHours;
    const hourlyBillRate =
      hourlyCost / (1 - salaryMargin.grossMarginPercentage / 100);
    const monthlyPay = salaryMargin.salary / 12;

    setSalaryMarginCalc({
      burden,
      hourlyCost,
      hourlyBillRate,
      monthlyPay,
    });
  }, [salaryMargin]);

  // Rate Margin Calculations
  useEffect(() => {
    const hourlyCost =
      rateMargin.hourlyBillRate * (1 - rateMargin.grossMarginPercentage / 100);
    const burden = hourlyCost * rateMargin.netAvailableHours;
    const salary = burden / (1 + rateMargin.burdenRatePercentage / 100);
    const monthlyPay = salary / 12;

    setRateMarginCalc({
      hourlyCost,
      burden,
      salary,
      monthlyPay,
    });
  }, [rateMargin]);

  // Salary Rate Calculations
  useEffect(() => {
    const burden =
      salaryRate.salary * (1 + salaryRate.burdenRatePercentage / 100);
    const hourlyCost = burden / salaryRate.netAvailableHours;
    const grossMarginPercentage =
      ((salaryRate.hourlyBillRate - hourlyCost) / salaryRate.hourlyBillRate) *
      100;
    const monthlyPay = salaryRate.salary / 12;

    setSalaryRateCalc({
      burden,
      hourlyCost,
      grossMarginPercentage,
      monthlyPay,
    });
  }, [salaryRate]);

  // Reset to default values
  const resetToDefaults = () => {
    setSalaryMargin({
      salary: 45000,
      burdenRatePercentage: 19.9,
      netAvailableHours: 1888,
      grossMarginPercentage: 35,
    });
    setRateMargin({
      burdenRatePercentage: 19.9,
      grossMarginPercentage: 35,
      hourlyBillRate: 80,
      netAvailableHours: 1888,
    });
    setSalaryRate({
      salary: 45000,
      burdenRatePercentage: 19.9,
      hourlyBillRate: 50,
      netAvailableHours: 1888,
    });
  };

  return (
    <Layout>
      <div className="flex">
        <div className="container mx-auto p-4 space-y-8 max-w-7xl">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">
              Gross Margin Calculation Without Overhead
            </h1>
            <p className="text-muted-foreground">
              Calculate and compare different margin scenarios
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Salary Margin Card */}
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle>Salary Margin</CardTitle>
                <CardDescription>
                  Calculate margins based on salary
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 flex-grow">
                <div className="flex flex-col space-y-2">
                  <Label>Salary ($)</Label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                    </span>
                    <Input
                      id="salary"
                      type="number"
                      value={salaryMargin.salary}
                      onChange={(e) =>
                        updateSalaryMargin("salary", e.target.value)
                      }
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <Label>Burden Rate (%)</Label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                      <Percent className="h-4 w-4" />
                    </span>
                    <Input
                      id="burdenRate"
                      type="number"
                      value={salaryMargin.burdenRatePercentage}
                      onChange={(e) =>
                        updateSalaryMargin(
                          "burdenRatePercentage",
                          e.target.value
                        )
                      }
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <Label>Net Available Hours</Label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                      <Info className="h-4 w-4" />
                    </span>
                    <Input
                      id="netAvailableHours"
                      type="number"
                      value={salaryMargin.netAvailableHours}
                      onChange={(e) =>
                        updateSalaryMargin("netAvailableHours", e.target.value)
                      }
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <Label>Gross Margin (%)</Label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                      <Percent className="h-4 w-4" />
                    </span>
                    <Input
                      id="grossMarginPercentage"
                      type="number"
                      value={salaryMargin.grossMarginPercentage}
                      onChange={(e) =>
                        updateSalaryMargin(
                          "grossMarginPercentage",
                          e.target.value
                        )
                      }
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardContent>
              <CardContent className="bg-muted rounded-b-lg pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <ResultField
                    label="Burden"
                    value={salaryMarginCalc.burden}
                    icon={<DollarSign className="h-4 w-4" />}
                  />
                  <ResultField
                    label="Hourly Cost"
                    value={salaryMarginCalc.hourlyCost}
                    icon={<ArrowRight className="h-4 w-4" />}
                  />
                  <ResultField
                    label="Hourly Bill Rate"
                    value={salaryMarginCalc.hourlyBillRate}
                    icon={<DollarSign className="h-4 w-4" />}
                  />
                  <ResultField
                    label="Monthly Pay"
                    value={salaryMarginCalc.monthlyPay}
                    icon={<RefreshCw className="h-4 w-4" />}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Rate Margin Card */}
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle>Rate Margin</CardTitle>
                <CardDescription>
                  Calculate margins based on hourly rate
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 flex-grow">
                <div className="flex flex-col space-y-2">
                  <Label>Burden Rate (%)</Label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                      <Percent className="h-4 w-4" />
                    </span>
                    <Input
                      id="burdenRate"
                      type="number"
                      value={rateMargin.burdenRatePercentage}
                      onChange={(e) =>
                        updateRateMargin("burdenRatePercentage", e.target.value)
                      }
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <Label>Gross Margin (%)</Label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                      <Percent className="h-4 w-4" />
                    </span>
                    <Input
                      id="grossMarginPercentage"
                      type="number"
                      value={rateMargin.grossMarginPercentage}
                      onChange={(e) =>
                        updateRateMargin(
                          "grossMarginPercentage",
                          e.target.value
                        )
                      }
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <Label>Hourly Bill Rate</Label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                    </span>
                    <Input
                      id="hourlyBillRate"
                      type="number"
                      value={rateMargin.hourlyBillRate}
                      onChange={(e) =>
                        updateRateMargin("hourlyBillRate", e.target.value)
                      }
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <Label>Net Available Hours</Label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                      <Info className="h-4 w-4" />
                    </span>
                    <Input
                      id="netAvailableHours"
                      type="number"
                      value={rateMargin.netAvailableHours}
                      onChange={(e) =>
                        updateRateMargin("netAvailableHours", e.target.value)
                      }
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardContent>
              <CardContent className="bg-muted rounded-b-lg pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <ResultField
                    label="Burden"
                    value={rateMarginCalc.burden}
                    icon={<DollarSign className="h-4 w-4" />}
                  />
                  <ResultField
                    label="Hourly Cost"
                    value={rateMarginCalc.hourlyCost}
                    icon={<ArrowRight className="h-4 w-4" />}
                  />
                  <ResultField
                    label="Salary"
                    value={rateMarginCalc.salary}
                    icon={<DollarSign className="h-4 w-4" />}
                  />
                  <ResultField
                    label="Monthly Pay"
                    value={rateMarginCalc.monthlyPay}
                    icon={<RefreshCw className="h-4 w-4" />}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Salary Rate Card */}
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle>Salary Rate</CardTitle>
                <CardDescription>
                  Calculate margins based on salary and rate
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 flex-grow">
                <div className="flex flex-col space-y-2">
                  <Label>Salary ($)</Label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                    </span>
                    <Input
                      id="salary"
                      type="number"
                      value={salaryRate.salary}
                      onChange={(e) =>
                        updateSalaryRate("salary", e.target.value)
                      }
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <Label>Burden Rate (%)</Label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                      <Percent className="h-4 w-4" />
                    </span>
                    <Input
                      id="burdenRate"
                      type="number"
                      value={salaryRate.burdenRatePercentage}
                      onChange={(e) =>
                        updateSalaryRate("burdenRatePercentage", e.target.value)
                      }
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <Label>Hourly Bill Rate</Label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                    </span>
                    <Input
                      id="hourlyBillRate"
                      type="number"
                      value={salaryRate.hourlyBillRate}
                      onChange={(e) =>
                        updateSalaryRate("hourlyBillRate", e.target.value)
                      }
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <Label>Net Available Hours</Label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                      <Info className="h-4 w-4" />
                    </span>
                    <Input
                      id="netAvailableHours"
                      type="number"
                      value={salaryRate.netAvailableHours}
                      onChange={(e) =>
                        updateSalaryRate("netAvailableHours", e.target.value)
                      }
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardContent>
              <CardContent className="bg-muted rounded-b-lg pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <ResultField
                    label="Burden"
                    value={salaryRateCalc.burden}
                    icon={<DollarSign className="h-4 w-4" />}
                  />
                  <ResultField
                    label="Hourly Cost"
                    value={salaryRateCalc.hourlyCost}
                    icon={<ArrowRight className="h-4 w-4" />}
                  />
                  <ResultField
                    label="Gross Margin (%)"
                    value={salaryRateCalc.grossMarginPercentage}
                    icon={<Percent className="h-4 w-4" />}
                  />
                  <ResultField
                    label="Monthly Pay"
                    value={salaryRateCalc.monthlyPay}
                    icon={<RefreshCw className="h-4 w-4" />}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Comparison</CardTitle>
              <CardDescription>
                Compare results across all calculation methods
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Metric</TableHead>
                    <TableHead>Salary Margin</TableHead>
                    <TableHead>Rate Margin</TableHead>
                    <TableHead>Salary Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Hourly Bill Rate</TableCell>
                    <TableCell>
                      ${salaryMarginCalc.hourlyBillRate.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      ${rateMargin.hourlyBillRate.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      ${salaryRate.hourlyBillRate.toFixed(2)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Salary</TableCell>
                    <TableCell>${salaryMargin.salary.toFixed(2)}</TableCell>
                    <TableCell>${rateMarginCalc.salary.toFixed(2)}</TableCell>
                    <TableCell>${salaryRate.salary.toFixed(2)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Burden</TableCell>
                    <TableCell>${salaryMarginCalc.burden.toFixed(2)}</TableCell>
                    <TableCell>${rateMarginCalc.burden.toFixed(2)}</TableCell>
                    <TableCell>${salaryRateCalc.burden.toFixed(2)}</TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell>Gross Margin</TableCell>
                    <TableCell>
                      <span
                        className={
                          salaryMargin.grossMarginPercentage < 25
                            ? "text-red-500"
                            : salaryMargin.grossMarginPercentage <= 35
                            ? "text-blue-500"
                            : "text-green-500"
                        }
                      >
                        {salaryMargin.grossMarginPercentage.toFixed(2)}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          rateMargin.grossMarginPercentage < 25
                            ? "text-red-500"
                            : rateMargin.grossMarginPercentage <= 35
                            ? "text-blue-500"
                            : "text-green-500"
                        }
                      >
                        {rateMargin.grossMarginPercentage.toFixed(2)}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          salaryRateCalc.grossMarginPercentage < 25
                            ? "text-red-500"
                            : salaryRateCalc.grossMarginPercentage <= 35
                            ? "text-blue-500"
                            : "text-green-500"
                        }
                      >
                        {salaryRateCalc.grossMarginPercentage.toFixed(2)}%
                      </span>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Monthly Pay</TableCell>
                    <TableCell>
                      ${salaryMarginCalc.monthlyPay.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      ${rateMarginCalc.monthlyPay.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      ${salaryRateCalc.monthlyPay.toFixed(2)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button
              onClick={resetToDefaults}
              variant="outline"
              className="w-full max-w-xs"
            >
              <RefreshCw className="mr-2 h-4 w-4" /> Reset to Defaults
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
