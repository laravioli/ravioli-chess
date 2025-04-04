import { mainStore } from 'src/main/store';
import { linkStateToStore } from '../../main/store/reactive';
export const makeObservable = linkStateToStore(mainStore, 'analyse');
