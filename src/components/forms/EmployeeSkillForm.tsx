import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import type { EmployeeModel, SkillModel } from "../../interfaces/Models";
import { useQueryErrorToast } from "../../hooks/useQueryErrorToast";
import { detailEmployee } from "../../services/api/employee";
import { fetchSkills } from "../../services/api/skills";
import { FormCheckboxGroup, type BaseFormProps } from "./FormBase";

const schema = z.object({
  skills: z.array(z.number()),
});
export type Schema = z.infer<typeof schema>;

function toSkillIds(skills: SkillModel[] | undefined): number[] {
  return skills?.map((s) => s.id) ?? [];
}

export const EmployeeSkillForm = ({
  formId,
  onSubmit,
  employee,
}: BaseFormProps<Schema> & { employee: EmployeeModel }) => {
  const skills = useQuery({
    queryKey: ["skills"],
    queryFn: () =>
      fetchSkills().then((response) => response.data.skills || []),
  });
  useQueryErrorToast(skills.error, "Erreur lors du chargement des compétences");

  const userSkills = useQuery({
    queryKey: ["userSkills", { employeeId: employee.id }],
    queryFn: () =>
      detailEmployee(employee.id).then((response) => {
        const emp = response.data.data;
        const raw = emp?.Skills ?? (emp as { skills?: SkillModel[] })?.skills ?? [];
        return Array.isArray(raw) ? (raw as SkillModel[]) : [];
      }),
    enabled: !!employee.id,
  });
  useQueryErrorToast(
    userSkills.error,
    "Erreur lors du chargement des compétences de l'employée",
  );

  const skillsForm = useForm<Schema>({
    defaultValues: { skills: [] },
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (userSkills.data !== undefined) {
      skillsForm.reset({ skills: toSkillIds(userSkills.data) });
    }
  }, [userSkills.data, skillsForm]);
    return (
        <form id={formId} onSubmit={skillsForm.handleSubmit(onSubmit, (errors) => console.log(errors))}>
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
    )
}