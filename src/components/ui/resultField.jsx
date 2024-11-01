import React from "react";
import { Label } from "./label.jsx"; // Assuming you have a Label component

export function ResultField({ label, value }) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <div className="p-2 bg-gray-100 rounded">{value}</div>
    </div>
  );
}
