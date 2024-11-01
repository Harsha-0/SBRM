import Layout from "../components/Layout.jsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table.jsx";
import { Input } from "../components/ui/input.jsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select.jsx";
import { Button } from "../components/ui/button.jsx";
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
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog.jsx";
import { MoreHorizontal } from "lucide-react";
import supabase from "../utils/SupabaseClient.js";
import { format } from "date-fns";
import { Label } from "../components/ui/label.jsx";
import { ScrollArea } from "../components/ui/scroll-area.jsx";
import { Card, CardContent, CardFooter } from "../components/ui/card.jsx";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover.jsx";
import { Calendar } from "../components/ui/calendar.jsx";
import { CalendarIcon } from "@radix-ui/react-icons";
import { Switch } from "../components/ui/switch.jsx";
import { useCallback, useEffect, useState } from "react";
export default function OffboardedResources() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [titles, setTitles] = useState([]);
  const [projects, setProjects] = useState([]);
  const [projectTypes, setProjectTypes] = useState([]);
  const [updateTrigger, setUpdateTrigger] = useState(0);

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .schema("resource_management")
        .from("employees")
        .select(
          `
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
        `
        )
        .not("employment_end_date", "is", null);

      if (error) throw error;

      const transformedData = data.map((emp) => {
        const employerBurden = emp.employer_burden?.[0] || {};
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
  }, []);

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
  }, [fetchEmployees]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees, updateTrigger]);

  const filteredEmployees = employees.filter(
    (employee) =>
      (employee.id
        .toString()
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
        employee.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.lastname.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedDepartment === "All" ||
        employee.department === selectedDepartment)
  );

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

  const handleSaveChanges = useCallback(async () => {
    const formatDateToLocal = (date) => {
      if (!date) return null;
      const d = new Date(date);
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      return d.toISOString().split("T")[0];
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
      fetchEmployees();
      setIsEditModalOpen(false);
      setSelectedEmployee(null);
      setUpdateTrigger((prev) => prev + 1);
    } else {
      console.error(
        "Error updating employee:",
        employeeError || employerBurdenError
      );
    }
  }, [selectedEmployee, fetchEmployees]);

  return (
    <Layout>
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold mb-5">Offboarded Resources</h1>
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
            <Input
              placeholder="Search by ID or Name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </div>

        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sl No</TableHead>
                <TableHead>First Name</TableHead>
                <TableHead>Last Name</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Last Hike Date</TableHead>
                <TableHead>Monthly Salary</TableHead>
                <TableHead>Bill Rate</TableHead>
                <TableHead>Last Project</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={13} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={13} className="text-center text-red-500">
                    Error: {error}
                  </TableCell>
                </TableRow>
              ) : filteredEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={13} className="text-center">
                    No offboarded employees found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmployees.map((employee, index) => (
                  <TableRow key={employee.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{employee.firstname}</TableCell>
                    <TableCell>{employee.lastname}</TableCell>
                    <TableCell>{employee.titleName}</TableCell>
                    <TableCell>
                      {format(new Date(employee.startDate), "yyyy-MM-dd")}
                    </TableCell>
                    <TableCell>
                      {employee.employmentEndDate &&
                      isValidDate(employee.employmentEndDate)
                        ? format(
                            new Date(employee.employmentEndDate),
                            "yyyy-MM-dd"
                          )
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      {employee.lastHikeDate !== "N/A"
                        ? format(new Date(employee.lastHikeDate), "yyyy-MM-dd")
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      ${employee.monthlySalary.toLocaleString()}
                    </TableCell>
                    <TableCell>${employee.billRate.toLocaleString()}</TableCell>
                    <TableCell>{employee.projectName}</TableCell>
                    <TableCell>{employee.typeName}</TableCell>
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
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {isEditModalOpen && selectedEmployee && (
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
                            department: value,
                            departmentName:
                              selectedDepartment?.category_name || "",
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
                          <PopoverContent className="w-auto p-0" align="start">
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
                        <Label htmlFor="lastHikeDate">Last Hike Date</Label>
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
                          <PopoverContent className="w-auto p-0" align="start">
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
                              {isValidDate(selectedEmployee?.employmentEndDate)
                                ? format(
                                    new Date(
                                      selectedEmployee.employmentEndDate
                                    ),
                                    "PPP"
                                  )
                                : "Select end date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={
                                selectedEmployee?.employmentEndDate
                                  ? new Date(selectedEmployee.employmentEndDate)
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

                    <div className="space-y-2">
                      <Label htmlFor="currentProject">Current Project</Label>
                      <Select
                        value={
                          selectedEmployee?.currentProject?.toString() || ""
                        }
                        onValueChange={(value) => {
                          const selectedProject = projects.find(
                            (project) => project.project_id.toString() === value
                          );
                          setSelectedEmployee({
                            ...selectedEmployee,
                            currentProject: value,
                            projectName: selectedProject?.project_name || "",
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
    </Layout>
  );
}

// Add this helper function at the top of your component or in a separate utility file
const isValidDate = (dateString) => {
  return dateString && !isNaN(new Date(dateString).getTime());
};
