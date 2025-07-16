import { initSite } from "src/lib/site/site";
import { wsConnect } from "src/lib/socket/socket";
import { rootStore } from "../store";

export async function boot() {
  initSite();
  wsConnect("/ws/taxi");
  await rootStore.userStore.getSession();
}
