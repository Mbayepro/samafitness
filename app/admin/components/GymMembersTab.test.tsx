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

  it("soumet le formulaire d'inscription sans notes (notes: null) et valide avec memberSchema", async () => {
    const { memberSchema } = await import("@/lib/validations/gym");
    const onSaveMember = vi.fn(async (payload) => {
      const parsed = memberSchema.safeParse(payload);
      expect(parsed.success).toBe(true);
      return parsed.success;
    });
    const showFeedback = vi.fn();

    render(
      <GymMembersTab
        {...defaultProps}
        defaultOpenCreate={true}
        onSaveMember={onSaveMember}
        showFeedback={showFeedback}
      />
    );

    const nameInput = screen.getByPlaceholderText(/Moussa Diop/i);
    const phoneInput = screen.getByPlaceholderText(/\+221 77 123 45 67/i);
    fireEvent.change(nameInput, { target: { value: "Ibrahima Fall" } });
    fireEvent.change(phoneInput, { target: { value: "+221 77 555 44 33" } });

    const submitBtn = screen.getByRole("button", { name: /^Inscrire$/i });
    fireEvent.click(submitBtn);

    await vi.waitFor(() => {
      expect(onSaveMember).toHaveBeenCalledTimes(1);
      expect(showFeedback).toHaveBeenCalledWith(
        "success",
        "Nouveau membre inscrit avec succès !"
      );
    });
  });
});
