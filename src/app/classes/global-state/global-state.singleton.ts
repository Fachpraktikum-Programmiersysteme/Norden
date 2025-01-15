import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface GlobalState {
    overrideActive: boolean;
    animationsDisabled: boolean;
    mode: 'default' | 'dfg';
}

@Injectable({ providedIn: 'root' })
export class GlobalStateSingleton {
    private stateSubject = new BehaviorSubject<GlobalState>({
        overrideActive: false,
        animationsDisabled: false,
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
