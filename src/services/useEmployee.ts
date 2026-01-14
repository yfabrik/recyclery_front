export const useEmployee = () => {
  const getEmployeeColor = (employeeName: string) => {
    if (!employeeName) return "#999";
    const colors = [
      "#4caf50",
      "#2196f3",
      "#ff9800",
      "#9c27b0",
      "#f44336",
      "#00bcd4",
      "#795548",
      "#607d8b",
    ];
    const hash = employeeName.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);
    return colors[Math.abs(hash) % colors.length];
  };

  // Fonction pour obtenir les initiales d'un employé
  const getEmployeeInitials = (employeeName: string) => {
    if (!employeeName) return "?";
    return employeeName
      .split(" ")
      .map((name) => name.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return {
    getEmployeeColor,
    getEmployeeInitials,
  };
};
