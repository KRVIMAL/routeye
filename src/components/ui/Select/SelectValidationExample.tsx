import React, { useState } from "react";
import { Select } from "./Select";
import { SelectOption } from "./Select.types";

const SelectValidationExample = () => {
  // Form state
  const [formData, setFormData] = useState({
    country: "",
    skills: [] as string[],
    experience: "",
    department: "",
  });

  // Error state
  const [errors, setErrors] = useState({
    country: "",
    skills: "",
    experience: "",
    department: "",
  });

  // Options
  const countryOptions: SelectOption[] = [
    { value: "us", label: "United States" },
    { value: "ca", label: "Canada" },
    { value: "uk", label: "United Kingdom" },
    { value: "de", label: "Germany" },
    { value: "fr", label: "France" },
    { value: "jp", label: "Japan" },
    { value: "au", label: "Australia" },
  ];

  const skillOptions: SelectOption[] = [
    { value: "react", label: "React" },
    { value: "vue", label: "Vue.js" },
    { value: "angular", label: "Angular" },
    { value: "nodejs", label: "Node.js" },
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "typescript", label: "TypeScript" },
    { value: "graphql", label: "GraphQL" },
  ];

  const experienceOptions: SelectOption[] = [
    { value: "0-1", label: "0-1 years" },
    { value: "2-3", label: "2-3 years" },
    { value: "4-5", label: "4-5 years" },
    { value: "6-10", label: "6-10 years" },
    { value: "10+", label: "10+ years" },
  ];

  const departmentOptions: SelectOption[] = [
    { value: "engineering", label: "Engineering" },
    { value: "design", label: "Design" },
    { value: "marketing", label: "Marketing" },
    { value: "sales", label: "Sales" },
    { value: "hr", label: "Human Resources", disabled: true }, // Disabled option
    { value: "finance", label: "Finance" },
  ];

  // Validation functions
  const validateCountry = (value: string) => {
    if (!value) {
      return "Country is required";
    }
    return "";
  };

  const validateSkills = (value: string[]) => {
    if (!value || value.length === 0) {
      return "Please select at least one skill";
    }
    if (value.length > 5) {
      return "Please select no more than 5 skills";
    }
    return "";
  };

  const validateExperience = (value: string) => {
    if (!value) {
      return "Experience level is required";
    }
    return "";
  };

  const validateDepartment = (value: string) => {
    if (!value) {
      return "Department selection is required";
    }
    return "";
  };
  // Replace these onChange handlers in your validation example:
  const handleCountryChange = (value: string | string[] | null) => {
    const stringValue = (value as string) || "";
    setFormData((prev) => ({ ...prev, country: stringValue }));

    // Validate on change (immediate feedback)
    const error = validateCountry(stringValue);
    setErrors((prev) => ({ ...prev, country: error }));
  };

  const handleSkillsChange = (value: string | string[] | null) => {
    const arrayValue = (value as string[]) || [];
    setFormData((prev) => ({ ...prev, skills: arrayValue }));

    // Validate on change (immediate feedback)
    const error = validateSkills(arrayValue);
    setErrors((prev) => ({ ...prev, skills: error }));
  };

  const handleExperienceChange = (value: string | string[] | null) => {
    const stringValue = (value as string) || "";
    setFormData((prev) => ({ ...prev, experience: stringValue }));

    // Clear any existing error when user makes a selection
    if (stringValue && errors.experience) {
      setErrors((prev) => ({ ...prev, experience: "" }));
    }
  };

  const handleDepartmentChange = (value: string | string[] | null) => {
    const stringValue = (value as string) || "";
    setFormData((prev) => ({ ...prev, department: stringValue }));

    // Clear any existing error when user makes a selection
    if (stringValue && errors.department) {
      setErrors((prev) => ({ ...prev, department: "" }));
    }
  };

  // Replace these onBlur handlers:
  const handleCountryBlur = (value: string | string[] | null | undefined) => {
    setTimeout(() => {
      const stringValue = (value as string) || "";
      const error = validateCountry(stringValue);
      setErrors((prev) => ({ ...prev, country: error }));
    }, 150);
  };

  const handleSkillsBlur = (value: string | string[] | null | undefined) => {
    const arrayValue = (value as string[]) || [];
    const error = validateSkills(arrayValue);
    setErrors((prev) => ({ ...prev, skills: error }));
  };

  // Or use this simpler approach with setTimeout:
  const handleExperienceBlur = (
    value: string | string[] | null | undefined
  ) => {
    // Delay validation to allow state to update properly
    setTimeout(() => {
      const stringValue = (value as string) || "";
      const error = validateExperience(stringValue);
      setErrors((prev) => ({ ...prev, experience: error }));
    }, 150);
  };

  const handleDepartmentBlur = (
    value: string | string[] | null | undefined
  ) => {
    // Delay validation to allow state to update properly
    setTimeout(() => {
      const stringValue = (value as string) || "";
      const error = validateDepartment(stringValue);
      setErrors((prev) => ({ ...prev, department: error }));
    }, 150);
  };
  // Form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const newErrors = {
      country: validateCountry(formData.country),
      skills: validateSkills(formData.skills),
      experience: validateExperience(formData.experience),
      department: validateDepartment(formData.department),
    };

    setErrors(newErrors);

    // Check if form is valid
    const isValid = Object.values(newErrors).every((error) => error === "");

    if (isValid) {
      alert(
        "Form submitted successfully!\n\n" + JSON.stringify(formData, null, 2)
      );
    } else {
      alert("Please fix the errors before submitting");
    }
  };

  // Reset form
  const handleReset = () => {
    setFormData({
      country: "",
      skills: [],
      experience: "",
      department: "",
    });
    setErrors({
      country: "",
      skills: "",
      experience: "",
      department: "",
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        User Profile Form
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Country Selection - Validate on Change (Immediate) */}
        <div>
          <Select
            variant="floating"
            label="Country (Validate on Change)"
            required
            options={countryOptions}
            value={formData.country}
            onChange={handleCountryChange}
            onBlur={handleCountryBlur}
            placeholder="Select your country..."
            error={errors.country}
            helperText={
              !errors.country ? "Validates immediately on change" : undefined
            }
            searchable
            clearable
            size="lg"
          />
        </div>

        {/* Skills Selection - Validate on Change (Immediate) */}
        <div>
          <Select
            variant="normal"
            label="Technical Skills (Validate on Change)"
            required
            options={skillOptions}
            value={formData.skills}
            onChange={handleSkillsChange}
            onBlur={handleSkillsBlur}
            placeholder="Select your skills..."
            error={errors.skills}
            helperText={
              !errors.skills
                ? "Validates immediately - Select 1-5 skills"
                : undefined
            }
            multiSelect
            searchable
            clearable
            size="md"
          />
        </div>

        {/* Experience Level - Validate on Blur Only */}
        <div>
          <Select
            variant="floating"
            label="Experience Level (Validate on Blur)"
            required
            asteriskPosition="left"
            options={experienceOptions}
            value={formData.experience}
            onChange={handleExperienceChange}
            onBlur={handleExperienceBlur}
            placeholder="Select experience level..."
            error={errors.experience}
            helperText={
              !errors.experience
                ? "Validates only when you leave this field"
                : undefined
            }
            size="lg"
          />
        </div>

        {/* Department - Validate on Blur Only */}
        <div>
          <Select
            variant="normal"
            label="Department (Validate on Blur)"
            required
            options={departmentOptions}
            value={formData.department}
            onChange={handleDepartmentChange}
            onBlur={handleDepartmentBlur}
            placeholder="Choose department..."
            error={errors.department}
            helperText={
              !errors.department
                ? "Validates when field loses focus - Some departments may not be available"
                : undefined
            }
            clearable
            size="md"
          />
        </div>

        {/* Loading State Example */}
        <div>
          <Select
            variant="floating"
            label="Loading Example"
            options={[]}
            value=""
            onChange={() => {}}
            placeholder="Loading..."
            loading={true}
            helperText="This shows the loading state"
            size="lg"
          />
        </div>

        {/* Disabled State Example */}
        <div>
          <Select
            variant="normal"
            label="Disabled Field"
            options={countryOptions}
            value="us"
            onChange={() => {}}
            placeholder="Cannot change this"
            disabled={true}
            helperText="This field is disabled"
            size="md"
          />
        </div>

        {/* Form Actions */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
          >
            Submit Form
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors font-medium"
          >
            Reset Form
          </button>
        </div>

        {/* Form Data Display */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Form Data:
          </h3>
          <pre className="text-sm text-gray-600 overflow-auto">
            {JSON.stringify(formData, null, 2)}
          </pre>
        </div>

        {/* Validation Strategy Info */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-700 mb-2">
            Validation Strategies Used:
          </h3>
          <div className="text-sm text-blue-600 space-y-2">
            <div>
              <strong>Country & Skills:</strong> Validate on Change (immediate
              feedback)
            </div>
            <div>
              <strong>Experience & Department:</strong> Validate on Blur
              (validate when leaving field)
            </div>
            <div>
              <strong>Form Submit:</strong> Validates all fields regardless of
              strategy
            </div>
          </div>
        </div>

        {/* Advanced Validation Example */}
        <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="text-lg font-semibold text-green-700 mb-3">
            Advanced Validation Patterns:
          </h3>
          <div className="space-y-2 text-sm text-green-600">
            <div>
              <strong>Real-time validation:</strong> Shows errors immediately as
              user types/selects
            </div>
            <div>
              <strong>Deferred validation:</strong> Waits until user finishes
              with field (onBlur)
            </div>
            <div>
              <strong>Submit validation:</strong> Final check before form
              submission
            </div>
            <div>
              <strong>Conditional validation:</strong> Different rules based on
              other field values
            </div>
            <div>
              <strong>Async validation:</strong> Server-side validation (not
              shown in this example)
            </div>
          </div>
        </div>

        {/* Error State Display */}
        {Object.values(errors).some((error) => error) && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="text-lg font-semibold text-red-700 mb-2">
              Validation Errors:
            </h3>
            <ul className="text-sm text-red-600 space-y-1">
              {Object.entries(errors).map(
                ([field, error]) =>
                  error && (
                    <li key={field}>
                      <strong>{field}:</strong> {error}
                    </li>
                  )
              )}
            </ul>
          </div>
        )}
      </form>
    </div>
  );
};

export default SelectValidationExample;
