import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { EmployeeModel, SkillModel } from "../../interfaces/Models";
import { useQueryErrorToast } from "../../hooks/useQueryErrorToast";
import { detailEmployee } from "../../services/api/employee";
import { fetchSkills } from "../../services/api/skills";
import {
  employeeSkillFormSchema,
  type EmployeeSkillFormOutput,
  type EmployeeSkillFormValues,
} from "../../services/schema/employee";
import { FormCheckboxGroup, type BaseFormProps } from "./FormBase";

export type { EmployeeSkillFormValues, EmployeeSkillFormOutput };
/** @deprecated Use EmployeeSkillFormOutput */
export type Schema = EmployeeSkillFormOutput;

function toSkillIds(skills: SkillModel[] | undefined): number[] {
  return skills?.map((s) => s.id) ?? [];
}

export const EmployeeSkillForm = ({
  formId,
  onSubmit,
  employee,
}: BaseFormProps<EmployeeSkillFormValues, EmployeeSkillFormOutput> & {
  employee: EmployeeModel;
}) => {
  const skills = useQuery({
    queryKey: ["skills"],
    queryFn: () =>
      fetchSkills().then((response) => response.data.data ?? []),
  });
  useQueryErrorToast(skills.error, "Erreur lors du chargement des compétences");

  const userSkills = useQuery({
    queryKey: ["userSkills", { employeeId: employee.id }],
    queryFn: () =>
      detailEmployee(employee.id).then((response) => {
        const emp = response.data.data;
        const raw = emp?.skills ?? [];
        return Array.isArray(raw) ? (raw as SkillModel[]) : [];
      }),
    enabled: !!employee.id,
  });
  useQueryErrorToast(
    userSkills.error,
    "Erreur lors du chargement des compétences de l'employée",
  );

  const skillsForm = useForm<
    EmployeeSkillFormValues,
    unknown,
    EmployeeSkillFormOutput
  >({
    defaultValues: { skills: [] },
    resolver: zodResolver(employeeSkillFormSchema),
  });

  useEffect(() => {
    if (userSkills.data !== undefined) {
      skillsForm.reset({ skills: toSkillIds(userSkills.data) });
    }
  }, [userSkills.data, skillsForm]);
  return (
    <form
      id={formId}
      onSubmit={skillsForm.handleSubmit(onSubmit, (errors) =>
        console.log(errors),
      )}
    >
      <FormCheckboxGroup
        name="skills"
        control={skillsForm.control}
        label="Compétences de l'employée"
        options={(skills.data ?? []).map((skill) => ({
          value: skill.id,
          label: skill.name,
        }))}
      />
    </form>
  );
};
