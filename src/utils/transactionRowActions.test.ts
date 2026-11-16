import { describe, expect, it } from "vitest";
import { getTransactionRowActions } from "./transactionRowActions";

const currentSession = 7;

describe("getTransactionRowActions", () => {
  it("a Sale of your open session can be edited and cancelled, not refunded", () => {
    expect(
      getTransactionRowActions(
        { transactionType: "sell", cash_session_id: currentSession },
        currentSession,
      ),
    ).toEqual({ canEdit: true, canCancel: true, canRefund: false });
  });

  it("a Refund of your open session can be cancelled, never edited", () => {
    expect(
      getTransactionRowActions(
        { transactionType: "refund", cash_session_id: currentSession },
        currentSession,
      ),
    ).toEqual({ canEdit: false, canCancel: true, canRefund: false });
  });

  it("a Refund from another session offers nothing", () => {
    expect(
      getTransactionRowActions(
        { transactionType: "refund", cash_session_id: 3 },
        currentSession,
      ),
    ).toEqual({ canEdit: false, canCancel: false, canRefund: false });
  });

  it("a Sale from another session can only be refunded", () => {
    expect(
      getTransactionRowActions(
        { transactionType: "sell", cash_session_id: 3 },
        currentSession,
      ),
    ).toEqual({ canEdit: false, canCancel: false, canRefund: true });
  });

  it("without an open session nothing is edited or cancelled", () => {
    expect(
      getTransactionRowActions({
        transactionType: "refund",
        cash_session_id: currentSession,
      }),
    ).toEqual({ canEdit: false, canCancel: false, canRefund: false });
  });
});
