import { useOutletContext } from "react-router-dom";
import type { AdminContext } from "./AdminLayout";

export function useAdmin() {
  return useOutletContext<AdminContext>();
}
