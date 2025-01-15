import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface GlobalState {
    infoOverrideActive: boolean;
    animationsDisabled: boolean;
    embedderDiabled: boolean;
    mode: 'default' | 'dfg';
}

@Injectable({ providedIn: 'root' })
export class GlobalStateSingleton {
    private stateSubject = new BehaviorSubject<GlobalState>({
        infoOverrideActive: false,
        animationsDisabled: false,
        embedderDiabled: false,
        mode: 'default',
    });

    public state$: Observable<GlobalState> = this.stateSubject.asObservable();

    get currentState(): GlobalState {
        return this.stateSubject.getValue();
    }

    updateState(newState: Partial<GlobalState>): void {
        const updatedState = { ...this.currentState, ...newState };
        this.stateSubject.next(updatedState);
    }
}
