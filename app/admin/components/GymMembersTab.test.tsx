import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import GymMembersTab from "./GymMembersTab";
import type { Member } from "@/lib/gym-store";

const mockMembers: Member[] = [
  {
    id: "mem_1",
    full_name: "Mamadou Sy",
    phone: "+221 77 111 22 33",
    plan_id: "muscu-cardio",
    start_date: "2026-01-01",
    end_date: "2026-12-31",
    status: "actif",
    created_at: "2026-01-01T10:00:00.000Z",
    updated_at: "2026-01-01T10:00:00.000Z",
  },
  {
    id: "mem_2",
    full_name: "Awa Ndiaye",
    phone: "+221 78 444 55 66",
    plan_id: "fitness-femme",
    start_date: "2025-01-01",
    end_date: "2025-02-01",
    status: "expire",
    created_at: "2025-01-01T10:00:00.000Z",
    updated_at: "2025-01-01T10:00:00.000Z",
  },
];

describe("GymMembersTab", () => {
  const defaultProps = {
    members: mockMembers,
    isSuperAdmin: true,
    onSaveMember: vi.fn(),
    onDeleteMember: vi.fn(),
    onQuickCheckIn: vi.fn(),
    onOpenPaymentForMember: vi.fn(),
    showFeedback: vi.fn(),
  };

  it("affiche la liste des membres", () => {
    render(<GymMembersTab {...defaultProps} />);
    expect(screen.getByText("Mamadou Sy")).toBeInTheDocument();
    expect(screen.getByText("Awa Ndiaye")).toBeInTheDocument();
  });

  it("filtre les membres via la barre de recherche", () => {
    render(<GymMembersTab {...defaultProps} />);
    const searchInput = screen.getByPlaceholderText(/Rechercher par nom/i);

    fireEvent.change(searchInput, { target: { value: "Mamadou" } });
    expect(screen.getByText("Mamadou Sy")).toBeInTheDocument();
    expect(screen.queryByText("Awa Ndiaye")).not.toBeInTheDocument();
  });
});
