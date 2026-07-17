/// <reference types="node" />
import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "list_my_rides",
  title: "List my rides",
  description:
    "List the signed-in Hop-Inn user's rides (most recent first) with pickup, dropoff, status, and fare.",
  inputSchema: {
    limit: z.number().int().min(1).max(50).default(10),
    status: z
      .enum(["pending", "matched", "in_progress", "completed", "cancelled"])
      .nullable()
      .describe("Optional status filter."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit, status }, ctx: ToolContext) => {
    if (!ctx.isAuthenticated()) {
      return {
        content: [{ type: "text", text: "Not authenticated" }],
        isError: true,
      };
    }

    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      {
        global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
        auth: { persistSession: false, autoRefreshToken: false },
      },
    );

    let query = supabase
      .from("rides")
      .select(
        "id, pickup_location, dropoff_location, ride_type, status, fare, distance_km, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    if (status) query = query.eq("status", status);

    const { data, error } = await query;
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }

    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { rides: data ?? [] },
    };
  },
});
