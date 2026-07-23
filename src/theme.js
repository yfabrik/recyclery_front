import { createTheme } from "@mui/material/styles";

const palette = {
  primary: {
    main: "#2E7D32", // Vert recyclage
    light: "#60AD5E",
    dark: "#1B5E20",
  },

  secondary: {
    main: "#FF8F00", // Orange énergique
    light: "#FFAB40",
    dark: "#E65100",
  },
  background: {
    default: "#F8F9FA",
    paper: "#FFFFFF",
  },
  success: {
    main: "#4CAF50",
  },
  warning: {
    main: "#FF9800",
  },
  error: {
    main: "#F44336",
  },
  info: {
    main: "#2196F3",
  },
};

const sharedComponents = {
  MuiButton: {
    styleOverrides: {
      root: {
        textTransform: "none",
        fontWeight: 500,
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        borderRadius: 12,
      },
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: {
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      },
    },
  },
};

export const theme = createTheme({
  palette,
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: "2.5rem",
    },
    h2: {
      fontWeight: 600,
      fontSize: "2rem",
    },
    h3: {
      fontWeight: 600,
      fontSize: "1.75rem",
    },
    h4: {
      fontWeight: 500,
      fontSize: "1.5rem",
    },
    h5: {
      fontWeight: 500,
      fontSize: "1.25rem",
    },
    h6: {
      fontWeight: 500,
      fontSize: "1rem",
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: sharedComponents,
});

export const touchTheme = createTheme({
  palette,
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 16,
    h1: {
      fontWeight: 700,
      fontSize: "2.9rem",
    },
    h2: {
      fontWeight: 600,
      fontSize: "2.35rem",
    },
    h3: {
      fontWeight: 600,
      fontSize: "2rem",
    },
    h4: {
      fontWeight: 500,
      fontSize: "1.75rem",
    },
    h5: {
      fontWeight: 500,
      fontSize: "1.45rem",
    },
    h6: {
      fontWeight: 500,
      fontSize: "1.2rem",
    },
    button: {
      fontSize: "1rem",
    },
    body1: {
      fontSize: "1.05rem",
    },
    body2: {
      fontSize: "0.95rem",
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    ...sharedComponents,
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
          minHeight: 48,
          padding: "10px 20px",
          fontSize: "1rem",
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          padding: 12,
        },
        sizeMedium: {
          width: 48,
          height: 48,
        },
        sizeLarge: {
          width: 56,
          height: 56,
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: 72,
          "@media (min-width: 600px)": {
            minHeight: 72,
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          minHeight: 56,
          paddingTop: 12,
          paddingBottom: 12,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          minHeight: 56,
          fontSize: "1rem",
          padding: "12px 20px",
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          minHeight: 48,
          fontSize: "1.05rem",
        },
        input: {
          padding: "14px 14px",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          minHeight: 48,
        },
        input: {
          padding: "14px 14px",
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          minHeight: 48,
          display: "flex",
          alignItems: "center",
          paddingTop: 14,
          paddingBottom: 14,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          minHeight: 48,
          paddingTop: 12,
          paddingBottom: 12,
          fontSize: "1.05rem",
        },
      },
    },
    MuiFormControlLabel: {
      styleOverrides: {
        root: {
          marginTop: 4,
          marginBottom: 4,
        },
        label: {
          fontSize: "1.05rem",
        },
      },
    },
  },
});

export function getTheme(isTouch) {
  return isTouch ? touchTheme : theme;
}

export default theme;
