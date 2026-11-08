import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./auth";

export type AccountProfile = { business: string; owner: string; phone: string; docType: string; docNumber: string };
export type Address = { id: string; zone: string; line: string; ref: string };
export type Taxi = { id: string; driver: string; plate: string; phone: string };
export type Account = { profile: AccountProfile; addresses: Address[]; taxis: Taxi[] };

const emptyProfile = (phone = ""): AccountProfile => ({ business: "", owner: "", phone, docType: "DNI", docNumber: "" });

export function useAccount() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["account", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<Account> => {
      const [profileResult, addressesResult, taxisResult] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user!.id).maybeSingle(),
        supabase.from("addresses").select("*").eq("user_id", user!.id).order("created_at"),
        supabase.from("taxis").select("*").eq("user_id", user!.id).order("created_at"),
      ]);
      if (profileResult.error) throw profileResult.error;
      if (addressesResult.error) throw addressesResult.error;
      if (taxisResult.error) throw taxisResult.error;
      const p = profileResult.data;
      return {
        profile: p ? { business: p.business_name, owner: p.owner_name, phone: p.phone, docType: p.doc_type, docNumber: p.doc_number } : emptyProfile(user!.email?.split("@")[0]),
        addresses: addressesResult.data.map((a) => ({ id: a.id, zone: a.zone, line: a.line, ref: a.ref })),
        taxis: taxisResult.data.map((t) => ({ id: t.id, driver: t.driver, plate: t.plate, phone: t.phone })),
      };
    },
  });
}

export function useAccountActions() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["account", user?.id] });
  const requireUser = () => { if (!user) throw new Error("Debes iniciar sesión"); return user; };
  return {
    saveProfile: async (profile: AccountProfile) => {
      const u = requireUser();
      const { error } = await supabase.from("profiles").upsert({ user_id: u.id, business_name: profile.business.trim(), owner_name: profile.owner.trim(), phone: profile.phone, doc_type: profile.docType, doc_number: profile.docNumber.trim() });
      if (error) throw error;
      await refresh();
    },
    addAddress: async (address: Omit<Address, "id">) => {
      const u = requireUser();
      const { error } = await supabase.from("addresses").insert({ ...address, user_id: u.id });
      if (error) throw error;
      await refresh();
    },
    deleteAddress: async (id: string) => {
      const { error } = await supabase.from("addresses").delete().eq("id", id);
      if (error) throw error;
      await refresh();
    },
    addTaxi: async (taxi: Omit<Taxi, "id">) => {
      const u = requireUser();
      const { error } = await supabase.from("taxis").insert({ ...taxi, user_id: u.id });
      if (error) throw error;
      await refresh();
    },
    deleteTaxi: async (id: string) => {
      const { error } = await supabase.from("taxis").delete().eq("id", id);
      if (error) throw error;
      await refresh();
    },
  };
}
