"use client";

import React from "react";
import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button 
      onClick={() => window.print()}
      className="btn btn-primary shadow-sm"
    >
      <Printer className="w-4 h-4 mr-2" /> 
      Imprimir / PDF
    </button>
  );
}
