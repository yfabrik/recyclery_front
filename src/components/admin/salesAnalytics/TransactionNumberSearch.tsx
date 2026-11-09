import { TextField } from "@mui/material";
import { useDebouncedCallback } from "@tanstack/react-pacer";
import { useState } from "react";

type TransactionNumberSearchProps = {
  value: string;
  onChange: (value: string) => void;
};

/** "N° de transaction" field; sends the search once typing pauses. */
export const TransactionNumberSearch = ({ value, onChange }: TransactionNumberSearchProps) => {
  const [draft, setDraft] = useState(value);
  const [received, setReceived] = useState(value);
  // Follow a change from outside (the chip's clear button, back/forward).
  if (value !== received) {
    setReceived(value);
    if (value !== draft.trim()) setDraft(value);
  }
  const send = useDebouncedCallback(onChange, { wait: 500 });

  return (
    <TextField
      size="small"
      label="N° de transaction"
      placeholder="Ex : 42"
      value={draft}
      onChange={(event) => {
        setDraft(event.target.value);
        send(event.target.value.trim());
      }}
      sx={{ width: 180 }}
    />
  );
};
