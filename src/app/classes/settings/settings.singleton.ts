import {Injectable} from '@angular/core';

import {BehaviorSubject, Observable} from 'rxjs';

export interface Settings {
    displayMode: 'dfg' | 'changes';
    checkMode: 'ec' | 'sc' | 'pc' | 'lc' | 'bc' | 'ft';
    basecaseMode: 'auto' | 'manual';
    falseInputStage: number;
    resetInputForm: boolean;
    nodeInfosDisabled: boolean;
    nodeLabelsDisabled: boolean;
    nodeSymbolsDisabled: boolean;
    arcWeightsDisabled: boolean;
    springEmbedderDisabled: boolean;
    traceAnimationsDisabled: boolean;
}

@Injectable({ providedIn: 'root' })
export class SettingsSingleton {

    /* attributes */

    private stateSubject = new BehaviorSubject<Settings>({
        displayMode: 'dfg',
        checkMode: 'ec',
        basecaseMode: 'auto',
        falseInputStage: 0,
        resetInputForm: false,
        nodeInfosDisabled: true,
        nodeLabelsDisabled: true,
        nodeSymbolsDisabled: true,
        arcWeightsDisabled: true,
        springEmbedderDisabled: true,
        traceAnimationsDisabled: true,
    });

    public state$: Observable<Settings> = this.stateSubject.asObservable();

    /* methods - getters */
    
    get currentState(): Settings {
        return this.stateSubject.getValue();
    };

    /* methods - other */

    updateState(newState: Partial<Settings>): void {
        const updatedState = { ...this.currentState, ...newState };
        this.stateSubject.next(updatedState);
    };
    
};