import { getPublicMenu } from "./admin.functions";
import { menu as staticMenu, withIds, type Category } from "./menu";

// Used by the public route loaders. If the server function fails for any
// reason the guests still get the built-in menu.
export async function loadMenu(): Promise<Category[]> {
  try {
    return await getPublicMenu();
  } catch (error) {
    console.error("getPublicMenu failed, using static menu", error);
    return withIds(staticMenu);
  }
}
