import {createLaningOpponent} from './brain.mjs';
import {makeObservation,validateAction} from './adapter.mjs';
window.LaningOpponent={createLaningOpponent,makeObservation,validateAction};
if (new URLSearchParams(location.search).has('middev')) window.startLaningDev();
