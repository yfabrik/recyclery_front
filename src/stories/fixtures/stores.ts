import type { EcoOrgModel, StoreModel } from "../../interfaces/Models";

const nowIso = new Date().toISOString();

export const mockStores: StoreModel[] = [
  {
    id: 1,
    createdAt: nowIso,
    name: "Recyclerie Centre",
    address: "12 rue de la Recyclerie",
    city: "Lille",
    postal_code: "59000",
    phone: "03 20 00 00 00",
    email: "centre@recyclerie.fr",
    is_active: true,
    manager_id: 1,
    caisses: [{ id: 1, createdAt: nowIso, name: "Caisse 1", is_active: true, recyclery_id: 1 }],
  },
  {
    id: 2,
    createdAt: nowIso,
    name: "Recyclerie Nord",
    address: "45 avenue du Nord",
    city: "Tourcoing",
    postal_code: "59200",
    phone: null,
    email: null,
    is_active: true,
    manager_id: null,
    caisses: [],
  },
];

export const mockEcoOrganisms: EcoOrgModel[] = [
  {
    id: 1,
    createdAt: nowIso,
    name: "EcoVert",
    description: "Traitement textiles",
    contact_email: "contact@ecovert.fr",
    contact_phone: "01 23 45 67 89",
    address: null,
    website: null,
    is_active: true,
  },
  {
    id: 2,
    createdAt: nowIso,
    name: "RecycloPlus",
    description: null,
    contact_email: null,
    contact_phone: null,
    address: null,
    website: null,
    is_active: true,
  },
];
