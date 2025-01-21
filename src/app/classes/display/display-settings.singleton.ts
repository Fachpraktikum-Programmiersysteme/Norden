import {Injectable} from '@angular/core';

import {BehaviorSubject, Observable} from 'rxjs';

export interface DisplaySettings {
    mode: 'dfg' | 'changes';
    arcWeightsDisabled: boolean;
    infoOverrideDisabled: boolean;
    springEmbedderDisabled: boolean;
    traceAnimationsDisabled: boolean;
}

@Injectable({ providedIn: 'root' })
export class DisplaySettingsSingleton {

    /* attributes */

    private stateSubject = new BehaviorSubject<DisplaySettings>({
        mode: 'dfg',
        arcWeightsDisabled: true,
        infoOverrideDisabled: true,
        springEmbedderDisabled: true,
        traceAnimationsDisabled: true,
    });

    public state$: Observable<DisplaySettings> = this.stateSubject.asObservable();

    /* methods - getters */
    
    get currentState(): DisplaySettings {
        return this.stateSubject.getValue();
    }

    /* methods - other */

    updateState(newState: Partial<DisplaySettings>): void {
        const updatedState = { ...this.currentState, ...newState };
        this.stateSubject.next(updatedState);
    }
}
