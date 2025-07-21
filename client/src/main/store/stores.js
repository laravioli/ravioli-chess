import { Ceval } from "src/lib/eval/ceval";
import { UiStore } from "src/common/stores/uistore";
import { UserStore } from "src/common/stores/userstore";
import { AnalyseStore } from "src/analyse/store/analyse";
import { EditorStore } from "src/editor/store/editor";
import { PlayStore } from "src/play/store/play";

/* Global Store */

export function makeGlobalStore(cfg) {
  return {
    uiStore: new UiStore(),
    userStore: new UserStore(),
    cevalStore: new Ceval(cfg.ceval),
  };
}

/* Page Store */

/* note: Each pageStore has onLoad and onUnload hook. Their purpose is to update (init/clean) global store object
         order : 
         -> newPage start rendering (create a new PageStore)
         -> oldPage unMount
         -> newPage mount
         {  BAD : update a global observable state subscribed by newPage
         -> oldPage onUnLoad()
         -> newPage onLoad()
         }
         PageStore is local (do init in constructor) but has access to global store
*/

const patterns = new Map([
  [/^\/(analysis)?$/, AnalyseStore],
  [/^\/editor$/, EditorStore],
  [/^\/play$/, PlayStore],
]);

export function pageStoreRouter(path) {
  for (const [regex, value] of patterns) {
    if (regex.test(path)) {
      return value;
    }
  }
  return null;
}
