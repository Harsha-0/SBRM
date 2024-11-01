import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout.jsx";
import { MoreHorizontal, Search } from "lucide-react";
import { Button } from "../components/ui/button.jsx";
import { Input } from "../components/ui/input.jsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select.jsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table.jsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu.jsx";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog.jsx";
import { ScrollArea } from "../components/ui/scroll-area.jsx";
import { Card, CardContent, CardFooter } from "../components/ui/card.jsx";
import supabase from "../utils/SupabaseClient.js";
import EmployeeFormModal from "./EmployeesFormModal.jsx";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover.jsx";
import { Calendar } from "../components/ui/calendar.jsx";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { Label } from "../components/ui/label.jsx";
import { Switch } from "../components/ui/switch.jsx";

// Add this helper function at the top of your component or in a separate utility file
const isValidDate = (dateString) => {
  return dateString && !isNaN(new Date(dateString).getTime());
};

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [titles, setTitles] = useState([]);
  const [projects, setProjects] = useState([]);
  const [projectTypes, setProjectTypes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const { data, error } = await supabase
          .schema("resource_management")
          .from("resource_categories")
          .select("category_id, category_name");

        if (error) throw error;

        setDepartments([{ category_id: "All", category_name: "All" }, ...data]);
      } catch (err) {
        console.error("Error fetching departments:", err);
        setError(err.message);
      }
    };

    const fetchEmployees = async () => {
      try {
        const { data, error } = await supabase
          .schema("resource_management")
          .from("employees").select(`
            employee_id,
            first_name,
            last_name,
            employee_title(title_id,title),
            resource_categories(category_id, category_name),
            start_date,
            employment_end_date,
            date_of_last_pay_increase,
            monthly_salary,
            bill_rate,
            projects_list(project_id,project_name),
            project_types(type_id, billing_type),
            employer_burden(
              er_insurance,
              er_retirement,
              hsa,
              is_futa,
              is_ss,
              is_med,
              is_sui
            )
          `);

        if (error) throw error;

        const transformedData = data.map((emp) => {
          const employerBurden = emp.employer_burden?.[0] || {};

          // Add this console.log
          console.log(
            `Employee ${emp.first_name} ${emp.last_name} end date:`,
            emp.employment_end_date,
            "Included in filter:",
            emp.employment_end_date === null ||
              emp.employment_end_date === "" ||
              emp.employment_end_date === "N/A" ||
              emp.employment_end_date === "-" ||
              new Date(emp.employment_end_date) > new Date()
          );

          return {
            id: emp.employee_id,
            firstname: emp.first_name,
            lastname: emp.last_name,
            title: emp.employee_title?.title_id ?? "N/A",
            titleName: emp.employee_title?.title ?? "N/A",
            department: emp.resource_categories?.category_id ?? "N/A",
            departmentName: emp.resource_categories?.category_name ?? "N/A",
            startDate: emp.start_date ?? "N/A",
            employmentEndDate: emp.employment_end_date ?? "N/A",
            lastHikeDate: emp.date_of_last_pay_increase ?? "N/A",
            monthlySalary: emp.monthly_salary ?? 0,
            billRate: emp.bill_rate ?? 0,
            currentProject: emp.projects_list?.project_id ?? "N/A",
            projectName: emp.projects_list?.project_name ?? "N/A",
            type: emp.project_types?.type_id ?? "N/A",
            typeName: emp.project_types?.billing_type ?? "N/A",
            erInsurance: employerBurden.er_insurance ?? 0,
            erRetirement: employerBurden.er_retirement ?? 0,
            hsa: employerBurden.hsa ?? 0,
            isFuta: employerBurden.is_futa ?? false,
            isSS: employerBurden.is_ss ?? false,
            isMed: employerBurden.is_med ?? false,
            isSui: employerBurden.is_sui ?? false,
          };
        });

        setEmployees(transformedData);
      } catch (err) {
        console.error("Error fetching employees:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchTitles = async () => {
      const { data, error } = await supabase
        .schema("resource_management")
        .from("employee_title")
        .select("title_id, title");
      if (error) throw error;
      setTitles(data);
    };

    const fetchProjects = async () => {
      const { data, error } = await supabase
        .schema("resource_management")
        .from("projects_list")
        .select("project_id, project_name");
      if (error) throw error;
      setProjects(data);
    };

    const fetchProjectTypes = async () => {
      const { data, error } = await supabase
        .schema("resource_management")
        .from("project_types")
        .select("type_id, billing_type");
      if (error) throw error;
      setProjectTypes(data);
    };

    fetchDepartments();
    fetchEmployees();
    fetchTitles();
    fetchProjects();
    fetchProjectTypes();
  }, []);

  const currentDate = new Date();

  const filteredEmployees = employees.filter(
    (employee) =>
      (employee.id
        .toString()
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
        employee.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.lastname.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedDepartment === "All" ||
        employee.department === selectedDepartment) &&
      (employee.employmentEndDate === null ||
        employee.employmentEndDate === "" ||
        employee.employmentEndDate === "N/A" ||
        employee.employmentEndDate === "-" ||
        new Date(employee.employmentEndDate) > currentDate)
  );

  const handleDelete = async () => {
    const { error } = await supabase
      .schema("resource_management")
      .from("employees")
      .delete()
      .eq("employee_id", employeeToDelete.id);

    if (error) {
      console.error("Error deleting employee:", error);
    } else {
      setEmployees((prevEmployees) =>
        prevEmployees.filter((emp) => emp.id !== employeeToDelete.id)
      );
      setIsDeleteDialogOpen(false);
      setEmployeeToDelete(null);
    }
  };

  const handleAddOrEditEmployee = (newEmployee) => {
    setEmployees((prevEmployees) => {
      const employeeIndex = prevEmployees.findIndex(
        (emp) => emp.id === newEmployee.employee_id
      );
      if (employeeIndex !== -1) {
        const updatedEmployees = [...prevEmployees];
        updatedEmployees[employeeIndex] = {
          ...updatedEmployees[employeeIndex],
          ...newEmployee,
        };
        return updatedEmployees;
      } else {
        return [...prevEmployees, newEmployee];
      }
    });
    setIsModalOpen(false);
  };

  const handleEditClick = (employee) => {
    const safeEmployee = {
      ...employee,
      startDate: isValidDate(employee.startDate) ? employee.startDate : null,
      lastHikeDate: isValidDate(employee.lastHikeDate)
        ? employee.lastHikeDate
        : null,
      employmentEndDate: isValidDate(employee.employmentEndDate)
        ? employee.employmentEndDate
        : null,
    };
    setSelectedEmployee(safeEmployee);
    setIsEditModalOpen(true);
  };
  const handleSaveChanges = async () => {
    // Helper function to format date as YYYY-MM-DD to avoid time zone issues
    const formatDateToLocal = (date) => {
      if (!date) return null;
      const d = new Date(date);
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); // Adjust for timezone offset
      return d.toISOString().split("T")[0]; // Return only the date part in YYYY-MM-DD
    };

    const formattedStartDate = selectedEmployee.startDate
      ? formatDateToLocal(selectedEmployee.startDate)
      : null;

    const formattedLastHikeDate = selectedEmployee.lastHikeDate
      ? formatDateToLocal(selectedEmployee.lastHikeDate)
      : null;

    const formattedEmploymentEndDate = selectedEmployee.employmentEndDate
      ? formatDateToLocal(selectedEmployee.employmentEndDate)
      : null;

    const updatedEmployee = {
      ...selectedEmployee,
      startDate: formattedStartDate,
      lastHikeDate: formattedLastHikeDate,
      employmentEndDate: formattedEmploymentEndDate,
    };

    const { error: employeeError } = await supabase
      .schema("resource_management")
      .from("employees")
      .update({
        first_name: updatedEmployee.firstname,
        last_name: updatedEmployee.lastname,
        title_id: updatedEmployee.title,
        category: updatedEmployee.department,
        start_date: updatedEmployee.startDate,
        employment_end_date: updatedEmployee.employmentEndDate,
        date_of_last_pay_increase: updatedEmployee.lastHikeDate,
        monthly_salary: updatedEmployee.monthlySalary,
        bill_rate: updatedEmployee.billRate,
        current_project: updatedEmployee.currentProject,
        project_type: updatedEmployee.type,
      })
      .eq("employee_id", updatedEmployee.id);

    const { error: employerBurdenError } = await supabase
      .schema("resource_management")
      .from("employer_burden")
      .update({
        er_insurance: updatedEmployee.erInsurance || 0,
        er_retirement: updatedEmployee.erRetirement || 0,
        hsa: updatedEmployee.hsa || 0,
        is_futa: updatedEmployee.isFuta,
        is_ss: updatedEmployee.isSS,
        is_med: updatedEmployee.isMed,
        is_sui: updatedEmployee.isSui,
      })
      .eq("employee_id", updatedEmployee.id);

    if (!employeeError && !employerBurdenError) {
      // Update the employees array with the updated employee data
      setEmployees((prevEmployees) =>
        prevEmployees.map((emp) =>
          emp.id === updatedEmployee.id
            ? {
                ...emp,
                ...updatedEmployee, // Update the employee with new data
                departmentName:
                  departments.find(
                    (dept) =>
                      dept.category_id.toString() === updatedEmployee.department
                  )?.category_name || emp.departmentName, // Update the department display name
              }
            : emp
        )
      );
      setIsEditModalOpen(false);
      setSelectedEmployee(null);
    } else {
      console.error(
        "Error updating employee:",
        employeeError || employerBurdenError
      );
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold mb-5">Employees</h1>
        <div className="flex justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Select
              value={selectedDepartment}
              onValueChange={(value) => setSelectedDepartment(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.category_id} value={dept.category_id}>
                    {dept.category_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by ID or Name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>

            <EmployeeFormModal
              employeeData={selectedEmployee}
              onClose={() => setIsModalOpen(false)}
              onSuccess={handleAddOrEditEmployee}
              titles={titles}
              departments={departments}
              projects={projects}
              projectTypes={projectTypes}
            />
          </div>
        </div>

        <div className="border rounded-md">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-4 flex justify-center">
                <span>Loading...</span>
              </div>
            ) : error ? (
              <p className="p-4 text-red-500">Error: {error}</p>
            ) : (
              <Table className="min-w-max">
                <TableHeader>
                  <TableRow>
                    <TableHead>Sl No</TableHead>
                    <TableHead>FIRST NAME</TableHead>
                    <TableHead>LAST NAME</TableHead>
                    <TableHead>TITLE</TableHead>
                    <TableHead>Start DATE</TableHead>
                    <TableHead>MONTHLY SALARY</TableHead>
                    <TableHead>LAST HIKE DATE</TableHead>
                    <TableHead>EMPLOYMENT END DATE</TableHead>
                    <TableHead>ER INSURANCE</TableHead>
                    <TableHead>ER RETIREMENT</TableHead>
                    <TableHead>HSA</TableHead>
                    <TableHead>FUTA</TableHead>
                    <TableHead>SS</TableHead>
                    <TableHead>MED</TableHead>
                    <TableHead>SUI</TableHead>
                    <TableHead>CURRENT PROJECT</TableHead>
                    <TableHead>TYPE</TableHead>
                    <TableHead>BILL RATE</TableHead>
                    <TableHead>CATEGORY</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((employee, index) => (
                    <TableRow key={employee.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="sticky left-0 z-10 bg-white w-24">
                        <Link
                          to={`/employees/${employee.id}`}
                          className="text-blue-500"
                        >
                          {employee.firstname}
                        </Link>
                      </TableCell>
                      <TableCell className="sticky left-0 z-10 bg-white w-24">
                        {employee.lastname}
                      </TableCell>
                      <TableCell>{employee.titleName}</TableCell>
                      <TableCell>
                        {employee.startDate &&
                        !isNaN(new Date(employee.startDate))
                          ? format(new Date(employee.startDate), "yyyy-MM-dd")
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        ${employee.monthlySalary?.toLocaleString() ?? "N/A"}
                      </TableCell>
                      <TableCell>
                        {employee.lastHikeDate &&
                        !isNaN(new Date(employee.lastHikeDate))
                          ? format(
                              new Date(employee.lastHikeDate),
                              "yyyy-MM-dd"
                            )
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {employee.employmentEndDate &&
                        !isNaN(new Date(employee.employmentEndDate))
                          ? format(
                              new Date(employee.employmentEndDate),
                              "yyyy-MM-dd"
                            )
                          : "-"}
                      </TableCell>
                      <TableCell>
                        ${employee.erInsurance?.toFixed(2) ?? "N/A"}
                      </TableCell>
                      <TableCell>
                        ${employee.erRetirement?.toFixed(2) ?? "N/A"}
                      </TableCell>
                      <TableCell>
                        ${employee.hsa?.toFixed(2) ?? "N/A"}
                      </TableCell>
                      <TableCell>{employee.isFuta ? "Yes" : "No"}</TableCell>
                      <TableCell>{employee.isSS ? "Yes" : "No"}</TableCell>
                      <TableCell>{employee.isMed ? "Yes" : "No"}</TableCell>
                      <TableCell>{employee.isSui ? "Yes" : "No"}</TableCell>
                      <TableCell>{employee.projectName}</TableCell>
                      <TableCell>{employee.typeName}</TableCell>
                      <TableCell>${employee.billRate ?? "N/A"}</TableCell>
                      <TableCell>{employee.departmentName}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => handleEditClick(employee)}
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setEmployeeToDelete(employee);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
            </DialogHeader>
            <p>Are you sure you want to delete this employee?</p>
            <DialogFooter>
              <Button
                variant="secondary"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Confirm Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Employee Modal */}
        {isEditModalOpen && (
          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent className="sm:max-w-[425px] md:max-w-[700px] lg:max-w-[900px]">
              <DialogHeader>
                <DialogTitle>Edit the Employee</DialogTitle>
                <p>Edit the details of the existing employee below.</p>
              </DialogHeader>
              <Card className="max-h-[70vh] flex flex-col">
                <ScrollArea className="flex-grow">
                  <CardContent>
                    <form className="space-y-6 py-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            value={selectedEmployee?.firstname || ""}
                            onChange={(e) =>
                              setSelectedEmployee({
                                ...selectedEmployee,
                                firstname: e.target.value,
                              })
                            }
                            placeholder="Enter first name"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            value={selectedEmployee?.lastname || ""}
                            onChange={(e) =>
                              setSelectedEmployee({
                                ...selectedEmployee,
                                lastname: e.target.value,
                              })
                            }
                            placeholder="Enter last name"
                            required
                          />
                        </div>
                      </div>

                      {/* Department selection */}
                      <div className="space-y-2">
                        <Label htmlFor="department">Department</Label>
                        <Select
                          value={selectedEmployee?.department?.toString() || ""}
                          onValueChange={(value) => {
                            const selectedDepartment = departments.find(
                              (dept) => dept.category_id.toString() === value
                            );
                            setSelectedEmployee({
                              ...selectedEmployee,
                              department: value, // Update the department ID (category_id)
                              departmentName:
                                selectedDepartment?.category_name || "", // Update the display name (category_name)
                            });
                          }}
                        >
                          <SelectTrigger id="department">
                            <SelectValue placeholder="Select a department" />
                          </SelectTrigger>
                          <SelectContent>
                            {departments.map((dept) => (
                              <SelectItem
                                key={dept.category_id}
                                value={dept.category_id.toString()}
                              >
                                {dept.category_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Select
                          value={selectedEmployee?.title?.toString() || ""}
                          onValueChange={(value) => {
                            const selectedTitle = titles.find(
                              (t) => t.title_id.toString() === value
                            );
                            setSelectedEmployee({
                              ...selectedEmployee,
                              title: value,
                              titleName: selectedTitle?.title || "",
                            });
                          }}
                        >
                          <SelectTrigger id="title">
                            <SelectValue placeholder="Select a title" />
                          </SelectTrigger>
                          <SelectContent>
                            {titles.map((title) => (
                              <SelectItem
                                key={title.title_id}
                                value={title.title_id.toString()}
                              >
                                {title.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Start Date, Last Pay Increase, and Employment End Date */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="startDate">Start Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={`w-full justify-start text-left font-normal ${
                                  !isValidDate(selectedEmployee?.startDate)
                                    ? "text-muted-foreground"
                                    : ""
                                }`}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {isValidDate(selectedEmployee?.startDate)
                                  ? format(
                                      new Date(selectedEmployee.startDate),
                                      "PPP"
                                    )
                                  : "Select start date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={
                                  selectedEmployee?.startDate
                                    ? new Date(selectedEmployee.startDate)
                                    : undefined
                                }
                                onSelect={(date) =>
                                  setSelectedEmployee({
                                    ...selectedEmployee,
                                    startDate: date ? date.toISOString() : null,
                                  })
                                }
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
                                variant="outline"
                                className={`w-full justify-start text-left font-normal ${
                                  !isValidDate(selectedEmployee?.lastHikeDate)
                                    ? "text-muted-foreground"
                                    : ""
                                }`}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {isValidDate(selectedEmployee?.lastHikeDate)
                                  ? format(
                                      new Date(selectedEmployee.lastHikeDate),
                                      "PPP"
                                    )
                                  : "Select date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={
                                  selectedEmployee?.lastHikeDate
                                    ? new Date(selectedEmployee.lastHikeDate)
                                    : undefined
                                }
                                onSelect={(date) =>
                                  setSelectedEmployee({
                                    ...selectedEmployee,
                                    lastHikeDate: date
                                      ? date.toISOString()
                                      : null,
                                  })
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="employmentEndDate">
                            Employment End Date
                          </Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={`w-full justify-start text-left font-normal ${
                                  !isValidDate(
                                    selectedEmployee?.employmentEndDate
                                  )
                                    ? "text-muted-foreground"
                                    : ""
                                }`}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {isValidDate(
                                  selectedEmployee?.employmentEndDate
                                )
                                  ? format(
                                      new Date(
                                        selectedEmployee.employmentEndDate
                                      ),
                                      "PPP"
                                    )
                                  : "Select end date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={
                                  selectedEmployee?.employmentEndDate
                                    ? new Date(
                                        selectedEmployee.employmentEndDate
                                      )
                                    : undefined
                                }
                                onSelect={(date) =>
                                  setSelectedEmployee({
                                    ...selectedEmployee,
                                    employmentEndDate: date
                                      ? date.toISOString()
                                      : null,
                                  })
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>

                      {/* Monthly Salary and Bill Rate */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="monthlySalary">Monthly Salary</Label>
                          <Input
                            id="monthlySalary"
                            type="number"
                            value={selectedEmployee?.monthlySalary || ""}
                            onChange={(e) =>
                              setSelectedEmployee({
                                ...selectedEmployee,
                                monthlySalary: e.target.value,
                              })
                            }
                            placeholder="Enter salary in dollars"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="billRate">Bill Rate</Label>
                          <Input
                            id="billRate"
                            type="number"
                            value={selectedEmployee?.billRate || ""}
                            onChange={(e) =>
                              setSelectedEmployee({
                                ...selectedEmployee,
                                billRate: e.target.value,
                              })
                            }
                            placeholder="Enter bill rate in dollars"
                            required
                          />
                        </div>
                      </div>

                      {/* Project selection */}
                      <div className="space-y-2">
                        <Label htmlFor="currentProject">Current Project</Label>
                        <Select
                          value={
                            selectedEmployee?.currentProject?.toString() || ""
                          }
                          onValueChange={(value) => {
                            const selectedProject = projects.find(
                              (project) =>
                                project.project_id.toString() === value
                            );
                            setSelectedEmployee({
                              ...selectedEmployee,
                              currentProject: value, // Update the project ID
                              projectName: selectedProject?.project_name || "", // Update the display name
                            });
                          }}
                        >
                          <SelectTrigger id="currentProject">
                            <SelectValue placeholder="Select a project" />
                          </SelectTrigger>
                          <SelectContent>
                            {projects.map((project) => (
                              <SelectItem
                                key={project.project_id}
                                value={project.project_id.toString()}
                              >
                                {project.project_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Project Type selection */}
                      <div className="space-y-2">
                        <Label htmlFor="projectType">Project Type</Label>
                        <Select
                          value={selectedEmployee?.type?.toString() || ""}
                          onValueChange={(value) =>
                            setSelectedEmployee({
                              ...selectedEmployee,
                              type: value,
                              typeName:
                                projectTypes.find(
                                  (t) => t.type_id.toString() === value
                                )?.billing_type || "",
                            })
                          }
                        >
                          <SelectTrigger id="projectType">
                            <SelectValue placeholder="Select a project type" />
                          </SelectTrigger>
                          <SelectContent>
                            {projectTypes.map((type) => (
                              <SelectItem
                                key={type.type_id}
                                value={type.type_id.toString()}
                              >
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
                            value={selectedEmployee?.erInsurance ?? 0}
                            onChange={(e) =>
                              setSelectedEmployee({
                                ...selectedEmployee,
                                erInsurance: parseFloat(e.target.value) || 0,
                              })
                            }
                            placeholder="Enter insurance amount"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="erRetirement">ER Retirement</Label>
                          <Input
                            id="erRetirement"
                            type="number"
                            value={selectedEmployee?.erRetirement ?? 0}
                            onChange={(e) =>
                              setSelectedEmployee({
                                ...selectedEmployee,
                                erRetirement: parseFloat(e.target.value) || 0,
                              })
                            }
                            placeholder="Enter retirement amount"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="hsa">HSA</Label>
                          <Input
                            id="hsa"
                            type="number"
                            value={selectedEmployee?.hsa ?? 0}
                            onChange={(e) =>
                              setSelectedEmployee({
                                ...selectedEmployee,
                                hsa: parseFloat(e.target.value) || 0,
                              })
                            }
                            placeholder="Enter HSA amount"
                          />
                        </div>
                      </div>

                      {/* Employer Contribution Switches */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="isFuta">FUTA</Label>
                          <Switch
                            id="isFuta"
                            checked={selectedEmployee?.isFuta || false}
                            onCheckedChange={(value) =>
                              setSelectedEmployee({
                                ...selectedEmployee,
                                isFuta: value,
                              })
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="isSS">Social Security Tax</Label>
                          <Switch
                            id="isSS"
                            checked={selectedEmployee?.isSS || false}
                            onCheckedChange={(value) =>
                              setSelectedEmployee({
                                ...selectedEmployee,
                                isSS: value,
                              })
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="isMed">Medicare</Label>
                          <Switch
                            id="isMed"
                            checked={selectedEmployee?.isMed || false}
                            onCheckedChange={(value) =>
                              setSelectedEmployee({
                                ...selectedEmployee,
                                isMed: value,
                              })
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="isSui">SUI</Label>
                          <Switch
                            id="isSui"
                            checked={selectedEmployee?.isSui || false}
                            onCheckedChange={(value) =>
                              setSelectedEmployee({
                                ...selectedEmployee,
                                isSui: value,
                              })
                            }
                          />
                        </div>
                      </div>
                    </form>
                  </CardContent>
                </ScrollArea>
                <CardFooter className="border-t pt-4">
                  <Button className="w-full" onClick={handleSaveChanges}>
                    Save Changes
                  </Button>
                </CardFooter>
              </Card>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </Layout>
  );
}
