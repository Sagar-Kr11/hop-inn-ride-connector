import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listUpcomingEvents from "./tools/list-upcoming-events";
import listMyRides from "./tools/list-my-rides";
import getProfile from "./tools/get-profile";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "hop-inn-mcp",
  title: "Hop-Inn",
  version: "0.1.0",
  instructions:
    "Tools for the Hop-Inn shared auto-rickshaw app. Use `list_upcoming_events` to browse hyperlocal events, `list_my_rides` to view the signed-in user's ride history, and `get_profile` to fetch their profile.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listUpcomingEvents, listMyRides, getProfile],
});
