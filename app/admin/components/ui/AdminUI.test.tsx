import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AdminBadge, getMemberStatusBadge } from "./AdminBadge";
import { AdminTable } from "./AdminTable";

describe("AdminBadge", () => {
  it("affiche le texte du badge avec les classes de variante", () => {
    render(<AdminBadge variant="success">Actif</AdminBadge>);
    expect(screen.getByText("Actif")).toBeInTheDocument();
  });

  it("getMemberStatusBadge renvoie les statuts attendus", () => {
    expect(getMemberStatusBadge("actif")).toEqual({ variant: "success", label: "Actif" });
    expect(getMemberStatusBadge("expire_bientot")).toEqual({ variant: "warning", label: "Expire bientôt" });
    expect(getMemberStatusBadge("expire")).toEqual({ variant: "danger", label: "Expiré" });
  });
});

describe("AdminTable", () => {
  interface Row {
    id: string;
    name: string;
    amount: number;
  }

  const columns = [
    { key: "name", header: "Nom" },
    {
      key: "amount",
      header: "Montant",
      align: "right" as const,
      render: (r: Row) => `${r.amount} FCFA`,
    },
  ];

  const data: Row[] = [
    { id: "1", name: "Amadou Diallo", amount: 15000 },
    { id: "2", name: "Fatou Ndiaye", amount: 30000 },
  ];

  it("affiche les en-têtes et les données du tableau", () => {
    render(
      <AdminTable
        columns={columns}
        data={data}
        keyExtractor={(r) => r.id}
      />
    );

    expect(screen.getByText("Nom")).toBeInTheDocument();
    expect(screen.getByText("Montant")).toBeInTheDocument();
    expect(screen.getByText("Amadou Diallo")).toBeInTheDocument();
    expect(screen.getByText("15000 FCFA")).toBeInTheDocument();
  });

  it("affiche l'état vide si data est vide", () => {
    render(
      <AdminTable
        columns={columns}
        data={[]}
        keyExtractor={(r) => r.id}
        emptyState={{ title: "Aucune donnée disponible" }}
      />
    );

    expect(screen.getByText("Aucune donnée disponible")).toBeInTheDocument();
  });

  it("déclenche onRowClick lors du clic sur une ligne", () => {
    const onRowClick = vi.fn();
    render(
      <AdminTable
        columns={columns}
        data={data}
        keyExtractor={(r) => r.id}
        onRowClick={onRowClick}
      />
    );

    fireEvent.click(screen.getByText("Amadou Diallo"));
    expect(onRowClick).toHaveBeenCalledWith(data[0]);
  });
});
