import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import GymPaymentsTab from "./GymPaymentsTab";
import type { Payment, Member } from "@/lib/gym-store";

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
];

const mockPayments: Payment[] = [
  {
    id: "pay_1",
    member_id: "mem_1",
    member_name: "Mamadou Sy",
    member_phone: "+221 77 111 22 33",
    amount_fcfa: 15000,
    method: "Wave",
    period_start: "2026-01-01",
    period_end: "2026-02-01",
    created_at: "2026-01-01T10:30:00.000Z",
    recorded_by: "Admin",
  },
];

describe("GymPaymentsTab", () => {
  const defaultProps = {
    payments: mockPayments,
    members: mockMembers,
    onRecordPayment: vi.fn(),
    showFeedback: vi.fn(),
  };

  it("affiche la liste des paiements", () => {
    render(<GymPaymentsTab {...defaultProps} />);
    expect(screen.getByText("Mamadou Sy")).toBeInTheDocument();
    expect(screen.getAllByText("Wave").length).toBeGreaterThan(0);
  });

  it("ouvre la modale d'enregistrement de paiement", () => {
    render(<GymPaymentsTab {...defaultProps} />);
    const addBtn = screen.getByText(/\+ Encaisser un Paiement/i);
    fireEvent.click(addBtn);
    expect(screen.getByText(/Enregistrer un paiement & prolonger/i)).toBeInTheDocument();
  });
});
