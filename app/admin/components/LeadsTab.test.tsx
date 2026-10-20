import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import LeadsTab from "./LeadsTab";
import type { Lead } from "@/lib/leads-store";

const mockLeads: Lead[] = [
  {
    id: "lead_1",
    name: "Ibrahima Ndiaye",
    phone: "+221 77 123 45 67",
    club: "Ndioum",
    status: "nouveau",
    created_at: "2026-02-01T12:00:00.000Z",
    message: "Intéressé par le cross-training",
  },
  {
    id: "lead_2",
    name: "Mariama Ba",
    phone: "+221 78 555 44 33",
    club: "Ndioum",
    status: "contacté",
    created_at: "2026-02-02T12:00:00.000Z",
    message: "Horaires des cours femmes",
  },
];

describe("LeadsTab", () => {
  const defaultProps = {
    leads: mockLeads,
    isSuperAdmin: true,
    isPending: false,
    onRefresh: vi.fn(),
    onExportCSV: vi.fn(),
    onUpdateStatus: vi.fn(),
    onDeleteLead: vi.fn(),
    onStartConvertLead: vi.fn(),
  };

  it("affiche les prospects de la liste", () => {
    render(<LeadsTab {...defaultProps} />);
    expect(screen.getByText("Ibrahima Ndiaye")).toBeInTheDocument();
    expect(screen.getByText("Mariama Ba")).toBeInTheDocument();
  });

  it("filtre les prospects par recherche textuelle", () => {
    render(<LeadsTab {...defaultProps} />);
    const searchInput = screen.getByPlaceholderText(/Rechercher par nom/i);

    fireEvent.change(searchInput, { target: { value: "Mariama" } });
    expect(screen.getByText("Mariama Ba")).toBeInTheDocument();
    expect(screen.queryByText("Ibrahima Ndiaye")).not.toBeInTheDocument();
  });
});
