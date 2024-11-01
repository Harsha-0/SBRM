"use client";

import { useState, useEffect } from "react";
import { Button } from "../components/ui/button.jsx";
import { Card, CardContent, CardFooter } from "../components/ui/card.jsx";
import { Input } from "../components/ui/input.jsx";
import { Label } from "../components/ui/label.jsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select.jsx";
import { Switch } from "../components/ui/switch.jsx";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { Calendar } from "../components/ui/calendar.jsx";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover.jsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog.jsx";
import { ScrollArea } from "../components/ui/scroll-area.jsx";
import supabase from "../utils/SupabaseClient.js";
import PropTypes from "prop-types";
import { cn } from "../lib/utils.js";

export default function EmployeeFormModal({
  employeeData,
  onClose,
  onSuccess,
}) {
  const [firstName, setFirstName] = useState(employeeData?.first_name || "");
  const [lastName, setLastName] = useState(employeeData?.last_name || "");
  const [startDate, setStartDate] = useState(employeeData?.start_date || null);
  const [lastPayIncreaseDate, setLastPayIncreaseDate] = useState(
    employeeData?.date_of_last_pay_increase || null
  );
  const [monthlySalary, setMonthlySalary] = useState(
    employeeData?.monthly_salary || ""
  );
  const [billRate, setBillRate] = useState(employeeData?.bill_rate || "");

  const [futa, setFuta] = useState(false);
  const [ss, setSs] = useState(false);
  const [medicare, setMedicare] = useState(false);
  const [sui, setSui] = useState(false);

  const [erInsurance, setErInsurance] = useState(
    employeeData?.erInsurance || 0
  );
  const [erRetirement, setErRetirement] = useState(
    employeeData?.erRetirement || 0
  );
  const [hsa, setHsa] = useState(employeeData?.hsa || 0);

  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [titles, setTitles] = useState([]);
  const [selectedTitle, setSelectedTitle] = useState("");
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [projectTypes, setProjectTypes] = useState([]);
  const [selectedProjectType, setSelectedProjectType] = useState("");
  const [endDate, setEndDate] = useState(
    employeeData?.employment_end_date || null
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: departmentsData } = await supabase
          .schema("resource_management")
          .from("resource_categories")
          .select("category_id, category_name");
        setDepartments(departmentsData);

        const { data: titlesData } = await supabase
          .schema("resource_management")
          .from("employee_title")
          .select("title_id, title");
        setTitles(titlesData);

        const { data: projectsData } = await supabase
          .schema("resource_management")
          .from("projects_list")
          .select("project_id, project_name");
        setProjects(projectsData);

        const { data: projectTypesData } = await supabase
          .schema("resource_management")
          .from("project_types")
          .select("type_id, billing_type");
        setProjectTypes(projectTypesData);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (employeeData) {
      setFirstName(employeeData.first_name);
      setLastName(employeeData.last_name);
      setStartDate(employeeData.start_date);
      setLastPayIncreaseDate(employeeData.date_of_last_pay_increase);
      setMonthlySalary(employeeData.monthly_salary);
      setBillRate(employeeData.bill_rate);
      setErInsurance(employeeData.erInsurance || 0); // Ensure 0 is shown
      setErRetirement(employeeData.erRetirement || 0); // Ensure 0 is shown
      setHsa(employeeData.hsa || 0); // Ensure 0 is shown
      setSelectedDepartment(employeeData.department);
      setSelectedTitle(employeeData.title);
      setSelectedProject(employeeData.current_project);
      setSelectedProjectType(employeeData.type);
      setEndDate(employeeData.employment_end_date);
    }
  }, [employeeData]);
  const validateForm = () => {
    if (
      !firstName ||
      !lastName ||
      !startDate ||
      !monthlySalary ||
      !selectedTitle ||
      !selectedDepartment ||
      !selectedProject ||
      !selectedProjectType ||
      !billRate
    ) {
      alert("Please fill in all required fields.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    try {
      const { data: employeeData, error: employeeError } = await supabase
        .schema("resource_management")
        .from("employees")
        .insert([
          {
            first_name: firstName,
            last_name: lastName,
            start_date: startDate,
            date_of_last_pay_increase: lastPayIncreaseDate,
            employment_end_date: endDate,
            monthly_salary: monthlySalary,
            created_by: null,
            title_id: selectedTitle,
            current_project: selectedProject,
            project_type: selectedProjectType,
            bill_rate: billRate,
            category: selectedDepartment,
          },
        ])
        .select("employee_id")
        .single();

      if (employeeError) {
        console.error("Error inserting employee data:", employeeError);
        throw employeeError;
      }

      const employeeId = employeeData?.employee_id;
      if (!employeeId) {
        throw new Error(
          "Failed to retrieve employee_id (UUID) from the employee insert."
        );
      }

      // Insert employer burden data using the switch values (true/false)
      const { data: burdenData, error: burdenError } = await supabase
        .schema("resource_management")
        .from("employer_burden")
        .insert([
          {
            employee_id: employeeId,
            er_insurance: erInsurance || 0,
            er_retirement: erRetirement || 0,
            hsa: hsa || 0,
            is_futa: futa,
            is_ss: ss,
            is_med: medicare,
            is_sui: sui,
          },
        ]);

      if (burdenError) {
        console.error("Error inserting employer burden data:", burdenError);
        throw burdenError;
      }

      console.log("Employee and employer burden data inserted successfully!");

      // Call onSuccess with new employee data to render in UI
      onSuccess(employeeData);

      // Added: Reload the page after successful submission
      window.location.reload();

      console.log("Closing modal...");
      onClose(); // Ensure this is called after successful submission
    } catch (error) {
      console.error("Error during submission:", error);
    }
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Add Employee</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] md:max-w-[700px] lg:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
          <DialogDescription>
            Enter the details of the new employee below.
          </DialogDescription>
        </DialogHeader>
        <Card className="max-h-[70vh] flex flex-col">
          <ScrollArea className="flex-grow">
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Enter first name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Enter last name"
                      required
                    />
                  </div>
                </div>

                {/* Updated: Department selection with ID */}
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select
                    required
                    value={selectedDepartment}
                    onValueChange={setSelectedDepartment}
                  >
                    <SelectTrigger id="department">
                      <SelectValue placeholder="Select a department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem
                          key={dept.category_id}
                          value={dept.category_id.toString()} // Pass ID here
                        >
                          {dept.category_name} {/* Display name */}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Updated: Title selection with ID */}
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Select
                    required
                    value={selectedTitle}
                    onValueChange={setSelectedTitle}
                  >
                    <SelectTrigger id="title">
                      <SelectValue placeholder="Select a title" />
                    </SelectTrigger>
                    <SelectContent>
                      {titles.map((title) => (
                        <SelectItem
                          key={title.title_id}
                          value={title.title_id.toString()} // Pass ID here
                        >
                          {title.title} {/* Display name */}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={`w-full justify-start text-left font-normal ${
                            !startDate ? "text-muted-foreground" : ""
                          }`}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? (
                            format(startDate, "PPP")
                          ) : (
                            <span>Select start date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastPayIncrease">
                      Date of Last Pay Increase
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={`w-full justify-start text-left font-normal ${
                            !lastPayIncreaseDate ? "text-muted-foreground" : ""
                          }`}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {lastPayIncreaseDate ? (
                            format(lastPayIncreaseDate, "PPP")
                          ) : (
                            <span>Select date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={lastPayIncreaseDate}
                          onSelect={setLastPayIncreaseDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="endDate"
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !endDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? (
                            format(endDate, "PPP")
                          ) : (
                            <span>Select end date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="monthlySalary">Monthly Salary</Label>
                    <Input
                      id="monthlySalary"
                      type="number"
                      value={monthlySalary}
                      onChange={(e) => setMonthlySalary(e.target.value)}
                      placeholder="Enter salary in dollars"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="billRate">Bill Rate</Label>
                  <Input
                    id="billRate"
                    type="number"
                    value={billRate}
                    onChange={(e) => setBillRate(e.target.value)}
                    placeholder="Enter bill rate in dollars"
                    required
                  />
                </div>

                {/* Updated: Project selection with ID */}
                <div className="space-y-2">
                  <Label htmlFor="currentProject">Current Project</Label>
                  <Select
                    required
                    value={selectedProject}
                    onValueChange={setSelectedProject}
                  >
                    <SelectTrigger id="currentProject">
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem
                          key={project.project_id}
                          value={project.project_id} // Pass ID here
                        >
                          {project.project_name} {/* Display name */}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Updated: Project Type selection with ID */}
                <div className="space-y-2">
                  <Label htmlFor="projectType">Project Type</Label>
                  <Select
                    required
                    value={selectedProjectType}
                    onValueChange={setSelectedProjectType}
                  >
                    <SelectTrigger id="projectType">
                      <SelectValue placeholder="Select a project type" />
                    </SelectTrigger>
                    <SelectContent>
                      {projectTypes.map((type) => (
                        <SelectItem key={type.type_id} value={type.type_id}>
                          {type.billing_type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="erInsurance">ER Insurance</Label>
                    <Input
                      id="erInsurance"
                      type="number"
                      value={erInsurance}
                      onChange={(e) => setErInsurance(e.target.value)}
                      placeholder="Enter insurance amount"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="erRetirement">ER Retirement</Label>
                    <Input
                      id="erRetirement"
                      type="number"
                      value={erRetirement}
                      onChange={(e) => setErRetirement(e.target.value)}
                      placeholder="Enter retirement amount"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hsa">HSA</Label>
                    <Input
                      id="hsa"
                      type="number"
                      value={hsa}
                      onChange={(e) => setHsa(e.target.value)}
                      placeholder="Enter HSA amount"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="futa">FUTA</Label>
                    <Switch
                      id="futa"
                      checked={futa}
                      onCheckedChange={setFuta}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="ss">Social Security Tax</Label>
                    <Switch id="ss" checked={ss} onCheckedChange={setSs} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="medicare">Medicare</Label>
                    <Switch
                      id="medicare"
                      checked={medicare}
                      onCheckedChange={setMedicare}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sui">SUI</Label>
                    <Switch id="sui" checked={sui} onCheckedChange={setSui} />
                  </div>
                </div>
              </form>
            </CardContent>
          </ScrollArea>
          <CardFooter className="border-t pt-4">
            <Button type="submit" className="w-full" onClick={handleSubmit}>
              Add Employee
            </Button>
          </CardFooter>
        </Card>
      </DialogContent>
    </Dialog>
  );
}

EmployeeFormModal.propTypes = {
  employeeData: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};
