import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { initPixel } from "@/lib/pixel";

export function FacebookPixel() {
  const { data } = useQuery({
    queryKey: ["fb_pixel"],
    queryFn: async () => {
      const { data } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "facebook_pixel_id")
        .maybeSingle();
      return (data?.value as { id?: string } | null)?.id ?? "";
    },
    staleTime: 1000 * 60 * 10,
  });

  useEffect(() => {
    if (data) initPixel(data);
  }, [data]);

  return null;
}
