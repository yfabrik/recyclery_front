import { Add, Delete, Edit } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "react-toastify";
import type { SkillModel } from "../../../interfaces/Models";
import {
  createSkill,
  deleteSkill,
  fetchSkills,
  updateSkill,
} from "../../../services/api/skills";

const SKILLS_QUERY_KEY = ["skills"];

const normalizeSkills = (
  data: { skills?: SkillModel[] } | SkillModel[] | undefined
): SkillModel[] => {
  if (!data) return [];
  return Array.isArray(data) ? data : data.skills ?? [];
};

export const SkillsTab = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSkill, setEditingSkill] = useState<SkillModel | null>(null);
  const [name, setName] = useState("");

  const queryClient = useQueryClient();

  const skillsQuery = useQuery({
    queryKey: SKILLS_QUERY_KEY,
    queryFn: async () => {
      const res = await fetchSkills();
      const data = res.data as { skills?: SkillModel[] } | SkillModel[];
      return normalizeSkills(data);
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: { name: string }) => createSkill(data),
    onError: () => toast.error("Erreur lors de la création"),
    onSuccess: () => {
      toast.success("Compétence créée avec succès");
      queryClient.invalidateQueries({ queryKey: SKILLS_QUERY_KEY });
      handleCloseDialog();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name: string } }) =>
      updateSkill(id, data),
    onError: () => toast.error("Erreur lors de la mise à jour"),
    onSuccess: () => {
      toast.success("Compétence mise à jour avec succès");
      queryClient.invalidateQueries({ queryKey: SKILLS_QUERY_KEY });
      handleCloseDialog();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteSkill(id),
    onError: () => toast.error("Erreur lors de la suppression"),
    onSuccess: () => {
      toast.success("Compétence supprimée avec succès");
      queryClient.invalidateQueries({ queryKey: SKILLS_QUERY_KEY });
    },
  });

  const handleOpenDialog = (skill: SkillModel | null = null) => {
    if (skill) {
      setEditingSkill(skill);
      setName(skill.name);
    } else {
      setEditingSkill(null);
      setName("");
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingSkill(null);
    setName("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Le nom est requis");
      return;
    }
    if (editingSkill) {
      updateMutation.mutate({ id: editingSkill.id, data: { name: trimmed } });
    } else {
      createMutation.mutate({ name: trimmed });
    }
  };

  const handleDelete = (skill: SkillModel) => {
    if (window.confirm(`Supprimer la compétence « ${skill.name} » ?`)) {
      deleteMutation.mutate(skill.id);
    }
  };

  const skills = skillsQuery.data ?? [];
  const isLoading = skillsQuery.isLoading;

  if (isLoading) {
    return <Typography>Chargement...</Typography>;
  }

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          Compétences
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Ajouter une compétence
        </Button>
      </Box>

      {skills.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          Aucune compétence. Ajoutez une compétence pour commencer.
        </Alert>
      ) : (
        <List
          sx={{
            bgcolor: "background.paper",
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          {skills.map((skill) => (
            <ListItem
              key={skill.id}
              secondaryAction={
                <Box component="span" sx={{ display: "flex", gap: 0.5 }}>
                  <IconButton
                    edge="end"
                    aria-label="Modifier"
                    onClick={() => handleOpenDialog(skill)}
                    color="primary"
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    edge="end"
                    aria-label="Supprimer"
                    onClick={() => handleDelete(skill)}
                    color="error"
                  >
                    <Delete />
                  </IconButton>
                </Box>
              }
            >
              <ListItemText primary={skill.name} />
            </ListItem>
          ))}
        </List>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingSkill ? "Modifier la compétence" : "Nouvelle compétence"}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Nom"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <TextField
              autoFocus
              margin="dense"
              label="Nom"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Annuler</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                !name.trim() ||
                createMutation.isPending ||
                updateMutation.isPending
              }
            >
              {editingSkill ? "Enregistrer" : "Ajouter"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};
