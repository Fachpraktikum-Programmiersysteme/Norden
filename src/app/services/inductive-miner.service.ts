import {Injectable} from "@angular/core";

import {ToastService} from './toast.service';
import {DisplayService} from "./display.service";

import {SettingsSingleton} from "../classes/settings/settings.singleton";

import {GraphGraphicsConfig} from "../classes/display/graph-graphics.config";

import {Graph} from '../classes/graph-representation/graph';
import {Node} from "../classes/graph-representation/node";
import {Arc} from "../classes/graph-representation/arc";
import {DFG} from "../classes/graph-representation/dfg";

@Injectable({
    providedIn: 'root'
})
export class InductiveMinerService {

    /* methods : constructor */

    public constructor(
        private _settings : SettingsSingleton,
        private _toastService : ToastService,
        private _displayService : DisplayService,
        private _graphicsConfig : GraphGraphicsConfig,
    ) {};

    /* methods : other */

    public checkTermination(inGraph : Graph) : boolean {
        if (inGraph.dfgArray.length !== 0) {
            return false;
        } else if (inGraph.supportCount !== 0) {
            return false;
        } else if (inGraph.eventCount !== 0) {
            return false;
        } else if (inGraph.nodeCount !== (inGraph.placeCount + inGraph.transitionCount)) {
            return false;
        } else {
            return true;
        };
    };

    public checkForCut(inOutGraph: Graph) : undefined | ['EC' | 'SC' | 'PC' | 'LC', DFG, Node[], Arc[]] {
        for (const dfg of inOutGraph.dfgArray) {
            let cut : [Node[], Arc[]] | undefined = undefined;
            cut = this.searchExclusiveCut(inOutGraph, dfg);
            if (cut !== undefined) {
                return ['EC', dfg, cut[0], cut[1]];
            };
            cut = this.searchSequenceCut(inOutGraph, dfg);
            if (cut !== undefined) {
                return ['SC', dfg, cut[0], cut[1]];
            };
            cut = this.searchParallelCut(inOutGraph, dfg);
            if (cut !== undefined) {
                return ['PC', dfg, cut[0], cut[1]];
            };
            cut = this.searchLoopCut(inOutGraph, dfg);
            if (cut !== undefined) {
                return ['LC', dfg, cut[0], cut[1]];
            };
        };
        return undefined;
    };

    public async checkInput(inOutGraph : Graph) {
        this.checkGraphStartEnd(inOutGraph);
        inOutGraph.resetAllChanged();
        inOutGraph.resetAllNew();
        this._displayService.refreshData();
        let cutFound : boolean = false;
        switch (this._settings.currentState.checkMode) {
            case 'ec' : {
                const checkEC : undefined | [DFG, [Node[], Arc[]], [Node[], Arc[]], boolean, Arc, Arc] = this.checkExclusiveCut(inOutGraph);
                if (checkEC !== undefined) {
                    this._toastService.showToast('Exclusive Cut accepted, 3s until execution', 'success');
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    this.executeExclusiveCut(inOutGraph, checkEC[0], checkEC[1], checkEC[2], checkEC[3], checkEC[4], checkEC[5]);
                    inOutGraph.resetAllMarked();
                    this._displayService.refreshData();
                    this._settings.updateState({ falseInputStage: (0) });
                    cutFound = true;
                    this._toastService.showToast('Exclusive Cut executed', 'info');
                } else {
                    if (this._settings.currentState.falseInputStage < 6) {
                        this._settings.updateState({ falseInputStage: (this._settings.currentState.falseInputStage + 1) });
                    };
                    this._toastService.showToast('Exclusive Cut rejected', 'error');
                };
                break;
            }
            case 'sc' : {
                const checkSC : undefined | [DFG, Arc[], [Node[], Arc[]], [Node[], Arc[]], boolean] = this.checkSequenceCut(inOutGraph);
                if (checkSC !== undefined) {
                    this._toastService.showToast('Sequence Cut accepted, 3s until execution', 'success');
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    this.executeSequenceCut(inOutGraph, checkSC[0], checkSC[1], checkSC[2], checkSC[3], checkSC[4]);
                    inOutGraph.resetAllMarked();
                    this._displayService.refreshData();
                    this._settings.updateState({ falseInputStage: (0) });
                    cutFound = true;
                    this._toastService.showToast('Sequence Cut executed', 'info');
                } else {
                    if (this._settings.currentState.falseInputStage < 6) {
                        this._settings.updateState({ falseInputStage: (this._settings.currentState.falseInputStage + 1) });
                    };
                    this._toastService.showToast('Sequence Cut rejected', 'error');
                };
                break;
            }
            case 'pc' : {
                const checkPC : undefined | [DFG, [Node[], Arc[]], [Node[], Arc[]], boolean, Arc, Arc[], Arc] = this.checkParallelCut(inOutGraph);
                if (checkPC !== undefined) {
                    this._toastService.showToast('Parallel Cut accepted, 3s until execution', 'success');
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    this.executeParallelCut(inOutGraph, checkPC[0], checkPC[1], checkPC[2], checkPC[3], checkPC[4], checkPC[5], checkPC[6]);
                    inOutGraph.resetAllMarked();
                    this._displayService.refreshData();
                    this._settings.updateState({ falseInputStage: (0) });
                    cutFound = true;
                    this._toastService.showToast('Parallel Cut executed', 'info');
                } else {
                    if (this._settings.currentState.falseInputStage < 6) {
                        this._settings.updateState({ falseInputStage: (this._settings.currentState.falseInputStage + 1) });
                    };
                    this._toastService.showToast('Parallel Cut rejected', 'error');
                };
                break;
            }
            case 'lc' : {
                const checkLC : undefined | [DFG, Node[], Node[], Node[], Node[], boolean] = this.checkLoopCut(inOutGraph);
                if (checkLC !== undefined) {
                    this._toastService.showToast('Loop Cut accepted, 3s until execution', 'success');
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    this.executeLoopCut(inOutGraph, checkLC[0], checkLC[1], checkLC[2], checkLC[3], checkLC[4], checkLC[5]);
                    inOutGraph.resetAllMarked();
                    this._displayService.refreshData();
                    this._settings.updateState({ falseInputStage: (0) });
                    cutFound = true;
                    this._toastService.showToast('Loop Cut executed', 'info');
                } else {
                    if (this._settings.currentState.falseInputStage < 6) {
                        this._settings.updateState({ falseInputStage: (this._settings.currentState.falseInputStage + 1) });
                    };
                    this._toastService.showToast('Loop Cut rejected', 'error');
                };
                break;
            }
            case 'bc' : {
                const checkBC : undefined | [DFG, Node | undefined] = this.checkBaseCase(inOutGraph);
                if (checkBC !== undefined) {
                    this._toastService.showToast('Base Case accepted, 3s until execution', 'success');
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    this.executeBaseCase(inOutGraph, checkBC[0], checkBC[1]);
                    inOutGraph.resetAllMarked();
                    this._displayService.refreshData();
                    this._settings.updateState({ falseInputStage: (0) });
                    cutFound = true;
                    this._toastService.showToast('Base Case executed', 'info');
                } else {
                    if (this._settings.currentState.falseInputStage < 6) {
                        this._settings.updateState({ falseInputStage: (this._settings.currentState.falseInputStage + 1) });
                    };
                    this._toastService.showToast('Base Case rejected', 'error');
                };
                break;
            }
            case 'ft' : {
                const checkFT : undefined | [DFG, Node | undefined] = this.checkFallThrough(inOutGraph);
                if (checkFT !== undefined) {
                    this._toastService.showToast('Fall Through accepted, 3s until execution', 'success');
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    this.executeFallThrough(inOutGraph, checkFT[0], checkFT[1]);
                    inOutGraph.resetAllMarked();
                    this._displayService.refreshData();
                    this._settings.updateState({ falseInputStage: (0) });
                    cutFound = true;
                    this._toastService.showToast('Fall Through executed', 'info');
                } else {
                    if (this._settings.currentState.falseInputStage < 6) {
                        this._settings.updateState({ falseInputStage: (this._settings.currentState.falseInputStage + 1) });
                    };
                    this._toastService.showToast('Fall Through rejected', 'error');
                };
                break;
            }
        };
        this._displayService.refreshData();
        if (cutFound) {
            if (this._settings.currentState.basecaseMode !== 'manual') {
                await new Promise(resolve => setTimeout(resolve, 3000));
                const autoBC : [number, [DFG, Node | undefined][]] = this.checkAllBaseCases(inOutGraph);
                inOutGraph.resetAllMarked();
                let casesExecuted : number = 0;
                for (const foundCase of autoBC[1]) {
                    this.executeBaseCase(inOutGraph, foundCase[0], foundCase[1]);
                    casesExecuted++;
                };
                if (casesExecuted !== autoBC[0]) {
                    throw new Error('#srv.mnr.cci.000: ' + 'automated base case check failed - found ' + autoBC[0] + ' cases, but executed ' + casesExecuted);
                };
                this._displayService.refreshData();
                this._toastService.showToast(('converted ' + casesExecuted + ' Base Cases'), 'info');
            };
            await new Promise(resolve => setTimeout(resolve, 3000));
            if (this.checkTermination(inOutGraph)) {
                this._toastService.showToast('the inductive miner has terminated', 'success');
            } else {
                this._toastService.showToast('termination condition of inductive miner not met', 'error');
            };
        } else {
            const falseInputs : number = this._settings.currentState.falseInputStage;
            const previouslyMarkedNodes : Node[] = inOutGraph.markedNodes.slice();
            const previouslyMarkedArcs : Arc[] = inOutGraph.markedArcs.slice();
            inOutGraph.resetAllMarked();
            const cutCheck = this.checkForCut(inOutGraph);
            inOutGraph.resetAllMarked();
            const bcCheck = this.checkAllBaseCases(inOutGraph);
            inOutGraph.resetAllMarked();
            if (cutCheck !== undefined) {
                if (falseInputs < 6) {
                    inOutGraph.resetAllMarked();
                    for (const node of previouslyMarkedNodes) {
                        inOutGraph.setElementMarkedFlag(node, true);
                    };
                    for (const arc of previouslyMarkedArcs) {
                        inOutGraph.setElementMarkedFlag(arc, true);
                    };
                    this._displayService.refreshData();
                };
                switch (falseInputs) {
                    case 0 : {
                        break;
                    }
                    case 1 : {
                        break;
                    }
                    case 2 : {
                        break;
                    }
                    case 3 : {
                        await new Promise(resolve => setTimeout(resolve, 3000));
                        this._toastService.showToast('a Cut is possible', 'info');
                        break;
                    }
                    case 4 : {
                        await new Promise(resolve => setTimeout(resolve, 3000));
                        this._toastService.showToast('a Cut is possible in DFG ' + cutCheck[1].id, 'info');
                        break;
                    }
                    case 5 : {
                        await new Promise(resolve => setTimeout(resolve, 3000));
                        switch (cutCheck[0]) {
                            case 'EC' : {
                                this._toastService.showToast('an Exclusive Cut is possible in DFG ' + cutCheck[1].id, 'info');
                                break;
                            }
                            case 'SC' : {
                                this._toastService.showToast('a Sequence Cut is possible in DFG ' + cutCheck[1].id, 'info');
                                break;
                            }
                            case 'PC' : {
                                this._toastService.showToast('a Parallel Cut is possible in DFG ' + cutCheck[1].id, 'info');
                                break;
                            }
                            case 'LC' : {
                                this._toastService.showToast('a Loop Cut is possible in DFG ' + cutCheck[1].id, 'info');
                                break;
                            }
                        };
                        break;
                    }
                    default : {
                        await new Promise(resolve => setTimeout(resolve, 3000));
                        inOutGraph.resetAllMarked();
                        for (const node of cutCheck[2]) {
                            inOutGraph.setElementMarkedFlag(node, true);
                        };
                        for (const arc of cutCheck[3]) {
                            inOutGraph.setElementMarkedFlag(arc, true);
                        };
                        this._displayService.refreshData();
                        switch (cutCheck[0]) {
                            case 'EC' : {
                                this._toastService.showToast('the marked Exclusive Cut is possible in DFG ' + cutCheck[1].id, 'info');
                                break;
                            }
                            case 'SC' : {
                                this._toastService.showToast('the marked Sequence Cut is possible in DFG ' + cutCheck[1].id, 'info');
                                break;
                            }
                            case 'PC' : {
                                this._toastService.showToast('the marked Parallel Cut is possible in DFG ' + cutCheck[1].id, 'info');
                                break;
                            }
                            case 'LC' : {
                                this._toastService.showToast('the marked Loop Cut is possible in DFG ' + cutCheck[1].id, 'info');
                                break;
                            }
                        };
                        break;
                    }
                };
            } else if (bcCheck[0] > 0) {
                if (falseInputs < 5) {
                    inOutGraph.resetAllMarked();
                    for (const node of previouslyMarkedNodes) {
                        inOutGraph.setElementMarkedFlag(node, true);
                    };
                    for (const arc of previouslyMarkedArcs) {
                        inOutGraph.setElementMarkedFlag(arc, true);
                    };
                    this._displayService.refreshData();
                };
                switch (falseInputs) {
                    case 0 : {
                        break;
                    }
                    case 1 : {
                        break;
                    }
                    case 2 : {
                        break;
                    }
                    case 3 : {
                        await new Promise(resolve => setTimeout(resolve, 3000));
                        this._toastService.showToast('a Base Case is applicable', 'info');
                        break;
                    }
                    case 4 : {
                        await new Promise(resolve => setTimeout(resolve, 3000));
                        this._toastService.showToast('a Base Case is applicable in DFG ' + bcCheck[1][0][0].id, 'info');
                        break;
                    }
                    default : {
                        await new Promise(resolve => setTimeout(resolve, 3000));
                        inOutGraph.resetAllMarked();
                        for (const node of bcCheck[1][0][0].nodes) {
                            inOutGraph.setElementMarkedFlag(node, true);
                        };
                        this._displayService.refreshData();
                        this._toastService.showToast('the marked Base Case is applicable in DFG ' + bcCheck[1][0][0].id, 'info');
                    }
                };
            } else {
                if (falseInputs < 5) {
                    inOutGraph.resetAllMarked();
                    for (const node of previouslyMarkedNodes) {
                        inOutGraph.setElementMarkedFlag(node, true);
                    };
                    for (const arc of previouslyMarkedArcs) {
                        inOutGraph.setElementMarkedFlag(arc, true);
                    };
                    this._displayService.refreshData();
                };
                switch (falseInputs) {
                    case 0 : {
                        break;
                    }
                    case 1 : {
                        break;
                    }
                    case 2 : {
                        break;
                    }
                    case 3 : {
                        await new Promise(resolve => setTimeout(resolve, 3000));
                        this._toastService.showToast('a Fall Through is applicable', 'info');
                        break;
                    }
                    case 4 : {
                        await new Promise(resolve => setTimeout(resolve, 3000));
                        this._toastService.showToast('a Fall Through is applicable in DFG ' + inOutGraph.dfgArray[0].id, 'info');
                        break;
                    }
                    default : {
                        await new Promise(resolve => setTimeout(resolve, 3000));
                        inOutGraph.resetAllMarked();
                        for (const node of inOutGraph.dfgArray[0].nodes) {
                            inOutGraph.setElementMarkedFlag(node, true);
                        };
                        this._displayService.refreshData();
                        this._toastService.showToast('the marked Fall Through is applicable in DFG ' + inOutGraph.dfgArray[0].id, 'info');
                        break;
                    }
                };
            };
        };
    };

    /* do not remove - alternative implementation */
    //
    // public async checkInput(inOutGraph : Graph) {
    //     this.checkGraphStartEnd(inOutGraph);
    //     inOutGraph.resetAllChanged();
    //     inOutGraph.resetAllNew();
    //     this._displayService.refreshData();
    //     /* TODO - part to be modified - start */
    //     this._toastService.showToast('changed flags reset, 2s until check for Exclusive Cut', 'info');
    //     await new Promise(resolve => setTimeout(resolve, 2000));
    //     /* TODO - part to be modified - end */
    //     this._displayService.refreshData();
    //     let inputAccepted : boolean = false;
    //     if (!inputAccepted) {
    //         const checkEC : [boolean, undefined | [DFG, [Node[], Arc[]], [Node[], Arc[]], boolean, Arc, Arc]] = this.checkExclusiveCut(inOutGraph);
    //         inputAccepted = checkEC[0];
    //         if (inputAccepted) {
    //             /* TODO - part to be modified - start */
    //             this._toastService.showToast('input accepted as EC, 3s until execution', 'success');
    //             await new Promise(resolve => setTimeout(resolve, 3000));
    //             /* TODO - part to be modified - end */
    //             if (checkEC[1] !== undefined) {
    //                 this.executeExclusiveCut(inOutGraph, checkEC[1][0], checkEC[1][1], checkEC[1][2], checkEC[1][3], checkEC[1][4], checkEC[1][5]);
    //                 this._displayService.refreshData();
    //                 /* TODO - part to be modified - start */
    //                 this._toastService.showToast('EC executed, 4s until reset of marked flags', 'info');
    //                 await new Promise(resolve => setTimeout(resolve, 4000));
    //                 /* TODO - part to be modified - end */
    //                 inOutGraph.resetAllMarked();
    //             } else {
    //                 throw new Error('#srv.mnr.ccI.000: ' + 'input check failed - check identified exclusive cut, but did not return associated values');
    //             };
    //         } else {
    //             /* TODO - part to be modified - start */
    //             this._toastService.showToast('input rejected as EC, 2s until check for SC', 'error');
    //             await new Promise(resolve => setTimeout(resolve, 2000));
    //             /* TODO - part to be modified - end */
    //         };
    //     };
    //     if (!inputAccepted) {
    //         const checkSC : [boolean, undefined | [DFG, Arc[], [Node[], Arc[]], [Node[], Arc[]], boolean]] = this.checkSequenceCut(inOutGraph);
    //         inputAccepted = checkSC[0];
    //         if (inputAccepted) {
    //             /* TODO - part to be modified - start */
    //             this._toastService.showToast('input accepted as SC, 3s until execution', 'success');
    //             await new Promise(resolve => setTimeout(resolve, 3000));
    //             /* TODO - part to be modified - end */
    //             if (checkSC[1] !== undefined) {
    //                 this.executeSequenceCut(inOutGraph, checkSC[1][0], checkSC[1][1], checkSC[1][2], checkSC[1][3], checkSC[1][4]);
    //                 this._displayService.refreshData();
    //                 /* TODO - part to be modified - start */
    //                 this._toastService.showToast('SC executed, 4s until reset of marked flags', 'info');
    //                 await new Promise(resolve => setTimeout(resolve, 4000));
    //                 /* TODO - part to be modified - end */
    //                 inOutGraph.resetAllMarked();
    //             } else {
    //                 throw new Error('#srv.mnr.ccI.001: ' + 'input check failed - check identified sequence cut, but did not return associated values');
    //             };
    //         } else {
    //             /* TODO - part to be modified - start */
    //             this._toastService.showToast('input rejected as SC, 2s until check for PC', 'error');
    //             await new Promise(resolve => setTimeout(resolve, 2000));
    //             /* TODO - part to be modified - end */
    //         };
    //     };
    //     if (!inputAccepted) {
    //         //const checkPC : [boolean, undefined | []] = this.checkParallelCut(inOutGraph);
    //         const checkPC : [boolean, undefined | [DFG, [Node[], Arc[]], [Node[], Arc[]], boolean, Arc, Arc[], Arc]] = this.checkParallelCut(inOutGraph);
    //         inputAccepted = checkPC[0];
    //         if (inputAccepted) {
    //             /* TODO - part to be modified - start */
    //             this._toastService.showToast('input accepted as PC, 3s until execution', 'success');
    //             await new Promise(resolve => setTimeout(resolve, 3000));
    //             /* TODO - part to be modified - end */
    //             if (checkPC[1] !== undefined) {
    //                 this.executeParallelCut(inOutGraph, checkPC[1][0], checkPC[1][1], checkPC[1][2], checkPC[1][3], checkPC[1][4], checkPC[1][5], checkPC[1][6]);
    //                 this._displayService.refreshData();
    //                 /* TODO - part to be modified - start */
    //                 this._toastService.showToast('PC executed, 4s until reset of marked flags', 'info');
    //                 await new Promise(resolve => setTimeout(resolve, 4000));
    //                 /* TODO - part to be modified - end */
    //                 inOutGraph.resetAllMarked();
    //             } else {
    //                 throw new Error('#srv.mnr.ccI.002: ' + 'input check failed - check identified parallel cut, but did not return associated values');
    //             };
    //         } else {
    //             /* TODO - part to be modified - start */
    //             this._toastService.showToast('input rejected as PC, 2s until check for LC', 'error');
    //             await new Promise(resolve => setTimeout(resolve, 2000));
    //             /* TODO - part to be modified - end */
    //         };
    //     };
    //     if (!inputAccepted) {
    //         const checkLC : [boolean, undefined | [DFG, Node[], Node[], Node[], Node[]]] = this.checkLoopCut(inOutGraph);
    //         inputAccepted = checkLC[0];
    //         if (inputAccepted) {
    //             /* TODO - part to be modified - start */
    //             this._toastService.showToast('input accepted as LC, 3s until execution', 'success');
    //             await new Promise(resolve => setTimeout(resolve, 3000));
    //             /* TODO - part to be modified - end */
    //             if (checkLC[1] !== undefined) {
    //                 this.executeLoopCut(inOutGraph, checkLC[1][0], checkLC[1][1], checkLC[1][2], checkLC[1][3], checkLC[1][4]);
    //                 this._displayService.refreshData();
    //                 /* TODO - part to be modified - start */
    //                 this._toastService.showToast('LC executed, 4s until reset of marked flags', 'info');
    //                 await new Promise(resolve => setTimeout(resolve, 4000));
    //                 /* TODO - part to be modified - end */
    //                 inOutGraph.resetAllMarked();
    //             } else {
    //                 throw new Error('#srv.mnr.ccI.003: ' + 'input check failed - check identified loop cut, but did not return associated values');
    //             };
    //         } else {
    //             /* TODO - part to be modified - start */
    //             this._toastService.showToast('input rejected as LC, 2s until check for BC', 'error');
    //             await new Promise(resolve => setTimeout(resolve, 2000));
    //             /* TODO - part to be modified - end */
    //         };
    //     };
    //     if (!inputAccepted) {
    //         const checkBC : [boolean, undefined | [DFG, Node | undefined]] = this.checkBaseCase(inOutGraph);
    //         inputAccepted = checkBC[0];
    //         if (inputAccepted) {
    //             /* TODO - part to be modified - start */
    //             this._toastService.showToast('input accepted as BC, 3s until execution', 'success');
    //             await new Promise(resolve => setTimeout(resolve, 3000));
    //             /* TODO - part to be modified - end */
    //             if (checkBC[1] !== undefined) {
    //                 if (checkBC[1][1] !== undefined) {
    //                     this.executeBaseCase(inOutGraph, checkBC[1][0], checkBC[1][1]);
    //                 } else {
    //                     this.executeBaseCase(inOutGraph, checkBC[1][0]);
    //                 };
    //                 this._displayService.refreshData();
    //                 /* TODO - part to be modified - start */
    //                 this._toastService.showToast('BC executed, 4s until reset of marked flags', 'info');
    //                 await new Promise(resolve => setTimeout(resolve, 4000));
    //                 /* TODO - part to be modified - end */
    //                 inOutGraph.resetAllMarked();
    //             } else {
    //                 throw new Error('#srv.mnr.ccI.004: ' + 'input check failed - check identified base case, but did not return associated values');
    //             };
    //         } else {
    //             /* TODO - part to be modified - start */
    //             this._toastService.showToast('input rejected as BC, end of checks reached --> no matching pattern found', 'error');
    //             await new Promise(resolve => setTimeout(resolve, 1000));
    //             /* TODO - part to be modified - end */
    //         };
    //     };
    //     //
    //     /* TODO - alternative implementation for test purposes - start */
    //     //
    //     // inOutGraph.resetAllMarked();
    //     // this._displayService.refreshData();
    //     // this._toastService.showToast('marked flags reset, 2s until automated check for all BC', 'info');
    //     // await new Promise(resolve => setTimeout(resolve, 2000));
    //     // const cases : number = this.autoCheckBaseCase(inOutGraph);
    //     // this._toastService.showToast('end of checks reached, found ' + cases.toString() + ' BC', 'error');
    //     // await new Promise(resolve => setTimeout(resolve, 1000));
    //     //
    //     /* TODO - alternative implementation for test purposes - end */
    //     //
    //     this._displayService.refreshData();
    //     /* TODO - part to be modified - start */
    //     if (this.checkTermination(inOutGraph)) {
    //         this._toastService.showToast('the inductive miner has terminated', 'success');
    //     } else {
    //         this._toastService.showToast('termination condition of inductive miner is not met', 'error');
    //     };
    //     /* TODO - part to be modified - end */
    // };

    /* to be removed - start */
    public testCutSearch(inOutGraph: Graph) : void {
        console.log('testing cut search');
        for (const dfg of inOutGraph.dfgArray) {
            let cut : [Node[], Arc[]] | undefined = undefined;
            cut = this.searchExclusiveCut(inOutGraph, dfg);
            if (cut !== undefined) {
                for (const node of cut[0]) {
                    inOutGraph.setElementMarkedFlag(node, true);
                };
                for (const arc of cut[1]) {
                    inOutGraph.setElementMarkedFlag(arc, true);
                };
                this._displayService.refreshData();
                this._toastService.showToast(('Exclusive Cut found in DFG ' + dfg.id.toString()), 'info');
                return;
            };
            cut = this.searchSequenceCut(inOutGraph, dfg);
            if (cut !== undefined) {
                for (const node of cut[0]) {
                    inOutGraph.setElementMarkedFlag(node, true);
                };
                for (const arc of cut[1]) {
                    inOutGraph.setElementMarkedFlag(arc, true);
                };
                this._displayService.refreshData();
                this._toastService.showToast(('Sequence Cut found in DFG ' + dfg.id.toString()), 'info');
                return;
            };
            cut = this.searchParallelCut(inOutGraph, dfg);
            if (cut !== undefined) {
                for (const node of cut[0]) {
                    inOutGraph.setElementMarkedFlag(node, true);
                };
                for (const arc of cut[1]) {
                    inOutGraph.setElementMarkedFlag(arc, true);
                };
                this._displayService.refreshData();
                this._toastService.showToast(('Parallel Cut found in DFG ' + dfg.id.toString()), 'info');
                return;
            };
            cut = this.searchLoopCut(inOutGraph, dfg);
            if (cut !== undefined) {
                for (const node of cut[0]) {
                    inOutGraph.setElementMarkedFlag(node, true);
                };
                for (const arc of cut[1]) {
                    inOutGraph.setElementMarkedFlag(arc, true);
                };
                this._displayService.refreshData();
                this._toastService.showToast(('Loop Cut found in DFG ' + dfg.id.toString()), 'info');
                return;
            };
        };
        this._toastService.showToast('no more cuts possible', 'info');
    };
    /* to be removed - end */

    private checkAllBaseCases(
        inOutGraph : Graph
    ) : [
        number,
        [DFG, Node | undefined][]
    ] {
        /* to be removed - start */
        console.log('im_service started automated check for base cases');
        /* to be removed - end */
        inOutGraph.resetAllChanged();
        inOutGraph.resetAllNew();
        const casesArray : [DFG, Node | undefined][] = [];
        let casesFound : number = 0;
        for (const dfg of inOutGraph.dfgArray) {
            if (dfg.nodes.length < 4) {
                inOutGraph.resetAllMarked();
                for (const node of dfg.nodes) {
                    inOutGraph.setElementMarkedFlag(node, true);
                };
                const checkBC : undefined | [DFG, Node | undefined] = this.checkBaseCase(inOutGraph);
                if (checkBC !== undefined) {
                    casesArray.push(checkBC)
                    casesFound++;
                };
            };
        };
        return [casesFound, casesArray];
    };

    private checkExclusiveCut(
        inOutGraph : Graph
    ) : undefined | [DFG, [Node[], Arc[]], [Node[], Arc[]], boolean, Arc, Arc] {
        /* to be removed - start */
        console.log('im_service started check of exclusive cut');
        /* to be removed - end */
        if (inOutGraph.markedArcs.length !== 2) {
            /* to be removed - start */
            console.log('exclusive cut rejected on check 1');
            /* to be removed - end */
            return undefined;
        };
        if (inOutGraph.markedNodes.length < 1) {
            /* to be removed - start */
            console.log('exclusive cut rejected on check 2');
            /* to be removed - end */
            return undefined;
        };
        let cutDFG : number | undefined = this.checkMarkedDFG(inOutGraph);
        if (cutDFG === undefined) {
            /* to be removed - start */
            console.log('exclusive cut rejected on check 3');
            /* to be removed - end */
            return undefined;
        };
        const dfgPos : number | undefined = this.checkDfgPosition(inOutGraph, cutDFG);
        if (dfgPos === undefined) {
            /* to be removed - start */
            console.log('exclusive cut rejected on check 4');
            /* to be removed - end */
            return undefined;
        };
        const dfg : DFG = inOutGraph.dfgArray[dfgPos];
        const endpointsMarked : boolean | undefined = this.checkEndpointsEqual(dfg);
        if (endpointsMarked === undefined) {
            /* to be removed - start */
            console.log('exclusive cut rejected on check 5');
            /* to be removed - end */
            return undefined;
        };
        const cutArcs : [Arc, Arc] | undefined = this.checkCutArcsEC(inOutGraph, dfg);
        if (cutArcs === undefined) {
            /* to be removed - start */
            console.log('exclusive cut rejected on check 6');
            /* to be removed - end */
            return undefined;
        };
        const splitM : [Node[], Arc[]] = [[], []];
        const splitU : [Node[], Arc[]] = [[], []];
        const arcSplit : [Arc[], Arc[]] | undefined = this.splitArcsEC(dfg);
        if (arcSplit === undefined) {
            /* to be removed - start */
            console.log('exclusive cut rejected on check 7');
            /* to be removed - end */
            return undefined;
        };
        splitM[1] = arcSplit[0];
        splitU[1] = arcSplit[1];
        const nodeSplit : [Node[], Node[]] | undefined = this.splitNodesMU(dfg);
        if (nodeSplit === undefined) {
            /* to be removed - start */
            console.log('exclusive cut rejected on check 8');
            /* to be removed - end */
            return undefined;
        };
        splitM[0] = nodeSplit[0];
        splitU[0] = nodeSplit[1];
        if ((splitM[1].length) < (splitM[0].length - 1)) {
            /* to be removed - start */
            console.log('exclusive cut rejected on check 9');
            /* to be removed - end */
            return undefined;
        };
        if ((splitU[1].length) < (splitU[0].length - 1)) {
            /* to be removed - start */
            console.log('exclusive cut rejected on check 10');
            /* to be removed - end */
            return undefined;
        };
        /* to be removed - start */
        console.log('found exclusive cut');
        /* to be removed - end */
        return [dfg, splitM, splitU, endpointsMarked, cutArcs[0], cutArcs[1]];
    };

    private checkSequenceCut(
        inOutGraph : Graph
    ) : 
        undefined | [DFG, Arc[], [Node[], Arc[]], [Node[], Arc[]], boolean] {
        if (inOutGraph.markedArcs.length < 1) {
            /* to be removed - start */
            console.log('sequence cut rejected on check 1');
            /* to be removed - end */
            return undefined;
        };
        if (inOutGraph.markedNodes.length < 2) {
            /* to be removed - start */
            console.log('sequence cut rejected on check 2');
            /* to be removed - end */
            return undefined;
        };
        let cutDFG : number | undefined = this.checkMarkedDFG(inOutGraph);
        if (cutDFG === undefined) {
            /* to be removed - start */
            console.log('sequence cut rejected on check 3');
            /* to be removed - end */
            return undefined;
        };
        const dfgPos : number | undefined = this.checkDfgPosition(inOutGraph, cutDFG);
        if (dfgPos === undefined) {
            /* to be removed - start */
            console.log('sequence cut rejected on check 4');
            /* to be removed - end */
            return undefined;
        };
        const dfg : DFG = inOutGraph.dfgArray[dfgPos];
        const cutsStartOnMarked : boolean = inOutGraph.markedArcs[0].source.marked;
        const endpointsCheck : boolean | undefined = this.checkEndpointsSC(dfg, cutsStartOnMarked);
        if (endpointsCheck === undefined) {
            /* to be removed - start */
            console.log('sequence cut rejected on check 5');
            /* to be removed - end */
            return undefined;
        };
        const splitT : [Node[], Arc[]] = [[], []];
        const splitB : [Node[], Arc[]] = [[], []];
        const arcSplit : [Arc[], Arc[], Arc[]] | undefined = this.splitArcsSC(dfg, cutsStartOnMarked);
        if (arcSplit === undefined) {
            /* to be removed - start */
            console.log('sequence cut rejected on check 6');
            /* to be removed - end */
            return undefined;
        };
        const cutArcs = arcSplit[0];
        splitT[1] = arcSplit[1];
        splitB[1] = arcSplit[2];
        const nodeSplit : [Node[], Node[]] | undefined = this.splitNodesTB(dfg, cutsStartOnMarked);
        if (nodeSplit === undefined) {
            /* to be removed - start */
            console.log('sequence cut rejected on check 7');
            /* to be removed - end */
            return undefined;
        };
        splitT[0] = nodeSplit[0];
        splitB[0] = nodeSplit[1];
        const reachability : boolean = this.checkReachabilitySC(splitT[0], splitB[0], dfg.arcs);
        if (!(reachability)) {
            /* to be removed - start */
            console.log('sequence cut rejected on check 8');
            /* to be removed - end */
            return undefined;
        };
        /* to be removed - start */
        console.log('found sequence cut');
        /* to be removed - end */
        return [dfg, cutArcs, splitT, splitB, cutsStartOnMarked];
    };

    private checkParallelCut(
        inOutGraph : Graph
    ) : undefined | [DFG, [Node[], Arc[]], [Node[], Arc[]], boolean, Arc, Arc[], Arc] {
        /* to be removed - start */
        console.log('im_service started check of parallel cut');
        /* to be removed - end */
        if (inOutGraph.markedArcs.length < 4) {
            /* to be removed - start */
            console.log('parallel cut rejected on check 1');
            /* to be removed - end */
            return undefined;
        };
        if (inOutGraph.markedNodes.length < 1) {
            /* to be removed - start */
            console.log('parallel cut rejected on check 2');
            /* to be removed - end */
            return undefined;
        };
        let cutDFG : number | undefined = this.checkMarkedDFG(inOutGraph);
        if (cutDFG === undefined) {
            /* to be removed - start */
            console.log('parallel cut rejected on check 3');
            /* to be removed - end */
            return undefined;
        };
        const dfgPos : number | undefined = this.checkDfgPosition(inOutGraph, cutDFG);
        if (dfgPos === undefined) {
            /* to be removed - start */
            console.log('parallel cut rejected on check 4');
            /* to be removed - end */
            return undefined;
        };
        const dfg : DFG = inOutGraph.dfgArray[dfgPos];
        const endpointsMarked : boolean | undefined = this.checkEndpointsEqual(dfg);
        if (endpointsMarked === undefined) {
            /* to be removed - start */
            console.log('parallel cut rejected on check 5');
            /* to be removed - end */
            return undefined;
        };
        const splitM : [Node[], Arc[]] = [[], []];
        const splitU : [Node[], Arc[]] = [[], []];
        const arcSplit : [Arc, Arc[], Arc, Arc[], Arc[]] | undefined = this.splitArcsPC(dfg);
        if (arcSplit === undefined) {
            /* to be removed - start */
            console.log('parallel cut rejected on check 6');
            /* to be removed - end */
            return undefined;
        };
        let cutPlayArc : Arc = arcSplit[0];
        let cutMidArcs : Arc[] = arcSplit[1];
        let cutStopArc : Arc = arcSplit[2];
        splitM[1] = arcSplit[3];
        splitU[1] = arcSplit[4];
        const nodeSplit : [Node[], Node[]] | undefined = this.splitNodesMU(dfg);
        if (nodeSplit === undefined) {
            /* to be removed - start */
            console.log('parallel cut rejected on check 7');
            /* to be removed - end */
            return undefined;
        };
        splitM[0] = nodeSplit[0];
        splitU[0] = nodeSplit[1];
        const reachability : boolean = this.checkReachabilityPC(dfg.startNode, dfg.endNode, endpointsMarked, splitM[0], splitU[0], splitM[1], splitU[1], cutPlayArc, cutMidArcs, cutStopArc);
        if (!(reachability)) {
            /* to be removed - start */
            console.log('parallel cut rejected on check 8');
            /* to be removed - end */
            return undefined;
        };
        if ((splitM[1].length) < (splitM[0].length - 1)) {
            /* to be removed - start */
            console.log('parallel cut rejected on check 9');
            /* to be removed - end */
            return undefined;
        };
        if ((splitU[1].length) < (splitU[0].length - 1)) {
            /* to be removed - start */
            console.log('parallel cut rejected on check 10');
            /* to be removed - end */
            return undefined;
        };
        /* to be removed - start */
        console.log('found parallel cut');
        /* to be removed - end */
        return [dfg, splitM, splitU, endpointsMarked, cutPlayArc, cutMidArcs, cutStopArc];
    };

    private checkLoopCut(
        inOutGraph : Graph
    ) : undefined | [DFG, Node[], Node[], Node[], Node[], boolean] {
        /* to be removed - start */
        console.log('im_service started check of loop cut');
        /* to be removed - end */
        if (inOutGraph.markedArcs.length < 2) {
            /* to be removed - start */
            console.log('loop cut rejected on check 1');
            /* to be removed - end */
            return undefined;
        };
        if (inOutGraph.markedNodes.length < 1) {
            /* to be removed - start */
            console.log('loop cut rejected on check 2');
            /* to be removed - end */
            return undefined;
        };
        let cutDFG : number | undefined = this.checkMarkedDFG(inOutGraph);
        if (cutDFG === undefined) {
            /* to be removed - start */
            console.log('loop cut rejected on check 3');
            /* to be removed - end */
            return undefined;
        };
        const dfgPos : number | undefined = this.checkDfgPosition(inOutGraph, cutDFG);
        if (dfgPos === undefined) {
            /* to be removed - start */
            console.log('loop cut rejected on check 4');
            /* to be removed - end */
            return undefined;
        };
        const dfg : DFG = inOutGraph.dfgArray[dfgPos];
        const endpointsMarked : boolean | undefined = this.checkEndpointsEqual(dfg);
        if (endpointsMarked === undefined) {
            /* to be removed - start */
            console.log('loop cut rejected on check 5');
            /* to be removed - end */
            return undefined;
        };
        const nodeSplit : [Node[], Node[]] | undefined = this.splitNodesMU(dfg);
        if (nodeSplit === undefined) {
            /* to be removed - start */
            console.log('loop cut rejected on check 6');
            /* to be removed - end */
            return undefined;
        };
        const splitM : Node[] = nodeSplit[0];
        const splitU : Node[] = nodeSplit[1];
        let A1 : Node[];
        let A2 : Node[];
        let checkLoop : { isLoop : boolean, A2_play : Node[], A2_stop : Node[] };
        checkLoop = this.checkLoopInternal(inOutGraph, splitU, splitM, dfg);
        if (checkLoop.isLoop) {
            A1 = splitU;
            A2 = splitM;
        } else {
            checkLoop = this.checkLoopInternal(inOutGraph, splitM, splitU, dfg);
            if (checkLoop.isLoop) {
                A1 = splitM;
                A2 = splitU;
            } else {
                /* to be removed - start */
                console.log('loop cut rejected on check 7');
                /* to be removed - end */
                return undefined;
            };
        };
        /* to be removed - start */
        console.log('found loop cut');
        /* to be removed - end */
        return [dfg, A1, A2, checkLoop.A2_play, checkLoop.A2_stop, endpointsMarked];
    };

    private checkBaseCase(
        inOutGraph : Graph
    ) : undefined | [DFG, Node | undefined] {
        /* to be removed - start */
        console.log('im_service started check of base case');
        /* to be removed - end */
        if (inOutGraph.markedArcs.length !== 0) {
            /* to be removed - start */
            console.log('base case rejected on check 1');
            /* to be removed - end */
            return undefined;
        };
        if (inOutGraph.markedNodes.length < 2) {
            /* to be removed - start */
            console.log('base case rejected on check 2');
            /* to be removed - end */
            return undefined;
        };
        if (inOutGraph.markedNodes.length > 3) {
            /* to be removed - start */
            console.log('base case rejected on check 3');
            /* to be removed - end */
            return undefined;
        };
        let cutDFG : number | undefined = this.checkMarkedDFG(inOutGraph);
        if (cutDFG === undefined) {
            /* to be removed - start */
            console.log('base case rejected on check 4');
            /* to be removed - end */
            return undefined;
        };
        const dfgPos : number | undefined = this.checkDfgPosition(inOutGraph, cutDFG);
        if (dfgPos === undefined) {
            /* to be removed - start */
            console.log('base case rejected on check 5');
            /* to be removed - end */
            return undefined;
        };
        const dfg : DFG = inOutGraph.dfgArray[dfgPos];
        if (dfg.nodes.length > 4) {
            /* to be removed - start */
            console.log('base case rejected on check 6');
            /* to be removed - end */
            return undefined;
        };
        if (dfg.startNode.type !== 'support') {
            throw new Error('#srv.mnr.cbc.000: ' + 'base case check failed - inconsitent dfg detected (start node type is not \'support\')');
        };
        if (dfg.startNode.label !== 'play') {
            throw new Error('#srv.mnr.cbc.001: ' + 'base case check failed - inconsitent dfg detected (start node label is not \'play\')');
        };
        if (dfg.endNode.type !== 'support') {
            throw new Error('#srv.mnr.cbc.002: ' + 'base case check failed - inconsitent dfg detected (end node type is not \'support\')');
        };
        if (dfg.endNode.label !== 'stop') {
            throw new Error('#srv.mnr.cbc.003: ' + 'base case check failed - inconsitent dfg detected (end node label is not \'stop\')');
        };
        if (dfg.nodes.length === 3) {
            if (inOutGraph.markedNodes.length !== 3) {
                /* to be removed - start */
                console.log('base case rejected on check 7');
                /* to be removed - end */
                return undefined;
            };
            if (dfg.arcs.length !== 2) {
                /* to be removed - start */
                console.log('base case rejected on check 8');
                /* to be removed - end */
                return undefined;
            };
            if (dfg.arcs[0].weight !== dfg.arcs[1].weight) {
                /* to be removed - start */
                console.log('base case rejected on check 9');
                /* to be removed - end */
                return undefined;
            };
            let midNode : Node | undefined;
            let midCount : number = 0;
            for (const node of dfg.nodes) {
                if ((node !== dfg.startNode) && (node !== dfg.endNode)) {
                    midNode = node;
                    midCount++;
                };
            };
            if (midCount !== 1) {
                throw new Error('#srv.mnr.cbc.004: ' + 'base case check failed - inconsitent dfg detected (three nodes, but more than one node that is neither start nor end)');
            };
            if (midNode === undefined) {
                throw new Error('#srv.mnr.cbc.005: ' + 'base case check failed - impossible error)');
            };
            if (midNode.type !== 'event') {
                if ((midNode.type !== 'support') || (midNode.label !=='tau')) {
                    throw new Error('#srv.mnr.cbc.006: ' + 'base case check failed - inconsitent dfg detected (middle node type is neither event nor tau)');
                };
            };
            for (const arc of dfg.arcs) {
                if (arc.source === dfg.startNode) {
                    if (arc.target !== midNode) {
                        /* to be removed - start */
                        console.log('base case rejected on check 10');
                        /* to be removed - end */
                        return undefined;
                    };
                } else if (arc.source === midNode) {
                    if (arc.target !== dfg.endNode) {
                        /* to be removed - start */
                        console.log('base case rejected on check 11');
                        /* to be removed - end */
                        return undefined;
                    };
                } else {
                    /* to be removed - start */
                    console.log('base case rejected on check 12');
                    /* to be removed - end */
                    return undefined;
                };
            };
            return [dfg, midNode];
        } else if (dfg.nodes.length === 2) {
            if (inOutGraph.markedNodes.length !== 2) {
                /* to be removed - start */
                console.log('base case rejected on check 13');
                /* to be removed - end */
                return undefined;
            };
            if (dfg.arcs.length !== 1) {
                /* to be removed - start */
                console.log('base case rejected on check 14');
                /* to be removed - end */
                return undefined;
            };
            if (dfg.arcs[0].source !== dfg.startNode) {
                /* to be removed - start */
                console.log('base case rejected on check 15');
                /* to be removed - end */
                return undefined;
            };
            if (dfg.arcs[0].target !== dfg.endNode) {
                /* to be removed - start */
                console.log('base case rejected on check 16');
                /* to be removed - end */
                return undefined;
            };
            /* to be removed - start */
            console.log('found base case');
            /* to be removed - end */
            return [dfg, undefined];
        } else {
            throw new Error('#srv.mnr.cbc.015: ' + 'base case check failed - inconsitent dfg detected (less than two nodes) detected');
        };
    };

    private checkFallThrough(
        inOutGraph : Graph,
    ) : undefined | [DFG, Node | undefined] {
        /* to be removed - start */
        console.log('im_service started check of fall through');
        /* to be removed - end */
        if (inOutGraph.markedArcs.length !== 0) {
            /* to be removed - start */
            console.log('fall through rejected on check 1');
            /* to be removed - end */
            return undefined;
        };
        if (inOutGraph.markedNodes.length < 3) {
            /* to be removed - start */
            console.log('fall through rejected on check 2');
            /* to be removed - end */
            return undefined;
        };
        let cutDFG : number | undefined = this.checkMarkedDFG(inOutGraph);
        if (cutDFG === undefined) {
            /* to be removed - start */
            console.log('fall through rejected on check 3');
            /* to be removed - end */
            return undefined;
        };
        const dfgPos : number | undefined = this.checkDfgPosition(inOutGraph, cutDFG);
        if (dfgPos === undefined) {
            /* to be removed - start */
            console.log('fall through rejected on check 4');
            /* to be removed - end */
            return undefined;
        };
        const dfg : DFG = inOutGraph.dfgArray[dfgPos];
        if (inOutGraph.markedNodes.length !== dfg.nodes.length) {
            /* to be removed - start */
            console.log('fall through rejected on check 5');
            /* to be removed - end */
            return undefined;
        };
        let cut : [Node[], Arc[]] | undefined = undefined;
        cut = this.searchExclusiveCut(inOutGraph, dfg);
        if (cut !== undefined) {
            /* to be removed - start */
            console.log('fall through rejected on check 6');
            /* to be removed - end */
            return undefined;
        };
        cut = this.searchSequenceCut(inOutGraph, dfg);
        if (cut !== undefined) {
            /* to be removed - start */
            console.log('fall through rejected on check 7');
            /* to be removed - end */
            return undefined;
        };
        cut = this.searchParallelCut(inOutGraph, dfg);
        if (cut !== undefined) {
            /* to be removed - start */
            console.log('fall through rejected on check 8');
            /* to be removed - end */
            return undefined;
        };
        cut = this.searchLoopCut(inOutGraph, dfg);
        if (cut !== undefined) {
            /* to be removed - start */
            console.log('fall through rejected on check 9');
            /* to be removed - end */
            return undefined;
        };
        let AOPT : Node | undefined = undefined;
        const activity : {
            [nodeID : number] : number;
        } = {};
        for (const node of dfg.nodes) {
            activity[node.id] = 0;
        };
        activity[dfg.startNode.id] = (-1);
        activity[dfg.endNode.id] = (-1);
        let traceIdx : number = 0;
        for (const trace of dfg.log) {
            for (const node of trace) {
                if (activity[node.id] !== traceIdx) {
                    activity[node.id] = (-1);
                } else {
                    activity[node.id]++;
                };
            };
            traceIdx++;
        };
        for (const node of dfg.nodes) {
            if (activity[node.id] !== traceIdx) {
                activity[node.id] = (-1);
            };
        };
        const candidates : Node[] = [];
        for (const node of dfg.nodes) {
            if (activity[node.id] !== (-1)) {
                candidates.push(node);
            };
        };
        if (candidates.length > 0) {
            AOPT = candidates[0];
        };
        /* to be removed - start */
        console.log('found fall through');
        /* to be removed - end */
        return [dfg, AOPT];
    };

    private executeExclusiveCut(
        inOutGraph : Graph,
        inSplitDfg : DFG,
        inMarkedSubgraph : [Node[], Arc[]],
        inUnmarkedSubgraph : [Node[], Arc[]],
        inEndpointsMarked : boolean,
        inCutStartArc : Arc,
        inCutEndArc : Arc
    ) : void {
        /* deciding which of the subgraphs to cut out as a new dfg, and which to keep as the rest of the old dfg */
        const restSubgraph : [Node[], Arc[]] = [[], []];
        const cutSubgraph : [Node[], Arc[]] = [[], []];
        if (inEndpointsMarked) {
            restSubgraph[0] = inMarkedSubgraph[0];
            restSubgraph[1] = inMarkedSubgraph[1];
            cutSubgraph[0] = inUnmarkedSubgraph[0];
            cutSubgraph[1] = inUnmarkedSubgraph[1];
        } else {
            restSubgraph[0] = inUnmarkedSubgraph[0];
            restSubgraph[1] = inUnmarkedSubgraph[1];
            cutSubgraph[0] = inMarkedSubgraph[0];
            cutSubgraph[1] = inMarkedSubgraph[1];
        };
        /* checking if the cut DFG starts at the global start of the graph or ends at the global end */
        const startOfGraph : boolean = this.checkGraphStart(inOutGraph, inSplitDfg.startNode);
        const endOfGraph : boolean = this.checkGraphEnd(inOutGraph, inSplitDfg.endNode);
        /* generating new start and end nodes and matching arcs */
        const globalPlayNodesArray : Node[] = [];
        const globalStopNodesArray : Node[] = [];
        let restSubgraphPlay : Node;
        let restSubgraphStop : Node;
        let cutSubgraphPlay : Node;
        let cutSubgraphStop : Node;
        let uncutStartArcs : Arc[] = [];
        let uncutStartArcsWeight : number = 0;
        let uncutEndArcs : Arc[] = [];
        let uncutEndArcsWeight : number = 0;
        let uncutMidArcs : Arc[] = [];
        let uncutStartNodesCount : number = 0;
        let uncutStartNodesX : number = 0;
        let uncutStartNodesY : number = 0;
        let uncutEndNodesCount : number = 0;
        let uncutEndNodesX : number = 0;
        let uncutEndNodesY : number = 0;
        for (const arc of restSubgraph[1]) {
            if (arc.source === inSplitDfg.startNode) {
                uncutStartArcs.push(arc);
            } else if (arc.target === inSplitDfg.endNode) {
                uncutEndArcs.push(arc);
            } else {
                uncutMidArcs.push(arc);
            };
            if (arc.source === inSplitDfg.startNode) {
                uncutStartNodesX = (uncutStartNodesX + arc.target.x);
                uncutStartNodesY = (uncutStartNodesY + arc.target.y);
                uncutStartArcsWeight = (uncutStartArcsWeight + arc.weight);
                uncutStartNodesCount++;
            };
            if (arc.target === inSplitDfg.endNode) {
                uncutEndNodesX = (uncutEndNodesX + arc.source.x);
                uncutEndNodesY = (uncutEndNodesY + arc.source.y);
                uncutEndArcsWeight = (uncutEndArcsWeight + arc.weight);
                uncutEndNodesCount++;
            };
        };
        if (uncutStartArcsWeight < 1) {
            throw new Error('#srv.mnr.eec.000: ' + 'exclusive cut execution failed - the weight of all uncut arcs starting at the start node of the split dfg is zero or less');
        };
        if (uncutEndArcsWeight < 1) {
            throw new Error('#srv.mnr.eec.001: ' + 'exclusive cut execution failed - the weight of all uncut arcs ending at the end node of the split dfg is zero or less');
        };
        restSubgraph[1] = [];
        for (const arc of uncutMidArcs) {
            restSubgraph[1].push(arc);
        };
        const nextUncutNodeFromStartX : number = Math.floor(uncutStartNodesX / uncutStartNodesCount);
        const nextUncutNodeFromStartY : number = Math.floor(uncutStartNodesY / uncutStartNodesCount);
        const nextUncutNodeToEndX : number = Math.floor(uncutEndNodesX / uncutEndNodesCount);
        const nextUncutNodeToEndY : number = Math.floor(uncutEndNodesY / uncutEndNodesCount);
        if (startOfGraph) {
            const startArcsWeight : number = (inCutStartArc.weight + uncutStartArcsWeight);
            const globalPlayNodes : [Node, Node, Node] = this.transformStart(inOutGraph, inSplitDfg.startNode, startArcsWeight);
            globalPlayNodesArray.push(globalPlayNodes[0], globalPlayNodes[1], globalPlayNodes[2]);
            const globalPlayPlaceTwo : Node = globalPlayNodes[2];
            const cutPlayX : number = Math.floor((globalPlayPlaceTwo.x / 2) + (inCutStartArc.target.x / 2));
            const cutPlayY : number = Math.floor((globalPlayPlaceTwo.y / 2) + (inCutStartArc.target.y / 2));
            const restPlayX : number = Math.floor((globalPlayPlaceTwo.x / 2) + (nextUncutNodeFromStartX / 2));
            const restPlayY : number = Math.floor((globalPlayPlaceTwo.y / 2) + (nextUncutNodeFromStartY / 2));
            const cutPlayAdded : [boolean, number, Node] = inOutGraph.addNode('support', 'play', cutPlayX, cutPlayY);
            if (!(cutPlayAdded[0])) {
                throw new Error('#srv.mnr.eec.002: ' + 'exclusive cut execution failed - new start node for cut part of split dfg could not be added due to conflict with existing node)');
            };
            const restPlayAdded : [boolean, number, Node] = inOutGraph.addNode('support', 'play', restPlayX, restPlayY);
            if (!(restPlayAdded[0])) {
                throw new Error('#srv.mnr.eec.003: ' + 'exclusive cut execution failed - new start node for rest part of split dfg could not be added due to conflict with existing node)');
            };
            restSubgraphPlay = restPlayAdded[2];
            cutSubgraphPlay = cutPlayAdded[2];
            if (inEndpointsMarked) {
                inOutGraph.setElementMarkedFlag(restSubgraphPlay, true);
            } else {
                inOutGraph.setElementMarkedFlag(cutSubgraphPlay, true);
            };
            inOutGraph.setElementNewFlag(restSubgraphPlay, true);
            inOutGraph.setElementNewFlag(cutSubgraphPlay, true);
            const arcToRestAdded = inOutGraph.addArc(globalPlayPlaceTwo, restSubgraphPlay, uncutStartArcsWeight);
            if (!(arcToRestAdded[0])) {
                throw new Error('#srv.mnr.eec.004: ' + 'exclusive cut execution failed - addition of arc from second play place to first new start node failed due to conflict with an existing arc');
            };
            const arcToCutAdded = inOutGraph.addArc(globalPlayPlaceTwo, cutSubgraphPlay, inCutStartArc.weight);
            if (!(arcToCutAdded[0])) {
                throw new Error('#srv.mnr.eec.005: ' + 'exclusive cut execution failed - addition of arc from second play place to second new start node failed due to conflict with an existing arc');
            };
            inOutGraph.setElementMarkedFlag(arcToCutAdded[2], inCutStartArc.marked);
            inOutGraph.setElementChangedFlag(arcToRestAdded[2], true);
            inOutGraph.setElementChangedFlag(arcToCutAdded[2], true);
            for (const arc of uncutStartArcs) {
                restSubgraph[1].push(this.replaceArc(inOutGraph, arc, restSubgraphPlay, arc.target));
            };
            cutSubgraph[1].push(this.replaceArc(inOutGraph, inCutStartArc, cutSubgraphPlay, inCutStartArc.target));
        } else {
            const incomingArcs : Arc[] = [];
            for (const arc of inOutGraph.arcs) {
                if (arc.target === inSplitDfg.startNode) {
                    incomingArcs.push(arc);
                };
            };
            if (incomingArcs.length < 1) {
                throw new Error('#srv.mnr.eec.006: ' + 'exclusive cut execution failed - no arc leading to the old start node of the split dfg was found within the graph');
            } else if (incomingArcs.length > 1) {
                throw new Error('#srv.mnr.eec.007: ' + 'exclusive cut execution failed - more than one arc leading to the old start node of the split dfg was found within the graph');
            };
            const incomingArc : Arc = incomingArcs[0];
            const cutPlayX : number = Math.floor((incomingArc.source.x / 2) + (inCutStartArc.target.x / 2));
            const cutPlayY : number = Math.floor((incomingArc.source.y / 2) + (inCutStartArc.target.y / 2));
            const restPlayX : number = Math.floor((incomingArc.source.x / 2) + (nextUncutNodeFromStartX / 2));
            const restPlayY : number = Math.floor((incomingArc.source.y / 2) + (nextUncutNodeFromStartY / 2));
            const cutPlayAdded : [boolean, number, Node] = inOutGraph.addNode('support', 'play', cutPlayX, cutPlayY);
            if (!(cutPlayAdded[0])) {
                throw new Error('#srv.mnr.eec.008: ' + 'exclusive cut execution failed - new start node for cut part of split dfg could not be added due to conflict with existing node)');
            };
            restSubgraphPlay = inSplitDfg.startNode;
            cutSubgraphPlay = cutPlayAdded[2];
            restSubgraphPlay.coordinates = [restPlayX, restPlayY];
            if (!(inEndpointsMarked)) {
                inOutGraph.setElementMarkedFlag(cutSubgraphPlay, true);
            };
            inOutGraph.setElementChangedFlag(restSubgraphPlay, true);
            inOutGraph.setElementNewFlag(cutSubgraphPlay, true);
            const restArcWeight : number = (incomingArc.weight - inCutStartArc.weight);
            if (restArcWeight !== uncutStartArcsWeight) {
                throw new Error('#srv.mnr.eec.009: ' + 'exclusive cut execution failed - the weight of the only arc leading into the split dfg is not equal to the sum of the weights of the uncut arcs and the cut arc');
            };
            inOutGraph.updateArcWeight(incomingArc, uncutStartArcsWeight);
            const arcToCutAdded = inOutGraph.addArc(incomingArc.source, cutSubgraphPlay, inCutStartArc.weight);
            if (!(arcToCutAdded[0])) {
                throw new Error('#srv.mnr.eec.010: ' + 'exclusive cut execution failed - addition of arc from outer source node to new start node failed due to conflict with an existing arc');
            };
            inOutGraph.setElementChangedFlag(incomingArc, true);
            inOutGraph.setElementChangedFlag(arcToCutAdded[2], true);
            for (const arc of uncutStartArcs) {
                restSubgraph[1].push(arc);
            };
            cutSubgraph[1].push(this.replaceArc(inOutGraph, inCutStartArc, cutSubgraphPlay, inCutStartArc.target));
        };
        if (endOfGraph) {
            const endArcsWeight : number = (inCutEndArc.weight + uncutEndArcsWeight);
            const globalStopNodes : [Node, Node, Node] = this.transformEnd(inOutGraph, inSplitDfg.endNode, endArcsWeight);
            globalStopNodesArray.push(globalStopNodes[0], globalStopNodes[1], globalStopNodes[2]);
            const globalStopPlaceOne : Node = globalStopNodes[0];
            const cutStopX : number = Math.floor((inCutEndArc.source.x / 2) + (globalStopPlaceOne.x / 2));
            const cutStopY : number = Math.floor((inCutEndArc.source.y / 2) + (globalStopPlaceOne.y / 2));
            const restStopX : number = Math.floor((nextUncutNodeToEndX / 2) + (globalStopPlaceOne.x / 2));
            const restStopY : number = Math.floor((nextUncutNodeToEndY / 2) + (globalStopPlaceOne.y / 2));
            const cutStopAdded : [boolean, number, Node] = inOutGraph.addNode('support', 'stop', cutStopX, cutStopY);
            if (!(cutStopAdded[0])) {
                throw new Error('#srv.mnr.eec.011: ' + 'exclusive cut execution failed - new end node for cut part of split dfg could not be added due to conflict with existing node)');
            };
            const restStopAdded : [boolean, number, Node] = inOutGraph.addNode('support', 'stop', restStopX, restStopY);
            if (!(restStopAdded[0])) {
                throw new Error('#srv.mnr.eec.012: ' + 'exclusive cut execution failed - new end node for rest part of split dfg could not be added due to conflict with existing node)');
            };
            restSubgraphStop = restStopAdded[2];
            cutSubgraphStop = cutStopAdded[2];
            if (inEndpointsMarked) {
                inOutGraph.setElementMarkedFlag(restSubgraphStop, true);
            } else {
                inOutGraph.setElementMarkedFlag(cutSubgraphStop, true);
            };
            inOutGraph.setElementNewFlag(restSubgraphStop, true);
            inOutGraph.setElementNewFlag(cutSubgraphStop, true);
            const arcFromRestAdded = inOutGraph.addArc(restSubgraphStop, globalStopPlaceOne, uncutEndArcsWeight);
            if (!(arcFromRestAdded[0])) {
                throw new Error('#srv.mnr.eec.013: ' + 'exclusive cut execution failed - addition of arc from first new end node to first stop place failed due to conflict with an existing arc');
            };
            const arcFromCutAdded = inOutGraph.addArc(cutSubgraphStop, globalStopPlaceOne, inCutEndArc.weight);
            if (!(arcFromCutAdded[0])) {
                throw new Error('#srv.mnr.eec.014: ' + 'exclusive cut execution failed - addition of arc from second new end node to first stop place failed due to conflict with an existing arc');
            };
            inOutGraph.setElementMarkedFlag(arcFromCutAdded[2], inCutEndArc.marked);
            inOutGraph.setElementChangedFlag(arcFromRestAdded[2], true);
            inOutGraph.setElementChangedFlag(arcFromCutAdded[2], true);
            for (const arc of uncutEndArcs) {
                restSubgraph[1].push(this.replaceArc(inOutGraph, arc, arc.source, restSubgraphStop));
            };
            cutSubgraph[1].push(this.replaceArc(inOutGraph, inCutEndArc, inCutEndArc.source, cutSubgraphStop));
        } else {
            const outgoingArcs : Arc[] = [];
            for (const arc of inOutGraph.arcs) {
                if (arc.source === inSplitDfg.endNode) {
                    outgoingArcs.push(arc);
                };
            };
            if (outgoingArcs.length < 1) {
                throw new Error('#srv.mnr.eec.015: ' + 'exclusive cut execution failed - no arc coming from the old end node of the split dfg was found within the graph');
            } else if (outgoingArcs.length > 1) {
                throw new Error('#srv.mnr.eec.016: ' + 'exclusive cut execution failed - more than one arc coming from the old end node of the split dfg was found within the graph');
            };
            const outgoingArc : Arc = outgoingArcs[0];
            const cutStopX : number = Math.floor((inCutEndArc.source.x / 2) + (outgoingArc.target.x / 2));
            const cutStopY : number = Math.floor((inCutEndArc.source.y / 2) + (outgoingArc.target.y / 2));
            const restStopX : number = Math.floor((nextUncutNodeToEndX / 2) + (outgoingArc.target.x / 2));
            const restStopY : number = Math.floor((nextUncutNodeToEndY / 2) + (outgoingArc.target.y / 2));
            const cutStopAdded : [boolean, number, Node] = inOutGraph.addNode('support', 'stop', cutStopX, cutStopY);
            if (!(cutStopAdded[0])) {
                throw new Error('#srv.mnr.eec.017: ' + 'exclusive cut execution failed - new end node for cut part of split dfg could not be added due to conflict with existing node)');
            };
            restSubgraphStop = inSplitDfg.endNode;
            cutSubgraphStop = cutStopAdded[2];
            restSubgraphStop.coordinates = [restStopX, restStopY];
            if (!(inEndpointsMarked)) {
                inOutGraph.setElementMarkedFlag(cutSubgraphStop, true);
            };
            inOutGraph.setElementChangedFlag(restSubgraphStop, true);
            inOutGraph.setElementNewFlag(cutSubgraphStop, true);
            const restArcWeight : number = (outgoingArc.weight - inCutEndArc.weight);
            if (restArcWeight !== uncutEndArcsWeight) {
                throw new Error('#srv.mnr.eec.018: ' + 'exclusive cut execution failed - the weight of the only arc leading out of the split dfg is not equal to the sum of the weights of the uncut arcs and the cut arc');
            };
            inOutGraph.updateArcWeight(outgoingArc, uncutEndArcsWeight);
            const arcFromCutAdded = inOutGraph.addArc(cutSubgraphStop, outgoingArc.target, inCutEndArc.weight);
            if (!(arcFromCutAdded[0])) {
                throw new Error('#srv.mnr.eec.019: ' + 'exclusive cut execution failed - addition of arc from new end node to outer target node failed due to conflict with an existing arc');
            };
            inOutGraph.setElementChangedFlag(outgoingArc, true);
            inOutGraph.setElementChangedFlag(arcFromCutAdded[2], true);
            for (const arc of uncutEndArcs) {
                restSubgraph[1].push(arc);
            };
            cutSubgraph[1].push(this.replaceArc(inOutGraph, inCutEndArc, inCutEndArc.source, cutSubgraphStop));
        };
        /* splitting the dfg event log between the cut part and the rest part */
        const cutSublog : Node[][] = [];
        const restSublog : Node[][] = [];
        if (inEndpointsMarked) {
            for (const trace of inSplitDfg.log) {
                const cutTrace : Node[] = [cutSubgraphPlay];
                const restTrace : Node[] = [restSubgraphPlay];
                for (let eventIdx = 1; eventIdx < (trace.length - 1); eventIdx++) {
                    if (trace[eventIdx].marked) {
                        restTrace.push(trace[eventIdx]);
                    } else {
                        cutTrace.push(trace[eventIdx]);
                    };
                };
                cutTrace.push(cutSubgraphStop);
                restTrace.push(restSubgraphStop);
                if (cutTrace.length > 2) {
                    cutSublog.push(cutTrace);
                };
                if (restTrace.length > 2) {
                    restSublog.push(restTrace);
                };
            };
        } else {
            for (const trace of inSplitDfg.log) {
                const cutTrace : Node[] = [cutSubgraphPlay];
                const restTrace : Node[] = [restSubgraphPlay];
                for (let eventIdx = 1; eventIdx < (trace.length - 1); eventIdx++) {
                    if (trace[eventIdx].marked) {
                        cutTrace.push(trace[eventIdx]);
                    } else {
                        restTrace.push(trace[eventIdx]);
                    };
                };
                cutTrace.push(cutSubgraphStop);
                restTrace.push(restSubgraphStop);
                if (cutTrace.length > 2) {
                    cutSublog.push(cutTrace);
                };
                if (restTrace.length > 2) {
                    restSublog.push(restTrace);
                };
            };
        };
        /* updating the graph event log */
        if (startOfGraph) {
            if (globalPlayNodesArray.length !== 3) {
                throw new Error('#srv.mnr.eec.020: ' + 'exclusive cut execution failed - newly transformed global play nodes were not assigned properly');
            };
            if (endOfGraph) {
                if (globalStopNodesArray.length !== 3) {
                    throw new Error('#srv.mnr.eec.021: ' + 'exclusive cut execution failed - newly transformed global stop nodes were not assigned properly');
                };
                for (const trace of inOutGraph.logArray) {
                    for (let evIdx = 0; evIdx < trace.length; evIdx++) {
                        if (trace[evIdx] === inCutStartArc.source) {
                            if (trace[evIdx + 1] === inCutStartArc.target) {
                                trace.splice(evIdx, 1, globalPlayNodesArray[0], globalPlayNodesArray[1], globalPlayNodesArray[2], cutSubgraphPlay);
                                evIdx = (evIdx + 3);
                            } else {
                                trace.splice(evIdx, 1, globalPlayNodesArray[0], globalPlayNodesArray[1], globalPlayNodesArray[2], restSubgraphPlay);
                                evIdx = (evIdx + 3);
                            };
                        };
                        if (trace[evIdx] === inCutEndArc.target) {
                            if (trace[evIdx - 1] === inCutEndArc.source) {
                                trace.splice(evIdx, 1, cutSubgraphStop, globalStopNodesArray[0], globalStopNodesArray[1], globalStopNodesArray[2]);
                                evIdx = (evIdx + 3);
                            } else {
                                trace.splice(evIdx, 1, restSubgraphStop, globalStopNodesArray[0], globalStopNodesArray[1], globalStopNodesArray[2]);
                                evIdx = (evIdx + 3);
                            };
                        };
                    };
                };
            } else {
                for (const trace of inOutGraph.logArray) {
                    for (let evIdx = 0; evIdx < trace.length; evIdx++) {
                        if (trace[evIdx] === inCutStartArc.source) {
                            if (trace[evIdx + 1] === inCutStartArc.target) {
                                trace.splice(evIdx, 1, globalPlayNodesArray[0], globalPlayNodesArray[1], globalPlayNodesArray[2], cutSubgraphPlay);
                                evIdx = (evIdx + 3);
                            } else {
                                trace.splice(evIdx, 1, globalPlayNodesArray[0], globalPlayNodesArray[1], globalPlayNodesArray[2], restSubgraphPlay);
                                evIdx = (evIdx + 3);
                            };
                        };
                        if (trace[evIdx] === inCutEndArc.target) {
                            if (trace[evIdx - 1] === inCutEndArc.source) {
                                trace.splice(evIdx, 1, cutSubgraphStop);
                            } else {
                                trace.splice(evIdx, 1, restSubgraphStop);
                            };
                        };
                    };
                };
            };
        } else {
            if (endOfGraph) {
                if (globalStopNodesArray.length !== 3) {
                    throw new Error('#srv.mnr.eec.022: ' + 'exclusive cut execution failed - newly transformed global stop nodes were not assigned properly');
                };
                for (const trace of inOutGraph.logArray) {
                    for (let evIdx = 0; evIdx < trace.length; evIdx++) {
                        if (trace[evIdx] === inCutStartArc.source) {
                            if (trace[evIdx + 1] === inCutStartArc.target) {
                                trace.splice(evIdx, 1, cutSubgraphPlay);
                            } else {
                                trace.splice(evIdx, 1, restSubgraphPlay);
                            };
                        };
                        if (trace[evIdx] === inCutEndArc.target) {
                            if (trace[evIdx - 1] === inCutEndArc.source) {
                                trace.splice(evIdx, 1, cutSubgraphStop, globalStopNodesArray[0], globalStopNodesArray[1], globalStopNodesArray[2]);
                                evIdx = (evIdx + 3);
                            } else {
                                trace.splice(evIdx, 1, restSubgraphStop, globalStopNodesArray[0], globalStopNodesArray[1], globalStopNodesArray[2]);
                                evIdx = (evIdx + 3);
                            };
                        };
                    };
                };
            } else {
                for (const trace of inOutGraph.logArray) {
                    for (let evIdx = 0; evIdx < trace.length; evIdx++) {
                        if (trace[evIdx] === inCutStartArc.source) {
                            if (trace[evIdx + 1] === inCutStartArc.target) {
                                trace.splice(evIdx, 1, cutSubgraphPlay);
                            } else {
                                trace.splice(evIdx, 1, restSubgraphPlay);
                            };
                        };
                        if (trace[evIdx] === inCutEndArc.target) {
                            if (trace[evIdx - 1] === inCutEndArc.source) {
                                trace.splice(evIdx, 1, cutSubgraphStop);
                            } else {
                                trace.splice(evIdx, 1, restSubgraphStop);
                            };
                        };
                    };
                };
            };
        };
        /* updating dfgs */
        restSubgraph[0].push(restSubgraphPlay);
        restSubgraph[0].push(restSubgraphStop);
        cutSubgraph[0].push(cutSubgraphPlay);
        cutSubgraph[0].push(cutSubgraphStop);
        if (inEndpointsMarked) {
            inSplitDfg.update(cutSubgraphPlay, cutSubgraphStop, cutSubgraph[0], cutSubgraph[1], cutSublog);
            inOutGraph.appendDFG(restSubgraphPlay, restSubgraphStop, restSubgraph[0], restSubgraph[1], restSublog);
        } else {
            inSplitDfg.update(restSubgraphPlay, restSubgraphStop, restSubgraph[0], restSubgraph[1], restSublog);
            inOutGraph.appendDFG(cutSubgraphPlay, cutSubgraphStop, cutSubgraph[0], cutSubgraph[1], cutSublog);
        };
        /* deleting replaced endpoints and updating references */
        if (startOfGraph) {
            const transformedGlobalPlay : Node | undefined = inOutGraph.startNode;
            if (transformedGlobalPlay !== undefined) {
                inOutGraph.startNode = globalPlayNodesArray[0];
                if (!(inOutGraph.deleteNode(transformedGlobalPlay))) {
                    throw new Error('#srv.mnr.eec.023: ' + 'exclusive cut execution failed - old global play node was not deleted properly');
                };
            } else {
                throw new Error('#srv.mnr.eec.024: ' + 'exclusive cut execution failed - the global start node within the graph is undefined');
            };
        };
        if (endOfGraph) {
            const transformedGlobalStop : Node | undefined = inOutGraph.endNode;
            if (transformedGlobalStop !== undefined) {
                inOutGraph.endNode = globalStopNodesArray[2];
                if (!(inOutGraph.deleteNode(transformedGlobalStop))) {
                    throw new Error('#srv.mnr.eec.025: ' + 'exclusive cut execution failed - old global stop node was not deleted properly');
                };
            } else {
                throw new Error('#srv.mnr.eec.026: ' + 'exclusive cut execution failed - the global end node within the graph is undefined');
            };
        };
    };

    private executeSequenceCut(
        inOutGraph : Graph,
        inSplitDfg : DFG,
        inCutArcs : Arc[],
        inTopSubgraph : [Node[], Arc[]],
        inBotSubgraph : [Node[], Arc[]],
        inTopMarked : boolean
    ) : void {
        /* special case detection */
        let topEmpty : boolean = false;
        let botEmpty : boolean = false;
        if (inTopSubgraph[0].length === 2) {
            let innerNode : Node;
            if (inTopSubgraph[0][1] !== inSplitDfg.startNode) {
                innerNode = inTopSubgraph[0][1];
            } else {
                innerNode = inTopSubgraph[0][0];
            };
            if (innerNode.type === 'support') {
                if (innerNode.label === 'tau') {
                    topEmpty = true;
                };
            };
        };
        if (inBotSubgraph[0].length === 1) {
            let innerNode : Node;
            if (inBotSubgraph[0][0] !== inSplitDfg.endNode) {
                innerNode = inBotSubgraph[0][0];
            } else {
                innerNode = inBotSubgraph[0][1];
            };
            if (innerNode.type === 'support') {
                if (innerNode.label === 'tau') {
                    botEmpty = true;
                };
            };
        };
        /* case-based handling */
        if (topEmpty) {
            if (botEmpty) {
                /* case I - top and bottom empty */
                /* generating new middle node and matching arcs */
                const subgraph : [Node[], Arc[]] = [[], []];
                const startNode : Node = inSplitDfg.startNode;
                const endNode : Node = inSplitDfg.endNode;
                let topEmptyNode : Node;
                let botEmptyNode : Node;
                if (inTopSubgraph[0][1] !== inSplitDfg.startNode) {
                    topEmptyNode = inTopSubgraph[0][1];
                } else {
                    topEmptyNode = inTopSubgraph[0][0];
                };
                if (inBotSubgraph[0][1] !== inSplitDfg.endNode) {
                    botEmptyNode = inBotSubgraph[0][1];
                } else {
                    botEmptyNode = inBotSubgraph[0][0];
                };
                let startWeight : number = 0;
                let endWeight : number = 0;
                for (const arc of inSplitDfg.arcs) {
                    if (arc.source === startNode) {
                        startWeight = startWeight + arc.weight;
                    };
                    if (arc.target === endNode) {
                        endWeight = endWeight + arc.weight;
                    };
                };
                const tauX : number = Math.floor((startNode.x / 2) + (endNode.x / 2));
                const tauY : number = Math.floor((startNode.y / 2) + (endNode.y / 2));
                const tauAdded : [boolean, number, Node] = inOutGraph.addNode('support', 'tau', tauX, tauY);
                if (!(tauAdded[0])) {
                    throw new Error('#srv.mnr.esc.000: ' + 'sequence cut execution failed - addition of new tau node failed due to conflict with an existing node');
                };
                const tauNode : Node = tauAdded[2];
                const arcToTauAdded : [boolean, number, Arc] = inOutGraph.addArc(startNode, tauNode);
                if (!(arcToTauAdded[0])) {
                    throw new Error('#srv.mnr.esc.001: ' + 'sequence cut execution failed - addition of arc from source node to new tau node failed due to conflict with an existing arc');
                };
                const arcToTau : Arc = arcToTauAdded[2];
                const arcFromTauAdded : [boolean, number, Arc] = inOutGraph.addArc(tauNode, endNode);
                if (!(arcFromTauAdded[0])) {
                    throw new Error('#srv.mnr.esc.002: ' + 'sequence cut execution failed - addition of arc from new tau node to target node failed due to conflict with an existing arc');
                };
                const arcFromTau : Arc = arcFromTauAdded[2];
                inOutGraph.setElementMarkedFlag(arcToTau, true);
                inOutGraph.setElementMarkedFlag(tauNode, true);
                inOutGraph.setElementMarkedFlag(arcFromTau, true);
                inOutGraph.setElementChangedFlag(arcToTau, true);
                inOutGraph.setElementChangedFlag(tauNode, true);
                inOutGraph.setElementChangedFlag(arcFromTau, true);
                subgraph[0].push(startNode, tauNode, endNode);
                subgraph[1].push(arcToTau, arcFromTau);
                /* splitting the dfg event log between the cut part and the rest part */
                const sublog : Node[][] = [];
                for (let traceIdx = 0; traceIdx < inSplitDfg.log.length; traceIdx++) {
                    sublog.push([startNode, tauNode, endNode]);
                };
                /* updating the graph event log */
                for (const trace of inOutGraph.logArray) {
                    for (let evIdx = 0; evIdx < trace.length; evIdx++) {
                        if (trace[evIdx] === startNode) {
                            if (trace[evIdx + 1] === topEmptyNode) {
                                if (trace[evIdx + 2] === botEmptyNode) {
                                    if (trace[evIdx + 3] === endNode) {
                                        trace.splice((evIdx + 1), 2, tauNode);
                                        evIdx = (evIdx + 2);
                                    } else {
                                        throw new Error('#srv.mnr.esc.003: ' + 'sequence cut execution failed - graph trace could not be updated');
                                    };
                                } else if (trace[evIdx + 2] === endNode) {
                                    trace.splice((evIdx + 1), 1, tauNode);
                                    evIdx = (evIdx + 2);
                                } else {
                                    throw new Error('#srv.mnr.esc.004: ' + 'sequence cut execution failed - graph trace could not be updated');
                                };
                            } else if (trace[evIdx + 1] === botEmptyNode) {
                                if (trace[evIdx + 2] === endNode) {
                                    trace.splice((evIdx + 1), 1, tauNode);
                                    evIdx = (evIdx + 2);
                                } else {
                                    throw new Error('#srv.mnr.esc.005: ' + 'sequence cut execution failed - graph trace could not be updated');
                                };
                            } else if (trace[evIdx + 1] === endNode) {
                                trace.splice((evIdx + 1), 0, tauNode);
                                evIdx = (evIdx + 2);
                            } else {
                                throw new Error('#srv.mnr.esc.006: ' + 'sequence cut execution failed - graph trace could not be updated');
                            };
                        };
                    };
                };
                /* deleting replaced nodes & arcs */
                for (const arc of inSplitDfg.arcs) {
                    if (!(inOutGraph.deleteArc(arc))) {
                        throw new Error('#srv.mnr.esc.007: ' + 'sequence cut execution failed - deletion of replaced arc failed');
                    };
                };
                for (const node of inSplitDfg.nodes) {
                    if (node !== inSplitDfg.startNode) {
                        if (node !== inSplitDfg.endNode) {
                            if (!(inOutGraph.deleteNode(node))) {
                                throw new Error('#srv.mnr.esc.008: ' + 'sequence cut execution failed - deletion of replaced node failed');
                            };
                        };
                    };
                };
                /* updating dfgs */
                inSplitDfg.update(startNode, endNode, subgraph[0], subgraph[1], sublog);
            } else {
                /* case II - only top empty */
                /* replacing tau node and adjacent arcs */
                const startNode : Node = inSplitDfg.startNode;
                let topEmptyNode : Node;
                if (inTopSubgraph[0][1] !== inSplitDfg.startNode) {
                    topEmptyNode = inTopSubgraph[0][1];
                } else {
                    topEmptyNode = inTopSubgraph[0][0];
                };
                const arcsToEmpty : Arc[] = [];
                for (const arc of inSplitDfg.arcs) {
                    if (arc.source === startNode) {
                        if (arc.target === topEmptyNode) {
                            arcsToEmpty.push(arc);
                        };
                    };
                };
                if (arcsToEmpty.length < 1) {
                    throw new Error('#srv.mnr.esc.009: ' + 'sequence cut execution failed - no arc connecting the start node to the top inner node was found within the split dfg');
                } else if (arcsToEmpty.length > 1) {
                    throw new Error('#srv.mnr.esc.010: ' + 'sequence cut execution failed - multiple arcs connecting the start node to the top inner node were found within the split dfg');
                };
                const arcToEmpty : Arc = arcsToEmpty[0];
                let arcsFromEmptyWeight : number = 0;
                for (const arc of inCutArcs) {
                    if (arc.source === topEmptyNode) {
                        arcsFromEmptyWeight = (arcsFromEmptyWeight + arc.weight);
                        const arcAdded : [boolean, number, Arc] = inOutGraph.addArc(startNode, arc.target, arc.weight);
                        const addedArc : Arc = arcAdded[2];
                        if (!(inOutGraph.deleteArc(arc))) {
                            throw new Error('#srv.mnr.esc.011: ' + 'sequence cut execution failed - deletion of replaced arc failed');
                        };
                        inOutGraph.setElementMarkedFlag(addedArc, true);
                        inOutGraph.setElementChangedFlag(addedArc, true);
                        inBotSubgraph[1].push(addedArc);
                    } else if (arc.source === startNode) {
                        inBotSubgraph[1].push(arc);
                    } else {
                        throw new Error('#srv.mnr.esc.012: ' + 'sequence cut execution failed - found an arc marked to be cut that has a source node outside the top split of the dfg');
                    };
                };
                if (arcsFromEmptyWeight !== arcToEmpty.weight) {
                    throw new Error('#srv.mnr.esc.013: ' + 'sequence cut execution failed - combined weight of all arcs leading away from the empty top node is not equal to the weight of the only arc leading to it');
                };
                if (!(inOutGraph.deleteArc(arcToEmpty))) {
                    throw new Error('#srv.mnr.esc.014: ' + 'sequence cut execution failed - deletion of replaced arc failed');
                };
                inBotSubgraph[0].push(startNode);
                /* splitting the dfg event log between the cut part and the rest part */
                const sublog : Node[][] = inSplitDfg.log;
                for (const trace of sublog) {
                    for (let evIdx = 0; evIdx < trace.length; evIdx++) {
                        if (trace[evIdx] === topEmptyNode) {
                            trace.splice(evIdx, 1);
                            evIdx = (evIdx - 1);
                        };
                    };
                };
                /* updating the graph event log */
                for (const trace of inOutGraph.logArray) {
                    for (let evIdx = 0; evIdx < trace.length; evIdx++) {
                        if (trace[evIdx] === topEmptyNode) {
                            trace.splice(evIdx, 1);
                            evIdx = (evIdx - 1);
                        };
                    };
                };
                /* updating dfgs */
                if (inTopMarked) {
                    inSplitDfg.update(startNode, inSplitDfg.endNode, inBotSubgraph[0], inBotSubgraph[1], sublog);
                } else {
                    inOutGraph.appendDFG(startNode, inSplitDfg.endNode, inBotSubgraph[0], inBotSubgraph[1], sublog);
                };
                /* deleting replaced empty node */
                if (!(inOutGraph.deleteNode(topEmptyNode))) {
                    throw new Error('#srv.mnr.esc.015: ' + 'sequence cut execution failed - deletion of replaced node failed');
                };
            };
        } else {
            if (botEmpty) {
                /* case II - only bottom empty */
                /* replacing tau node and adjacent arcs */
                const endNode : Node = inSplitDfg.endNode;
                let botEmptyNode : Node;
                if (inBotSubgraph[0][1] !== inSplitDfg.endNode) {
                    botEmptyNode = inBotSubgraph[0][1];
                } else {
                    botEmptyNode = inBotSubgraph[0][0];
                };
                const arcsFromEmpty : Arc[] = [];
                for (const arc of inSplitDfg.arcs) {
                    if (arc.target === endNode) {
                        if (arc.source === botEmptyNode) {
                            arcsFromEmpty.push(arc);
                        };
                    };
                };
                if (arcsFromEmpty.length < 1) {
                    throw new Error('#srv.mnr.esc.016: ' + 'sequence cut execution failed - no arc connecting the bottom inner node to the end node was found within the split dfg');
                } else if (arcsFromEmpty.length > 1) {
                    throw new Error('#srv.mnr.esc.017: ' + 'sequence cut execution failed - multiple arcs connecting the bottom inner node to the end node were found within the split dfg');
                };
                const arcFromEmpty : Arc = arcsFromEmpty[0];
                let arcsToEmptyWeight : number = 0;
                for (const arc of inCutArcs) {
                    if (arc.target === botEmptyNode) {
                        arcsToEmptyWeight = (arcsToEmptyWeight + arc.weight);
                        const arcAdded : [boolean, number, Arc] = inOutGraph.addArc(arc.source, endNode, arc.weight);
                        const addedArc : Arc = arcAdded[2];
                        if (!(inOutGraph.deleteArc(arc))) {
                            throw new Error('#srv.mnr.esc.018: ' + 'sequence cut execution failed - deletion of replaced arc failed');
                        };
                        inOutGraph.setElementMarkedFlag(addedArc, true);
                        inOutGraph.setElementChangedFlag(addedArc, true);
                        inTopSubgraph[1].push(addedArc);
                    } else if (arc.target === endNode) {
                        inTopSubgraph[1].push(arc);
                    } else {
                        throw new Error('#srv.mnr.esc.019: ' + 'sequence cut execution failed - found an arc marked to be cut that has a target node outside the bottom split of the dfg');
                    };
                };
                if (arcsToEmptyWeight !== arcFromEmpty.weight) {
                    throw new Error('#srv.mnr.esc.020: ' + 'sequence cut execution failed - combined weight of all arcs leading to from the empty bottom node is not equal to the weight of the only arc leading away from it');
                };
                if (!(inOutGraph.deleteArc(arcFromEmpty))) {
                    throw new Error('#srv.mnr.esc.021: ' + 'sequence cut execution failed - deletion of replaced arc failed');
                };
                inTopSubgraph[0].push(endNode);
                /* splitting the dfg event log between the cut part and the rest part */
                const sublog : Node[][] = inSplitDfg.log;
                for (const trace of sublog) {
                    for (let evIdx = 0; evIdx < trace.length; evIdx++) {
                        if (trace[evIdx] === botEmptyNode) {
                            trace.splice(evIdx, 1);
                            evIdx = (evIdx - 1);
                        };
                    };
                };
                /* updating the graph event log */
                for (const trace of inOutGraph.logArray) {
                    for (let evIdx = 0; evIdx < trace.length; evIdx++) {
                        if (trace[evIdx] === botEmptyNode) {
                            trace.splice(evIdx, 1);
                            evIdx = (evIdx - 1);
                        };
                    };
                };
                /* updating dfgs */
                if (inTopMarked) {
                    inOutGraph.appendDFG(inSplitDfg.startNode, endNode, inTopSubgraph[0], inTopSubgraph[1], sublog);
                } else {
                    inSplitDfg.update(inSplitDfg.startNode, endNode, inTopSubgraph[0], inTopSubgraph[1], sublog);
                };
                /* deleting replaced empty node */
                if (!(inOutGraph.deleteNode(botEmptyNode))) {
                    throw new Error('#srv.mnr.esc.022: ' + 'sequence cut execution failed - deletion of replaced node failed');
                };
            } else {
                /* case III - neither top nor bottom empty */
                /* generating new start and end nodes and matching arcs */
                let topSubgraphPlay : Node;
                let topSubgraphStop : Node;
                let botSubgraphPlay : Node;
                let botSubgraphStop : Node;
                let cutArcsWeight : number = 0;
                let cutArcsStartX : number = 0;
                let cutArcsStartY : number = 0;
                let cutArcsEndX : number = 0;
                let cutArcsEndY : number = 0;
                let cutArcsNum : number = inCutArcs.length;
                for (const arc of inCutArcs) {
                    cutArcsWeight = (cutArcsWeight + arc.weight);
                    cutArcsStartX = (cutArcsStartX + arc.source.x);
                    cutArcsStartY = (cutArcsStartY + arc.source.y);
                    cutArcsEndX = (cutArcsEndX + arc.target.x);
                    cutArcsEndY = (cutArcsEndY + arc.target.y);
                };
                const cutArcsStartMidX : number = Math.floor(cutArcsStartX / cutArcsNum)
                const cutArcsStartMidY : number = Math.floor(cutArcsStartY / cutArcsNum);
                const cutArcsEndMidX : number = Math.floor(cutArcsEndX / cutArcsNum);
                const cutArcsEndMidY : number = Math.floor(cutArcsEndY / cutArcsNum);
                const newStopX : number = Math.floor((3 * (cutArcsStartMidX / 4)) + (cutArcsEndMidX / 4));
                const newStopY : number = Math.floor((3 * (cutArcsStartMidY / 4)) + (cutArcsEndMidY / 4));
                const newPlayX : number = Math.floor((cutArcsStartMidX / 4) + (3 * (cutArcsEndMidX / 4)));
                const newPlayY : number = Math.floor((cutArcsStartMidY / 4) + (3 * (cutArcsEndMidY / 4)));
                const newPlaceX : number = Math.floor((cutArcsStartMidX / 2) + (cutArcsEndMidX / 2));
                const newPlaceY : number = Math.floor((cutArcsStartMidY / 2) + (cutArcsEndMidY / 2));
                const newStopAdded : [boolean, number, Node] = inOutGraph.addNode('support', 'stop', newStopX, newStopY);
                if (!(newStopAdded[0])) {
                    throw new Error('#srv.mnr.esc.023: ' + 'sequence cut execution failed - new end node for top part of split dfg could not be added due to conflict with existing node)');
                };
                const newStop : Node = newStopAdded[2];
                inTopSubgraph[0].push(newStop);
                const newPlayAdded : [boolean, number, Node] = inOutGraph.addNode('support', 'play', newPlayX, newPlayY);
                if (!(newPlayAdded[0])) {
                    throw new Error('#srv.mnr.esc.024: ' + 'sequence cut execution failed - new play node for bottom part of split dfg could not be added due to conflict with existing node)');
                };
                const newPlay : Node = newPlayAdded[2];
                inBotSubgraph[0].push(newPlay);
                const newPlaceAdded : [boolean, number, Node] = inOutGraph.addNode('place', '', newPlaceX, newPlaceY);
                if (!(newPlaceAdded[0])) {
                    throw new Error('#srv.mnr.esc.025: ' + 'sequence cut execution failed - new place between parts of split dfg could not be added due to conflict with existing node)');
                };
                const newPlace : Node = newPlaceAdded[2];
                inOutGraph.setElementNewFlag(newStop, true);
                inOutGraph.setElementNewFlag(newPlay, true);
                inOutGraph.setElementNewFlag(newPlace, true);
                topSubgraphPlay = inSplitDfg.startNode;
                topSubgraphStop = newStop;
                botSubgraphPlay = newPlay;
                botSubgraphStop = inSplitDfg.endNode;
                const innerArcOneAdded : [boolean, number, Arc] = inOutGraph.addArc(newStop, newPlace, cutArcsWeight);
                if (!(innerArcOneAdded[0])) {
                    throw new Error('#srv.mnr.esc.026: ' + 'sequence cut execution failed - arc from new stop node to new middle place could not be added due to conflict with an existing arc');
                };
                const innerArcOne : Arc = innerArcOneAdded[2];
                const innerArcTwoAdded : [boolean, number, Arc] = inOutGraph.addArc(newPlace, newPlay, cutArcsWeight);
                if (!(innerArcTwoAdded[0])) {
                    throw new Error('#srv.mnr.esc.027: ' + 'sequence cut execution failed - arc from new middle place to new end node could not be added due to conflict with an existing arc');
                };
                const innerArcTwo : Arc = innerArcTwoAdded[2];
                inOutGraph.setElementMarkedFlag(innerArcOne, true);
                inOutGraph.setElementMarkedFlag(innerArcTwo, true);
                inOutGraph.setElementChangedFlag(innerArcOne, true);
                inOutGraph.setElementChangedFlag(innerArcTwo, true);
                let topTauCase : boolean = false;
                let botTauCase : boolean = false;
                let topTauArc : Arc | undefined = undefined;
                let botTauArc : Arc | undefined = undefined;
                let topTauTarget : Node | undefined = undefined;
                let botTauSource : Node | undefined = undefined;
                let topTauBranch : [Arc, Node, Arc] | undefined = undefined;
                let botTauBranch : [Arc, Node, Arc] | undefined = undefined;
                for (const arc of inCutArcs) {
                    const outerArcsAdded : [boolean, Arc, boolean, Arc] = this.replaceAndAddArc(inOutGraph, arc, arc.source, newStop, newPlay, arc.target);
                    if (outerArcsAdded[0]) {
                        if (outerArcsAdded[1].source === inSplitDfg.startNode) {
                            topTauTarget = arc.target;
                            topTauCase = true;
                            topTauArc = outerArcsAdded[1];
                        } else {
                            inTopSubgraph[1].push(outerArcsAdded[1]);
                        };
                    };
                    if (outerArcsAdded[2]) {
                        if (outerArcsAdded[3].target === inSplitDfg.endNode) {
                            botTauSource = arc.source;
                            botTauCase = true;
                            botTauArc = outerArcsAdded[3];
                        } else {
                            inBotSubgraph[1].push(outerArcsAdded[3]);
                        };
                    };
                };
                if (topTauCase && botTauCase) {
                    throw new Error('#srv.mnr.esc.028: ' + 'sequence cut execution failed - top and bottom split both contain tau case');
                };
                if (topTauCase) {
                    if (topTauArc !== undefined) {
                        topTauBranch = this.replaceArcInsertNode(inOutGraph, topTauArc, topTauArc.source, topTauArc.target, 'support', 'tau');
                        inTopSubgraph[1].push(topTauBranch[0]);
                        inTopSubgraph[0].push(topTauBranch[1]);
                        inTopSubgraph[1].push(topTauBranch[2]);
                    } else {
                        throw new Error('#srv.mnr.esc.029: ' + 'sequence cut execution failed - top split contains tau case, but tau arc returns undefined');
                    };
                };
                if (botTauCase) {
                    if (botTauArc !== undefined) {
                        botTauBranch = this.replaceArcInsertNode(inOutGraph, botTauArc, botTauArc.source, botTauArc.target, 'support', 'tau');
                        inBotSubgraph[1].push(botTauBranch[0]);
                        inBotSubgraph[0].push(botTauBranch[1]);
                        inBotSubgraph[1].push(botTauBranch[2]);
                    } else {
                        throw new Error('#srv.mnr.esc.030: ' + 'sequence cut execution failed - bottom split contains tau case, but tau arc returns undefined');
                    };
                };
                /* splitting the dfg event log between the cut part and the rest part */
                const topSublog : Node[][] = [];
                const botSublog : Node[][] = [];
                if (inTopMarked) {
                    let topTauCount : number = 0;
                    let botTauCount : number = 0;
                    for (const trace of inSplitDfg.log) {
                        const topTrace : Node[] = [];
                        const botTrace : Node[] = [];
                        botTrace.push(newPlay);
                        for (let eventIdx = 0; eventIdx < trace.length; eventIdx++) {
                            if (trace[eventIdx].marked) {
                                topTrace.push(trace[eventIdx]);
                            } else {
                                botTrace.push(trace[eventIdx]);
                            };
                        };
                        topTrace.push(newStop);
                        if (topTrace.length > 2) {
                            topSublog.push(topTrace);
                        } else if (topTrace.length === 2) {
                            topTauCount++;
                            if (topTauCase) {
                                if (topTauBranch !== undefined) {
                                    topTrace.splice(1, 0, topTauBranch[1]);
                                    topSublog.push(topTrace);
                                } else {
                                    throw new Error('#srv.mnr.esc.031: ' + 'sequence cut execution failed - top tau case was detected, but top tau branch returns undefined');
                                };
                            } else {
                                throw new Error('#srv.mnr.esc.032: ' + 'sequence cut execution failed - splitting trace from old dfg lead to a subtrace for the top subgraph containing 2 nodes, but no top tau case was detected');
                            };
                        } else {
                            throw new Error('#srv.mnr.esc.033: ' + 'sequence cut execution failed - splitting trace from old dfg lead to a subtrace for the top subgraph containing less than 2 nodes');
                        };
                        if (botTrace.length > 2) {
                            botSublog.push(botTrace);
                        } else if (botTrace.length === 2) {
                            botTauCount++;
                            if (botTauCase) {
                                if (botTauBranch !== undefined) {
                                    botTrace.splice(1, 0, botTauBranch[1]);
                                    botSublog.push(botTrace);
                                } else {
                                    throw new Error('#srv.mnr.esc.034: ' + 'sequence cut execution failed - bottom tau case was detected, but bottom tau branch returns undefined');
                                };
                            } else {
                                throw new Error('#srv.mnr.esc.035: ' + 'sequence cut execution failed - splitting trace from old dfg lead to a subtrace for the bottom subgraph containing 2 nodes, but no bottom tau case was detected');
                            };
                        } else {
                            throw new Error('#srv.mnr.esc.036: ' + 'sequence cut execution failed - splitting trace from old dfg lead to a subtrace for the bottom subgraph containing less than 2 nodes');
                        };
                    };
                    if (topTauCase) {
                        if (topTauArc !== undefined) {
                            if (topTauCount !== topTauArc.weight) {
                                throw new Error('#srv.mnr.esc.037: ' + 'sequence cut execution failed - splitting the log of the old dfg ' + topTauCount + ' tau cases were found within the top split, while the detected top tau arc had a weight of ' + topTauArc.weight);
                            };
                        };
                    };
                    if (botTauCase) {
                        if (botTauArc !== undefined) {
                            if (botTauCount !== botTauArc.weight) {
                                throw new Error('#srv.mnr.esc.038: ' + 'sequence cut execution failed - splitting the log of the old dfg ' + botTauCount + ' tau cases were found within the bottom split, while the detected bottom tau arc had a weight of ' + botTauArc.weight);
                            };
                        };
                    };
                } else {
                    let topTauCount : number = 0;
                    let botTauCount : number = 0;
                    for (const trace of inSplitDfg.log) {
                        const topTrace : Node[] = [];
                        const botTrace : Node[] = [];
                        botTrace.push(newPlay);
                        for (let eventIdx = 0; eventIdx < trace.length; eventIdx++) {
                            if (trace[eventIdx].marked) {
                                botTrace.push(trace[eventIdx]);
                            } else {
                                topTrace.push(trace[eventIdx]);
                            };
                        };
                        topTrace.push(newStop);
                        if (topTrace.length > 2) {
                            topSublog.push(topTrace);
                        } else if (topTrace.length === 2) {
                            topTauCount++;
                            if (topTauCase) {
                                if (topTauBranch !== undefined) {
                                    topTrace.splice(1, 0, topTauBranch[1]);
                                    topSublog.push(topTrace);
                                } else {
                                    throw new Error('#srv.mnr.esc.039: ' + 'sequence cut execution failed - top tau case was detected, but top tau branch returns undefined');
                                };
                            } else {
                                throw new Error('#srv.mnr.esc.040: ' + 'sequence cut execution failed - splitting trace from old dfg lead to a subtrace for the top subgraph containing 2 nodes, but no top tau case was detected');
                            };
                        } else {
                            throw new Error('#srv.mnr.esc.041: ' + 'sequence cut execution failed - splitting trace from old dfg lead to a subtrace for the top subgraph containing less than 2 nodes');
                        };
                        if (botTrace.length > 2) {
                            botSublog.push(botTrace);
                        } else if (botTrace.length === 2) {
                            botTauCount++;
                            if (botTauCase) {
                                if (botTauBranch !== undefined) {
                                    botTrace.splice(1, 0, botTauBranch[1]);
                                    botSublog.push(botTrace);
                                } else {
                                    throw new Error('#srv.mnr.esc.042: ' + 'sequence cut execution failed - bottom tau case was detected, but bottom tau branch returns undefined');
                                };
                            } else {
                                throw new Error('#srv.mnr.esc.043: ' + 'sequence cut execution failed - splitting trace from old dfg lead to a subtrace for the bottom subgraph containing 2 nodes, but no bottom tau case was detected');
                            };
                        } else {
                            throw new Error('#srv.mnr.esc.044: ' + 'sequence cut execution failed - splitting trace from old dfg lead to a subtrace for the bottom subgraph containing less than 2 nodes');
                        };
                    };
                    if (topTauCase) {
                        if (topTauArc !== undefined) {
                            if (topTauCount !== topTauArc.weight) {
                                throw new Error('#srv.mnr.esc.045: ' + 'sequence cut execution failed - splitting the log of the old dfg ' + topTauCount + ' tau cases were found within the top split, while the detected top tau arc had a weight of ' + topTauArc.weight);
                            };
                        };
                    };
                    if (botTauCase) {
                        if (botTauArc !== undefined) {
                            if (botTauCount !== botTauArc.weight) {
                                throw new Error('#srv.mnr.esc.046: ' + 'sequence cut execution failed - splitting the log of the old dfg ' + botTauCount + ' tau cases were found within the bottom split, while the detected bottom tau arc had a weight of ' + botTauArc.weight);
                            };
                        };
                    };
                };
                /* updating the graph event log */
                for (const trace of inOutGraph.logArray) {
                    for (let evIdx = 0; evIdx < trace.length; evIdx++) {
                        for (const arc of inCutArcs) {
                            if (trace[evIdx] === arc.source) {
                                if (trace[evIdx + 1] === arc.target) {
                                    trace.splice((evIdx + 1), 0, newStop, newPlace, newPlay);
                                    if (topTauCase) {
                                        if (topTauBranch !== undefined) {
                                            if ((arc.source === inSplitDfg.startNode) && (arc.target === topTauTarget)) {
                                                trace.splice((evIdx + 1), 0, topTauBranch[1]);
                                                evIdx = (evIdx + 1);
                                            };
                                        } else {
                                            throw new Error('#srv.mnr.esc.047: ' + 'sequence cut execution failed - top tau case was detected, but top tau branch returns undefined');
                                        };
                                    } else if (botTauCase) {
                                        if (botTauBranch !== undefined) {
                                            if ((arc.source === botTauSource) && (arc.target === inSplitDfg.endNode)) {
                                                trace.splice((evIdx + 4), 0, botTauBranch[1]);
                                                evIdx = (evIdx + 1);
                                            };
                                        }else {
                                            throw new Error('#srv.mnr.esc.048: ' + 'sequence cut execution failed - bottom tau case was detected, but bottom tau branch returns undefined');
                                        };
                                    };
                                    evIdx = (evIdx + 3);
                                };
                            };
                        };
                    };
                };
                /* deciding which of the subgraphs to cut out as a new dfg, and which to keep as the rest of the old dfg, then updating dfgs accordingly */
                if (inTopMarked) {
                    inSplitDfg.update(botSubgraphPlay, botSubgraphStop, inBotSubgraph[0], inBotSubgraph[1], botSublog);
                    inOutGraph.appendDFG(topSubgraphPlay, topSubgraphStop, inTopSubgraph[0], inTopSubgraph[1], topSublog);
                } else {
                    inSplitDfg.update(topSubgraphPlay, topSubgraphStop, inTopSubgraph[0], inTopSubgraph[1], topSublog);
                    inOutGraph.appendDFG(botSubgraphPlay, botSubgraphStop, inBotSubgraph[0], inBotSubgraph[1], botSublog);
                };
            };
        };
    };

    private executeParallelCut(
        inOutGraph : Graph,
        inSplitDfg : DFG,
        inMarkedSubgraph : [Node[], Arc[]],
        inUnmarkedSubgraph : [Node[], Arc[]],
        inEndpointsMarked : boolean,
        inCutStartArc : Arc,
        inCutMidArcs : Arc[],
        inCutEndArc : Arc
    ) : void {
        /* deciding which of the subgraphs to cut out as a new dfg, and which to keep as the rest of the old dfg */
        const restSubgraph : [Node[], Arc[]] = [[], []];
        const cutSubgraph : [Node[], Arc[]] = [[], []];
        if (inEndpointsMarked) {
            restSubgraph[0] = inMarkedSubgraph[0];
            restSubgraph[1] = inMarkedSubgraph[1];
            cutSubgraph[0] = inUnmarkedSubgraph[0];
            cutSubgraph[1] = inUnmarkedSubgraph[1];
        } else {
            restSubgraph[0] = inUnmarkedSubgraph[0];
            restSubgraph[1] = inUnmarkedSubgraph[1];
            cutSubgraph[0] = inMarkedSubgraph[0];
            cutSubgraph[1] = inMarkedSubgraph[1];
        };
        /* checking if the cut DFG starts at the global start of the graph or ends at the global end */
        const startOfGraph : boolean = this.checkGraphStart(inOutGraph, inSplitDfg.startNode);
        const endOfGraph : boolean = this.checkGraphEnd(inOutGraph, inSplitDfg.endNode);
        /* generating new start and end nodes and matching arcs */
        const globalPlayNodesArray : Node[] = [];
        const globalStopNodesArray : Node[] = [];
        let startTransition : Node;
        let startPlaceRest : Node;
        let startPlaceCut : Node;
        let endTransition : Node;
        let endPlaceRest : Node;
        let endPlaceCut : Node;
        let restSubgraphPlay : Node;
        let restSubgraphStop : Node;
        let cutSubgraphPlay : Node;
        let cutSubgraphStop : Node;
        let uncutStartArcs : Arc[] = [];
        let uncutStartArcsWeight : number = 0;
        let uncutEndArcs : Arc[] = [];
        let uncutEndArcsWeight : number = 0;
        let uncutMidArcs : Arc[] = [];
        let uncutStartNodesCount : number = 0;
        let uncutStartNodesX : number = 0;
        let uncutStartNodesY : number = 0;
        let uncutEndNodesCount : number = 0;
        let uncutEndNodesX : number = 0;
        let uncutEndNodesY : number = 0;
        for (const arc of restSubgraph[1]) {
            if (arc.source === inSplitDfg.startNode) {
                uncutStartArcs.push(arc);
            } else if (arc.target === inSplitDfg.endNode) {
                uncutEndArcs.push(arc);
            } else {
                uncutMidArcs.push(arc);
            };
            if (arc.source === inSplitDfg.startNode) {
                uncutStartNodesX = (uncutStartNodesX + arc.target.x);
                uncutStartNodesY = (uncutStartNodesY + arc.target.y);
                uncutStartArcsWeight = (uncutStartArcsWeight + arc.weight);
                uncutStartNodesCount++;
            };
            if (arc.target === inSplitDfg.endNode) {
                uncutEndNodesX = (uncutEndNodesX + arc.source.x);
                uncutEndNodesY = (uncutEndNodesY + arc.source.y);
                uncutEndArcsWeight = (uncutEndArcsWeight + arc.weight);
                uncutEndNodesCount++;
            };
        };
        if (uncutStartArcsWeight < 1) {
            throw new Error('#srv.mnr.epc.000: ' + 'parallel cut execution failed - the weight of all uncut arcs starting at the start node of the split dfg is zero or less');
        };
        if (uncutEndArcsWeight < 1) {
            throw new Error('#srv.mnr.epc.001: ' + 'parallel cut execution failed - the weight of all uncut arcs ending at the end node of the split dfg is zero or less');
        };
        restSubgraph[1] = [];
        for (const arc of uncutMidArcs) {
            restSubgraph[1].push(arc);
        };
        const startArcsWeight : number = (uncutStartArcsWeight + inCutStartArc.weight);
        const endArcsWeight : number = (uncutEndArcsWeight + inCutEndArc.weight);
        const nextUncutNodeFromStartX : number = Math.floor(uncutStartNodesX / uncutStartNodesCount);
        const nextUncutNodeFromStartY : number = Math.floor(uncutStartNodesY / uncutStartNodesCount);
        const nextUncutNodeToEndX : number = Math.floor(uncutEndNodesX / uncutEndNodesCount);
        const nextUncutNodeToEndY : number = Math.floor(uncutEndNodesY / uncutEndNodesCount);
        if (startOfGraph) {
            const globalPlayNodes : [Node, Node] = this.transformStartShort(inOutGraph, inSplitDfg.startNode, startArcsWeight);
            globalPlayNodesArray.push(globalPlayNodes[0], globalPlayNodes[1]);
            startTransition = globalPlayNodes[1];
            const calcX1 : number = startTransition.x;
            const calcY1 : number = startTransition.y;
            const cutX2 : number = inCutStartArc.target.x;
            const cutY2 : number = inCutStartArc.target.y;
            const restPlaceX : number = Math.floor((2 * calcX1 / 3) + (nextUncutNodeFromStartX / 3));
            const restPlaceY : number = Math.floor((2 * calcY1 / 3) + (nextUncutNodeFromStartY / 3));
            const cutPlaceX : number = Math.floor((2 * calcX1 / 3) + (cutX2 / 3));
            const cutPlaceY : number = Math.floor((2 * calcY1 / 3) + (cutY2 / 3));
            const restPlayX : number = Math.floor((calcX1 / 3) + (2 * nextUncutNodeFromStartX / 3));
            const restPlayY : number = Math.floor((calcY1 / 3) + (2 * nextUncutNodeFromStartY / 3));
            const cutPlayX : number = Math.floor((calcX1 / 3) + (2 * cutX2 / 3));
            const cutPlayY : number = Math.floor((calcY1 / 3) + (2 * cutY2 / 3));
            const restPlaceAdded : [boolean, number, Node] = inOutGraph.addNode('place', '', restPlaceX, restPlaceY);
            if (!(restPlaceAdded[0])) {
                throw new Error('#srv.mnr.epc.002: ' + 'parallel cut execution failed - new place for rest part of split dfg could not be added due to conflict with existing node)');
            };
            startPlaceRest = restPlaceAdded[2];
            const cutPlaceAdded : [boolean, number, Node] = inOutGraph.addNode('place', '', cutPlaceX, cutPlaceY);
            if (!(cutPlaceAdded[0])) {
                throw new Error('#srv.mnr.epc.003: ' + 'parallel cut execution failed - new place for cut part of split dfg could not be added due to conflict with existing node)');
            };
            startPlaceCut = cutPlaceAdded[2];
            const restPlayAdded : [boolean, number, Node] = inOutGraph.addNode('support', 'play', restPlayX, restPlayY);
            if (!(restPlayAdded[0])) {
                throw new Error('#srv.mnr.epc.004: ' + 'parallel cut execution failed - new start node for rest part of split dfg could not be added due to conflict with existing node)');
            };
            restSubgraphPlay = restPlayAdded[2];
            const cutPlayAdded : [boolean, number, Node] = inOutGraph.addNode('support', 'play', cutPlayX, cutPlayY);
            if (!(cutPlayAdded[0])) {
                throw new Error('#srv.mnr.epc.005: ' + 'parallel cut execution failed - new start node for cut part of split dfg could not be added due to conflict with existing node)');
            };
            cutSubgraphPlay = cutPlayAdded[2];
            if (inEndpointsMarked) {
                inOutGraph.setElementMarkedFlag(startPlaceRest, true);
                inOutGraph.setElementMarkedFlag(restSubgraphPlay, true);
            } else {
                inOutGraph.setElementMarkedFlag(startPlaceCut, true);
                inOutGraph.setElementMarkedFlag(cutSubgraphPlay, true);
            };
            inOutGraph.setElementNewFlag(startPlaceRest, true);
            inOutGraph.setElementNewFlag(startPlaceCut, true);
            inOutGraph.setElementNewFlag(restSubgraphPlay, true);
            inOutGraph.setElementNewFlag(cutSubgraphPlay, true);
            for (const arc of uncutStartArcs) {
                restSubgraph[1].push(this.replaceArc(inOutGraph, arc, restSubgraphPlay, arc.target));
            };
        } else {
            const incomingArcs : Arc[] = [];
            for (const arc of inOutGraph.arcs) {
                if (arc.target === inSplitDfg.startNode) {
                    incomingArcs.push(arc);
                };
            };
            if (incomingArcs.length < 1) {
                throw new Error('#srv.mnr.epc.006: ' + 'parallel cut execution failed - no arc leading to the old start node of the split dfg was found within the graph');
            } else if (incomingArcs.length > 1) {
                throw new Error('#srv.mnr.epc.007: ' + 'parallel cut execution failed - more than one arc leading to the old start node of the split dfg was found within the graph');
            };
            const incomingArc : Arc = incomingArcs[0];
            const calcX1 : number = inCutStartArc.source.x;
            const calcY1 : number = inCutStartArc.source.y;
            const cutX2 : number = inCutStartArc.target.x;
            const cutY2 : number = inCutStartArc.target.y;
            const restPlaceX : number = Math.floor((2 * calcX1 / 3) + (nextUncutNodeFromStartX / 3));
            const restPlaceY : number = Math.floor((2 * calcY1 / 3) + (nextUncutNodeFromStartY / 3));
            const cutPlaceX : number = Math.floor((2 * calcX1 / 3) + (cutX2 / 3));
            const cutPlaceY : number = Math.floor((2 * calcY1 / 3) + (cutY2 / 3));
            const restPlayX : number = Math.floor((calcX1 / 3) + (2 * nextUncutNodeFromStartX / 3));
            const restPlayY : number = Math.floor((calcY1 / 3) + (2 * nextUncutNodeFromStartY / 3));
            const cutPlayX : number = Math.floor((calcX1 / 3) + (2 * cutX2 / 3));
            const cutPlayY : number = Math.floor((calcY1 / 3) + (2 * cutY2 / 3));
            const startTransitionAdded : [boolean, number, Node] = inOutGraph.addNode('transition', '', inCutStartArc.source.x, inCutStartArc.source.y);
            if (!(startTransitionAdded[0])) {
                throw new Error('#srv.mnr.epc.008: ' + 'parallel cut execution failed - new start transition could not be added due to conflict with existing node)');
            };
            startTransition = startTransitionAdded[2];
            const restPlaceAdded : [boolean, number, Node] = inOutGraph.addNode('place', '', restPlaceX, restPlaceY);
            if (!(restPlaceAdded[0])) {
                throw new Error('#srv.mnr.epc.009: ' + 'parallel cut execution failed - new start place for rest part of split dfg could not be added due to conflict with existing node)');
            };
            startPlaceRest = restPlaceAdded[2];
            const cutPlaceAdded : [boolean, number, Node] = inOutGraph.addNode('place', '', cutPlaceX, cutPlaceY);
            if (!(cutPlaceAdded[0])) {
                throw new Error('#srv.mnr.epc.010: ' + 'parallel cut execution failed - new start place for cut part of split dfg could not be added due to conflict with existing node)');
            };
            startPlaceCut = cutPlaceAdded[2];
            restSubgraphPlay = inSplitDfg.startNode;
            restSubgraphPlay.coordinates = [restPlayX, restPlayY];
            const cutPlayAdded : [boolean, number, Node] = inOutGraph.addNode('support', 'play', cutPlayX, cutPlayY);
            if (!(cutPlayAdded[0])) {
                throw new Error('#srv.mnr.epc.011: ' + 'parallel cut execution failed - new start node for cut part of split dfg could not be added due to conflict with existing node)');
            };
            cutSubgraphPlay = cutPlayAdded[2];
            if (inEndpointsMarked) {
                inOutGraph.setElementMarkedFlag(startTransition, true);
                inOutGraph.setElementMarkedFlag(startPlaceRest, true);
            } else {
                inOutGraph.setElementMarkedFlag(startPlaceCut, true);
                inOutGraph.setElementMarkedFlag(cutSubgraphPlay, true);
            };
            inOutGraph.setElementNewFlag(startTransition, true);
            inOutGraph.setElementNewFlag(startPlaceRest, true);
            inOutGraph.setElementNewFlag(startPlaceCut, true);
            inOutGraph.setElementChangedFlag(restSubgraphPlay, true);
            inOutGraph.setElementNewFlag(cutSubgraphPlay, true);
            startTransition.special = true;
            if (incomingArc.weight !== startArcsWeight) {
                throw new Error('#srv.mnr.epc.012: ' + 'parallel cut execution failed - the weight of the only arc leading into the split dfg is not equal to the sum of the weights of the uncut arcs and the cut arc');
            };
            this.replaceArc(inOutGraph, incomingArc, incomingArc.source, startTransition);
            for (const arc of uncutStartArcs) {
                restSubgraph[1].push(arc);
            };
        };
        cutSubgraph[1].push(this.replaceArc(inOutGraph, inCutStartArc, cutSubgraphPlay, inCutStartArc.target));
        const arcToRestPlaceAdded = inOutGraph.addArc(startTransition, startPlaceRest, startArcsWeight);
        if (!(arcToRestPlaceAdded[0])) {
            throw new Error('#srv.mnr.epc.013: ' + 'parallel cut execution failed - addition of arc from start transition to rest start place failed due to conflict with an existing arc');
        };
        const arcToCutPlaceAdded = inOutGraph.addArc(startTransition, startPlaceCut, startArcsWeight);
        if (!(arcToCutPlaceAdded[0])) {
            throw new Error('#srv.mnr.epc.014: ' + 'parallel cut execution failed - addition of arc from start transition to cut start place failed due to conflict with an existing arc');
        };
        const arcToRestAdded = inOutGraph.addArc(startPlaceRest, restSubgraphPlay, startArcsWeight);
        if (!(arcToRestAdded[0])) {
            throw new Error('#srv.mnr.epc.015: ' + 'parallel cut execution failed - addition of arc from rest start place to rest play node failed due to conflict with an existing arc');
        };
        const arcToCutAdded = inOutGraph.addArc(startPlaceCut, cutSubgraphPlay, startArcsWeight);
        if (!(arcToCutAdded[0])) {
            throw new Error('#srv.mnr.epc.016: ' + 'parallel cut execution failed - addition of arc from cut start place to cut play node failed due to conflict with an existing arc');
        };
        inOutGraph.setElementMarkedFlag(arcToCutPlaceAdded[2], inCutStartArc.marked);
        inOutGraph.setElementMarkedFlag(arcToCutAdded[2], inCutStartArc.marked);
        inOutGraph.setElementChangedFlag(arcToRestPlaceAdded[2], true);
        inOutGraph.setElementChangedFlag(arcToCutPlaceAdded[2], true);
        inOutGraph.setElementChangedFlag(arcToRestAdded[2], true);
        inOutGraph.setElementChangedFlag(arcToCutAdded[2], true);
        if (endOfGraph) {
            const globalStopNodes : [Node, Node] = this.transformEndShort(inOutGraph, inSplitDfg.endNode, endArcsWeight);
            globalStopNodesArray.push(globalStopNodes[0], globalStopNodes[1]);
            endTransition = globalStopNodes[0];
            const cutX1 : number = inCutEndArc.source.x;
            const cutY1 : number = inCutEndArc.source.y;
            const calcX2 : number = endTransition.x;
            const calcY2 : number = endTransition.y;
            const restPlaceX : number = Math.floor((nextUncutNodeToEndX / 3) + (2 * calcX2 / 3));
            const restPlaceY : number = Math.floor((nextUncutNodeToEndY / 3) + (2 * calcY2 / 3));
            const cutPlaceX : number = Math.floor((cutX1 / 3) + (2 * calcX2 / 3));
            const cutPlaceY : number = Math.floor((cutY1 / 3) + (2 * calcY2 / 3));
            const restStopX : number = Math.floor((2 * nextUncutNodeToEndX / 3) + (calcX2 / 3));
            const restStopY : number = Math.floor((2 * nextUncutNodeToEndY / 3) + (calcY2 / 3));
            const cutStopX : number = Math.floor((2 * cutX1 / 3) + (calcX2 / 3));
            const cutStopY : number = Math.floor((2 * cutY1 / 3) + (calcY2 / 3));
            const restPlaceAdded : [boolean, number, Node] = inOutGraph.addNode('place', '', restPlaceX, restPlaceY);
            if (!(restPlaceAdded[0])) {
                throw new Error('#srv.mnr.epc.017: ' + 'parallel cut execution failed - new place for rest part of split dfg could not be added due to conflict with existing node)');
            };
            endPlaceRest = restPlaceAdded[2];
            const cutPlaceAdded : [boolean, number, Node] = inOutGraph.addNode('place', '', cutPlaceX, cutPlaceY);
            if (!(cutPlaceAdded[0])) {
                throw new Error('#srv.mnr.epc.018: ' + 'parallel cut execution failed - new place for cut part of split dfg could not be added due to conflict with existing node)');
            };
            endPlaceCut = cutPlaceAdded[2];
            const restStopAdded : [boolean, number, Node] = inOutGraph.addNode('support', 'stop', restStopX, restStopY);
            if (!(restStopAdded[0])) {
                throw new Error('#srv.mnr.epc.019: ' + 'parallel cut execution failed - new end node for rest part of split dfg could not be added due to conflict with existing node)');
            };
            restSubgraphStop = restStopAdded[2];
            const cutStopAdded : [boolean, number, Node] = inOutGraph.addNode('support', 'stop', cutStopX, cutStopY);
            if (!(cutStopAdded[0])) {
                throw new Error('#srv.mnr.epc.020: ' + 'parallel cut execution failed - new end node for cut part of split dfg could not be added due to conflict with existing node)');
            };
            cutSubgraphStop = cutStopAdded[2];
            if (inEndpointsMarked) {
                inOutGraph.setElementMarkedFlag(endPlaceRest, true);
                inOutGraph.setElementMarkedFlag(restSubgraphStop, true);
            } else {
                inOutGraph.setElementMarkedFlag(endPlaceCut, true);
                inOutGraph.setElementMarkedFlag(cutSubgraphStop, true);
            };
            inOutGraph.setElementNewFlag(endPlaceRest, true);
            inOutGraph.setElementNewFlag(endPlaceCut, true);
            inOutGraph.setElementNewFlag(restSubgraphStop, true);
            inOutGraph.setElementNewFlag(cutSubgraphStop, true);
            for (const arc of uncutEndArcs) {
                restSubgraph[1].push(this.replaceArc(inOutGraph, arc, arc.source, restSubgraphStop));
            };
        } else {
            const outgoingArcs : Arc[] = [];
            for (const arc of inOutGraph.arcs) {
                if (arc.source === inSplitDfg.endNode) {
                    outgoingArcs.push(arc);
                };
            };
            if (outgoingArcs.length < 1) {
                throw new Error('#srv.mnr.epc.021: ' + 'parallel cut execution failed - no arc coming from the old end node of the split dfg was found within the graph');
            } else if (outgoingArcs.length > 1) {
                throw new Error('#srv.mnr.epc.022: ' + 'parallel cut execution failed - more than one arc coming from the old end node of the split dfg was found within the graph');
            };
            const outgoingArc : Arc = outgoingArcs[0];
            const cutX1 : number = inCutEndArc.source.x;
            const cutY1 : number = inCutEndArc.source.y;
            const calcX2 : number = inCutEndArc.target.x;
            const calcY2 : number = inCutEndArc.target.y;
            const restPlaceX : number = Math.floor((nextUncutNodeToEndX / 3) + (2 * calcX2 / 3));
            const restPlaceY : number = Math.floor((nextUncutNodeToEndY / 3) + (2 * calcY2 / 3));
            const cutPlaceX : number = Math.floor((cutX1 / 3) + (2 * calcX2 / 3));
            const cutPlaceY : number = Math.floor((cutY1 / 3) + (2 * calcY2 / 3));
            const restStopX : number = Math.floor((2 * nextUncutNodeToEndX / 3) + (calcX2 / 3));
            const restStopY : number = Math.floor((2 * nextUncutNodeToEndY / 3) + (calcY2 / 3));
            const cutStopX : number = Math.floor((2 * cutX1 / 3) + (calcX2 / 3));
            const cutStopY : number = Math.floor((2 * cutY1 / 3) + (calcY2 / 3));
            const endTransitionAdded : [boolean, number, Node] = inOutGraph.addNode('transition', '', inCutEndArc.target.x, inCutEndArc.target.y);
            if (!(endTransitionAdded[0])) {
                throw new Error('#srv.mnr.epc.023: ' + 'parallel cut execution failed - new end transition could not be added due to conflict with existing node)');
            };
            endTransition = endTransitionAdded[2];
            const restPlaceAdded : [boolean, number, Node] = inOutGraph.addNode('place', '', restPlaceX, restPlaceY);
            if (!(restPlaceAdded[0])) {
                throw new Error('#srv.mnr.epc.024: ' + 'parallel cut execution failed - new end place for rest part of split dfg could not be added due to conflict with existing node)');
            };
            endPlaceRest = restPlaceAdded[2];
            const cutPlaceAdded : [boolean, number, Node] = inOutGraph.addNode('place', '', cutPlaceX, cutPlaceY);
            if (!(cutPlaceAdded[0])) {
                throw new Error('#srv.mnr.epc.025: ' + 'parallel cut execution failed - new end place for cut part of split dfg could not be added due to conflict with existing node)');
            };
            endPlaceCut = cutPlaceAdded[2];
            restSubgraphStop = inSplitDfg.endNode;
            restSubgraphStop.coordinates = [restStopX, restStopY];
            const cutStopAdded : [boolean, number, Node] = inOutGraph.addNode('support', 'stop', cutStopX, cutStopY);
            if (!(cutStopAdded[0])) {
                throw new Error('#srv.mnr.epc.026: ' + 'parallel cut execution failed - new end node for cut part of split dfg could not be added due to conflict with existing node)');
            };
            cutSubgraphStop = cutStopAdded[2];
            if (inEndpointsMarked) {
                inOutGraph.setElementMarkedFlag(endTransition, true);
                inOutGraph.setElementMarkedFlag(endPlaceRest, true);
            } else {
                inOutGraph.setElementMarkedFlag(endPlaceCut, true);
                inOutGraph.setElementMarkedFlag(cutSubgraphStop, true);
            };
            inOutGraph.setElementNewFlag(endTransition, true);
            inOutGraph.setElementNewFlag(endPlaceRest, true);
            inOutGraph.setElementNewFlag(endPlaceCut, true);
            inOutGraph.setElementChangedFlag(restSubgraphStop, true);
            inOutGraph.setElementNewFlag(cutSubgraphStop, true);
            endTransition.special = true;
            if (outgoingArc.weight !== endArcsWeight) {
                throw new Error('#srv.mnr.epc.027: ' + 'parallel cut execution failed - the weight of the only arc leading out of the split dfg is not equal to the sum of the weights of the uncut arcs and the cut arc');
            };
            this.replaceArc(inOutGraph, outgoingArc, endTransition, outgoingArc.target);
            for (const arc of uncutEndArcs) {
                restSubgraph[1].push(arc);
            };
        };
        cutSubgraph[1].push(this.replaceArc(inOutGraph, inCutEndArc, inCutEndArc.source, cutSubgraphStop));
        const arcFromRestPlaceAdded = inOutGraph.addArc(endPlaceRest, endTransition, endArcsWeight);
        if (!(arcFromRestPlaceAdded[0])) {
            throw new Error('#srv.mnr.epc.028: ' + 'parallel cut execution failed - addition of arc from rest end place to end transition failed due to conflict with an existing arc');
        };
        const arcFromCutPlaceAdded = inOutGraph.addArc(endPlaceCut, endTransition, endArcsWeight);
        if (!(arcFromCutPlaceAdded[0])) {
            throw new Error('#srv.mnr.epc.029: ' + 'parallel cut execution failed - addition of arc from cut end place to end transition failed due to conflict with an existing arc');
        };
        const arcFromRestAdded = inOutGraph.addArc(restSubgraphStop, endPlaceRest, endArcsWeight);
        if (!(arcFromRestAdded[0])) {
            throw new Error('#srv.mnr.epc.030: ' + 'parallel cut execution failed - addition of arc from rest stop node to rest end place failed due to conflict with an existing arc');
        };
        const arcFromCutAdded = inOutGraph.addArc(cutSubgraphStop, endPlaceCut, endArcsWeight);
        if (!(arcFromCutAdded[0])) {
            throw new Error('#srv.mnr.epc.031: ' + 'parallel cut execution failed - addition of arc from cut stop node to cut end place failed due to conflict with an existing arc');
        };
        inOutGraph.setElementMarkedFlag(arcFromCutPlaceAdded[2], inCutEndArc.marked);
        inOutGraph.setElementMarkedFlag(arcFromCutAdded[2], inCutEndArc.marked);
        inOutGraph.setElementChangedFlag(arcFromRestPlaceAdded[2], true);
        inOutGraph.setElementChangedFlag(arcFromCutPlaceAdded[2], true);
        inOutGraph.setElementChangedFlag(arcFromRestAdded[2], true);
        inOutGraph.setElementChangedFlag(arcFromCutAdded[2], true);
        /* splitting the dfg event log between the cut part and the rest part */
        const cutSublog : Node[][] = [];
        const restSublog : Node[][] = [];
        const markedArcCases : [Arc, number][] = [];
        const unmarkedArcCases : [Arc, number][] = [];
        const markedTauCases : [Arc, Node, Arc][] = [];
        const unmarkedTauCases : [Arc, Node, Arc][] = [];
        const traceTranslations : [Node[], Node[], Node[]][] = [];
        const dfgNodeSet : {
            [nodeId : number] : boolean;
        } = {};
        dfgNodeSet[inSplitDfg.startNode.id] = true;
        dfgNodeSet[inSplitDfg.endNode.id] = true;
        let markedSubgraph : [Node[], Arc[]];
        let unmarkedSubgraph : [Node[], Arc[]];
        if (inEndpointsMarked) {
            markedSubgraph = restSubgraph;
            unmarkedSubgraph = cutSubgraph;
        } else {
            markedSubgraph = cutSubgraph;
            unmarkedSubgraph = restSubgraph;
        };
        for (const trace of inSplitDfg.log) {
            const cutTrace : Node[] = [];
            const restTrace : Node[] = [];
            let markedTrace : Node[];
            let unmarkedTrace : Node[];
            if (inEndpointsMarked) {
                markedTrace = restTrace;
                unmarkedTrace = cutTrace;
            } else {
                markedTrace = cutTrace;
                unmarkedTrace = restTrace;
            };
            cutTrace.push(cutSubgraphPlay);
            restTrace.push(restSubgraphPlay);
            for (let eventIdx = 1; eventIdx < (trace.length + 1); eventIdx++) {
                let currentSubgraph : [Node[], Arc[]];
                let currentArcCases : [Arc, number][] = [];
                let currentTauCases : [Arc, Node, Arc][] = [];
                let currentTrace : Node[];
                let currentNode : Node;
                if (eventIdx < (trace.length - 1)) {
                    currentNode = trace[eventIdx];
                    if (dfgNodeSet[currentNode.id] === undefined) {
                        dfgNodeSet[currentNode.id] = true;
                    };
                    if (currentNode.marked) {
                        currentSubgraph = markedSubgraph;
                        currentArcCases = markedArcCases;
                        currentTauCases = markedTauCases;
                        currentTrace = markedTrace;
                    } else {
                        currentSubgraph = unmarkedSubgraph;
                        currentArcCases = unmarkedArcCases;
                        currentTauCases = unmarkedTauCases;
                        currentTrace = unmarkedTrace;
                    };
                } else if (eventIdx === (trace.length - 1)) {
                    currentNode = cutSubgraphStop;
                    currentTrace = cutTrace;
                    currentSubgraph = cutSubgraph;
                    if (inEndpointsMarked) {
                        currentArcCases = unmarkedArcCases;
                        currentTauCases = unmarkedTauCases;
                    } else {
                        currentArcCases = markedArcCases;
                        currentTauCases = markedTauCases;
                    };
                } else {
                    currentNode = restSubgraphStop;
                    currentTrace = restTrace;
                    currentSubgraph = restSubgraph;
                    if (inEndpointsMarked) {
                        currentArcCases = markedArcCases;
                        currentTauCases = markedTauCases;
                    } else {
                        currentArcCases = unmarkedArcCases;
                        currentTauCases = unmarkedTauCases;
                    };
                };
                const lastNode : Node = currentTrace[(currentTrace.length - 1)];
                let foundArc : Arc | undefined = undefined;
                for (const arc of currentSubgraph[1]) {
                    if (arc.source === lastNode) {
                        if (arc.target === currentNode) {
                            foundArc = arc;
                            break;
                        };
                    };
                };
                if (foundArc !== undefined) {
                    let caseFound : number = (-1);
                    for (let caseIdx = 0; caseIdx < currentArcCases.length; caseIdx++) {
                        const arcCase : [Arc, number] = currentArcCases[caseIdx];
                        if (arcCase[0] === foundArc) {
                            caseFound = caseIdx;
                            break;
                        };
                    };
                    if (caseFound < 0) {
                        currentArcCases.push([foundArc, 1]);
                        currentTrace.push(currentNode);
                    } else {
                        const foundCase : [Arc, number] = currentArcCases[caseFound];
                        foundCase[1]++;
                        currentTrace.push(currentNode);
                    };
                } else {
                    let caseFound : number = (-1);
                    for (let caseIdx = 0; caseIdx < currentTauCases.length; caseIdx++) {
                        const tauCase : [Arc, Node, Arc] = currentTauCases[caseIdx];
                        if (tauCase[0].source === lastNode) {
                            if (tauCase[2].target === currentNode) {
                                caseFound = caseIdx;
                                break;
                            };
                        };
                    };
                    if (caseFound < 0) {
                        let tauX : number;
                        let tauY : number;
                        if (currentNode !== lastNode) {
                            tauX = Math.floor((lastNode.x / 2) + (currentNode.x / 2));
                            tauY = Math.floor((lastNode.y / 2) + (currentNode.y / 2));
                        } else {
                            tauX = Math.floor(currentNode.x + Math.ceil(this._graphicsConfig.defaultNodeRadius / 2));
                            tauY = Math.floor(currentNode.y);
                        };
                        const tauAdded : [boolean, number, Node] = inOutGraph.addNode('support', 'tau', tauX, tauY);
                        if (!(tauAdded[0])) {
                            throw new Error('#srv.mnr.epc.032: ' + 'parallel cut execution failed - addition of new tau node failed due to conflict with an existing node');
                        };
                        const tau : Node = tauAdded[2];
                        const arcToTauAdded : [boolean, number, Arc] = inOutGraph.addArc(lastNode, tau);
                        if (!(arcToTauAdded[0])) {
                            throw new Error('#srv.mnr.epc.033: ' + 'parallel cut execution failed - addition of arc from source node to new tau node failed due to conflict with an existing arc');
                        };
                        const arcToTau : Arc = arcToTauAdded[2];
                        const arcFromTauAdded : [boolean, number, Arc] = inOutGraph.addArc(tau, currentNode);
                        if (!(arcFromTauAdded[0])) {
                            throw new Error('#srv.mnr.epc.034: ' + 'parallel cut execution failed - addition of arc from new tau node to target node failed due to conflict with an existing arc');
                        };
                        const arcFromTau : Arc = arcFromTauAdded[2];
                        // inOutGraph.setElementMarkedFlag(arcToTau, true);
                        inOutGraph.setElementMarkedFlag(tau, true);
                        // inOutGraph.setElementMarkedFlag(arcFromTau, true);
                        inOutGraph.setElementNewFlag(arcToTau, true);
                        inOutGraph.setElementNewFlag(tau, true);
                        inOutGraph.setElementNewFlag(arcFromTau, true);
                        currentSubgraph[0].push(tau);
                        currentSubgraph[1].push(arcToTau, arcFromTau);
                        currentTauCases.push([arcToTau, tau, arcFromTau]);
                        currentTrace.push(tau, currentNode);
                    } else {
                        const foundCase : [Arc, Node, Arc] = currentTauCases[caseFound];
                        inOutGraph.updateArcWeight(foundCase[0], (foundCase[0].weight + 1));
                        inOutGraph.updateArcWeight(foundCase[2], (foundCase[2].weight + 1));
                        currentTrace.push(foundCase[1], currentNode);
                    };
                };
            };
            if (cutTrace.length < 3) {
                throw new Error('#srv.mnr.epc.035: ' + 'parallel cut execution failed - splitting the dfg log resulted in a sublog for the cut subgraph containing less than three nodes');
            };
            if (restTrace.length < 3) {
                throw new Error('#srv.mnr.epc.036: ' + 'parallel cut execution failed - splitting the dfg log resulted in a sublog for the rest subgraph containing less than three nodes');
            };
            cutSublog.push(cutTrace);
            restSublog.push(restTrace);
            traceTranslations.push([trace, restTrace, cutTrace]);
        };
        /* updating weights of inner arcs */
        for (const arcCase of markedArcCases) {
            inOutGraph.updateArcWeight(arcCase[0], arcCase[1]);
        };
        for (const arcCase of unmarkedArcCases) {
            inOutGraph.updateArcWeight(arcCase[0], arcCase[1]);
        };
        /* updating the graph event log */
        if (startOfGraph) {
            if (globalPlayNodesArray.length !== 2) {
                throw new Error('#srv.mnr.epc.037: ' + 'parallel cut execution failed - newly transformed global play nodes were not assigned properly');
            };
            if (endOfGraph) {
                if (globalStopNodesArray.length !== 2) {
                    throw new Error('#srv.mnr.epc.038: ' + 'parallel cut execution failed - newly transformed global stop nodes were not assigned properly');
                };
                for (let trace of inOutGraph.logArray) {
                    for (let evIdx = 0; evIdx < trace.length; evIdx++) {
                        if (trace[evIdx] === inSplitDfg.startNode) {
                            const cutStartIdx : number = evIdx;
                            const cutSubtrace : Node[] = [];
                            while ((evIdx < trace.length) && (trace[evIdx] !== inSplitDfg.endNode)) {
                                const checkedNode : Node = trace[evIdx];
                                if (dfgNodeSet[checkedNode.id] !== true) {
                                    throw new Error('#srv.mnr.epc.039: ' + 'parallel cut execution failed - encountered a node that is not part of the split dfg within a subtrace belonging to the split dfg whilst trying to update the graph log');
                                } else {
                                    cutSubtrace.push(checkedNode);
                                    evIdx++;
                                };
                            };
                            const cutEndIdx : number  = evIdx;
                            if (cutEndIdx < trace.length) {
                                if (trace[cutEndIdx] === inSplitDfg.endNode) {
                                    cutSubtrace.push(trace[cutEndIdx]);
                                } else {
                                    throw new Error('#srv.mnr.epc.040: ' + 'parallel cut execution failed - encountered a trace within the graph log that contains the dfg start node, but the position of the end node of the split dfg was not identified correctly');
                                };
                            } else {
                                throw new Error('#srv.mnr.epc.041: ' + 'parallel cut execution failed - encountered a trace within the graph log that contains the dfg start node, but not the dfg end node');
                            };
                            let translation : [Node[], Node[]] | undefined = undefined;
                            for (const entry of traceTranslations) {
                                if (this.checkTraceEquality (cutSubtrace, entry[0])) {
                                    translation = [entry[1], entry[2]];
                                    break;
                                };
                            };
                            if (translation === undefined) {
                                throw new Error('#srv.mnr.epc.042: ' + 'parallel cut execution failed - could not find an applicable trace translation for a cut subtrace of the graph log');
                            };
                            let traceStart : Node[] = [];
                            if ((cutStartIdx) > 0) {
                                traceStart = trace.slice(0, (cutStartIdx));
                            };
                            let traceEnd : Node[] = trace.slice((cutEndIdx + 1));
                            if ((traceStart.length + cutSubtrace.length + traceEnd.length) !== (trace.length)) {
                                throw new Error('#srv.mnr.epc.043: ' + 'parallel cut execution failed - a trace of the graph log was split incorrectly');
                            };
                            if (inEndpointsMarked) {
                                trace.splice(cutStartIdx, cutSubtrace.length);
                                for (let idx = (traceEnd.length - 1); idx > (-1); idx--) {
                                    trace.splice(cutStartIdx, 0, traceEnd[idx]);
                                };
                                trace.splice(cutStartIdx, 0, endPlaceRest, globalStopNodesArray[0], globalStopNodesArray[1]);
                                for (let idx = (translation[0].length - 1); idx > (-1); idx--) {
                                    trace.splice(cutStartIdx, 0, translation[0][idx]);
                                };
                                trace.splice(cutStartIdx, 0, endPlaceCut, startPlaceRest);
                                for (let idx = (translation[1].length - 1); idx > (-1); idx--) {
                                    trace.splice(cutStartIdx, 0, translation[1][idx]);
                                };
                                trace.splice(cutStartIdx, 0, globalPlayNodesArray[0], globalPlayNodesArray[1], startPlaceCut);
                            } else {
                                trace.splice(cutStartIdx, cutSubtrace.length);
                                for (let idx = (traceEnd.length - 1); idx > (-1); idx--) {
                                    trace.splice(cutStartIdx, 0, traceEnd[idx]);
                                };
                                trace.splice(cutStartIdx, 0, endPlaceCut, globalStopNodesArray[0], globalStopNodesArray[1]);
                                for (let idx = (translation[1].length - 1); idx > (-1); idx--) {
                                    trace.splice(cutStartIdx, 0, translation[1][idx]);
                                };
                                trace.splice(cutStartIdx, 0, endPlaceRest, startPlaceCut);
                                for (let idx = (translation[0].length - 1); idx > (-1); idx--) {
                                    trace.splice(cutStartIdx, 0, translation[0][idx]);
                                };
                                trace.splice(cutStartIdx, 0, globalPlayNodesArray[0], globalPlayNodesArray[1], startPlaceRest);
                            };
                            evIdx = (trace.length - traceEnd.length - 1);
                        };
                    };
                };
            } else {
                for (let trace of inOutGraph.logArray) {
                    for (let evIdx = 0; evIdx < trace.length; evIdx++) {
                        if (trace[evIdx] === inSplitDfg.startNode) {
                            const cutStartIdx : number = evIdx;
                            const cutSubtrace : Node[] = [];
                            while ((evIdx < trace.length) && (trace[evIdx] !== inSplitDfg.endNode)) {
                                const checkedNode : Node = trace[evIdx];
                                if (dfgNodeSet[checkedNode.id] !== true) {
                                    throw new Error('#srv.mnr.epc.044: ' + 'parallel cut execution failed - encountered a node that is not part of the split dfg within a subtrace belonging to the split dfg whilst trying to update the graph log');
                                } else {
                                    cutSubtrace.push(checkedNode);
                                    evIdx++;
                                };
                            };
                            const cutEndIdx : number  = evIdx;
                            if (cutEndIdx < trace.length) {
                                if (trace[cutEndIdx] === inSplitDfg.endNode) {
                                    cutSubtrace.push(trace[cutEndIdx]);
                                } else {
                                    throw new Error('#srv.mnr.epc.045: ' + 'parallel cut execution failed - encountered a trace within the graph log that contains the dfg start node, but the position of the end node of the split dfg was not identified correctly');
                                };
                            } else {
                                throw new Error('#srv.mnr.epc.046: ' + 'parallel cut execution failed - encountered a trace within the graph log that contains the dfg start node, but not the dfg end node');
                            };
                            let translation : [Node[], Node[]] | undefined = undefined;
                            for (const entry of traceTranslations) {
                                if (this.checkTraceEquality (cutSubtrace, entry[0])) {
                                    translation = [entry[1], entry[2]];
                                    break;
                                };
                            };
                            if (translation === undefined) {
                                throw new Error('#srv.mnr.epc.047: ' + 'parallel cut execution failed - could not find an applicable trace translation for a cut subtrace of the graph log');
                            };
                            let traceStart : Node[] = [];
                            if ((cutStartIdx) > 0) {
                                traceStart = trace.slice(0, (cutStartIdx));
                            };
                            let traceEnd : Node[] = trace.slice((cutEndIdx + 1));
                            if ((traceStart.length + cutSubtrace.length + traceEnd.length) !== (trace.length)) {
                                throw new Error('#srv.mnr.epc.048: ' + 'parallel cut execution failed - a trace of the graph log was split incorrectly');
                            };
                            if (inEndpointsMarked) {
                                trace.splice(cutStartIdx, cutSubtrace.length);
                                for (let idx = (traceEnd.length - 1); idx > (-1); idx--) {
                                    trace.splice(cutStartIdx, 0, traceEnd[idx]);
                                };
                                trace.splice(cutStartIdx, 0, endPlaceRest, endTransition);
                                for (let idx = (translation[0].length - 1); idx > (-1); idx--) {
                                    trace.splice(cutStartIdx, 0, translation[0][idx]);
                                };
                                trace.splice(cutStartIdx, 0, endPlaceCut, startPlaceRest);
                                for (let idx = (translation[1].length - 1); idx > (-1); idx--) {
                                    trace.splice(cutStartIdx, 0, translation[1][idx]);
                                };
                                trace.splice(cutStartIdx, 0, globalPlayNodesArray[0], globalPlayNodesArray[1], startPlaceCut);
                            } else {
                                trace.splice(cutStartIdx, cutSubtrace.length);
                                for (let idx = (traceEnd.length - 1); idx > (-1); idx--) {
                                    trace.splice(cutStartIdx, 0, traceEnd[idx]);
                                };
                                trace.splice(cutStartIdx, 0, endPlaceCut, endTransition);
                                for (let idx = (translation[1].length - 1); idx > (-1); idx--) {
                                    trace.splice(cutStartIdx, 0, translation[1][idx]);
                                };
                                trace.splice(cutStartIdx, 0, endPlaceRest, startPlaceCut);
                                for (let idx = (translation[0].length - 1); idx > (-1); idx--) {
                                    trace.splice(cutStartIdx, 0, translation[0][idx]);
                                };
                                trace.splice(cutStartIdx, 0, globalPlayNodesArray[0], globalPlayNodesArray[1], startPlaceRest);
                            };
                            evIdx = (trace.length - traceEnd.length - 1);
                        };
                    };
                };
            };
        } else {
            if (endOfGraph) {
                if (globalStopNodesArray.length !== 2) {
                    throw new Error('#srv.mnr.epc.049: ' + 'parallel cut execution failed - newly transformed global stop nodes were not assigned properly');
                };
                for (let trace of inOutGraph.logArray) {
                    for (let evIdx = 0; evIdx < trace.length; evIdx++) {
                        if (trace[evIdx] === inSplitDfg.startNode) {
                            const cutStartIdx : number = evIdx;
                            const cutSubtrace : Node[] = [];
                            while ((evIdx < trace.length) && (trace[evIdx] !== inSplitDfg.endNode)) {
                                const checkedNode : Node = trace[evIdx];
                                if (dfgNodeSet[checkedNode.id] !== true) {
                                    throw new Error('#srv.mnr.epc.050: ' + 'parallel cut execution failed - encountered a node that is not part of the split dfg within a subtrace belonging to the split dfg whilst trying to update the graph log');
                                } else {
                                    cutSubtrace.push(checkedNode);
                                    evIdx++;
                                };
                            };
                            const cutEndIdx : number  = evIdx;
                            if (cutEndIdx < trace.length) {
                                if (trace[cutEndIdx] === inSplitDfg.endNode) {
                                    cutSubtrace.push(trace[cutEndIdx]);
                                } else {
                                    throw new Error('#srv.mnr.epc.051: ' + 'parallel cut execution failed - encountered a trace within the graph log that contains the dfg start node, but the position of the end node of the split dfg was not identified correctly');
                                };
                            } else {
                                throw new Error('#srv.mnr.epc.052: ' + 'parallel cut execution failed - encountered a trace within the graph log that contains the dfg start node, but not the dfg end node');
                            };
                            let translation : [Node[], Node[]] | undefined = undefined;
                            for (const entry of traceTranslations) {
                                if (this.checkTraceEquality (cutSubtrace, entry[0])) {
                                    translation = [entry[1], entry[2]];
                                    break;
                                };
                            };
                            if (translation === undefined) {
                                throw new Error('#srv.mnr.epc.053: ' + 'parallel cut execution failed - could not find an applicable trace translation for a cut subtrace of the graph log');
                            };
                            let traceStart : Node[] = [];
                            if ((cutStartIdx) > 0) {
                                traceStart = trace.slice(0, (cutStartIdx));
                            };
                            let traceEnd : Node[] = trace.slice((cutEndIdx + 1));
                            if ((traceStart.length + cutSubtrace.length + traceEnd.length) !== (trace.length)) {
                                throw new Error('#srv.mnr.epc.054: ' + 'parallel cut execution failed - a trace of the graph log was split incorrectly');
                            };
                            if (inEndpointsMarked) {
                                trace.splice(cutStartIdx, cutSubtrace.length);
                                for (let idx = (traceEnd.length - 1); idx > (-1); idx--) {
                                    trace.splice(cutStartIdx, 0, traceEnd[idx]);
                                };
                                trace.splice(cutStartIdx, 0, endPlaceRest, globalStopNodesArray[0], globalStopNodesArray[1]);
                                for (let idx = (translation[0].length - 1); idx > (-1); idx--) {
                                    trace.splice(cutStartIdx, 0, translation[0][idx]);
                                };
                                trace.splice(cutStartIdx, 0, endPlaceCut, startPlaceRest);
                                for (let idx = (translation[1].length - 1); idx > (-1); idx--) {
                                    trace.splice(cutStartIdx, 0, translation[1][idx]);
                                };
                                trace.splice(cutStartIdx, 0, startTransition, startPlaceCut);
                            } else {
                                trace.splice(cutStartIdx, cutSubtrace.length);
                                for (let idx = (traceEnd.length - 1); idx > (-1); idx--) {
                                    trace.splice(cutStartIdx, 0, traceEnd[idx]);
                                };
                                trace.splice(cutStartIdx, 0, endPlaceCut, globalStopNodesArray[0], globalStopNodesArray[1]);
                                for (let idx = (translation[1].length - 1); idx > (-1); idx--) {
                                    trace.splice(cutStartIdx, 0, translation[1][idx]);
                                };
                                trace.splice(cutStartIdx, 0, endPlaceRest, startPlaceCut);
                                for (let idx = (translation[0].length - 1); idx > (-1); idx--) {
                                    trace.splice(cutStartIdx, 0, translation[0][idx]);
                                };
                                trace.splice(cutStartIdx, 0, startTransition, startPlaceRest);
                            };
                            evIdx = (trace.length - traceEnd.length - 1);
                        };
                    };
                };
            } else {
                for (let trace of inOutGraph.logArray) {
                    for (let evIdx = 0; evIdx < trace.length; evIdx++) {
                        if (trace[evIdx] === inSplitDfg.startNode) {
                            const cutStartIdx : number = evIdx;
                            const cutSubtrace : Node[] = [];
                            while ((evIdx < trace.length) && (trace[evIdx] !== inSplitDfg.endNode)) {
                                const checkedNode : Node = trace[evIdx];
                                if (dfgNodeSet[checkedNode.id] !== true) {
                                    throw new Error('#srv.mnr.epc.055: ' + 'parallel cut execution failed - encountered a node that is not part of the split dfg within a subtrace belonging to the split dfg whilst trying to update the graph log');
                                } else {
                                    cutSubtrace.push(checkedNode);
                                    evIdx++;
                                };
                            };
                            const cutEndIdx : number  = evIdx;
                            if (cutEndIdx < trace.length) {
                                if (trace[cutEndIdx] === inSplitDfg.endNode) {
                                    cutSubtrace.push(trace[cutEndIdx]);
                                } else {
                                    throw new Error('#srv.mnr.epc.056: ' + 'parallel cut execution failed - encountered a trace within the graph log that contains the dfg start node, but the position of the end node of the split dfg was not identified correctly');
                                };
                            } else {
                                throw new Error('#srv.mnr.epc.057: ' + 'parallel cut execution failed - encountered a trace within the graph log that contains the dfg start node, but not the dfg end node');
                            };
                            let translation : [Node[], Node[]] | undefined = undefined;
                            for (const entry of traceTranslations) {
                                if (this.checkTraceEquality (cutSubtrace, entry[0])) {
                                    translation = [entry[1], entry[2]];
                                    break;
                                };
                            };
                            if (translation === undefined) {
                                throw new Error('#srv.mnr.epc.058: ' + 'parallel cut execution failed - could not find an applicable trace translation for a cut subtrace of the graph log');
                            };
                            let traceStart : Node[] = [];
                            if ((cutStartIdx) > 0) {
                                traceStart = trace.slice(0, (cutStartIdx));
                            };
                            let traceEnd : Node[] = trace.slice((cutEndIdx + 1));
                            if ((traceStart.length + cutSubtrace.length + traceEnd.length) !== (trace.length)) {
                                throw new Error('#srv.mnr.epc.059: ' + 'parallel cut execution failed - a trace of the graph log was split incorrectly');
                            };
                            if (inEndpointsMarked) {
                                trace.splice(cutStartIdx, cutSubtrace.length);
                                for (let idx = (traceEnd.length - 1); idx > (-1); idx--) {
                                    trace.splice(cutStartIdx, 0, traceEnd[idx]);
                                };
                                trace.splice(cutStartIdx, 0, endPlaceRest, endTransition);
                                for (let idx = (translation[0].length - 1); idx > (-1); idx--) {
                                    trace.splice(cutStartIdx, 0, translation[0][idx]);
                                };
                                trace.splice(cutStartIdx, 0, endPlaceCut, startPlaceRest);
                                for (let idx = (translation[1].length - 1); idx > (-1); idx--) {
                                    trace.splice(cutStartIdx, 0, translation[1][idx]);
                                };
                                trace.splice(cutStartIdx, 0, startTransition, startPlaceCut);
                            } else {
                                trace.splice(cutStartIdx, cutSubtrace.length);
                                for (let idx = (traceEnd.length - 1); idx > (-1); idx--) {
                                    trace.splice(cutStartIdx, 0, traceEnd[idx]);
                                };
                                trace.splice(cutStartIdx, 0, endPlaceCut, endTransition);
                                for (let idx = (translation[1].length - 1); idx > (-1); idx--) {
                                    trace.splice(cutStartIdx, 0, translation[1][idx]);
                                };
                                trace.splice(cutStartIdx, 0, endPlaceRest, startPlaceCut);
                                for (let idx = (translation[0].length - 1); idx > (-1); idx--) {
                                    trace.splice(cutStartIdx, 0, translation[0][idx]);
                                };
                                trace.splice(cutStartIdx, 0, startTransition, startPlaceRest);
                            };
                            evIdx = (trace.length - traceEnd.length - 1);
                        };
                    };
                };
            };
        };
        /* updating dfgs */
        restSubgraph[0].push(restSubgraphPlay);
        restSubgraph[0].push(restSubgraphStop);
        cutSubgraph[0].push(cutSubgraphPlay);
        cutSubgraph[0].push(cutSubgraphStop);
        if (inEndpointsMarked) {
            inSplitDfg.update(cutSubgraphPlay, cutSubgraphStop, cutSubgraph[0], cutSubgraph[1], cutSublog);
            inOutGraph.appendDFG(restSubgraphPlay, restSubgraphStop, restSubgraph[0], restSubgraph[1], restSublog);
        } else {
            inSplitDfg.update(restSubgraphPlay, restSubgraphStop, restSubgraph[0], restSubgraph[1], restSublog);
            inOutGraph.appendDFG(cutSubgraphPlay, cutSubgraphStop, cutSubgraph[0], cutSubgraph[1], cutSublog);
        };
        /* deleting replaced endpoints and updating references */
        if (startOfGraph) {
            const transformedGlobalPlay : Node | undefined = inOutGraph.startNode;
            if (transformedGlobalPlay !== undefined) {
                inOutGraph.startNode = globalPlayNodesArray[0];
                if (!(inOutGraph.deleteNode(transformedGlobalPlay))) {
                    throw new Error('#srv.mnr.epc.060: ' + 'parallel cut execution failed - old global play node was not deleted properly');
                };
            } else {
                throw new Error('#srv.mnr.epc.061: ' + 'parallel cut execution failed - the global start node within the graph is undefined');
            };
        };
        if (endOfGraph) {
            const transformedGlobalStop : Node | undefined = inOutGraph.endNode;
            if (transformedGlobalStop !== undefined) {
                inOutGraph.endNode = globalStopNodesArray[1];
                if (!(inOutGraph.deleteNode(transformedGlobalStop))) {
                    throw new Error('#srv.mnr.epc.062: ' + 'parallel cut execution failed - old global stop node was not deleted properly');
                };
            } else {
                throw new Error('#srv.mnr.epc.063: ' + 'parallel cut execution failed - the global end node within the graph is undefined');
            };
        };
        /* deleting inner cut arcs */
        for (const arc of inCutMidArcs) {
            const arcDeleted : boolean = inOutGraph.deleteArc(arc);
            if (!(arcDeleted)) {
                throw new Error('#srv.mnr.epc.064: ' + 'parallel cut execution failed - an inner cut arc could not be deleted properly');
            };
        };
    };

    private executeLoopCut(
        inOutGraph: Graph,
        inSplitDfg: DFG,
        inA1: Node[],
        inA2: Node[],
        inA2play: Node[],
        inA2stop: Node[],
        inEndpointsMarked : boolean
    ): void {
        /* checking if the cut DFG starts at the global start of the graph or ends at the global end */
        const oldStartNode : Node = inSplitDfg.startNode;
        const oldEndNode : Node = inSplitDfg.endNode;
        const startOfGraph : boolean = this.checkGraphStart(inOutGraph, oldStartNode);
        const endOfGraph : boolean = this.checkGraphEnd(inOutGraph, oldEndNode);
        /* splitting dfg arcs */
        const loopDo : {
            [nodeID : number] : boolean;
        } = {};
        const loopRedo : {
            [nodeID : number] : boolean;
        } = {};
        const loopRedoPlay : {
            [nodeID : number] : boolean;
        } = {};
        const loopRedoStop : {
            [nodeID : number] : boolean;
        } = {};
        for (const node of inA1) {
            loopDo[node.id] = true;
        };
        for (const node of inA2) {
            loopRedo[node.id] = true;
        };
        for (const node of inA2play) {
            loopRedoPlay[node.id] = true;
        };
        for (const node of inA2stop) {
            loopRedoStop[node.id] = true;
        };
        const doArcs : Arc[] = [];
        const arcsToDo : Arc[] = [];
        const arcsFromDo : Arc[] = [];
        const redoArcs : Arc[] = [];
        const arcsToRedo : Arc[] = [];
        const arcsFromRedo : Arc[] = [];
        for (const arc of inSplitDfg.arcs) {
            const sourceID : number = arc.source.id;
            const targetID : number = arc.target.id;
            let error : boolean = false;
            if (arc.source === oldStartNode) {
                if (arc.target === oldEndNode) {
                    error = true;
                } else if (loopDo[targetID] === true) {
                    if (arc.marked) {
                        error = true;
                    } else {
                        arcsToDo.push(arc);
                    };
                } else {
                    error = true;
                };
            } else if (loopDo[sourceID] === true) {
                if (arc.target === oldEndNode) {
                    if (arc.marked) {
                        error = true;
                    } else {
                        arcsFromDo.push(arc);
                    };
                } else if (loopDo[targetID] === true) {
                    if (arc.marked) {
                        error = true;
                    } else {
                        doArcs.push(arc);
                    };
                } else if (loopRedoPlay[targetID] === true) {
                    if (arc.marked) {
                        arcsToRedo.push(arc);
                    } else {
                        error = true;
                    };
                } else {
                    error = true;
                };
            } else if (loopRedo[sourceID] === true) {
                if (loopRedo[targetID] === true) {
                    if (arc.marked) {
                        error = true;
                    } else {
                        redoArcs.push(arc);
                    };
                } else if (loopDo[targetID] === true) {
                    if (loopRedoStop[sourceID] === true) {
                        if (arc.marked) {
                            arcsFromRedo.push(arc);
                        } else {
                            error = true;
                        };
                    } else {
                        error = true;
                    }
                } else {
                    error = true;
                };
            } else {
                error = true;
            };
            if (error) {
                throw new Error('#srv.mnr.elc.000: ' + 'loop cut execution failed - an untranslatable arc was found while splitting the dfg arcs between the do part and the redo part of the loop');
            };
        };
        if (arcsToDo.length < 1) {
            throw new Error('#srv.mnr.elc.001: ' + 'loop cut execution failed - no arc leading to the start of the do part of the loop was found');
        };
        if (arcsFromDo.length < 1) {
            throw new Error('#srv.mnr.elc.002: ' + 'loop cut execution failed - no arc coming from the end of the do part of the loop was found');
        };
        if (arcsToRedo.length < 1) {
            throw new Error('#srv.mnr.elc.003: ' + 'loop cut execution failed - no arc leading to the start of the redo part of the loop was found');
        };
        if (arcsFromRedo.length < 1) {
            throw new Error('#srv.mnr.elc.004: ' + 'loop cut execution failed - no arc coming from the end of the redo part of the loop was found');
        };
        /* deciding which of the subgraphs to cut out as a new dfg, and which to keep as the rest of the old dfg */
        const redoSubgraph : [Node[], Arc[]] = [inA2, redoArcs];
        const doSubgraph : [Node[], Arc[]] = [inA1, doArcs];
        /* generating new start and end nodes and matching arcs */
        const globalPlayNodesArray : Node[] = [];
        const globalStopNodesArray : Node[] = [];
        let newStartNode : Node;
        let newEndNode : Node;
        let doSubgraphPlay : Node;
        let doSubgraphStop : Node;
        let redoSubgraphPlay : Node;
        let redoSubgraphStop : Node;
        let arcsToDoCount : number = 0;
        let arcsToDoWeight : number = 0;
        let arcsToDoTargetX : number = 0;
        let arcsToDoTargetY : number = 0;
        let arcsFromDoCount : number = 0;
        let arcsFromDoWeight : number = 0;
        let arcsFromDoSourceX : number = 0;
        let arcsFromDoSourceY : number = 0;
        let arcsToRedoCount : number = 0;
        let arcsToRedoWeight : number = 0;
        let arcsToRedoTargetX : number = 0;
        let arcsToRedoTargetY : number = 0;
        let arcsFromRedoCount : number = 0;
        let arcsFromRedoWeight : number = 0;
        let arcsFromRedoSourceX : number = 0;
        let arcsFromRedoSourceY : number = 0;
        for (const arc of arcsToDo) {
            arcsToDoCount++;
            arcsToDoWeight = arcsToDoWeight + arc.weight;
            arcsToDoTargetX = arcsToDoTargetX + arc.target.x;
            arcsToDoTargetY = arcsToDoTargetY + arc.target.y;
        };
        for (const arc of arcsFromDo) {
            arcsFromDoCount++;
            arcsFromDoWeight = arcsFromDoWeight + arc.weight;
            arcsFromDoSourceX = arcsFromDoSourceX + arc.source.x;
            arcsFromDoSourceY = arcsFromDoSourceY + arc.source.y;
        };
        for (const arc of arcsToRedo) {
            arcsToRedoCount++;
            arcsToRedoWeight = arcsToRedoWeight + arc.weight;
            arcsToRedoTargetX = arcsToRedoTargetX + arc.target.x;
            arcsToRedoTargetY = arcsToRedoTargetY + arc.target.y;
        };
        for (const arc of arcsFromRedo) {
            arcsFromRedoCount++;
            arcsFromRedoWeight = arcsFromRedoWeight + arc.weight;
            arcsFromRedoSourceX = arcsFromRedoSourceX + arc.source.x;
            arcsFromRedoSourceY = arcsFromRedoSourceY + arc.source.y;
        };
        const nextDoNodeFromStartX : number = Math.floor(arcsToDoTargetX / arcsToDoCount);
        const nextDoNodeFromStartY : number = Math.floor(arcsToDoTargetY / arcsToDoCount);
        const nextDoNodeToEndX : number = Math.floor(arcsFromDoSourceX / arcsFromDoCount);
        const nextDoNodeToEndY : number = Math.floor(arcsFromDoSourceY / arcsFromDoCount);
        const nextRedoNodeFromStartX : number = Math.floor(arcsToRedoTargetX / arcsToRedoCount);
        const nextRedoNodeFromStartY : number = Math.floor(arcsToRedoTargetY / arcsToRedoCount);
        const nextRedoNodeToEndX : number = Math.floor(arcsFromRedoSourceX / arcsFromRedoCount);
        const nextRedoNodeToEndY : number = Math.floor(arcsFromRedoSourceY / arcsFromRedoCount);
        if (startOfGraph) {
            const globalPlayNodes : [Node, Node, Node] = this.transformStart(inOutGraph, oldStartNode, arcsToDoWeight);
            globalPlayNodesArray.push(globalPlayNodes[0], globalPlayNodes[1], globalPlayNodes[2]);
            newStartNode = globalPlayNodes[2];
            const doPlayX : number = Math.floor((newStartNode.x / 2) + (nextDoNodeFromStartX / 2));
            const doPlayY : number = Math.floor((newStartNode.y / 2) + (nextDoNodeFromStartY / 2));
            const doPlayAdded : [boolean, number, Node] = inOutGraph.addNode('support', 'play', doPlayX, doPlayY);
            if (!(doPlayAdded[0])) {
                throw new Error('#srv.mnr.elc.005: ' + 'loop cut execution failed - new start node for do part of split dfg could not be added due to conflict with existing node)');
            };
            doSubgraphPlay = doPlayAdded[2];
            if (inEndpointsMarked) {
                inOutGraph.setElementMarkedFlag(doSubgraphPlay, true);
            };
            inOutGraph.setElementNewFlag(doSubgraphPlay, true);
            for (const arc of arcsToDo) {
                doSubgraph[1].push(this.replaceArc(inOutGraph, arc, doSubgraphPlay, arc.target));
            };
        } else {
            const incomingArcs : Arc[] = [];
            for (const arc of inOutGraph.arcs) {
                if (arc.target === oldStartNode) {
                    incomingArcs.push(arc);
                };
            };
            if (incomingArcs.length < 1) {
                throw new Error('#srv.mnr.elc.006: ' + 'loop cut execution failed - no arc leading to the old start node of the split dfg was found within the graph');
            } else if (incomingArcs.length > 1) {
                throw new Error('#srv.mnr.elc.007: ' + 'loop cut execution failed - more than one arc leading to the old start node of the split dfg was found within the graph');
            };
            const incomingArc : Arc = incomingArcs[0];
            newStartNode = incomingArc.source;
            const doPlayX : number = Math.floor((newStartNode.x / 2) + (nextDoNodeFromStartX / 2));
            const doPlayY : number = Math.floor((newStartNode.y / 2) + (nextDoNodeFromStartY / 2));
            doSubgraphPlay = oldStartNode;
            doSubgraphPlay.coordinates = [doPlayX, doPlayY];
            inOutGraph.setElementChangedFlag(doSubgraphPlay, true);
            inOutGraph.setElementChangedFlag(incomingArc, true);
            for (const arc of arcsToDo) {
                doSubgraph[1].push(arc);
            };
        };
        if (endOfGraph) {
            const globalStopNodes : [Node, Node, Node] = this.transformEnd(inOutGraph, oldEndNode, arcsFromDoWeight);
            globalStopNodesArray.push(globalStopNodes[0], globalStopNodes[1], globalStopNodes[2]);
            newEndNode = globalStopNodes[0];
            const doStopX : number = Math.floor((nextDoNodeToEndX / 2) + (newEndNode.x / 2));
            const doStopY : number = Math.floor((nextDoNodeToEndY / 2) + (newEndNode.y / 2));
            const doStopAdded : [boolean, number, Node] = inOutGraph.addNode('support', 'stop', doStopX, doStopY);
            if (!(doStopAdded[0])) {
                throw new Error('#srv.mnr.elc.008: ' + 'loop cut execution failed - new stoü node for do part of split dfg could not be added due to conflict with existing node)');
            };
            doSubgraphStop = doStopAdded[2];
            if (inEndpointsMarked) {
                inOutGraph.setElementMarkedFlag(doSubgraphStop, true);
            };
            inOutGraph.setElementNewFlag(doSubgraphStop, true);
            for (const arc of arcsFromDo) {
                doSubgraph[1].push(this.replaceArc(inOutGraph, arc, arc.source, doSubgraphStop));
            };
        } else {
            const outgoingArcs : Arc[] = [];
            for (const arc of inOutGraph.arcs) {
                if (arc.source === oldEndNode) {
                    outgoingArcs.push(arc);
                };
            };
            if (outgoingArcs.length < 1) {
                throw new Error('#srv.mnr.elc.009: ' + 'loop cut execution failed - no arc coming from the old end node of the split dfg was found within the graph');
            } else if (outgoingArcs.length > 1) {
                throw new Error('#srv.mnr.elc.010: ' + 'loop cut execution failed - more than one arc coming from the old end node of the split dfg was found within the graph');
            };
            const outgoingArc : Arc = outgoingArcs[0];
            newEndNode = outgoingArc.target;
            const doStopX : number = Math.floor((nextDoNodeToEndX / 2) + (newEndNode.x / 2));
            const doStopY : number = Math.floor((nextDoNodeToEndY / 2) + (newEndNode.y / 2));
            doSubgraphStop = oldEndNode;
            doSubgraphStop.coordinates = [doStopX, doStopY];
            inOutGraph.setElementChangedFlag(doSubgraphStop, true);
            inOutGraph.setElementChangedFlag(outgoingArc, true);
            for (const arc of arcsFromDo) {
                doSubgraph[1].push(arc);
            };
        };
        const redoPlayX : number = Math.floor((newStartNode.x / 2) + (nextRedoNodeFromStartX / 2));
        const redoPlayY : number = Math.floor((newStartNode.y / 2) + (nextRedoNodeFromStartY / 2));
        const redoStopX : number = Math.floor((nextRedoNodeToEndX / 2) + (newEndNode.x / 2));
        const redoStopY : number = Math.floor((nextRedoNodeToEndY / 2) + (newEndNode.y / 2));
        const redoPlayAdded : [boolean, number, Node] = inOutGraph.addNode('support', 'play', redoPlayX, redoPlayY);
        const redoStopAdded : [boolean, number, Node] = inOutGraph.addNode('support', 'stop', redoStopX, redoStopY);
        if (!(redoPlayAdded[0])) {
            throw new Error('#srv.mnr.elc.011: ' + 'loop cut execution failed - new play node for redo part of split dfg could not be added due to conflict with existing node)');
        };
        if (!(redoStopAdded[0])) {
            throw new Error('#srv.mnr.elc.012: ' + 'loop cut execution failed - new stop node for redo part of split dfg could not be added due to conflict with existing node)');
        };
        redoSubgraphPlay = redoPlayAdded[2];
        redoSubgraphStop = redoStopAdded[2];
        if (!(inEndpointsMarked)) {
            inOutGraph.setElementMarkedFlag(redoSubgraphPlay, true);
            inOutGraph.setElementMarkedFlag(redoSubgraphStop, true);
        };
        inOutGraph.setElementNewFlag(redoSubgraphPlay, true);
        inOutGraph.setElementNewFlag(redoSubgraphStop, true);
        const arcToDoAdded = inOutGraph.addArc(newStartNode, doSubgraphPlay, arcsToDoWeight);
        if (!(arcToDoAdded[0])) {
            throw new Error('#srv.mnr.elc.013: ' + 'loop cut execution failed - addition of arc from new start node to do play node failed due to conflict with an existing arc');
        };
        const arcFromDoAdded = inOutGraph.addArc(doSubgraphStop, newEndNode, arcsFromDoWeight);
        if (!(arcFromDoAdded[0])) {
            throw new Error('#srv.mnr.elc.014: ' + 'loop cut execution failed - addition of arc from do stop node to new end node failed due to conflict with an existing arc');
        };
        const arcToRedoAdded = inOutGraph.addArc(newEndNode, redoSubgraphPlay, arcsToRedoWeight);
        if (!(arcToRedoAdded[0])) {
            throw new Error('#srv.mnr.elc.015: ' + 'loop cut execution failed - addition of arc from new end node to redo play node failed due to conflict with an existing arc');
        };
        const arcFromRedoAdded = inOutGraph.addArc(redoSubgraphStop, newStartNode, arcsFromRedoWeight);
        if (!(arcFromRedoAdded[0])) {
            throw new Error('#srv.mnr.elc.016: ' + 'loop cut execution failed - addition of arc from redo stop node to new start node failed due to conflict with an existing arc');
        };
        inOutGraph.setElementMarkedFlag(arcToRedoAdded[2], true);
        inOutGraph.setElementMarkedFlag(arcFromRedoAdded[2], true);
        inOutGraph.setElementChangedFlag(arcToDoAdded[2], true);
        inOutGraph.setElementChangedFlag(arcFromDoAdded[2], true);
        inOutGraph.setElementNewFlag(arcToRedoAdded[2], true);
        inOutGraph.setElementNewFlag(arcFromRedoAdded[2], true);
        for (const arc of arcsToRedo) {
            const arcFromDoAdded : [boolean, number, Arc] = inOutGraph.addArc(arc.source, doSubgraphStop, arc.weight);
            if (arcFromDoAdded[0]) {
                inOutGraph.setElementMarkedFlag(arcFromDoAdded[2], true);
                inOutGraph.setElementChangedFlag(arcFromDoAdded[2], true);
                doSubgraph[1].push(arcFromDoAdded[2]);
            };
            inOutGraph.addArc(doSubgraphStop, newEndNode, arc.weight);
            const arcToRedoDoAdded : [boolean, number, Arc] = inOutGraph.addArc(redoSubgraphPlay, arc.target, arc.weight);
            if (arcToRedoDoAdded[0]) {
                inOutGraph.setElementMarkedFlag(arcToRedoDoAdded[2], true);
                inOutGraph.setElementChangedFlag(arcToRedoDoAdded[2], true);
                redoSubgraph[1].push(arcToRedoDoAdded[2]);
            };
            if (!(inOutGraph.deleteArc(arc))) {
                throw new Error('#srv.mnr.elc.017: ' + 'loop cut execution failed - deletion of replaced arc failed');
            };
        };
        for (const arc of arcsFromRedo) {
            const arcFromRedoAdded : [boolean, number, Arc] = inOutGraph.addArc(arc.source, redoSubgraphStop, arc.weight);
            if (arcFromRedoAdded[0]) {
                inOutGraph.setElementMarkedFlag(arcFromRedoAdded[2], true);
                inOutGraph.setElementChangedFlag(arcFromRedoAdded[2], true);
                redoSubgraph[1].push(arcFromRedoAdded[2]);
            };
            inOutGraph.addArc(newStartNode, doSubgraphPlay, arc.weight);
            const arcToDoAdded : [boolean, number, Arc] = inOutGraph.addArc(doSubgraphPlay, arc.target, arc.weight);
            if (arcToDoAdded[0]) {
                inOutGraph.setElementMarkedFlag(arcToDoAdded[2], true);
                inOutGraph.setElementChangedFlag(arcToDoAdded[2], true);
                doSubgraph[1].push(arcToDoAdded[2]);
            };
            if (!(inOutGraph.deleteArc(arc))) {
                throw new Error('#srv.mnr.elc.018: ' + 'loop cut execution failed - deletion of replaced arc failed');
            };
        };
        /* splitting the dfg event log between the cut part and the rest part */
        const doSublog : Node[][] = [];
        const redoSublog : Node[][] = [];
        const dfgNodeSet : {
            [nodeId : number] : boolean;
        } = {};
        dfgNodeSet[oldStartNode.id] = true;
        dfgNodeSet[oldEndNode.id] = true;
        let markedSubgraph : [Node[], Arc[]];
        let unmarkedSubgraph : [Node[], Arc[]];
        if (inEndpointsMarked) {
            markedSubgraph = doSubgraph;
            unmarkedSubgraph = redoSubgraph;
        } else {
            markedSubgraph = redoSubgraph;
            unmarkedSubgraph = doSubgraph;
        };
        for (const trace of inSplitDfg.log) {
            const doTrace : Node[] = [];
            const redoTrace : Node[] = [];
            let markedTrace : Node[];
            let unmarkedTrace : Node[];
            if (inEndpointsMarked) {
                markedTrace = doTrace;
                unmarkedTrace = redoTrace;
            } else {
                markedTrace = redoTrace;
                unmarkedTrace = doTrace;
            };
            doTrace.push(doSubgraphPlay);
            redoTrace.push(redoSubgraphPlay);
            for (let eventIdx = 1; eventIdx < (trace.length + 1); eventIdx++) {
                let currentTrace : Node[];
                let currentNode : Node;
                if (eventIdx < (trace.length - 1)) {
                    currentNode = trace[eventIdx];
                    if (dfgNodeSet[currentNode.id] === undefined) {
                        dfgNodeSet[currentNode.id] = true;
                    };
                    if (currentNode.marked) {
                        currentTrace = markedTrace;
                    } else {
                        currentTrace = unmarkedTrace;
                    }
                } else if (eventIdx === (trace.length - 1)) {
                    currentNode = doSubgraphStop;
                    currentTrace = doTrace;
                } else {
                    currentNode = redoSubgraphStop;
                    currentTrace = redoTrace;
                };
                currentTrace.push(currentNode);
            };
            if (doTrace.length > 2) {
                doSublog.push(doTrace);
            } else {
                throw new Error('#srv.mnr.elc.019: ' + 'loop cut execution failed - splitting the dfg log resulted in a sublog for the do subgraph containing less than three nodes');
            };
            if (redoTrace.length > 2) {
                redoSublog.push(redoTrace);
            } else {
                /* trace does not loop --> skip trace */
            };
        };
        /* updating the graph event log */
        if (startOfGraph) {
            if (globalPlayNodesArray.length !== 3) {
                throw new Error('#srv.mnr.elc.020: ' + 'loop cut execution failed - newly transformed global play nodes were not assigned properly');
            };
        };
        if (endOfGraph) {
            if (globalStopNodesArray.length !== 3) {
                throw new Error('#srv.mnr.elc.021: ' + 'loop cut execution failed - newly transformed global stop nodes were not assigned properly');
            };
        };
        for (const trace of inOutGraph.logArray) {
            for (let evIdx = 0; evIdx < trace.length; evIdx++) {
                if (trace[evIdx] === oldStartNode) {
                    if (startOfGraph) {
                        trace.splice(evIdx, 1, globalPlayNodesArray[0], globalPlayNodesArray[1], globalPlayNodesArray[2], doSubgraphPlay);
                        evIdx = (evIdx + 4);
                    } else {
                        trace.splice(evIdx, 1, newStartNode);
                        evIdx = (evIdx + 1);
                    };
                    while ((evIdx < trace.length) && (trace[evIdx] !== oldEndNode)) {
                        const lastNode : Node = trace[(evIdx - 1)];
                        const currentNode : Node = trace[evIdx];
                        if (dfgNodeSet[currentNode.id] !== true) {
                            throw new Error('#srv.mnr.elc.022: ' + 'loop cut execution failed - encountered a node that is not part of the split dfg within a subtrace belonging to the split dfg whilst trying to update the graph log');
                        } else {
                            if (loopDo[lastNode.id] === true) {
                                if (loopRedoPlay[currentNode.id] === true) {
                                    trace.splice(evIdx, 0, doSubgraphStop, newEndNode, redoSubgraphPlay);
                                    evIdx = (evIdx + 3);
                                };
                            } else if (loopRedoStop[lastNode.id] === true) {
                                if (loopDo[currentNode.id] === true) {
                                    trace.splice(evIdx, 0, redoSubgraphStop, newStartNode, doSubgraphPlay);
                                    evIdx = (evIdx + 3);
                                };
                            };
                            evIdx++;
                        };
                    };
                    if (evIdx < trace.length) {
                        if (trace[evIdx] === oldEndNode) {
                            if (endOfGraph) {
                                trace.splice(evIdx, 1, doSubgraphStop, globalStopNodesArray[0], globalStopNodesArray[1], globalStopNodesArray[2]);
                                evIdx = (evIdx + 3);
                            } else {
                                trace.splice(evIdx, 1, newEndNode);
                            };
                        } else {
                            throw new Error('#srv.mnr.elc.023: ' + 'loop cut execution failed - encountered a trace within the graph log that contains the dfg start node, but the position of the end node of the split dfg was not identified correctly');
                        };
                    } else {
                        throw new Error('#srv.mnr.elc.024: ' + 'loop cut execution failed - encountered a trace within the graph log that contains the dfg start node, but not the dfg end node');
                    };
                };
            };
        };
        //updating DFGs
        doSubgraph[0].push(doSubgraphPlay);
        doSubgraph[0].push(doSubgraphStop);
        redoSubgraph[0].push(redoSubgraphPlay);
        redoSubgraph[0].push(redoSubgraphStop);
        if (inEndpointsMarked) {
            inSplitDfg.update(redoSubgraphPlay, redoSubgraphStop, redoSubgraph[0], redoSubgraph[1], redoSublog);
            inOutGraph.appendDFG(doSubgraphPlay, doSubgraphStop, doSubgraph[0], doSubgraph[1], doSublog);
        } else {
            inSplitDfg.update(doSubgraphPlay, doSubgraphStop, doSubgraph[0], doSubgraph[1], doSublog);
            inOutGraph.appendDFG(redoSubgraphPlay, redoSubgraphStop, redoSubgraph[0], redoSubgraph[1], redoSublog);
        };
        /* deleting replaced endpoints and updating references */
        if (startOfGraph) {
            inOutGraph.startNode = globalPlayNodesArray[0];
            if (!(inOutGraph.deleteNode(oldStartNode))) {
                throw new Error('#srv.mnr.elc.025: ' + 'loop cut execution failed - old global play node was not deleted properly');
            };
        };
        if (endOfGraph) {
            if (!(inOutGraph.deleteNode(oldEndNode))) {
                throw new Error('#srv.mnr.elc.026: ' + 'loop cut execution failed - old global stop node was not deleted properly');
            };
        };
    };

    private executeBaseCase(
        inOutGraph : Graph,
        inDfg : DFG,
        inMiddleNode? : Node
    ) : void {
        if (inDfg.nodes.length === 3) {
            let fstArc : Arc;
            let sndArc : Arc;
            if (inDfg.arcs[0].source === inDfg.startNode) {
                fstArc = inDfg.arcs[0];
                sndArc = inDfg.arcs[1];
            } else {
                fstArc = inDfg.arcs[1];
                sndArc = inDfg.arcs[0];
            };
            if (inMiddleNode === undefined) {
                throw new Error('#srv.mnr.ebc.000: ' + 'base case conversion failed - given dfg contains three nodes but no middle node was given');
            };
            const middleNode : Node = this.transformMid(inOutGraph, inMiddleNode);
            if (this.checkGraphStart(inOutGraph, inDfg.startNode)) {
                if (this.checkGraphEnd(inOutGraph, inDfg.endNode)) {
                    const startNodes : [Node, Node, Node] = this.transformStart(inOutGraph, inDfg.startNode, fstArc.weight);
                    const endNodes : [Node, Node, Node] = this.transformEnd(inOutGraph, inDfg.endNode, sndArc.weight);
                    this.replaceArc(inOutGraph, fstArc, startNodes[2], middleNode);
                    this.replaceArc(inOutGraph, sndArc, middleNode, endNodes[0]);
                    const replaceArcsArray : [Arc, Node, Node][] = [];
                    for (const arc of inOutGraph.arcs) {
                        if (arc.source === inDfg.startNode) {
                            replaceArcsArray.push([arc, startNodes[2], arc.target]);
                        } else if (arc.target === inDfg.endNode) {
                            replaceArcsArray.push([arc, arc.source, endNodes[0]]);
                        };
                    };
                    for (const entry of replaceArcsArray) {
                        this.replaceArc(inOutGraph, entry[0], entry[1], entry[2]);
                    };
                    for (const trace of inOutGraph.logArray) {
                        for (let evIdx = 0; evIdx < trace.length; evIdx++) {
                            if (trace[evIdx] === inDfg.startNode) {
                                trace.splice(evIdx, 1, startNodes[0], startNodes[1], startNodes[2]);
                                evIdx = (evIdx + 2);
                            } else if (trace[evIdx] === inMiddleNode) {
                                trace.splice(evIdx, 1, middleNode);
                            } else if (trace[evIdx] === inDfg.endNode) {
                                trace.splice(evIdx, 1, endNodes[0], endNodes[1], endNodes[2]);
                                evIdx = (evIdx + 2);
                            };
                        };
                    };
                } else {
                    const startNodes : [Node, Node, Node] = this.transformStart(inOutGraph, inDfg.startNode, fstArc.weight);
                    this.replaceArc(inOutGraph, fstArc, startNodes[2], middleNode);
                    if (!(inOutGraph.deleteArc(sndArc))) {
                        throw new Error('#srv.mnr.ebc.011: ' + 'base case conversion failed - deletion of old arc from middle node (event) to end node (support) failed');
                    };
                    const replaceArcsArray : [Arc, Node, Node][] = [];
                    for (const arc of inOutGraph.arcs) {
                        if (arc.source === inDfg.startNode) {
                            replaceArcsArray.push([arc, startNodes[2], arc.target]);
                        } else if (arc.source === inDfg.endNode) {
                            replaceArcsArray.push([arc, middleNode, arc.target]);
                        };
                    };
                    for (const entry of replaceArcsArray) {
                        this.replaceArc(inOutGraph, entry[0], entry[1], entry[2]);
                    };
                    for (const trace of inOutGraph.logArray) {
                        for (let evIdx = 0; evIdx < trace.length; evIdx++) {
                            if (trace[evIdx] === inDfg.startNode) {
                                trace.splice(evIdx, 1, startNodes[0], startNodes[1], startNodes[2]);
                                evIdx = (evIdx + 2);
                            } else if (trace[evIdx] === inMiddleNode) {
                                trace.splice(evIdx, 1, middleNode);
                            } else if (trace[evIdx] === inDfg.endNode) {
                                trace.splice(evIdx, 1);
                                evIdx = (evIdx - 1);
                            };
                        };
                    };
                };
            } else {
                if (this.checkGraphEnd(inOutGraph, inDfg.endNode)) {
                    const endNodes : [Node, Node, Node] = this.transformEnd(inOutGraph, inDfg.endNode, sndArc.weight);
                    this.replaceArc(inOutGraph, sndArc, middleNode, endNodes[0]);
                    if (!(inOutGraph.deleteArc(fstArc))) {
                        throw new Error('#srv.mnr.ebc.017: ' + 'base case conversion failed - deletion of old arc from start node (support) to middle node (event) failed');
                    };
                    const replaceArcsArray : [Arc, Node, Node][] = [];
                    for (const arc of inOutGraph.arcs) {
                        if (arc.target === inDfg.startNode) {
                            replaceArcsArray.push([arc, arc.source, middleNode]);
                        } else if (arc.target === inDfg.endNode) {
                            replaceArcsArray.push([arc, arc.source, endNodes[0]]);
                        };
                    };
                    for (const entry of replaceArcsArray) {
                        this.replaceArc(inOutGraph, entry[0], entry[1], entry[2]);
                    };
                    for (const trace of inOutGraph.logArray) {
                        for (let evIdx = 0; evIdx < trace.length; evIdx++) {
                            if (trace[evIdx] === inDfg.startNode) {
                                trace.splice(evIdx, 1);
                                evIdx = (evIdx - 1);
                            } else if (trace[evIdx] === inMiddleNode) {
                                trace.splice(evIdx, 1, middleNode);
                            } else if (trace[evIdx] === inDfg.endNode) {
                                trace.splice(evIdx, 1, endNodes[0], endNodes[1], endNodes[2]);
                                evIdx = (evIdx + 2);
                            };
                        };
                    };
                } else {
                    if (!(inOutGraph.deleteArc(fstArc))) {
                        throw new Error('#srv.mnr.ebc.023: ' + 'base case conversion failed - deletion of old arc from start node (support) to middle node (event) failed');
                    };
                    if (!(inOutGraph.deleteArc(sndArc))) {
                        throw new Error('#srv.mnr.ebc.024: ' + 'base case conversion failed - deletion of old arc from middle node (event) to end node (support) failed');
                    };
                    const replaceArcsArray : [Arc, Node, Node][] = [];
                    for (const arc of inOutGraph.arcs) {
                        if (arc.target === inDfg.startNode) {
                            replaceArcsArray.push([arc, arc.source, middleNode]);
                        } else if (arc.source === inDfg.endNode) {
                            replaceArcsArray.push([arc, middleNode, arc.target]);
                        };
                    };
                    for (const entry of replaceArcsArray) {
                        this.replaceArc(inOutGraph, entry[0], entry[1], entry[2]);
                    };
                    for (const trace of inOutGraph.logArray) {
                        for (let evIdx = 0; evIdx < trace.length; evIdx++) {
                            if (trace[evIdx] === inDfg.startNode) {
                                trace.splice(evIdx, 1);
                                evIdx = (evIdx - 1);
                            } else if (trace[evIdx] === inMiddleNode) {
                                trace.splice(evIdx, 1, middleNode);
                            } else if (trace[evIdx] === inDfg.endNode) {
                                trace.splice(evIdx, 1);
                                evIdx = (evIdx - 1);
                            };
                        };
                    };
                };
            };
            for (const node of inDfg.nodes) {
                if (!(inOutGraph.deleteNode(node))) {
                    throw new Error('#srv.mnr.ebc.029: ' + 'base case conversion failed - deletion of an old node failed');
                };
            };
            if (!(inOutGraph.deleteDFG(inDfg))) {
                throw new Error('#srv.mnr.ebc.030: ' + 'base case conversion failed - deletion of the dfg failed');
            };
        } else {
            if (inMiddleNode !== undefined) {
                throw new Error('#srv.mnr.ebc.031: ' + 'base case conversion failed - given dfg contains only two nodes but a middle node was given');
            };
            if (this.checkGraphStart(inOutGraph, inDfg.startNode)) {
                if (this.checkGraphEnd(inOutGraph, inDfg.endNode)) {
                    if ((inOutGraph.nodes.length === 2) && (inOutGraph.arcs.length === 1)) {
                        const nodes : [Node, Node, Node, Node, Node] = this.transformStartEnd(inOutGraph, inDfg.startNode, inDfg.endNode, inDfg.arcs[0]);
                        for (const trace of inOutGraph.logArray) {
                            for (let evIdx = 0; evIdx < trace.length; evIdx++) {
                                if (trace[evIdx] === inDfg.startNode) {
                                    trace.splice(evIdx, 1, nodes[0], nodes[1]);
                                    evIdx = (evIdx + 1);
                                } else if (trace[evIdx] === inDfg.endNode) {
                                    if ((trace[(evIdx - 1)]) !== (nodes[1])) {
                                        trace.splice(evIdx, 1, nodes[3], nodes[4]);
                                        evIdx = (evIdx + 1);
                                    } else {
                                        trace.splice(evIdx, 1, nodes[2], nodes[3], nodes[4]);
                                        evIdx = (evIdx + 2);
                                    };
                                };
                            };
                        };
                    } else {
                        const startNodes : [Node, Node, Node] = this.transformStart(inOutGraph, inDfg.startNode, inDfg.arcs[0].weight);
                        const endNodes : [Node, Node, Node] = this.transformEnd(inOutGraph, inDfg.endNode, inDfg.arcs[0].weight);
                        const middleNode : Node = this.replaceArcInsertNode(inOutGraph, inDfg.arcs[0], startNodes[2], endNodes[0], 'transition', '')[1];
                        const replaceArcsArray : [Arc, Node, Node][] = [];
                        for (const arc of inOutGraph.arcs) {
                            if (arc.source === inDfg.startNode) {
                                replaceArcsArray.push([arc, middleNode, arc.target]);
                            } else if (arc.target === inDfg.endNode) {
                                replaceArcsArray.push([arc, arc.source, middleNode]);
                            };
                        };
                        for (const entry of replaceArcsArray) {
                            this.replaceArc(inOutGraph, entry[0], entry[1], entry[2]);
                        };
                        for (const trace of inOutGraph.logArray) {
                            for (let evIdx = 0; evIdx < trace.length; evIdx++) {
                                if (trace[evIdx] === inDfg.startNode) {
                                    trace.splice(evIdx, 1, startNodes[0], startNodes[1], startNodes[2]);
                                    evIdx = (evIdx + 2);
                                } else if (trace[evIdx] === inDfg.endNode) {
                                    if ((trace[(evIdx - 1)]) !== (startNodes[2])) {
                                        trace.splice(evIdx, 1, endNodes[0], endNodes[1], endNodes[2]);
                                        evIdx = (evIdx + 2);
                                    } else {
                                        trace.splice(evIdx, 1, middleNode, endNodes[0], endNodes[1], endNodes[2]);
                                        evIdx = (evIdx + 3);
                                    };
                                };
                            };
                        };
                    };
                } else {
                    const startNodes : [Node, Node, Node] = this.transformStart(inOutGraph, inDfg.startNode, inDfg.arcs[0].weight);
                    if (!(inOutGraph.deleteArc(inDfg.arcs[0]))) {
                        throw new Error('#srv.mnr.ebc.036: ' + 'base case conversion failed - deletion of old arc from start node (support) to end node (support) failed');
                    };
                    const replaceArcsArray : [Arc, Node, Node][] = [];
                    for (const arc of inOutGraph.arcs) {
                        if (arc.source === inDfg.endNode) {
                            replaceArcsArray.push([arc, startNodes[2], arc.target]);
                        };
                    };
                    for (const entry of replaceArcsArray) {
                        this.replaceArc(inOutGraph, entry[0], entry[1], entry[2]);
                    };
                    for (const trace of inOutGraph.logArray) {
                        for (let evIdx = 0; evIdx < trace.length; evIdx++) {
                            if (trace[evIdx] === inDfg.startNode) {
                                trace.splice(evIdx, 1, startNodes[0], startNodes[1], startNodes[2]);
                                evIdx = (evIdx + 2);
                            } else if (trace[evIdx] === inDfg.endNode) {
                                trace.splice(evIdx, 1);
                                evIdx = (evIdx - 1);
                            };
                        };
                    };
                };
            } else {
                if (this.checkGraphEnd(inOutGraph, inDfg.endNode)) {
                    const endNodes : [Node, Node, Node] = this.transformEnd(inOutGraph, inDfg.endNode, inDfg.arcs[0].weight);
                    if (!(inOutGraph.deleteArc(inDfg.arcs[0]))) {
                        throw new Error('#srv.mnr.ebc.040: ' + 'base case conversion failed - deletion of old arc from start node (support) to end node (support) failed');
                    };
                    const replaceArcsArray : [Arc, Node, Node][] = [];
                    for (const arc of inOutGraph.arcs) {
                        if (arc.target === inDfg.startNode) {
                            replaceArcsArray.push([arc, arc.source, endNodes[0]]);
                        };
                    };
                    for (const entry of replaceArcsArray) {
                        this.replaceArc(inOutGraph, entry[0], entry[1], entry[2]);
                    };
                    for (const trace of inOutGraph.logArray) {
                        for (let evIdx = 0; evIdx < trace.length; evIdx++) {
                            if (trace[evIdx] === inDfg.startNode) {
                                trace.splice(evIdx, 1);
                                evIdx = (evIdx - 1);
                            } else if (trace[evIdx] === inDfg.endNode) {
                                trace.splice(evIdx, 1, endNodes[0], endNodes[1], endNodes[2]);
                                evIdx = (evIdx + 2);
                            };
                        };
                    };
                } else {
                    throw new Error('#srv.mnr.ebc.043: ' + 'base case conversion failed - given dfg contains only two nodes but is neither at the start nor at the end of the graph');
                };
            };
            for (const node of inDfg.nodes) {
                if (!(inOutGraph.deleteNode(node))) {
                    throw new Error('#srv.mnr.ebc.044: ' + 'base case conversion failed - deletion of an old node failed');
                };
            };
            if (!(inOutGraph.deleteDFG(inDfg))) {
                throw new Error('#srv.mnr.ebc.045: ' + 'base case conversion failed - deletion of the dfg failed');
            };
        };
    };

    private executeFallThrough(
        inOutGraph : Graph,
        inSplitDfg : DFG,
        inAOPT : Node |undefined
    ) : void {
        if (inAOPT !== undefined) /* execute ActivityOncePerTrace - FallThrough */ {
            /* checking if the cut DFG starts at the global start of the graph or ends at the global end */
            const start_of_graph : boolean = this.checkGraphStart(inOutGraph, inSplitDfg.startNode);
            const end_of_graph : boolean = this.checkGraphEnd(inOutGraph, inSplitDfg.endNode);
            /* generating new start and end nodes and matching arcs */
            const subgraph_AOPT : [Node[], Arc[]] = [[], []];
            const subgraph_Rest : [Node[], Arc[]] = [[], []];
            const play_old : Node = inSplitDfg.startNode;
            const stop_old : Node = inSplitDfg.endNode;
            const global_play : Node[] = [];
            const global_stop : Node[] = [];
            let transition_play : Node;
            let transition_stop : Node;
            let place_play_AOPT : Node;
            let place_play_Rest : Node;
            let place_stop_AOPT : Node;
            let place_stop_Rest : Node;
            let play_AOPT : Node;
            let play_Rest : Node;
            let stop_AOPT : Node;
            let stop_Rest : Node;
            let nodes_Rest : Node[] = [];
            let arcs_play_AOPT : Arc[] = [];
            let arcs_play_Rest : Arc[] = [];
            let arcs_play_stop : Arc[] = [];
            let arcs_AOPT_Rest : Arc[] = [];
            let arcs_AOPT_stop : Arc[] = [];
            let arcs_Rest_AOPT : Arc[] = [];
            let arcs_Rest_Rest : Arc[] = [];
            let arcs_Rest_stop : Arc[] = [];
            let arcs_play_Rest_x : number = 0;
            let arcs_play_Rest_y : number = 0;
            let arcs_Rest_stop_x : number = 0;
            let arcs_Rest_stop_y : number = 0;
            let arcs_play_Rest_num : number = 0;
            let arcs_Rest_stop_num : number = 0;
            let arcs_to_stop_weight : number = 0;
            let arcs_from_play_weight : number = 0;
            for (const arc of inSplitDfg.arcs) {
                if (arc.source === play_old) {
                    if (arc.target === stop_old) {
                        arcs_play_stop.push(arc);
                        arcs_to_stop_weight = (arcs_to_stop_weight + arc.weight);
                    } else if (arc.target === inAOPT) {
                        arcs_play_AOPT.push(arc);
                    } else {
                        arcs_play_Rest.push(arc);
                        arcs_play_Rest_num++;
                        arcs_play_Rest_x = (arcs_play_Rest_x + arc.target.x);
                        arcs_play_Rest_y = (arcs_play_Rest_y + arc.target.y);
                    };
                    arcs_from_play_weight = (arcs_from_play_weight + arc.weight);
                } else if (arc.source === inAOPT) {
                    if (arc.target === stop_old) {
                        arcs_AOPT_stop.push(arc);
                        arcs_to_stop_weight = (arcs_to_stop_weight + arc.weight);
                    } else if (arc.target === inAOPT) {
                        throw new Error('#srv.mnr.efa.000: ' + 'aopt fall through execution failed - an arc leading from the aopt node back to the aopt node was found');
                    } else {
                        arcs_AOPT_Rest.push(arc);
                    };
                } else {
                    if (arc.target === stop_old) {
                        arcs_Rest_stop.push(arc);
                        arcs_Rest_stop_num++;
                        arcs_Rest_stop_x = (arcs_Rest_stop_x + arc.source.x);
                        arcs_Rest_stop_y = (arcs_Rest_stop_y + arc.source.y);
                        arcs_to_stop_weight = (arcs_to_stop_weight + arc.weight);
                    } else if (arc.target === inAOPT) {
                        arcs_Rest_AOPT.push(arc);
                    } else {
                        arcs_Rest_Rest.push(arc);
                    };
                };
            };
            if (arcs_from_play_weight !== arcs_to_stop_weight) {
                throw new Error('#srv.mnr.efa.001: ' + 'aopt fall through execution failed - the weight of all arcs starting at the play node is different from the weight of all arcs leading to the stop node');
            };
            if (arcs_from_play_weight < 1) {
                throw new Error('#srv.mnr.efa.002: ' + 'aopt fall through execution failed - the weight of all arcs starting at the play node is zero or less');
            };
            if (arcs_play_stop.length > 1) {
                throw new Error('#srv.mnr.efa.003: ' + 'aopt fall through execution failed - more than one arc leading from the start to the stop node detected');
            };
            for (const node of inSplitDfg.nodes) {
                if (node !== inSplitDfg.startNode) {
                    if (node !== inSplitDfg.endNode) {
                        if (node !== inAOPT) {
                            nodes_Rest.push(node);
                        };
                    };
                };
            };
            subgraph_AOPT[0] = [inAOPT];
            subgraph_Rest[0] = nodes_Rest;
            subgraph_Rest[1] = arcs_Rest_Rest;
            const next_play_Rest_x : number = Math.floor(arcs_play_Rest_x / arcs_play_Rest_num);
            const next_play_Rest_y : number = Math.floor(arcs_play_Rest_y / arcs_play_Rest_num);
            const next_Rest_stop_x : number = Math.floor(arcs_Rest_stop_x / arcs_Rest_stop_num);
            const next_Rest_stop_y : number = Math.floor(arcs_Rest_stop_y / arcs_Rest_stop_num);
            if (start_of_graph) {
                const globalPlayNodes : [Node, Node] = this.transformStartShort(inOutGraph, play_old, arcs_from_play_weight);
                global_play.push(globalPlayNodes[0], globalPlayNodes[1]);
                transition_play = globalPlayNodes[1];
                const calc_x : number = transition_play.x;
                const calc_y : number = transition_play.y;
                const aopt_x : number = inAOPT.x;
                const aopt_y : number = inAOPT.y;
                const place_play_AOPT_x : number = Math.floor((2 * calc_x / 3) + (aopt_x / 3));
                const place_play_AOPT_y : number = Math.floor((2 * calc_y / 3) + (aopt_y / 3));
                const place_play_Rest_x : number = Math.floor((2 * calc_x / 3) + (next_play_Rest_x / 3));
                const place_play_Rest_y : number = Math.floor((2 * calc_y / 3) + (next_play_Rest_y / 3));
                const play_AOPT_x : number = Math.floor((calc_x / 3) + (2 * aopt_x / 3));
                const play_AOPT_y : number = Math.floor((calc_y / 3) + (2 * aopt_y / 3));
                const play_Rest_x : number = Math.floor((calc_x / 3) + (2 * next_play_Rest_x / 3));
                const play_Rest_y : number = Math.floor((calc_y / 3) + (2 * next_play_Rest_y / 3));
                const place_play_AOPT_added : [boolean, number, Node] = inOutGraph.addNode('place', '', place_play_AOPT_x, place_play_AOPT_y);
                if (!(place_play_AOPT_added[0])) {
                    throw new Error('#srv.mnr.efa.004: ' + 'aopt fall through execution failed - new start place for aopt part of split dfg could not be added due to conflict with existing node)');
                };
                place_play_AOPT = place_play_AOPT_added[2];
                const place_play_Rest_added : [boolean, number, Node] = inOutGraph.addNode('place', '', place_play_Rest_x, place_play_Rest_y);
                if (!(place_play_Rest_added[0])) {
                    throw new Error('#srv.mnr.efa.005: ' + 'aopt fall through execution failed - new start place for rest part of split dfg could not be added due to conflict with existing node)');
                };
                place_play_Rest = place_play_Rest_added[2];
                const play_AOPT_added : [boolean, number, Node] = inOutGraph.addNode('support', 'play', play_AOPT_x, play_AOPT_y);
                if (!(play_AOPT_added[0])) {
                    throw new Error('#srv.mnr.efa.006: ' + 'aopt fall through execution failed - new play node for aopt part of split dfg could not be added due to conflict with existing node)');
                };
                play_AOPT = play_AOPT_added[2];
                const play_Rest_added : [boolean, number, Node] = inOutGraph.addNode('support', 'play', play_Rest_x, play_Rest_y);
                if (!(play_Rest_added[0])) {
                    throw new Error('#srv.mnr.efa.007: ' + 'aopt fall through execution failed - new play node for rest part of split dfg could not be added due to conflict with existing node)');
                };
                play_Rest = play_Rest_added[2];
                inOutGraph.setElementNewFlag(place_play_AOPT, true);
                inOutGraph.setElementNewFlag(place_play_Rest, true);
                inOutGraph.setElementNewFlag(play_AOPT, true);
                inOutGraph.setElementNewFlag(play_Rest, true);
                for (const arc of arcs_play_Rest) {
                    subgraph_Rest[1].push(this.replaceArc(inOutGraph, arc, play_Rest, arc.target));
                };
            } else {
                const arcs_incoming : Arc[] = [];
                for (const arc of inOutGraph.arcs) {
                    if (arc.target === play_old) {
                        arcs_incoming.push(arc);
                    };
                };
                if (arcs_incoming.length < 1) {
                    throw new Error('#srv.mnr.efa.008: ' + 'aopt fall through execution failed - no arc leading to the old start node of the split dfg was found within the graph');
                } else if (arcs_incoming.length > 1) {
                    throw new Error('#srv.mnr.efa.009: ' + 'aopt fall through execution failed - more than one arc leading to the old start node of the split dfg was found within the graph');
                };
                const incoming_arc : Arc = arcs_incoming[0];
                const calc_x : number = play_old.x;
                const calc_y : number = play_old.y;
                const aopt_x : number = inAOPT.x;
                const aopt_y : number = inAOPT.y;
                const place_play_AOPT_x : number = Math.floor((2 * calc_x / 3) + (aopt_x / 3));
                const place_play_AOPT_y : number = Math.floor((2 * calc_y / 3) + (aopt_y / 3));
                const place_play_Rest_x : number = Math.floor((2 * calc_x / 3) + (next_play_Rest_x / 3));
                const place_play_Rest_y : number = Math.floor((2 * calc_y / 3) + (next_play_Rest_y / 3));
                const play_AOPT_x : number = Math.floor((calc_x / 3) + (2 * aopt_x / 3));
                const play_AOPT_y : number = Math.floor((calc_y / 3) + (2 * aopt_y / 3));
                const play_Rest_x : number = Math.floor((calc_x / 3) + (2 * next_play_Rest_x / 3));
                const play_Rest_y : number = Math.floor((calc_y / 3) + (2 * next_play_Rest_y / 3));
                const transition_play_added : [boolean, number, Node] = inOutGraph.addNode('transition', '', calc_x, calc_y);
                if (!(transition_play_added[0])) {
                    throw new Error('#srv.mnr.efa.010: ' + 'aopt fall through execution failed - new start transition could not be added due to conflict with existing node)');
                };
                transition_play = transition_play_added[2];
                const place_play_AOPT_added : [boolean, number, Node] = inOutGraph.addNode('place', '', place_play_AOPT_x, place_play_AOPT_y);
                if (!(place_play_AOPT_added[0])) {
                    throw new Error('#srv.mnr.efa.011: ' + 'aopt fall through execution failed - new start place for aopt part of split dfg could not be added due to conflict with existing node)');
                };
                place_play_AOPT = place_play_AOPT_added[2];
                const place_play_Rest_added : [boolean, number, Node] = inOutGraph.addNode('place', '', place_play_Rest_x, place_play_Rest_y);
                if (!(place_play_Rest_added[0])) {
                    throw new Error('#srv.mnr.efa.012: ' + 'aopt fall through execution failed - new start place for rest part of split dfg could not be added due to conflict with existing node)');
                };
                place_play_Rest = place_play_Rest_added[2];
                const play_AOPT_added : [boolean, number, Node] = inOutGraph.addNode('support', 'play', play_AOPT_x, play_AOPT_y);
                if (!(play_AOPT_added[0])) {
                    throw new Error('#srv.mnr.efa.013: ' + 'aopt fall through execution failed - new play node for aopt part of split dfg could not be added due to conflict with existing node)');
                };
                play_AOPT = play_AOPT_added[2];
                play_Rest = play_old;
                play_Rest.coordinates = [play_Rest_x, play_Rest_y];
                inOutGraph.setElementNewFlag(transition_play, true);
                inOutGraph.setElementNewFlag(place_play_AOPT, true);
                inOutGraph.setElementNewFlag(place_play_Rest, true);
                inOutGraph.setElementNewFlag(play_AOPT, true);
                inOutGraph.setElementChangedFlag(play_Rest, true);
                transition_play.special = true;
                if (incoming_arc.weight !== arcs_from_play_weight) {
                    throw new Error('#srv.mnr.efa.014: ' + 'aopt fall through execution failed - the weight of the only arc leading into the split dfg is not equal to the sum of the weights of all arcs leading away from its start node');
                };
                this.replaceArc(inOutGraph, incoming_arc, incoming_arc.source, transition_play);
                for (const arc of arcs_play_Rest) {
                    subgraph_Rest[1].push(arc);
                };
            };
            if (end_of_graph) {
                const globalStopNodes : [Node, Node] = this.transformEndShort(inOutGraph, stop_old, arcs_to_stop_weight);
                global_stop.push(globalStopNodes[0], globalStopNodes[1]);
                transition_stop = globalStopNodes[0];
                const aopt_x : number = inAOPT.x;
                const aopt_y : number = inAOPT.y;
                const calc_x : number = transition_stop.x;
                const calc_y : number = transition_stop.y;
                const place_stop_AOPT_x : number = Math.floor((aopt_x / 3) + (2 * calc_x / 3));
                const place_stop_AOPT_y : number = Math.floor((aopt_y / 3) + (2 * calc_y / 3));
                const place_stop_Rest_x : number = Math.floor((next_Rest_stop_x / 3) + (2 * calc_x / 3));
                const place_stop_Rest_y : number = Math.floor((next_Rest_stop_y / 3) + (2 * calc_y / 3));
                const stop_AOPT_x : number = Math.floor((2 * aopt_x / 3) + (calc_x / 3));
                const stop_AOPT_y : number = Math.floor((2 * aopt_y / 3) + (calc_y / 3));
                const stop_Rest_x : number = Math.floor((2 * next_Rest_stop_x / 3) + (calc_x / 3));
                const stop_Rest_y : number = Math.floor((2 * next_Rest_stop_y / 3) + (calc_y / 3));
                const place_stop_AOPT_added : [boolean, number, Node] = inOutGraph.addNode('place', '', place_stop_AOPT_x, place_stop_AOPT_y);
                if (!(place_stop_AOPT_added[0])) {
                    throw new Error('#srv.mnr.efa.015: ' + 'aopt fall through execution failed - new end place for aopt part of split dfg could not be added due to conflict with existing node)');
                };
                place_stop_AOPT = place_stop_AOPT_added[2];
                const place_stop_Rest_added : [boolean, number, Node] = inOutGraph.addNode('place', '', place_stop_Rest_x, place_stop_Rest_y);
                if (!(place_stop_Rest_added[0])) {
                    throw new Error('#srv.mnr.efa.016: ' + 'aopt fall through execution failed - new end place for rest part of split dfg could not be added due to conflict with existing node)');
                };
                place_stop_Rest = place_stop_Rest_added[2];
                const stop_AOPT_added : [boolean, number, Node] = inOutGraph.addNode('support', 'stop', stop_AOPT_x, stop_AOPT_y);
                if (!(stop_AOPT_added[0])) {
                    throw new Error('#srv.mnr.efa.017: ' + 'aopt fall through execution failed - new stop node for aopt part of split dfg could not be added due to conflict with existing node)');
                };
                stop_AOPT = stop_AOPT_added[2];
                const stop_Rest_added : [boolean, number, Node] = inOutGraph.addNode('support', 'stop', stop_Rest_x, stop_Rest_y);
                if (!(stop_Rest_added[0])) {
                    throw new Error('#srv.mnr.efa.018: ' + 'aopt fall through execution failed - new stop node for rest part of split dfg could not be added due to conflict with existing node)');
                };
                stop_Rest = stop_Rest_added[2];
                inOutGraph.setElementNewFlag(place_stop_AOPT, true);
                inOutGraph.setElementNewFlag(place_stop_Rest, true);
                inOutGraph.setElementNewFlag(stop_AOPT, true);
                inOutGraph.setElementNewFlag(stop_Rest, true);
                for (const arc of arcs_Rest_stop) {
                    subgraph_Rest[1].push(this.replaceArc(inOutGraph, arc, arc.source, stop_Rest));
                };
            } else {
                const arcs_outgoing : Arc[] = [];
                for (const arc of inOutGraph.arcs) {
                    if (arc.source === inSplitDfg.endNode) {
                        arcs_outgoing.push(arc);
                    };
                };
                if (arcs_outgoing.length < 1) {
                    throw new Error('#srv.mnr.efa.019: ' + 'aopt fall through execution failed - no arc coming from the old end node of the split dfg was found within the graph');
                } else if (arcs_outgoing.length > 1) {
                    throw new Error('#srv.mnr.efa.020: ' + 'aopt fall through execution failed - more than one arc coming from the old end node of the split dfg was found within the graph');
                };
                const outgoing_arc : Arc = arcs_outgoing[0];
                const aopt_x : number = inAOPT.x;
                const aopt_y : number = inAOPT.y;
                const calc_x : number = stop_old.x;
                const calc_y : number = stop_old.y;
                const place_stop_AOPT_x : number = Math.floor((aopt_x / 3) + (2 * calc_x / 3));
                const place_stop_AOPT_y : number = Math.floor((aopt_y / 3) + (2 * calc_y / 3));
                const place_stop_Rest_x : number = Math.floor((next_Rest_stop_x / 3) + (2 * calc_x / 3));
                const place_stop_Rest_y : number = Math.floor((next_Rest_stop_y / 3) + (2 * calc_y / 3));
                const stop_AOPT_x : number = Math.floor((2 * aopt_x / 3) + (calc_x / 3));
                const stop_AOPT_y : number = Math.floor((2 * aopt_y / 3) + (calc_y / 3));
                const stop_Rest_x : number = Math.floor((2 * next_Rest_stop_x / 3) + (calc_x / 3));
                const stop_Rest_y : number = Math.floor((2 * next_Rest_stop_y / 3) + (calc_y / 3));
                const transition_stop_added : [boolean, number, Node] = inOutGraph.addNode('transition', '', calc_x, calc_y);
                if (!(transition_stop_added[0])) {
                    throw new Error('#srv.mnr.efa.021: ' + 'aopt fall through execution failed - new end transition could not be added due to conflict with existing node)');
                };
                transition_stop = transition_stop_added[2];
                const place_stop_AOPT_added : [boolean, number, Node] = inOutGraph.addNode('place', '', place_stop_AOPT_x, place_stop_AOPT_y);
                if (!(place_stop_AOPT_added[0])) {
                    throw new Error('#srv.mnr.efa.022: ' + 'aopt fall through execution failed - new end place for aopt part of split dfg could not be added due to conflict with existing node)');
                };
                place_stop_AOPT = place_stop_AOPT_added[2];
                const place_stop_Rest_added : [boolean, number, Node] = inOutGraph.addNode('place', '', place_stop_Rest_x, place_stop_Rest_y);
                if (!(place_stop_Rest_added[0])) {
                    throw new Error('#srv.mnr.efa.023: ' + 'aopt fall through execution failed - new end place for rest part of split dfg could not be added due to conflict with existing node)');
                };
                place_stop_Rest = place_stop_Rest_added[2];
                const stop_AOPT_added : [boolean, number, Node] = inOutGraph.addNode('support', 'stop', stop_AOPT_x, stop_AOPT_y);
                if (!(stop_AOPT_added[0])) {
                    throw new Error('#srv.mnr.efa.024: ' + 'aopt fall through execution failed - new stop node for aopt part of split dfg could not be added due to conflict with existing node)');
                };
                stop_AOPT = stop_AOPT_added[2];
                stop_Rest = stop_old;
                stop_Rest.coordinates = [stop_Rest_x, stop_Rest_y];
                inOutGraph.setElementNewFlag(transition_stop, true);
                inOutGraph.setElementNewFlag(place_stop_AOPT, true);
                inOutGraph.setElementNewFlag(place_stop_Rest, true);
                inOutGraph.setElementNewFlag(stop_AOPT, true);
                inOutGraph.setElementChangedFlag(stop_Rest, true);
                transition_stop.special = true;
                if (outgoing_arc.weight !== arcs_to_stop_weight) {
                    throw new Error('#srv.mnr.efa.025: ' + 'aopt fall through execution failed - the weight of the only arc leading out of the split dfg is not equal to the sum of the weights of all arcs leading into its end node');
                };
                this.replaceArc(inOutGraph, outgoing_arc, transition_stop, outgoing_arc.target);
                for (const arc of arcs_Rest_stop) {
                    subgraph_Rest[1].push(arc);
                };
            };
            const arc_to_AOPT_play_place_added = inOutGraph.addArc(transition_play, place_play_AOPT, arcs_from_play_weight);
            if (!(arc_to_AOPT_play_place_added[0])) {
                throw new Error('#srv.mnr.efa.026: ' + 'aopt fall through execution failed - addition of arc from start transition to aopt start place failed due to conflict with an existing arc');
            };
            const arc_to_Rest_play_place_added = inOutGraph.addArc(transition_play, place_play_Rest, arcs_from_play_weight);
            if (!(arc_to_Rest_play_place_added[0])) {
                throw new Error('#srv.mnr.efa.027: ' + 'aopt fall through execution failed - addition of arc from start transition to rest start place failed due to conflict with an existing arc');
            };
            const arc_to_AOPT_play_added = inOutGraph.addArc(place_play_AOPT, play_AOPT, arcs_from_play_weight);
            if (!(arc_to_AOPT_play_added[0])) {
                throw new Error('#srv.mnr.efa.028: ' + 'aopt fall through execution failed - addition of arc from aopt start place to aopt play node failed due to conflict with an existing arc');
            };
            const arc_to_Rest_play_added = inOutGraph.addArc(place_play_Rest, play_Rest, arcs_from_play_weight);
            if (!(arc_to_Rest_play_added[0])) {
                throw new Error('#srv.mnr.efa.029: ' + 'aopt fall through execution failed - addition of arc from rest start place to rest play node failed due to conflict with an existing arc');
            };
            const arc_to_AOPT_added = inOutGraph.addArc(play_AOPT, inAOPT, arcs_from_play_weight);
            if (!(arc_to_AOPT_added[0])) {
                throw new Error('#srv.mnr.efa.030: ' + 'aopt fall through execution failed - addition of arc from aopt play node to aopt node failed due to conflict with an existing arc');
            };
            const arc_from_AOPT_added = inOutGraph.addArc(inAOPT, stop_AOPT, arcs_to_stop_weight);
            if (!(arc_from_AOPT_added[0])) {
                throw new Error('#srv.mnr.efa.031: ' + 'aopt fall through execution failed - addition of arc from aopt node to aopt stop node failed due to conflict with an existing arc');
            };
            const arc_from_AOPT_stop_added = inOutGraph.addArc(stop_AOPT, place_stop_AOPT, arcs_to_stop_weight);
            if (!(arc_from_AOPT_stop_added[0])) {
                throw new Error('#srv.mnr.efa.032: ' + 'aopt fall through execution failed - addition of arc from aopt stop node to aopt end place failed due to conflict with an existing arc');
            };
            const arc_from_Rest_stop_added = inOutGraph.addArc(stop_Rest, place_stop_Rest, arcs_to_stop_weight);
            if (!(arc_from_Rest_stop_added[0])) {
                throw new Error('#srv.mnr.efa.033: ' + 'aopt fall through execution failed - addition of arc from rest stop node to rest end place failed due to conflict with an existing arc');
            };
            const arc_from_AOPT_stop_place_added = inOutGraph.addArc(place_stop_AOPT, transition_stop, arcs_to_stop_weight);
            if (!(arc_from_AOPT_stop_place_added[0])) {
                throw new Error('#srv.mnr.efa.034: ' + 'aopt fall through execution failed - addition of arc from aopt end place to end transition failed due to conflict with an existing arc');
            };
            const arc_from_Rest_stop_place_added = inOutGraph.addArc(place_stop_Rest, transition_stop, arcs_to_stop_weight);
            if (!(arc_from_Rest_stop_place_added[0])) {
                throw new Error('#srv.mnr.efa.035: ' + 'aopt fall through execution failed - addition of arc from rest end place to end transition failed due to conflict with an existing arc');
            };
            inOutGraph.setElementChangedFlag(arc_to_Rest_play_place_added[2], true);
            inOutGraph.setElementChangedFlag(arc_to_Rest_play_added[2], true);
            inOutGraph.setElementNewFlag(arc_to_AOPT_play_place_added[2], true);
            inOutGraph.setElementNewFlag(arc_to_AOPT_play_added[2], true);
            inOutGraph.setElementNewFlag(arc_to_AOPT_added[2], true);
            inOutGraph.setElementNewFlag(arc_from_AOPT_added[2], true);
            inOutGraph.setElementNewFlag(arc_from_AOPT_stop_added[2], true);
            inOutGraph.setElementNewFlag(arc_from_AOPT_stop_place_added[2], true);
            inOutGraph.setElementChangedFlag(arc_from_Rest_stop_added[2], true);
            inOutGraph.setElementChangedFlag(arc_from_Rest_stop_place_added[2], true);
            subgraph_AOPT[1].push(arc_to_AOPT_added[2], arc_from_AOPT_added[2]);
            subgraph_AOPT[0].push(play_AOPT);
            subgraph_AOPT[0].push(stop_AOPT);
            subgraph_Rest[0].push(play_Rest);
            subgraph_Rest[0].push(stop_Rest);
            /* splitting the dfg event log between the cut part and the rest part */
            const sublog_AOPT : Node[][] = [];
            const sublog_Rest : Node[][] = [];
            const arc_cases_AOPT : [Arc, number][] = [];
            const arc_cases_Rest : [Arc, number][] = [];
            const tau_cases_Rest : [Arc, Node, Arc][] = [];
            const trace_translations : [Node[], Node[], Node[]][] = [];
            const dfg_nodes : {
                [nodeId : number] : boolean;
            } = {};
            dfg_nodes[play_old.id] = true;
            dfg_nodes[stop_old.id] = true;
            for (const trace of inSplitDfg.log) {
                const trace_AOPT : Node[] = [];
                const trace_Rest : Node[] = [];
                trace_AOPT.push(play_AOPT);
                trace_Rest.push(play_Rest);
                for (let eventIdx = 1; eventIdx < (trace.length + 1); eventIdx++) {
                    let current_arc_cases : [Arc, number][];
                    let current_subgraph : [Node[], Arc[]];
                    let current_trace : Node[];
                    let current_node : Node;
                    let current_mode : 'AOPT' | 'Rest';
                    if (eventIdx < (trace.length - 1)) {
                        current_node = trace[eventIdx];
                        if (dfg_nodes[current_node.id] === undefined) {
                            dfg_nodes[current_node.id] = true;
                        };
                        if (current_node !== inAOPT) {
                            current_mode = 'Rest';
                            current_trace = trace_Rest;
                            current_subgraph = subgraph_Rest;
                            current_arc_cases = arc_cases_Rest;
                        } else {
                            current_mode = 'AOPT';
                            current_trace = trace_AOPT;
                            current_subgraph = subgraph_AOPT;
                            current_arc_cases = arc_cases_AOPT;
                        };
                    } else if (eventIdx === (trace.length - 1)) {
                        current_node = stop_AOPT;
                        current_mode = 'AOPT';
                        current_trace = trace_AOPT;
                        current_subgraph = subgraph_AOPT;
                        current_arc_cases = arc_cases_AOPT;
                    } else {
                        current_node = stop_Rest;
                        current_mode = 'Rest';
                        current_trace = trace_Rest;
                        current_subgraph = subgraph_Rest;
                        current_arc_cases = arc_cases_Rest;
                    };
                    const last_node : Node = current_trace[(current_trace.length - 1)];
                    let foundArc : Arc | undefined = undefined;
                    for (const arc of current_subgraph[1]) {
                        if (arc.source === last_node) {
                            if (arc.target === current_node) {
                                foundArc = arc;
                                break;
                            };
                        };
                    };
                    if (foundArc !== undefined) {
                        let caseFound : number = (-1);
                        for (let caseIdx = 0; caseIdx < current_arc_cases.length; caseIdx++) {
                            const arcCase : [Arc, number] = current_arc_cases[caseIdx];
                            if (arcCase[0] === foundArc) {
                                caseFound = caseIdx;
                                break;
                            };
                        };
                        if (caseFound < 0) {
                            current_arc_cases.push([foundArc, 1]);
                        } else {
                            const foundCase : [Arc, number] = current_arc_cases[caseFound];
                            foundCase[1]++;
                        };
                        current_trace.push(current_node);
                    } else {
                        if (current_mode !== 'AOPT') {
                            let caseFound : number = (-1);
                            for (let caseIdx = 0; caseIdx < tau_cases_Rest.length; caseIdx++) {
                                const tau_case : [Arc, Node, Arc] = tau_cases_Rest[caseIdx];
                                if (tau_case[0].source === last_node) {
                                    if (tau_case[2].target === current_node) {
                                        caseFound = caseIdx;
                                        break;
                                    };
                                };
                            };
                            if (caseFound < 0) {
                                let tau_x : number;
                                let tau_y : number;
                                if (current_node !== last_node) {
                                    tau_x = Math.floor((last_node.x / 2) + (current_node.x / 2));
                                    tau_y = Math.floor((last_node.y / 2) + (current_node.y / 2));
                                } else {
                                    tau_x = Math.floor(current_node.x + Math.ceil(this._graphicsConfig.defaultNodeRadius / 2));
                                    tau_y = Math.floor(current_node.y);
                                };
                                const tau_added : [boolean, number, Node] = inOutGraph.addNode('support', 'tau', tau_x, tau_y);
                                if (!(tau_added[0])) {
                                    throw new Error('#srv.mnr.efa.036: ' + 'aopt fall through execution failed - addition of new tau node failed due to conflict with an existing node');
                                };
                                const tau : Node = tau_added[2];
                                const arc_to_tau_added : [boolean, number, Arc] = inOutGraph.addArc(last_node, tau);
                                if (!(arc_to_tau_added[0])) {
                                    throw new Error('#srv.mnr.efa.037: ' + 'aopt fall through execution failed - addition of arc from source node to new tau node failed due to conflict with an existing arc');
                                };
                                const arc_to_tau : Arc = arc_to_tau_added[2];
                                const arc_from_tau_added : [boolean, number, Arc] = inOutGraph.addArc(tau, current_node);
                                if (!(arc_from_tau_added[0])) {
                                    throw new Error('#srv.mnr.efa.038: ' + 'aopt fall through execution failed - addition of arc from new tau node to target node failed due to conflict with an existing arc');
                                };
                                const arc_from_tau : Arc = arc_from_tau_added[2];
                                inOutGraph.setElementNewFlag(arc_to_tau, true);
                                inOutGraph.setElementNewFlag(tau, true);
                                inOutGraph.setElementNewFlag(arc_from_tau, true);
                                current_subgraph[0].push(tau);
                                current_subgraph[1].push(arc_to_tau, arc_from_tau);
                                tau_cases_Rest.push([arc_to_tau, tau, arc_from_tau]);
                                current_trace.push(tau, current_node);
                            } else {
                                const foundCase : [Arc, Node, Arc] = tau_cases_Rest[caseFound];
                                inOutGraph.updateArcWeight(foundCase[0], (foundCase[0].weight + 1));
                                inOutGraph.updateArcWeight(foundCase[2], (foundCase[2].weight + 1));
                                current_trace.push(foundCase[1], current_node);
                            };
                        } else {
                            throw new Error('#srv.mnr.efa.039: ' + 'aopt fall through execution failed - tau case encountered in aopt subgraph');
                        };
                    };
                };
                if (trace_AOPT.length !== 3) {
                    throw new Error('#srv.mnr.efa.040: ' + 'aopt fall through execution failed - splitting the dfg log resulted in a sublog for the aopt subgraph not containing exactly three nodes');
                };
                if (trace_Rest.length < 3) {
                    throw new Error('#srv.mnr.efa.041: ' + 'aopt fall through execution failed - splitting the dfg log resulted in a sublog for the rest subgraph containing less than three nodes');
                };
                sublog_AOPT.push(trace_AOPT);
                sublog_Rest.push(trace_Rest);
                trace_translations.push([trace, trace_Rest, trace_AOPT]);
            };
            /* updating weights of inner arcs */
            for (const arc_case of arc_cases_AOPT) {
                if (arc_case[0].weight !== arc_case[1]) {
                    throw new Error('#srv.mnr.efa.042: ' + 'aopt fall through execution failed - detected arc weights within aopt subgraph differ from expected values');
                };
            };
            for (const arc_case of arc_cases_Rest) {
                inOutGraph.updateArcWeight(arc_case[0], arc_case[1]);
            };
            /* updating the graph event log */
            if (start_of_graph) {
                if (global_play.length !== 2) {
                    throw new Error('#srv.mnr.efa.043: ' + 'aopt fall through execution failed - newly transformed global play nodes were not assigned properly');
                };
            };
            if (end_of_graph) {
                if (global_stop.length !== 2) {
                    throw new Error('#srv.mnr.efa.044: ' + 'aopt fall through execution failed - newly transformed global stop nodes were not assigned properly');
                };
            };
            for (let trace of inOutGraph.logArray) {
                for (let ev_idx = 0; ev_idx < trace.length; ev_idx++) {
                    if (trace[ev_idx] === play_old) {
                        const cut_start_idx : number = ev_idx;
                        const trace_cut_nodes : Node[] = [];
                        while ((ev_idx < trace.length) && (trace[ev_idx] !== stop_old)) {
                            const checked_node : Node = trace[ev_idx];
                            if (dfg_nodes[checked_node.id] !== true) {
                                throw new Error('#srv.mnr.efa.045: ' + 'aopt fall through execution failed - encountered a node that is not part of the split dfg within a subtrace belonging to the split dfg whilst trying to update the graph log');
                            } else {
                                trace_cut_nodes.push(checked_node);
                                ev_idx++;
                            };
                        };
                        const cut_end_idx : number  = ev_idx;
                        if (cut_end_idx < trace.length) {
                            if (trace[cut_end_idx] === stop_old) {
                                trace_cut_nodes.push(trace[cut_end_idx]);
                            } else {
                                throw new Error('#srv.mnr.efa.046: ' + 'aopt fall through execution failed - encountered a trace within the graph log that contains the dfg start node, but the position of the end node of the split dfg was not identified correctly');
                            };
                        } else {
                            throw new Error('#srv.mnr.efa.047: ' + 'aopt fall through execution failed - encountered a trace within the graph log that contains the dfg start node, but not the dfg end node');
                        };
                        let cut_translation : [Node[], Node[]] | undefined = undefined;
                        for (const entry of trace_translations) {
                            if (this.checkTraceEquality (trace_cut_nodes, entry[0])) {
                                cut_translation = [entry[1], entry[2]];
                                break;
                            };
                        };
                        if (cut_translation === undefined) {
                            throw new Error('#srv.mnr.efa.048: ' + 'aopt fall through execution failed - could not find an applicable trace translation for a cut subtrace of the graph log');
                        };
                        let trace_start_nodes : Node[] = [];
                        if ((cut_start_idx) > 0) {
                            trace_start_nodes = trace.slice(0, (cut_start_idx));
                        };
                        let trace_end_nodes : Node[] = trace.slice((cut_end_idx + 1));
                        if ((trace_start_nodes.length + trace_cut_nodes.length + trace_end_nodes.length) !== (trace.length)) {
                            throw new Error('#srv.mnr.efa.049: ' + 'aopt fall through execution failed - a trace of the graph log was split incorrectly');
                        };
                        trace.splice(cut_start_idx, trace_cut_nodes.length);
                        for (let idx = (trace_end_nodes.length - 1); idx > (-1); idx--) {
                            trace.splice(cut_start_idx, 0, trace_end_nodes[idx]);
                        };
                        if (end_of_graph) {
                            trace.splice(cut_start_idx, 0, place_stop_AOPT, global_stop[0], global_stop[1]);
                        } else {
                            trace.splice(cut_start_idx, 0, place_stop_AOPT, transition_stop);
                        };
                        for (let idx = (cut_translation[1].length - 1); idx > (-1); idx--) {
                            trace.splice(cut_start_idx, 0, cut_translation[1][idx]);
                        };
                        trace.splice(cut_start_idx, 0, place_stop_Rest, place_play_AOPT);
                        for (let idx = (cut_translation[0].length - 1); idx > (-1); idx--) {
                            trace.splice(cut_start_idx, 0, cut_translation[0][idx]);
                        };
                        if (start_of_graph) {
                            trace.splice(cut_start_idx, 0, global_play[0], global_play[1], place_play_Rest);
                        } else {
                            trace.splice(cut_start_idx, 0, transition_play, place_play_Rest);
                        };
                        ev_idx = (trace.length - trace_end_nodes.length - 1);
                    };
                };
            };
            /* updating dfgs */
            inSplitDfg.update(play_Rest, stop_Rest, subgraph_Rest[0], subgraph_Rest[1], sublog_Rest);
            inOutGraph.appendDFG(play_AOPT, stop_AOPT, subgraph_AOPT[0], subgraph_AOPT[1], sublog_AOPT);
            /* deleting replaced endpoints and updating references */
            if (start_of_graph) {
                inOutGraph.startNode = global_play[0];
                if (!(inOutGraph.deleteNode(play_old))) {
                    throw new Error('#srv.mnr.efa.050: ' + 'aopt fall through execution failed - old global play node could not be deleted properly');
                };
            };
            if (end_of_graph) {
                inOutGraph.endNode = global_stop[1];
                if (!(inOutGraph.deleteNode(stop_old))) {
                    throw new Error('#srv.mnr.efa.051: ' + 'aopt fall through execution failed - old global stop node could not be deleted properly');
                };
            };
            /* deleting cut arcs */
            for (const arc of arcs_play_AOPT) {
                const arc_deleted : boolean = inOutGraph.deleteArc(arc);
                if (!(arc_deleted)) {
                    throw new Error('#srv.mnr.efa.052: ' + 'aopt fall through execution failed - a cut arc could not be deleted properly');
                };
            };
            for (const arc of arcs_play_stop) {
                const arc_deleted : boolean = inOutGraph.deleteArc(arc);
                if (!(arc_deleted)) {
                    throw new Error('#srv.mnr.efa.053: ' + 'aopt fall through execution failed - a cut arc could not be deleted properly');
                };
            };
            for (const arc of arcs_AOPT_Rest) {
                const arc_deleted : boolean = inOutGraph.deleteArc(arc);
                if (!(arc_deleted)) {
                    throw new Error('#srv.mnr.efa.054: ' + 'aopt fall through execution failed - a cut arc could not be deleted properly');
                };
            };
            for (const arc of arcs_AOPT_stop) {
                const arc_deleted : boolean = inOutGraph.deleteArc(arc);
                if (!(arc_deleted)) {
                    throw new Error('#srv.mnr.efa.055: ' + 'aopt fall through execution failed - a cut arc could not be deleted properly');
                };
            };
            for (const arc of arcs_Rest_AOPT) {
                const arc_deleted : boolean = inOutGraph.deleteArc(arc);
                if (!(arc_deleted)) {
                    throw new Error('#srv.mnr.efa.056: ' + 'aopt fall through execution failed - a cut arc could not be deleted properly');
                };
            };
        } else /* execute FlowerModel - FallThrough */ {
            /* checking if the cut DFG starts at the global start of the graph or ends at the global end */
            const start_of_graph : boolean = this.checkGraphStart(inOutGraph, inSplitDfg.startNode);
            const end_of_graph : boolean = this.checkGraphEnd(inOutGraph, inSplitDfg.endNode);
            /* generating new start and end nodes and matching arcs */
            const play_old : Node = inSplitDfg.startNode;
            const stop_old : Node = inSplitDfg.endNode;
            const global_play : Node[] = [];
            const global_stop : Node[] = [];
            const inner_nodes : Node[] = [];
            let transition_play : Node;
            let transition_stop : Node;
            let place_center : Node;
            let inner_nodes_x : number = 0;
            let inner_nodes_y : number = 0;
            let inner_nodes_num : number = 0;
            let arcs_to_stop_weight : number = 0;
            let arcs_from_play_weight : number = 0;
            for (const arc of inSplitDfg.arcs) {
                if (arc.source === play_old) {
                    arcs_from_play_weight = (arcs_from_play_weight + arc.weight);
                };
                if (arc.target === stop_old) {
                    arcs_to_stop_weight = (arcs_to_stop_weight + arc.weight);
                };
            };
            if (arcs_from_play_weight !== arcs_to_stop_weight) {
                throw new Error('#srv.mnr.eff.000: ' + 'fm fall through execution failed - the weight of all arcs starting at the play node is different from the weight of all arcs leading to the stop node');
            };
            if (arcs_from_play_weight < 1) {
                throw new Error('#srv.mnr.eff.001: ' + 'fm fall through execution failed - the weight of all arcs starting at the play node is zero or less');
            };
            for (const node of inSplitDfg.nodes) {
                if (node !== play_old) {
                    if (node !== stop_old) {
                        inner_nodes.push(node);
                        inner_nodes_x = (inner_nodes_x + node.x);
                        inner_nodes_y = (inner_nodes_y + node.y);
                        inner_nodes_num++;
                    };
                };
            };
            const center_x : number = Math.floor(inner_nodes_x / inner_nodes_num);
            const center_y : number = Math.floor(inner_nodes_y / inner_nodes_num);
            if (start_of_graph) {
                const globalPlayNodes : [Node, Node] = this.transformStartShort(inOutGraph, play_old, arcs_from_play_weight);
                global_play.push(globalPlayNodes[0], globalPlayNodes[1]);
                transition_play = globalPlayNodes[1];
            } else {
                const arcs_incoming : Arc[] = [];
                for (const arc of inOutGraph.arcs) {
                    if (arc.target === play_old) {
                        arcs_incoming.push(arc);
                    };
                };
                if (arcs_incoming.length < 1) {
                    throw new Error('#srv.mnr.eff.002: ' + 'fm fall through execution failed - no arc leading to the old start node of the split dfg was found within the graph');
                } else if (arcs_incoming.length > 1) {
                    throw new Error('#srv.mnr.eff.003: ' + 'fm fall through execution failed - more than one arc leading to the old start node of the split dfg was found within the graph');
                };
                const incoming_arc : Arc = arcs_incoming[0];
                const transition_play_added : [boolean, number, Node] = inOutGraph.addNode('transition', '', play_old.x, play_old.y);
                if (!(transition_play_added[0])) {
                    throw new Error('#srv.mnr.eff.004: ' + 'fm fall through execution failed - new start transition could not be added due to conflict with existing node)');
                };
                transition_play = transition_play_added[2];
                inOutGraph.setElementNewFlag(transition_play, true);
                transition_play.special = true;
                if (incoming_arc.weight !== arcs_from_play_weight) {
                    throw new Error('#srv.mnr.eff.005: ' + 'fm fall through execution failed - the weight of the only arc leading into the split dfg is not equal to the sum of the weights of all arcs leading away from its start node');
                };
                this.replaceArc(inOutGraph, incoming_arc, incoming_arc.source, transition_play);
            };
            if (end_of_graph) {
                const globalStopNodes : [Node, Node] = this.transformEndShort(inOutGraph, stop_old, arcs_to_stop_weight);
                global_stop.push(globalStopNodes[0], globalStopNodes[1]);
                transition_stop = globalStopNodes[0];
            } else {
                const arcs_outgoing : Arc[] = [];
                for (const arc of inOutGraph.arcs) {
                    if (arc.source === inSplitDfg.endNode) {
                        arcs_outgoing.push(arc);
                    };
                };
                if (arcs_outgoing.length < 1) {
                    throw new Error('#srv.mnr.eff.006: ' + 'fm fall through execution failed - no arc coming from the old end node of the split dfg was found within the graph');
                } else if (arcs_outgoing.length > 1) {
                    throw new Error('#srv.mnr.eff.007: ' + 'fm fall through execution failed - more than one arc coming from the old end node of the split dfg was found within the graph');
                };
                const outgoing_arc : Arc = arcs_outgoing[0];
                const transition_stop_added : [boolean, number, Node] = inOutGraph.addNode('transition', '', stop_old.x, stop_old.y);
                if (!(transition_stop_added[0])) {
                    throw new Error('#srv.mnr.eff.008: ' + 'fm fall through execution failed - new end transition could not be added due to conflict with existing node)');
                };
                transition_stop = transition_stop_added[2];
                inOutGraph.setElementNewFlag(transition_stop, true);
                transition_stop.special = true;
                if (outgoing_arc.weight !== arcs_to_stop_weight) {
                    throw new Error('#srv.mnr.eff.009: ' + 'fm fall through execution failed - the weight of the only arc leading out of the split dfg is not equal to the sum of the weights of all arcs leading into its end node');
                };
                this.replaceArc(inOutGraph, outgoing_arc, transition_stop, outgoing_arc.target);
            };
            const place_center_added : [boolean, number, Node] = inOutGraph.addNode('place', '', center_x, center_y);
            if (!(place_center_added[0])) {
                throw new Error('#srv.mnr.eff.010: ' + 'fm fall through execution failed - new central place could not be added due to conflict with existing node)');
            };
            place_center = place_center_added[2];
            inOutGraph.setElementNewFlag(place_center, true);
            const arc_to_central_place_added = inOutGraph.addArc(transition_play, place_center, arcs_from_play_weight);
            if (!(arc_to_central_place_added[0])) {
                throw new Error('#srv.mnr.eff.011: ' + 'fm fall through execution failed - addition of arc from start transition to central place failed due to conflict with an existing arc');
            };
            const arc_from_central_place_added = inOutGraph.addArc(place_center, transition_stop, arcs_to_stop_weight);
            if (!(arc_from_central_place_added[0])) {
                throw new Error('#srv.mnr.eff.012: ' + 'fm fall through execution failed - addition of arc from central place to end transition failed due to conflict with an existing arc');
            };
            inOutGraph.setElementNewFlag(arc_to_central_place_added[2], true);
            inOutGraph.setElementNewFlag(arc_from_central_place_added[2], true);
            /* generating flower petals (individual subdfg per inner node of the split dfg) */
            const petal_subgraph : {
                [nodeId : number] : [Node, Arc, Node, Arc, Node];
            } = {};
            const petal_arcs : {
                [nodeId : number] : number;
            } = {};
            const dfg_nodes : {
                [nodeId : number] : boolean;
            } = {};
            for (const trace of inSplitDfg.log) {
                for (let ev_idx = 1; ev_idx < (trace.length - 1); ev_idx++) {
                    const current_node_id : number = trace[ev_idx].id;
                    dfg_nodes[current_node_id] = true;
                    if (petal_arcs[current_node_id] !== undefined) {
                        petal_arcs[current_node_id]++;
                    } else {
                        petal_arcs[current_node_id] = 1;
                    };
                };
            };
            for (const node of inner_nodes) {
                let petal_arc_weight : number | undefined = petal_arcs[node.id];
                if ((petal_arc_weight === undefined) || (petal_arc_weight < 1)) {
                    throw new Error('#srv.mnr.eff.013: ' + 'fm fall through execution failed - found a node of the dfg that does not appear within the dfg log');
                };
                const arc_vector_x : number = (node.x - center_x);
                const arc_vector_y : number = (node.y - center_y);
                const arc_vector_l : number = (Math.sqrt((arc_vector_x * arc_vector_x) + (arc_vector_y * arc_vector_y)));
                let off_vector_l : number;
                if (arc_vector_l !== 0) {
                    off_vector_l = ((this._graphicsConfig.defaultNodeRadius * 0.9) / arc_vector_l);
                } else {
                    off_vector_l = 0;
                };
                const offset_x : number = (Math.floor(off_vector_l * arc_vector_y * (-1)));
                const offset_y : number = (Math.floor(off_vector_l * arc_vector_x));
                const play_x : number = (Math.floor((center_x) + (arc_vector_x * 0.5) + (offset_x)));
                const play_y : number = (Math.floor((center_y) + (arc_vector_y * 0.5) + (offset_y)));
                const stop_x : number = (Math.floor((center_x) + (arc_vector_x * 0.5) - (offset_x)));
                const stop_y : number = (Math.floor((center_y) + (arc_vector_y * 0.5) - (offset_y)));
                const petal_play_added : [boolean, number, Node] = inOutGraph.addNode('support', 'play', play_x, play_y);
                if (!(petal_play_added[0])) {
                    throw new Error('#srv.mnr.eff.014: ' + 'fm fall through execution failed - new petal play node could not be added due to conflict with existing node)');
                };
                const petal_play : Node = petal_play_added[2];
                const petal_stop_added : [boolean, number, Node] = inOutGraph.addNode('support', 'stop', stop_x, stop_y);
                if (!(petal_stop_added[0])) {
                    throw new Error('#srv.mnr.eff.015: ' + 'fm fall through execution failed - new petal stop node could not be added due to conflict with existing node)');
                };
                const petal_stop : Node = petal_stop_added[2];
                inOutGraph.setElementNewFlag(petal_play, true);
                inOutGraph.setElementNewFlag(petal_stop, true);
                const arc_center_play_added = inOutGraph.addArc(place_center, petal_play, petal_arc_weight);
                if (!(arc_center_play_added[0])) {
                    throw new Error('#srv.mnr.eff.016: ' + 'fm fall through execution failed - addition of arc from central place to petal play node failed due to conflict with an existing arc');
                };
                const arc_play_node_added = inOutGraph.addArc(petal_play, node, petal_arc_weight);
                if (!(arc_play_node_added[0])) {
                    throw new Error('#srv.mnr.eff.017: ' + 'fm fall through execution failed - addition of arc from petal play node to petal mid node failed due to conflict with an existing arc');
                };
                const arc_node_stop_added = inOutGraph.addArc(node, petal_stop, petal_arc_weight);
                if (!(arc_node_stop_added[0])) {
                    throw new Error('#srv.mnr.eff.018: ' + 'fm fall through execution failed - addition of arc from petal mid node to petal stop node failed due to conflict with an existing arc');
                };
                const arc_stop_center_added = inOutGraph.addArc(petal_stop, place_center, petal_arc_weight);
                if (!(arc_stop_center_added[0])) {
                    throw new Error('#srv.mnr.eff.019: ' + 'fm fall through execution failed - addition of arc from petal stop node to central place failed due to conflict with an existing arc');
                };
                inOutGraph.setElementChangedFlag(arc_center_play_added[2], true);
                inOutGraph.setElementChangedFlag(arc_play_node_added[2], true);
                inOutGraph.setElementChangedFlag(arc_node_stop_added[2], true);
                inOutGraph.setElementChangedFlag(arc_stop_center_added[2], true);
                petal_subgraph[node.id] = [petal_play, arc_play_node_added[2], node, arc_node_stop_added[2], petal_stop];
            };
            /* deleting old arcs */
            for (const arc of inSplitDfg.arcs) {
                const arc_deleted : boolean = inOutGraph.deleteArc(arc);
                if (!(arc_deleted)) {
                    throw new Error('#srv.mnr.eff.020: ' + 'fm fall through execution failed - old arc could not be deleted properly');
                };
            };
            /* updating the graph event log */
            if (start_of_graph) {
                if (global_play.length !== 2) {
                    throw new Error('#srv.mnr.eff.021: ' + 'fm fall through execution failed - newly transformed global play nodes were not assigned properly');
                };
            };
            if (end_of_graph) {
                if (global_stop.length !== 2) {
                    throw new Error('#srv.mnr.eff.022: ' + 'fm fall through execution failed - newly transformed global stop nodes were not assigned properly');
                };
            };
            for (let trace of inOutGraph.logArray) {
                for (let ev_idx = 0; ev_idx < trace.length; ev_idx++) {
                    if (trace[ev_idx] === play_old) {
                        if (start_of_graph) {
                            trace.splice(ev_idx, 1, global_play[0], global_play[1]);
                            ev_idx = (ev_idx + 2);
                        } else {
                            trace.splice(ev_idx, 1, transition_play);
                            ev_idx = (ev_idx + 1);
                        };
                        while ((ev_idx < trace.length) && (trace[ev_idx] !== stop_old)) {
                            const checked_node : Node = trace[ev_idx];
                            if (dfg_nodes[checked_node.id] !== true) {
                                throw new Error('#srv.mnr.eff.023: ' + 'fm fall through execution failed - encountered a node that is not part of the split dfg within a subtrace belonging to the split dfg whilst trying to update the graph log');
                            } else {
                                const check_petal : [Node, Arc, Node, Arc, Node] = petal_subgraph[checked_node.id];
                                trace.splice(ev_idx, 1, place_center, check_petal[0], check_petal[2], check_petal[4]);
                                ev_idx = (ev_idx + 4);
                            };
                        };
                        if (ev_idx < trace.length) {
                            if (trace[ev_idx] === stop_old) {
                                if (end_of_graph) {
                                    trace.splice(ev_idx, 1, place_center, global_stop[0], global_stop[1]);
                                    ev_idx = (ev_idx + 2);
                                } else {
                                    trace.splice(ev_idx, 1, place_center, transition_stop);
                                    ev_idx = (ev_idx + 1);
                                };
                            } else {
                                throw new Error('#srv.mnr.eff.024: ' + 'fm fall through execution failed - encountered a trace within the graph log that contains the dfg start node, but the position of the end node of the split dfg was not identified correctly');
                            };
                        } else {
                            throw new Error('#srv.mnr.eff.025: ' + 'fm fall through execution failed - encountered a trace within the graph log that contains the dfg start node, but not the dfg end node');
                        };
                    };
                };
            };
            /* updating dfgs */
            let current_subgraph : [Node, Arc, Node, Arc, Node] = petal_subgraph[inner_nodes[0].id];
            let current_nodes : [Node, Node, Node] = [current_subgraph[0], current_subgraph[2], current_subgraph[4]];
            let current_log : Node[][] = [];
            for (let i = 0; i < petal_arcs[inner_nodes[0].id]; i++) {
                current_log.push(current_nodes);
            };
            inSplitDfg.update(current_subgraph[0], current_subgraph[4], current_nodes, [current_subgraph[1], current_subgraph[3]], current_log);
            for (let k = 1; k < (inner_nodes.length); k++) {
                current_subgraph = petal_subgraph[inner_nodes[k].id];
                current_nodes = [current_subgraph[0], current_subgraph[2], current_subgraph[4]];
                current_log = [];
                for (let l = 0; l < petal_arcs[inner_nodes[k].id]; l++) {
                    current_log.push(current_nodes);
                };
                inOutGraph.appendDFG(current_subgraph[0], current_subgraph[4], current_nodes, [current_subgraph[1], current_subgraph[3]], current_log);
            };
            /* deleting replaced endpoints and updating references */
            if (start_of_graph) {
                inOutGraph.startNode = global_play[0];
                if (!(inOutGraph.deleteNode(play_old))) {
                    throw new Error('#srv.mnr.eff.026: ' + 'fm fall through execution failed - old global play node could not be deleted properly');
                };
            };
            if (end_of_graph) {
                inOutGraph.endNode = global_stop[1];
                if (!(inOutGraph.deleteNode(stop_old))) {
                    throw new Error('#srv.mnr.eff.027: ' + 'fm fall through execution failed - old global stop node could not be deleted properly');
                };
            };
        };
    };

    private searchExclusiveCut(
        inOutGraph : Graph,
        inDfg : DFG
    ) : undefined | [Node[], Arc[]] {
        let cutArcs : Arc[] = [];
        let cutNodes : Node[] = [];
        let foundCut : boolean = false;
        const startNode = inDfg.startNode;
        const startExclusiveCut = new Set<Node>();
        // adding all nodes adjacent to the dfg start node to a set of nodes to be checked
        for (const arc of inDfg.arcs) {
            if (arc.source === startNode) {
                startExclusiveCut.add(arc.target);
            };
        };
        // creating a list of sets of visited nodes
        const visitedNodesList : Set<Node>[] = [];
        for (const node of startExclusiveCut) {
            const visitedNodes = new Set<Node>();
            visitedNodes.add(startNode);
            visitedNodes.add(node);
            visitedNodesList.push(visitedNodes);
        };
        // running checks on every set of visited nodes
        for (const visitedNodes of visitedNodesList) {
            const nodesToVisit = new Set<Node>(visitedNodes);
            while (nodesToVisit.size > 0) {
                const currentNode = nodesToVisit.values().next().value;
                if(currentNode !== undefined){
                    nodesToVisit.delete(currentNode)
                };
                if(currentNode === inDfg.startNode){
                    continue;
                };
                for (const arc of inDfg.arcs) {
                    if ((arc.source === currentNode) && (!(visitedNodes.has(arc.target))) && (currentNode !== inDfg.endNode)){
                        visitedNodes.add(arc.target);
                        nodesToVisit.add(arc.target);
                    } else if ((arc.target === currentNode) && (!(visitedNodes.has(arc.source))) && (currentNode !== inDfg.endNode)){
                        nodesToVisit.add(arc.source);
                        visitedNodes.add(arc.source);
                    };
                };
            };
            // checking whether all nodes of the dfg have been reached
            const allNodesVisited = inDfg.nodes.every(node => visitedNodes.has(node));
            if (!(allNodesVisited)) {
                cutNodes = [];
                visitedNodes.forEach((node) => (cutNodes.push(node)));
                for (let idx = 0; idx < cutNodes.length; idx++) {
                    if (cutNodes[idx] === inDfg.startNode) {
                        cutNodes.splice(idx, 1);
                        idx--;
                    } else if (cutNodes[idx] === inDfg.endNode) {
                        cutNodes.splice(idx, 1);
                        idx--;
                    }
                };
                cutArcs = [];
                for (const arc of inDfg.arcs) {
                    if (arc.source === inDfg.startNode) {
                        if (visitedNodes.has(arc.target)) {
                            cutArcs.push(arc);
                        };
                    } else if (arc.target === inDfg.endNode) {
                        if (visitedNodes.has(arc.source)) {
                            cutArcs.push(arc);
                        };
                    };
                };
                inOutGraph.resetAllMarked();
                for (const node of cutNodes) {
                    inOutGraph.setElementMarkedFlag(node, true);
                };
                for (const arc of cutArcs) {
                    inOutGraph.setElementMarkedFlag(arc, true);
                };
                if (this.checkExclusiveCut(inOutGraph) !== undefined) {
                    inOutGraph.resetAllMarked();
                    this._displayService.refreshData();
                    foundCut = true;
                    break;
                } else {
                    inOutGraph.resetAllMarked();
                };
            };
        };
        if (foundCut) {
            return [cutNodes, cutArcs];
        } else {
            return undefined;
        };
    };

    private searchSequenceCut(
        inOutGraph : Graph,
        inDfg : DFG
    ) : undefined | [Node[], Arc[]] {
        const candidateArcs : Arc[] = [];
        for (const arc of inDfg.arcs) {
            if (!(arc.reverseExists)) {
                candidateArcs.push(arc);
            };
        };
        let cutArcs : Arc[] = [];
        let cutNodes : Node[] = [];
        let nodeSplitTop : Node[] = [];
        let nodeSplitBot : Node[] = [];
        let checkedArcIds : number[] = [];
        let foundCut : boolean = false;
        while (candidateArcs.length > 0) {
            const checkedArc : Arc = candidateArcs[0];
            const trgReach : {[nodeID : number] : boolean} = this.checkReachableNodes([checkedArc.target], inDfg.arcs);
            if (trgReach[checkedArc.source.id] !== true) {
                cutNodes = [];
                cutArcs = [checkedArc];
                nodeSplitTop = [checkedArc.source];
                nodeSplitBot = [checkedArc.target];
                checkedArcIds = [0];
                for (let idx = 1; idx < candidateArcs.length; idx++) {
                    const otherArc : Arc = candidateArcs[idx];
                    let noOverlap : boolean = true;
                    for (const topNode of nodeSplitTop) {
                        if (otherArc.target === topNode) {
                            noOverlap = false;
                            break;
                        };
                    };
                    for (const botNode of nodeSplitBot) {
                        if (otherArc.source === botNode) {
                            noOverlap = false;
                            break;
                        };
                    };
                    if (noOverlap) {
                        nodeSplitTop.push(otherArc.source);
                        nodeSplitBot.push(otherArc.target);
                        let noLoop : boolean = true;
                        const botReach : {[nodeID : number] : boolean} = this.checkReachableNodes(nodeSplitBot, inDfg.arcs);
                        for (const topNode of nodeSplitTop) {
                            if (botReach[topNode.id] === true) {
                                noLoop = false;
                            };
                        };
                        if (noLoop) {
                            cutArcs.push(otherArc);
                            checkedArcIds.push(idx);
                        } else {
                            nodeSplitTop.pop();
                            nodeSplitBot.pop();
                        };
                    };
                };
                const botReach : {[nodeID : number] : boolean} = this.checkReachableNodes(nodeSplitBot, inDfg.arcs);
                for (const node of nodeSplitBot) {
                    if (botReach[node.id] !== true) {
                        cutNodes.push(node);
                    };
                };
                for (const node of inDfg.nodes) {
                    if (botReach[node.id] === true) {
                        cutNodes.push(node);
                    };
                };
                inOutGraph.resetAllMarked();
                for (const node of cutNodes) {
                    inOutGraph.setElementMarkedFlag(node, true);
                };
                for (const arc of cutArcs) {
                    inOutGraph.setElementMarkedFlag(arc, true);
                };
                if (this.checkSequenceCut(inOutGraph) !== undefined) {
                    inOutGraph.resetAllMarked();
                    this._displayService.refreshData();
                    foundCut = true;
                    break;
                } else {
                    inOutGraph.resetAllMarked();
                    let deleted : number = 0;
                    for (const arcId of checkedArcIds) {
                        candidateArcs.splice((arcId - deleted), 1);
                        deleted++;
                    };
                };
            } else {
                candidateArcs.splice(0, 1);
            };    
        };
        if (foundCut) {
            return [cutNodes, cutArcs];
        } else {
            return undefined;
        };
    };

    private searchParallelCut(
        inOutGraph : Graph,
        inDfg : DFG
    ) : undefined | [Node[], Arc[]] {
        const startNode = inDfg.startNode;
        const endNode = inDfg.endNode;
        const arcs = inDfg.arcs;

        const A1 = new Set<Node>();
        const A2 = new Set<Node>();

        // Helper function to check if two nodes are mutually reachable
        const areNodesMutuallyReachable = (nodeA: Node, nodeB: Node): boolean => {
            return arcs.some(arc => arc.source === nodeA && arc.target === nodeB) &&
                arcs.some(arc => arc.source === nodeB && arc.target === nodeA);
        };

        // Helper function to check if two nodes are only unilateral reachable
        const areNodesUnilateralReachable = (neighbors: Set <Node>, arcs: Arc[]): boolean =>{
            for (const nodeA of neighbors){
                for (const nodeB of neighbors) {
                    if(nodeA !== nodeB && arcs.some(arc => arc.source === nodeA && arc.target === nodeB)){
                        return true
                    }
                }
            }
            return false
        }

        // Helper function to check if there is a path from startNode to endNode using only nodes in a set
        // and visiting the explicit node
        const doesPathExist = (set: Set<Node>, nodeToVisit: Node): boolean => {
            const visited = new Set<Node>();
            const stack = [startNode];
            const processedNodes = new Set<Node>();
            let nodeVisited = false;

            while (stack.length > 0) {
                const currentNode = stack.pop();
                if(currentNode === nodeToVisit){
                    nodeVisited = true
                }
                if (currentNode === endNode && nodeVisited) {
                    return true;
                }
                //handle startNode
                if (currentNode && ((set.has(currentNode) && !visited.has(currentNode))
                    || (currentNode === startNode && !visited.has(currentNode)))) {
                    visited.add(currentNode);
                    for (const arc of arcs) {
                        //handle endNode
                        if (arc.source === currentNode && ((set.has(arc.target))
                            || arc.target === endNode)) {
                            stack.push(arc.target);
                        }
                    }
                }
            }
            return false;
        };

        // Step 0: Get all neighbors of the start node
        const neighbors = new Set<Node>();
        for (const arc of arcs) {
            if (arc.source === startNode) {
                neighbors.add(arc.target);
            }
        }

        //Step 0.1: Check pairs of neighbors for unilateral reachability
        if(!areNodesUnilateralReachable(neighbors, arcs)){
            return undefined;
        }

        // Step 1: Check pairs of neighbors for mutual reachability
        for (const nodeA of neighbors) {
            for (const nodeB of neighbors) {
                if ((nodeA !== nodeB && areNodesMutuallyReachable(nodeA, nodeB))
                    &&!(A2.has(nodeA) && A1.has(nodeB))) {
                    A1.add(nodeA);
                    A2.add(nodeB);
                }
            }
        }

        // Step 2: Check neighbors of A1 and A2 for mutual relationships
        const expandSets = (setA: Set<Node>, setB: Set<Node>): boolean => {
            const nodesToVisit = new Set<Node>(setA);
            while (nodesToVisit.size > 0) {
                const currentNode = nodesToVisit.values().next().value;
                if (currentNode !== undefined) {
                    nodesToVisit.delete(currentNode);
                };

                for (const arc of arcs) {
                    if (arc.source === currentNode && !setA.has(arc.target) && !setB.has(arc.target)
                        && arc.target !==endNode) {
                        const allMutuallyReachable = Array.from(setA).every(aNode=>
                            areNodesMutuallyReachable(aNode, arc.target));
                        if (allMutuallyReachable) {
                            setB.add(arc.target);
                        } else{
                            setA.add(arc.target);
                        }
                        nodesToVisit.add(arc.target);
                    }
                }
            }
            return true;
        };

        if (!expandSets(A1, A2) || !expandSets(A2, A1)) {
            return undefined;
        }

        // Step 2.1: Still mutuall reachable elements in A1 to A2?
        const allMutuallyReachable = Array.from(A1).every(a1Node =>
            Array.from(A2).every(a2Node => areNodesMutuallyReachable(a1Node, a2Node)))
        if(!allMutuallyReachable){
            return undefined;
        }


        // Step 3: Check paths for nodes in A1
        for (const node of A1) {
            if (!doesPathExist(A1, node)) {
                return undefined;
            }
        }

        // Step 3.1: Check paths for nodes in A2
        for (const node of A2) {
            if (!doesPathExist(A2, node)) {
                return undefined;
            }
        }
        //mark arcs between sets A1 and A2
        const markArcsBetweenSets = () =>{
            for (const arc of arcs){
                if ((A1.has(arc.source) && A2.has(arc.target))
                    ||(A1.has(arc.target) && A2.has(arc.source))){
                    arc.marked = true
                    inOutGraph.markedArcs.push(arc)
                }
            }
        }
        //mark nodes of set A1
        for (let node of inDfg.nodes){
            if(A1.has(node)){
                node.marked = true
                inOutGraph.markedNodes.push(node)
            }
        }
        markArcsBetweenSets()
        arcs.forEach(arc => {
            if((arc.source === startNode && A1.has(arc.target)) ||
                (arc.target === endNode && A1.has(arc.source))){
                arc.marked = true
                inOutGraph.markedArcs.push(arc)
            }
        })

        return [inOutGraph.markedNodes.slice(), inOutGraph.markedArcs.slice()];
    };

    private searchLoopCut(
        inOutGraph : Graph,
        inDfg : DFG
    ) : undefined | [Node[], Arc[]] {
    const startNode = inDfg.startNode;
    const endNode = inDfg.endNode;
    const arcs = inDfg.arcs;

    const redoSet = this.findNodesBetweenDuplicatesInArrays(inDfg.log)

    //mark nodes of redo part
    for (let node of inDfg.nodes){
        if(redoSet.has(node)){
        node.marked = true
        inOutGraph.markedNodes.push(node)
        }
    }
    //mark arcs to and from redo part
    this.markArcsOfRedoPart(redoSet, inDfg.arcs, inOutGraph)
    const checkLC : undefined | [DFG, Node[], Node[], Node[], Node[], boolean] = this.checkLoopCut(inOutGraph)
    if(checkLC === undefined){
        //this.initNodesAndArcs(inDfg, inGraph)
        inOutGraph.resetAllMarked()
        return undefined;
    } else {
        return [inOutGraph.markedNodes.slice(), inOutGraph.markedArcs.slice()];
    };
    };

    private checkGraphStart(
        inGraph : Graph,
        inNode : Node
    ) : boolean {
        if (inGraph.startNode !== undefined) {
            if (inNode !== inGraph.startNode) {
                return false;
            } else {
                return true;
            };
        } else {
            throw new Error('#srv.mnr.ccs.000: ' + 'cut check failed - start node of graph is undefined');
        };
    };

    private checkGraphEnd(
        inGraph : Graph,
        inNode : Node
    ) : boolean {
        if (inGraph.endNode !== undefined) {
            if (inNode !== inGraph.endNode) {
                return false;
            } else {
                return true;
            };
        } else {
            throw new Error('#srv.mnr.cce.000: ' + 'cut check failed - end node of graph is undefined');
        };
    };

    private checkGraphStartEnd(
        inGraph : Graph
    ) : void {
        if (inGraph.startNode === undefined) {
            throw new Error('#srv.mnr.cse.000: ' + 'graph check failed - start node of graph is undefined');
        };
        if (inGraph.endNode === undefined) {
            throw new Error('#srv.mnr.cse.000: ' + 'graph check failed - end node of graph is undefined');
        };
    };

    private checkMarkedDFG(
        inGraph : Graph
    ) : number | undefined {
        if (inGraph.markedNodes.length < 1) {
            return undefined;
        };
        let cutDFG : number | undefined = inGraph.markedNodes[0].dfg;
        if (cutDFG === undefined) {
            return undefined;
        };
        if (!(this.checkMarkedNodesDFG(inGraph, cutDFG))) {
            return undefined;
        };
        if (!(this.checkMarkedArcsDFG(inGraph, cutDFG))) {
            return undefined;
        };
        return cutDFG;
    };

    private checkMarkedNodesDFG(
        inGraph : Graph,
        inDFG : number
    ) : boolean {
        for (const node of inGraph.markedNodes) {
            if (node.dfg !== inDFG) {
                return false;
            };
        };
        return true;
    };

    private checkMarkedArcsDFG(
        inGraph : Graph,
        inDFG : number
    ) : boolean {
        for (const arc of inGraph.markedArcs) {
            if (arc.dfg !== inDFG) {
                return false;
            };
        };
        return true;
    };

    private checkDfgPosition(
        inGraph : Graph,
        inDfgId : number
    ) : number | undefined {
        let dfgPos : number = 0;
        for (const dfg of inGraph.dfgArray) {
            if (dfg.id === inDfgId) {
                return dfgPos;
            };
            dfgPos++;
        };
        return undefined;
    };

    private checkReachableNodes(
        inSourceNodes : Node[],
        inArcsToCheck : Arc[]
    ) : {
        [nodeID : number] : boolean
    } {
        const nodesToCheck : Node[] = [];
        let reachedNum : number = 0;
        let reached : {
            [nodeID : number] : boolean
        } = {};
        for (const node of inSourceNodes) {
            nodesToCheck.push(node);
            reached[node.id] = false;
        };
        while (nodesToCheck.length > 0) {
            const checkedNode : Node | undefined = nodesToCheck.pop();
            if (checkedNode !== undefined) {
                for (const arc of inArcsToCheck) {
                    if (arc.source === checkedNode) {
                        if (reached[arc.target.id] === undefined) {
                            nodesToCheck.push(arc.target);
                            reached[arc.target.id] = true;
                            reachedNum++;
                        } else if (reached[arc.target.id] === false) {
                            reached[arc.target.id] = true;
                            reachedNum++;
                        } else {
                            /* node has been reached before --> skip node */
                        };
                    };
                };
            } else {
                throw new Error('#srv.mnr.cfp.000: ' + 'path check failed - impossible error');
            };
        };
        return reached;
    };

    private checkForArc(
        inArcs : Arc[],
        inSourceNode : Node,
        inTargetNode : Node
    ) : boolean {
        let arcFound : boolean = false;
        for (const arc of inArcs) {
            if (arc.source === inSourceNode) {
                if (arc.target === inTargetNode) {
                    arcFound = true;
                    break;
                };
            };
        };
        return arcFound;
    };

    private checkTraceEquality(
        inTraceOne : Node[],
        inTraceTwo : Node[]
    ) : boolean {
        if (inTraceOne.length !== inTraceTwo.length) {
            return false;
        };
        for (let idx = 0; idx < inTraceOne.length; idx++) {
            if (inTraceOne[idx] !== inTraceTwo[idx]) {
                return false;
            };
        };
        return true;
    };

    private checkLoopInternal(
        inOutGraph: Graph,
        A1: Node[],
        A2: Node[],
        dfg: DFG
    ) : {
        isLoop: boolean,
        A2_play: Node[],
        A2_stop: Node[]
    } {
        // if (A2.some(A2Node => A2Node.type !== 'event')) {
        //     return { isLoop: false, A2_play: [], A2_stop: [] };
        // };
        if (A1.some(A1Node => A2.some(A2Node => A1Node.id === A2Node?.id))) {
            return { isLoop: false, A2_play: [], A2_stop: [] };
        };
        const A1_play = A1.filter(a1 => dfg.arcs.some(arc => arc.target.id === a1.id && !A1.some(a1 => arc.source.id == a1.id)));
        const A1_stop = A1.filter(a1 => dfg.arcs.some(arc => arc.source.id === a1.id && !A1.some(a1 => arc.target.id == a1.id)));
        const A2_play = A2.filter(a2 => dfg.arcs.some(arc => arc.target.id === a2?.id && !A2.some(a2 => arc.source.id == a2.id)));
        const A2_stop = A2.filter(a2 => dfg.arcs.some(arc => arc.source.id === a2?.id && !A2.some(a2 => arc.target.id == a2.id)));
        const arcsToCut = inOutGraph.arcs.filter(arc =>
            A2_play.some(a2_play => a2_play?.id === arc.target.id) && !A2.some(a2 => a2?.id === arc.source.id) ||
            A2_stop.some(a2_stop => a2_stop?.id === arc.source.id) && !A2.some(a2 => a2?.id === arc.target.id)
        );
        if (!this.areArcsArraysEqual(arcsToCut, inOutGraph.markedArcs)) {
            return { isLoop: false, A2_play: [], A2_stop: [] };
        };
        if (!dfg.arcs.some(arc => arc.source.type === "support" && arc.source.label == 'play' && A1_play.every(a1_play => arc.target.id === a1_play.id))) {
            return { isLoop: false, A2_play: [], A2_stop: [] };
        };
        if (!dfg.arcs.some(arc => arc.target.type === "support" && arc.target.label == 'stop' && A1_stop.every(a1_play => arc.source.id === a1_play.id))) {
            return { isLoop: false, A2_play: [], A2_stop: [] };
        };
        for (const A2_activity of A2_stop) {
            for (const A1_activity of A1_play) {
                if (!dfg.arcs.some(arc => arc.source.id === A2_activity.id && arc.target.id === A1_activity.id)) {
                    return { isLoop: false, A2_play: [], A2_stop: [] };
                };
            };
        };
        for (const A1_activity of A1_stop) {
            for (const A2_activity of A2_play) {
                if (!dfg.arcs.some(arc => arc.source.id === A1_activity.id && arc.target.id === A2_activity.id)) {
                    return { isLoop: false, A2_play: [], A2_stop: [] };
                };
            };
        };
        return { isLoop: true, A2_play, A2_stop };
    };

    private areArraysEqualById(
        arrayOne: Node[],
        arrayTwo: Node[]
    ) : boolean {
        if (arrayOne.length !== arrayTwo.length) {
            return false;
        }
        const sortedArrayOne = arrayOne.map(obj => obj.id).sort();
        const sortedArrayTwo = arrayTwo.map(obj => obj.id).sort();
        return (
            sortedArrayOne.every(
                (id, index) => (id === sortedArrayTwo[index])
            )
        );
    };

    private areArcsArraysEqual(
        arrayOne: Arc[],
        arrayTwo: Arc[]
    ) : boolean {
        if (arrayOne.length !== arrayTwo.length) {
            return false;
        } return arrayOne.every(
            (obj, index) => {
                const obj2 = arrayTwo[index];
                return ((obj.source.id === obj2.source.id) && (obj.target.id === obj2.target.id));
            }
        );
    };

    private findSubArray(
        mainArray: Node[],
        subArray: Node[]
    ) : number | null {
        const mainLength = mainArray.length;
        const subLength = subArray.length;
        for (let i = 0; i <= mainLength - subLength; i++) { let match = true;
            for (let j = 0; j < subLength; j++) {
                if (mainArray[i + j].id !== subArray[j].id) {
                    match = false;
                    break;
                };
            };
            if (match) {
                return i;
            };
        };
        return null;
    };

    /**
     * Check whether graph is beeing connected using deepsearch
     * @param inOutGraph
     * @param useMarkedNodes decide whether marked nodes are beeing analyzed or unmarked nodes
     * @private
     */
    private areNodesConnected(
        inOutGraph: Graph,
        useMarkedNodes: boolean
    ) : boolean {
        /* check whether nodes to be checked are marked or unmarked */
        const nodesToCheck = useMarkedNodes ? inOutGraph.markedNodes : inOutGraph.unmarkedNodes
        if (nodesToCheck.length === 0){
            return false
        }
        const visited = new Set<Node>()
        /* start with random marked or unmarked node */
        const stack = [nodesToCheck[0]]
        while (stack.length > 0){
            const currentNode = stack.pop()
            if(!currentNode) continue
            visited.add(currentNode)
            /* expand stack whenever we find a connecting arc to marked or unmarked node */
            /* using outgoing arcs */
            for (const arc of inOutGraph.arcs){
                if(arc.source === currentNode
                    && ((useMarkedNodes && arc.target.marked) || (!useMarkedNodes && !arc.target.marked))
                    && !visited.has(arc.target)){
                    stack.push(arc.target)
                }
            }
            /* using incoming arcs */
            for (const arc of inOutGraph.arcs){
                if (arc.target === currentNode
                    && ((useMarkedNodes && arc.source.marked) || (!useMarkedNodes && !arc.source.marked))
                    && !visited.has(arc.source)){
                    stack.push(arc.source)
                }
            }
        }
        /* check whether all marked or unmarked nodes have been visited */
        return nodesToCheck.every(node => visited.has(node))
    };

    /**
     * Method filters arcs that are only used between marked nodes and
     * arc that are only used beetwen unmarked nodes
     * @param inOutGraph
     * @private
     */
    private adjustArcsForConnectivity(
        inOutGraph: Graph
    ) : [
        Arc[],
        Arc[]
    ] {
        /* set of marked and unmarked nodes */
        const markedNodes = new Set(inOutGraph.markedNodes)
        const unmarkedNodes = new Set(inOutGraph.unmarkedNodes)
        /* filter arcs for marked nodes */
        const markedArcs = inOutGraph.arcs.filter(arc =>
            markedNodes.has(arc.source) && markedNodes.has(arc.target))
        /* filter arcs for unmarked nodes */
        const unmarkedArcs = inOutGraph.arcs.filter(arc =>
            unmarkedNodes.has(arc.source) && unmarkedNodes.has(arc.target))
        for (const arc of inOutGraph.arcs){
            if(!markedArcs.includes(arc) && !unmarkedArcs.includes(arc)){
                // inOutGraph.deleteArc(arc)
            }
        }
        return [markedArcs, unmarkedArcs]
    };

    private checkEndpointsEqual(
        inDfg : DFG
    ) : boolean | undefined {
        if (inDfg.startNode.marked) {
            if (inDfg.endNode.marked) {
                return true;
            } else {
                return undefined;
            };
        } else {
            if (inDfg.endNode.marked) {
                return undefined;
            } else {
                return false;
            };
        };
    };

    private checkEndpointsSC(
        inDfg : DFG,
        inCutsStartOnMarked : boolean
    ) : boolean | undefined {
        if (inCutsStartOnMarked) {
            if (!(inDfg.startNode.marked)) {
                return undefined;
            };
            if (inDfg.endNode.marked) {
                return undefined;
            };
        } else {
            if (inDfg.startNode.marked) {
                return undefined;
            };
            if (!(inDfg.endNode.marked)) {
                return undefined;
            };
        };
        return true;
    };

    private checkCutArcsEC(
        inGraph : Graph,
        inDfg : DFG
    ) : [
        Arc,
        Arc
    ] | undefined {
        const arcZero : Arc = inGraph.markedArcs[0];
        const arcOne : Arc = inGraph.markedArcs[1];
        if (arcZero.source !== inDfg.startNode) {
            if (arcZero.target !== inDfg.endNode) {
                return undefined;
            } else {
                if (arcOne.source !== inDfg.startNode) {
                    return undefined;
                } else {
                    return [arcOne, arcZero]
                };
            };
        } else {
            if (arcOne.target !== inDfg.endNode) {
                return undefined;
            } else {
                return [arcZero, arcOne]
            };
        };
    };

    private splitArcsEC(
        inDfg : DFG
    ) : [
        Arc[],
        Arc[]
    ] | undefined {
        const arcsBetweenMarked : Arc[] = [];
        const arcsBetweenUnmarked : Arc[] = [];
        let foundUnmarkedStartArc : boolean = false;
        let foundUnmarkedEndArc : boolean = false;
        for (const arc of inDfg.arcs) {
            if (arc.marked) {
                if (arc.source.marked) {
                    if (arc.target.marked) {
                        return undefined;
                    } else {
                        /* arc is cut --> skip arc */
                    };
                } else {
                    if (arc.target.marked) {
                        /* arc is cut --> skip arc */
                    } else {
                        return undefined;
                    };
                };
            } else {
                if (arc.source === inDfg.startNode) {
                    if (arc.target === inDfg.endNode) {
                        return undefined;
                    } else {
                        foundUnmarkedStartArc = true;
                    };
                } else if (arc.target === inDfg.endNode) {
                    foundUnmarkedEndArc = true;
                };
                if (arc.source.marked) {
                    if (arc.target.marked) {
                        arcsBetweenMarked.push(arc);
                    } else {
                        return undefined;
                    };
                } else {
                    if (arc.target.marked) {
                        return undefined;
                    } else {
                        arcsBetweenUnmarked.push(arc);
                    };
                };
            };
        };
        if (foundUnmarkedStartArc) {
            if (foundUnmarkedEndArc) {
                return [arcsBetweenMarked, arcsBetweenUnmarked];
            };
        };
        return undefined;
    };

    private splitArcsSC(
        inDfg : DFG,
        inCutsStartOnMarked : boolean
    ) : [
        Arc[],
        Arc[],
        Arc[]
    ] | undefined {
        const cutArcs : Arc[] = [];
        const arcsBetweenMarked : Arc[] = [];
        const arcsBetweenUnmarked : Arc[] = [];
        if (inCutsStartOnMarked) {
            for (const arc of inDfg.arcs) {
                if (arc.source === inDfg.startNode) {
                    if (arc.target === inDfg.endNode) {
                        return undefined;
                    };
                };
                if (arc.marked) {
                    if (arc.target.marked) {
                        return undefined;
                    };
                    if (!(arc.source.marked)) {
                        return undefined;
                    };
                    cutArcs.push(arc);
                } else {
                    if (arc.source.marked) {
                        if (arc.target.marked) {
                            arcsBetweenMarked.push(arc);
                        } else {
                            return undefined;
                        };
                    } else {
                        if (arc.target.marked) {
                            return undefined;
                        }else {
                            arcsBetweenUnmarked.push(arc);
                        };
                    };
                };
            };
            return [cutArcs, arcsBetweenMarked, arcsBetweenUnmarked];
        } else {
            for (const arc of inDfg.arcs) {
                if (arc.source === inDfg.startNode) {
                    if (arc.target === inDfg.endNode) {
                        return undefined;
                    };
                };
                if (arc.marked) {
                    if (arc.source.marked) {
                        return undefined;
                    };
                    if (!(arc.target.marked)) {
                        return undefined;
                    };
                    cutArcs.push(arc);
                } else {
                    if (arc.source.marked) {
                        if (arc.target.marked) {
                            arcsBetweenMarked.push(arc);
                        } else {
                            return undefined;
                        };
                    } else {
                        if (arc.target.marked) {
                            return undefined;
                        }else {
                            arcsBetweenUnmarked.push(arc);
                        };
                    };
                };
            };
            return [cutArcs, arcsBetweenUnmarked, arcsBetweenMarked];
        };
    };

    private splitArcsPC(
        inDfg : DFG
    ) : [
        Arc,
        Arc[],
        Arc,
        Arc[],
        Arc[]
    ] | undefined {
        const cutPlayArcs : Arc[] = [];
        const cutMidArcs : Arc[] = [];
        const cutStopArcs : Arc[] = [];
        const arcsBetweenMarked : Arc[] = [];
        const arcsBetweenUnmarked : Arc[] = [];
        const reverseSearch : Arc[] = [];
        let foundUnmarkedStartArc : boolean = false;
        let foundUnmarkedEndArc : boolean = false;
        for (const arc of inDfg.arcs) {
            if (arc.source === inDfg.startNode) {
                if (arc.target === inDfg.endNode) {
                    return undefined;
                };
            };
            if (arc.marked) {
                if (arc.source.marked) {
                    if (arc.target.marked) {
                        return undefined;
                    };
                } else {
                    if (!(arc.target.marked)) {
                        return undefined;
                    };
                };
                if (arc.source === inDfg.startNode) {
                    cutPlayArcs.push(arc);
                } else if (arc.target === inDfg.endNode) {
                    cutStopArcs.push(arc);
                } else {
                    if (arc.reverseExists) {
                        let reverse : Arc | undefined = undefined;
                        let reverseChecked : boolean = false;
                        for (let idx = 0; idx < reverseSearch.length; idx++) {
                            const rev : Arc = reverseSearch[idx];
                            if (rev.source === arc.target) {
                                if (rev.target === arc.source) {
                                    reverse = rev;
                                    reverseSearch.splice(idx, 1);
                                    reverseChecked = true;
                                    break;
                                };
                            };
                        };
                        if (reverseChecked) {
                            if (reverse !== undefined) {
                                cutMidArcs.push(arc, reverse);
                            } else {
                                throw new Error('#srv.mnr.sap.000: ' + 'arc split failed - impossible error');
                            };
                        } else {
                            reverseSearch.push(arc);
                        };
                    } else {
                        return undefined;
                    };
                };
            } else {
                if (arc.source === inDfg.startNode) {
                    foundUnmarkedStartArc = true;
                } else if (arc.target === inDfg.endNode) {
                    foundUnmarkedEndArc = true;
                };
                if (arc.source.marked) {
                    if (arc.target.marked) {
                        arcsBetweenMarked.push(arc);
                    } else {
                        return undefined;
                    };
                } else {
                    if (arc.target.marked) {
                        return undefined;
                    }else {
                        arcsBetweenUnmarked.push(arc);
                    };
                };
            };
        };
        if (reverseSearch.length !== 0) {
            return undefined;
        };
        if (cutPlayArcs.length !== 1) {
            return undefined;
        };
        if (cutMidArcs.length < 2) {
            return undefined;
        };
        if (cutStopArcs.length !== 1) {
            return undefined;
        };
        if (foundUnmarkedStartArc) {
            if (foundUnmarkedEndArc) {
                return [cutPlayArcs[0], cutMidArcs, cutStopArcs[0], arcsBetweenMarked, arcsBetweenUnmarked];
            };
        };
        return undefined;
    };

    private splitNodesMU(
        inDfg : DFG
    ) : [
        Node[],
        Node[]
    ] | undefined {
        const nodeSplitMarked : Node[] = [];
        const nodeSplitUnmarked : Node[] = [];
        for (const node of inDfg.nodes) {
            if (node !== inDfg.startNode) {
                if (node !== inDfg.endNode) {
                    if (node.marked) {
                        nodeSplitMarked.push(node);
                    } else {
                        nodeSplitUnmarked.push(node);
                    };
                } else {
                    /* skip end node */
                };
            } else {
                /* skip start node */
            };
        };
        if (nodeSplitMarked.length < 1) {
            return undefined;
        };
        if (nodeSplitUnmarked.length < 1) {
            return undefined;
        };
        return [nodeSplitMarked, nodeSplitUnmarked];
    };

    private splitNodesTB(
        inDfg : DFG,
        inTopMarked : boolean
    ) : [
        Node[],
        Node[]
    ] | undefined {
        const nodeSplitTop : Node[] = [];
        const nodeSplitBottom : Node[] = [];
        if (inTopMarked) {
            for (const node of inDfg.nodes) {
                if (node.marked) {
                    nodeSplitTop.push(node);
                } else {
                    nodeSplitBottom.push(node);
                };
            };
        } else {
            for (const node of inDfg.nodes) {
                if (node.marked) {
                    nodeSplitBottom.push(node);
                } else {
                    nodeSplitTop.push(node);
                };
            };
        };
        if (nodeSplitTop.length < 2) {
            return undefined;
        };
        if (nodeSplitBottom.length < 2) {
            return undefined;
        };
        return [nodeSplitTop, nodeSplitBottom];
    };

    private checkReachabilitySC(
        inNodeSplitTop : Node[],
        inNodeSplitBottom : Node[],
        inArcs : Arc[]
    ) : boolean {
        const reachableFromTop : {[nodeID : number] : boolean} = this.checkReachableNodes(inNodeSplitTop, inArcs);
        for (const botNode of inNodeSplitBottom) {
            if (reachableFromTop[botNode.id] !== true) {
                return false;
            };
        };
        const reachableFromBottom : {[nodeID : number] : boolean} = this.checkReachableNodes(inNodeSplitBottom, inArcs);
        for (const topNode of inNodeSplitTop) {
            if (reachableFromBottom[topNode.id] === true) {
                return false;
            };
        };
        return true;
    };

    private checkReachabilityPC(
        inDfgPlay : Node,
        inDfgStop : Node,
        inEndpointsMarked : boolean,
        inNodeSplitM : Node[],
        inNodeSplitU : Node[],
        inArcSplitM : Arc[],
        inArcSplitU : Arc[],
        inCutPlayArc : Arc,
        inCutMidArcs : Arc[],
        inCutStopArc : Arc
    ) : boolean {
        /* checking whether an arc exists between every marked and unmarked node (every such an needs to be marked to be cut) */
        const reachableM : {[nodeID : number] : boolean} = this.checkReachableNodes(inNodeSplitM, inCutMidArcs);
        for (const uNode of inNodeSplitU) {
            if (reachableM[uNode.id] !== true) {
                return false;
            };
        };
        const reachableU : {[nodeID : number] : boolean} = this.checkReachableNodes(inNodeSplitU, inCutMidArcs);
        for (const mNode of inNodeSplitM) {
            if (reachableU[mNode.id] !== true) {
                return false;
            };
        };
        /* checking whether a path from play to stop that visits the node exists for every inner node (excluding inner cut arcs) */
        let expandedArcSplitM : Arc[];
        let expandedArcSplitU : Arc[];
        if (inEndpointsMarked) {
            expandedArcSplitM = inArcSplitM;
            expandedArcSplitU = inCutMidArcs.concat(inCutPlayArc, inCutStopArc);
        } else {
            expandedArcSplitM = inCutMidArcs.concat(inCutPlayArc, inCutStopArc);
            expandedArcSplitU = inArcSplitU;
        };
        const playReachM : {[nodeID : number] : boolean} = this.checkReachableNodes([inDfgPlay], expandedArcSplitM);
        for (const mNode of inNodeSplitM) {
            if (playReachM[mNode.id] !== true) {
                return false;
            };
            const nodeReachM : {[nodeID : number] : boolean} = this.checkReachableNodes([mNode], expandedArcSplitM);
            if (nodeReachM[inDfgStop.id] !== true) {
                return false;
            };
        };
        const playReachU : {[nodeID : number] : boolean} = this.checkReachableNodes([inDfgPlay], expandedArcSplitU);
        for (const uNode of inNodeSplitU) {
            if (playReachU[uNode.id] !== true) {
                return false;
            };
            const nodeReachU : {[nodeID : number] : boolean} = this.checkReachableNodes([uNode], expandedArcSplitU);
            if (nodeReachU[inDfgStop.id] !== true) {
                return false;
            };
        };
        return true;
    };

    private replaceArc(
        inOutGraph : Graph,
        inReplacedArc : Arc,
        inNewArcSourceNode : Node,
        inNewArcTargetNode : Node
    ) : Arc {
        const arcAdded : [boolean, number, Arc] = inOutGraph.addArc(inNewArcSourceNode, inNewArcTargetNode, inReplacedArc.weight);
        if (!(arcAdded[0])) {
            throw new Error('#srv.mnr.rpa.000: ' + 'replacing cut arc failed - new arc could not be added due to conflict with an existing arc');
        };
        const newArc : Arc = arcAdded[2];
        if (!(inOutGraph.deleteArc(inReplacedArc))) {
            throw new Error('#srv.mnr.rpa.001: ' + 'replacing cut arc failed - deletion of replaced arc failed');
        };
        if (inReplacedArc.marked) {
            inOutGraph.setElementMarkedFlag(newArc, true);
        };
        inOutGraph.setElementChangedFlag(newArc, true);
        return newArc;
    };

    private replaceAndAddArc(
        inOutGraph : Graph,
        inReplacedArc : Arc,
        inNewArcOneSourceNode : Node,
        inNewArcOneTargetNode : Node,
        inNewArcTwoSourceNode : Node,
        inNewArcTwoTargetNode : Node
    ) : [
        boolean,
        Arc,
        boolean,
        Arc
    ] {
        const arcOneAdded : [boolean, number, Arc] = inOutGraph.addArc(inNewArcOneSourceNode, inNewArcOneTargetNode, inReplacedArc.weight);
        const newArcOne : Arc = arcOneAdded[2];
        const arcTwoAdded : [boolean, number, Arc] = inOutGraph.addArc(inNewArcTwoSourceNode, inNewArcTwoTargetNode, inReplacedArc.weight);
        const newArcTwo : Arc = arcTwoAdded[2];
        if (!(inOutGraph.deleteArc(inReplacedArc))) {
            throw new Error('#srv.mnr.raa.002: ' + 'replacing cut arc failed - deletion of replaced arc failed');
        };
        if (inReplacedArc.marked) {
            inOutGraph.setElementMarkedFlag(newArcOne, true);
            inOutGraph.setElementMarkedFlag(newArcTwo, true);
        };
        inOutGraph.setElementChangedFlag(newArcOne, true);
        inOutGraph.setElementChangedFlag(newArcTwo, true);
        return [arcOneAdded[0], newArcOne, arcTwoAdded[0], newArcTwo];
    };

    private replaceArcInsertNode(
        inOutGraph : Graph,
        inReplacedArc : Arc,
        inNewBranchSourceNode : Node,
        inNewBranchTargetNode : Node,
        inNewNodeType : 'support' | 'place' | 'transition',
        inNewNodeLabel : string
    ) : [
        Arc,
        Node,
        Arc
    ] {
        const placeX : number = (inNewBranchSourceNode.x + Math.ceil((inNewBranchTargetNode.x - inNewBranchSourceNode.x) / 2));
        const placeY : number = (inNewBranchSourceNode.y + Math.ceil((inNewBranchTargetNode.y - inNewBranchSourceNode.y) / 2));
        const placeAdded : [boolean, number, Node] = inOutGraph.addNode(inNewNodeType, inNewNodeLabel, placeX, placeY);
        if (!(placeAdded[0])) {
            throw new Error('#srv.mnr.rai.000: ' + 'replacing cut arc failed - new node could not be added due to conflict with an existing node');
        };
        const newArcPlace : Node = placeAdded[2];
        const arcOneAdded : [boolean, number, Arc] = inOutGraph.addArc(inNewBranchSourceNode, newArcPlace, inReplacedArc.weight);
        if (!(arcOneAdded[0])) {
            throw new Error('#srv.mnr.rai.001: ' + 'replacing cut arc failed - arc from branch source node to new node could not be added due to conflict with an existing arc');
        };
        const newArcOne : Arc = arcOneAdded[2];
        const arcTwoAdded : [boolean, number, Arc] = inOutGraph.addArc(newArcPlace, inNewBranchTargetNode, inReplacedArc.weight);
        if (!(arcTwoAdded[0])) {
            throw new Error('#srv.mnr.rai.002: ' + 'replacing cut arc failed - arc from new node to branch target node could not be added due to conflict with an existing arc');
        };
        const newArcTwo : Arc = arcTwoAdded[2];
        if (!(inOutGraph.deleteArc(inReplacedArc))) {
            throw new Error('#srv.mnr.rai.003: ' + 'replacing cut arc failed - deletion of replaced arc failed');
        };
        if (inReplacedArc.marked) {
            inOutGraph.setElementMarkedFlag(newArcOne, true);
            // inOutGraph.setElementMarkedFlag(newArcPlace, true);
            inOutGraph.setElementMarkedFlag(newArcTwo, true);
        };
        inOutGraph.setElementNewFlag(newArcOne, true);
        inOutGraph.setElementNewFlag(newArcPlace, true);
        inOutGraph.setElementNewFlag(newArcTwo, true);
        return [newArcOne, newArcPlace, newArcTwo];
    };

    private transformStart(
        inOutGraph : Graph,
        inStartNode : Node,
        inArcWeight : number
    ) : [
        Node,
        Node,
        Node
    ] {
        const startPlaceOneAdded : [boolean, number, Node] = inOutGraph.addNode('place', '', inStartNode.x, (inStartNode.y - Math.ceil(this._graphicsConfig.defaultNodeRadius / 2)));
        if (!(startPlaceOneAdded[0])) {
            throw new Error('#srv.mnr.tsn.000: ' + 'start node transformation failed - first start place could not be added due to conflict with existing node)');
        };
        const startPlaceOne : Node = startPlaceOneAdded[2];
        const startTransitionAdded : [boolean, number, Node] = inOutGraph.addNode('transition', inStartNode.label, inStartNode.x, inStartNode.y);
        if (!(startTransitionAdded[0])) {
            throw new Error('#srv.mnr.tsn.001: ' + 'start node transformation failed - start transition could not be added due to conflict with existing node)');
        };
        const startTransition : Node = startTransitionAdded[2];
        const startPlaceTwoAdded : [boolean, number, Node] = inOutGraph.addNode('place', '', inStartNode.x, (inStartNode.y + Math.ceil(this._graphicsConfig.defaultNodeRadius / 2)));
        if (!(startPlaceTwoAdded[0])) {
            throw new Error('#srv.mnr.tsn.002: ' + 'start node transformation failed - second start place could not be added due to conflict with existing node)');
        };
        const startPlaceTwo : Node = startPlaceTwoAdded[2];
        const startArcOneAdded : [boolean, number, Arc] = inOutGraph.addArc(startPlaceOne, startTransition, inArcWeight);
        if (!(startArcOneAdded[0])) {
            throw new Error('#srv.mnr.tsn.003: ' + 'start node transformation failed - arc from first start place to start transition could not be added due to conflict with an existing arc');
        };
        const startArcOne : Arc = startArcOneAdded[2];
        const startArcTwoAdded : [boolean, number, Arc] = inOutGraph.addArc(startTransition, startPlaceTwo, inArcWeight);
        if (!(startArcTwoAdded[0])) {
            throw new Error('#srv.mnr.tsn.004: ' + 'start node transformation failed - arc from start transition to second start place could not be added due to conflict with an existing arc');
        };
        const startArcTwo : Arc = startArcTwoAdded[2];
        if (inStartNode.marked) {
            inOutGraph.setElementMarkedFlag(startPlaceOne, true);
            // inOutGraph.setElementMarkedFlag(startArcOne, true);
            inOutGraph.setElementMarkedFlag(startTransition, true);
            // inOutGraph.setElementMarkedFlag(startArcTwo, true);
            inOutGraph.setElementMarkedFlag(startPlaceTwo, true);
        };
        inOutGraph.setElementNewFlag(startPlaceOne, true);
        inOutGraph.setElementNewFlag(startArcOne, true);
        inOutGraph.setElementChangedFlag(startTransition, true);
        inOutGraph.setElementNewFlag(startArcTwo, true);
        inOutGraph.setElementNewFlag(startPlaceTwo, true);
        startTransition.special = true;
        return [startPlaceOne, startTransition, startPlaceTwo]
    };

    private transformMid(
        inOutGraph : Graph,
        inMidNode : Node
    ) : Node {
        if ((inMidNode.type === 'support') && (inMidNode.label === 'tau')) {
            const midTransitionAdded : [boolean, number, Node] = inOutGraph.addNode('transition', '', inMidNode.x, inMidNode.y);
            if (!(midTransitionAdded[0])) {
                throw new Error('#srv.mnr.tmn.001: ' + 'mid node transformation failed - mid transition could not be added due to conflict with existing node)');
            };
            const midTransition : Node = midTransitionAdded[2];
            if (inMidNode.marked) {
                inOutGraph.setElementMarkedFlag(midTransition, true);
            };
            inOutGraph.setElementChangedFlag(midTransition, true);
            midTransition.special = true;
            return midTransition;
        } else {
            const midTransitionAdded : [boolean, number, Node] = inOutGraph.addNode('transition', inMidNode.label, inMidNode.x, inMidNode.y);
            if (!(midTransitionAdded[0])) {
                throw new Error('#srv.mnr.tmn.001: ' + 'mid node transformation failed - mid transition could not be added due to conflict with existing node)');
            };
            const midTransition : Node = midTransitionAdded[2];
            if (inMidNode.marked) {
                inOutGraph.setElementMarkedFlag(midTransition, true);
            };
            inOutGraph.setElementChangedFlag(midTransition, true);
            return midTransition;
        };
    };

    private transformEnd(
        inOutGraph : Graph,
        inEndNode : Node,
        inArcWeight : number
    ) : [
        Node,
        Node,
        Node
    ] {
        const endPlaceOneAdded : [boolean, number, Node] = inOutGraph.addNode('place', '', inEndNode.x, (inEndNode.y - Math.ceil(this._graphicsConfig.defaultNodeRadius / 2)));
        if (!(endPlaceOneAdded[0])) {
            throw new Error('#srv.mnr.ten.000: ' + 'end node transformation failed - first end place could not be added due to conflict with existing node)');
        };
        const endPlaceOne : Node = endPlaceOneAdded[2];
        const endTransitionAdded : [boolean, number, Node] = inOutGraph.addNode('transition', inEndNode.label, inEndNode.x, inEndNode.y);
        if (!(endTransitionAdded[0])) {
            throw new Error('#srv.mnr.ten.001: ' + 'end node transformation failed - end transition could not be added due to conflict with existing node)');
        };
        const endTransition : Node = endTransitionAdded[2];
        const endPlaceTwoAdded : [boolean, number, Node] = inOutGraph.addNode('place', '', inEndNode.x, (inEndNode.y + Math.ceil(this._graphicsConfig.defaultNodeRadius / 2)));
        if (!(endPlaceTwoAdded[0])) {
            throw new Error('#srv.mnr.ten.002: ' + 'end node transformation failed - second end place could not be added due to conflict with existing node)');
        };
        const endPlaceTwo : Node = endPlaceTwoAdded[2];
        const endArcOneAdded : [boolean, number, Arc] = inOutGraph.addArc(endPlaceOne, endTransition, inArcWeight);
        if (!(endArcOneAdded[0])) {
            throw new Error('#srv.mnr.ten.003: ' + 'end node transformation failed - arc from first end place to end transition could not be added due to conflict with an existing arc');
        };
        const endArcOne : Arc = endArcOneAdded[2];
        const endArcTwoAdded : [boolean, number, Arc] = inOutGraph.addArc(endTransition, endPlaceTwo, inArcWeight);
        if (!(endArcTwoAdded[0])) {
            throw new Error('#srv.mnr.ten.004: ' + 'end node transformation failed - arc from end transition to second end place could not be added due to conflict with an existing arc');
        };
        const endArcTwo : Arc = endArcTwoAdded[2];
        if (inEndNode.marked) {
            inOutGraph.setElementMarkedFlag(endPlaceOne, true);
            // inOutGraph.setElementMarkedFlag(endArcOne, true);
            inOutGraph.setElementMarkedFlag(endTransition, true);
            // inOutGraph.setElementMarkedFlag(endArcTwo, true);
            inOutGraph.setElementMarkedFlag(endPlaceTwo, true);
        };
        inOutGraph.setElementNewFlag(endPlaceOne, true);
        inOutGraph.setElementNewFlag(endArcOne, true);
        inOutGraph.setElementChangedFlag(endTransition, true);
        inOutGraph.setElementNewFlag(endArcTwo, true);
        inOutGraph.setElementNewFlag(endPlaceTwo, true);
        endTransition.special = true;
        return [endPlaceOne, endTransition, endPlaceTwo]
    };

    private transformStartShort(
        inOutGraph : Graph,
        inStartNode : Node,
        inArcWeight : number
    ) : [
        Node,
        Node
    ] {
        const startPlaceAdded : [boolean, number, Node] = inOutGraph.addNode('place', '', inStartNode.x, (inStartNode.y - Math.ceil(this._graphicsConfig.defaultNodeRadius / 2)));
        if (!(startPlaceAdded[0])) {
            throw new Error('#srv.mnr.tsn.000: ' + 'start node transformation failed - first start place could not be added due to conflict with existing node)');
        };
        const startPlace : Node = startPlaceAdded[2];
        const startTransitionAdded : [boolean, number, Node] = inOutGraph.addNode('transition', inStartNode.label, inStartNode.x, inStartNode.y);
        if (!(startTransitionAdded[0])) {
            throw new Error('#srv.mnr.tsn.001: ' + 'start node transformation failed - start transition could not be added due to conflict with existing node)');
        };
        const startTransition : Node = startTransitionAdded[2];
        const startArcAdded : [boolean, number, Arc] = inOutGraph.addArc(startPlace, startTransition, inArcWeight);
        if (!(startArcAdded[0])) {
            throw new Error('#srv.mnr.tsn.003: ' + 'start node transformation failed - arc from first start place to start transition could not be added due to conflict with an existing arc');
        };
        const startArc : Arc = startArcAdded[2];
        if (inStartNode.marked) {
            inOutGraph.setElementMarkedFlag(startPlace, true);
            // inOutGraph.setElementMarkedFlag(startArc, true);
            inOutGraph.setElementMarkedFlag(startTransition, true);
        };
        inOutGraph.setElementNewFlag(startPlace, true);
        inOutGraph.setElementNewFlag(startArc, true);
        inOutGraph.setElementChangedFlag(startTransition, true);
        startTransition.special = true;
        return [startPlace, startTransition]
    };

    private transformEndShort(
        inOutGraph : Graph,
        inEndNode : Node,
        inArcWeight : number
    ) : [
        Node,
        Node
    ] {
        const endTransitionAdded : [boolean, number, Node] = inOutGraph.addNode('transition', inEndNode.label, inEndNode.x, inEndNode.y);
        if (!(endTransitionAdded[0])) {
            throw new Error('#srv.mnr.ten.001: ' + 'end node transformation failed - end transition could not be added due to conflict with existing node)');
        };
        const endTransition : Node = endTransitionAdded[2];
        const endPlaceAdded : [boolean, number, Node] = inOutGraph.addNode('place', '', inEndNode.x, (inEndNode.y + Math.ceil(this._graphicsConfig.defaultNodeRadius / 2)));
        if (!(endPlaceAdded[0])) {
            throw new Error('#srv.mnr.ten.002: ' + 'end node transformation failed - second end place could not be added due to conflict with existing node)');
        };
        const endPlace : Node = endPlaceAdded[2];
        const endArcAdded : [boolean, number, Arc] = inOutGraph.addArc(endTransition, endPlace, inArcWeight);
        if (!(endArcAdded[0])) {
            throw new Error('#srv.mnr.ten.004: ' + 'end node transformation failed - arc from end transition to second end place could not be added due to conflict with an existing arc');
        };
        const endArc : Arc = endArcAdded[2];
        if (inEndNode.marked) {
            inOutGraph.setElementMarkedFlag(endTransition, true);
            // inOutGraph.setElementMarkedFlag(endArc, true);
            inOutGraph.setElementMarkedFlag(endPlace, true);
        };
        inOutGraph.setElementChangedFlag(endTransition, true);
        inOutGraph.setElementNewFlag(endArc, true);
        inOutGraph.setElementNewFlag(endPlace, true);
        endTransition.special = true;
        return [endTransition, endPlace]
    };

    private transformStartEnd(
        inOutGraph : Graph,
        inStartNode : Node,
        inEndNode : Node,
        inArc : Arc
    ) : [
        Node,
        Node,
        Node,
        Node,
        Node
    ] {
        const startY : number = (inStartNode.y - Math.ceil(this._graphicsConfig.defaultNodeRadius / 2));
        const startPlaceAdded : [boolean, number, Node] = inOutGraph.addNode('place', '', inStartNode.x, startY);
        if (!(startPlaceAdded[0])) {
            throw new Error('#srv.mnr.tse.000: ' + 'start-end transformation failed - start place could not be added due to conflict with existing node)');
        };
        const startPlace : Node = startPlaceAdded[2];
        const startTransitionAdded : [boolean, number, Node] = inOutGraph.addNode('transition', inStartNode.label, inStartNode.x, inStartNode.y);
        if (!(startTransitionAdded[0])) {
            throw new Error('#srv.mnr.tse.001: ' + 'start-end transformation failed - start transition could not be added due to conflict with existing node)');
        };
        const startTransition : Node = startTransitionAdded[2];
        const midX : number = (inArc.sourceX + Math.ceil((inArc.targetX - inArc.sourceX) / 2));
        const midY : number = (inArc.sourceY + Math.ceil((inArc.targetY - inArc.sourceY) / 2));
        const midPlaceAdded : [boolean, number, Node] = inOutGraph.addNode('place', '', midX, midY);
        if (!(midPlaceAdded[0])) {
            throw new Error('#srv.mnr.tse.002: ' + 'start-end transformation failed - mid place could not be added due to conflict with existing node)');
        };
        const midPlace : Node = midPlaceAdded[2];
        const endTransitionAdded : [boolean, number, Node] = inOutGraph.addNode('transition', inEndNode.label, inEndNode.x, inEndNode.y);
        if (!(endTransitionAdded[0])) {
            throw new Error('#srv.mnr.tse.003: ' + 'start-end transformation failed - end transition could not be added due to conflict with existing node)');
        };
        const endTransition : Node = endTransitionAdded[2];
        const endY : number = (inEndNode.y + Math.ceil(this._graphicsConfig.defaultNodeRadius / 2));
        const endPlaceAdded : [boolean, number, Node] = inOutGraph.addNode('place', '', inEndNode.x, endY);
        if (!(endPlaceAdded[0])) {
            throw new Error('#srv.mnr.tse.004: ' + 'start-end transformation failed - end place could not be added due to conflict with existing node)');
        };
        const endPlace : Node = endPlaceAdded[2];
        const startArcAdded : [boolean, number, Arc] = inOutGraph.addArc(startPlace, startTransition, inArc.weight);
        if (!(startArcAdded[0])) {
            throw new Error('#srv.mnr.tse.005: ' + 'start-end transformation failed - arc from start place to start transition could not be added due to conflict with an existing arc');
        };
        const startArc : Arc = startArcAdded[2];
        const midArcOneAdded : [boolean, number, Arc] = inOutGraph.addArc(startTransition, midPlace, inArc.weight);
        if (!(midArcOneAdded[0])) {
            throw new Error('#srv.mnr.tse.006: ' + 'start-end transformation failed - arc from start transition to mid place could not be added due to conflict with an existing arc');
        };
        const midArcOne : Arc = midArcOneAdded[2];
        const midArcTwoAdded : [boolean, number, Arc] = inOutGraph.addArc(midPlace, endTransition, inArc.weight);
        if (!(midArcTwoAdded[0])) {
            throw new Error('#srv.mnr.tse.007: ' + 'start-end transformation failed - arc from mid place to end transition could not be added due to conflict with an existing arc');
        };
        const midArcTwo : Arc = midArcTwoAdded[2];
        const endArcAdded : [boolean, number, Arc] = inOutGraph.addArc(endTransition, endPlace, inArc.weight);
        if (!(endArcAdded[0])) {
            throw new Error('#srv.mnr.tse.008: ' + 'start-end transformation failed - arc from end transition to end place could not be added due to conflict with an existing arc');
        };
        const endArc : Arc = endArcAdded[2];
        if (!(inOutGraph.deleteArc(inArc))) {
            throw new Error('#srv.mnr.tse.009: ' + 'start-end transformation failed - deletion of old arc from start node (support) to end node (support) failed');
        };
        if (inStartNode.marked) {
            inOutGraph.setElementMarkedFlag(startPlace, true);
            // inOutGraph.setElementMarkedFlag(startArc, true);
            inOutGraph.setElementMarkedFlag(startTransition, true);
        };
        if (inEndNode.marked) {
            inOutGraph.setElementMarkedFlag(endTransition, true);
            // inOutGraph.setElementMarkedFlag(endArc, true);
            inOutGraph.setElementMarkedFlag(endPlace, true);
        };
        if (inArc.marked) {
            inOutGraph.setElementMarkedFlag(midArcOne, true);
            // inOutGraph.setElementMarkedFlag(midPlace, true);
            inOutGraph.setElementMarkedFlag(midArcTwo, true);
        };
        inOutGraph.setElementNewFlag(startPlace, true);
        inOutGraph.setElementNewFlag(startArc, true);
        inOutGraph.setElementChangedFlag(startTransition, true);
        inOutGraph.setElementChangedFlag(midArcOne, true);
        inOutGraph.setElementNewFlag(midPlace, true);
        inOutGraph.setElementChangedFlag(midArcTwo, true);
        inOutGraph.setElementChangedFlag(endTransition, true);
        inOutGraph.setElementNewFlag(endArc, true);
        inOutGraph.setElementNewFlag(endPlace, true);
        startTransition.special = true;
        endTransition.special = true;
        return [startPlace, startTransition, midPlace, endTransition, endPlace];
    };

    private initNodesAndArcs(inDfg: DFG, inGraph: Graph){
        inDfg.arcs.forEach(arc => arc.marked = false)
        inDfg.nodes.forEach(node => node.marked = false)
        inGraph.markedNodes = []
        inGraph.markedArcs = []
    }

    private markArcsOfRedoPart(redoSet: Set<Node>, arcs: Arc[], inGraph: Graph): void{
        arcs.filter(arc => {
            const isRelevant = redoSet.has(arc.source) || redoSet.has(arc.target)
            if(isRelevant){
                arc.marked = true
                inGraph.markedArcs.push(arc)
            }
        })
    }

    private findNodesBetweenDuplicatesInArrays<Nodes>(nodesLog: Nodes[][]): Set<Nodes> {
        const resultSet = new Set<Nodes>();
        const duplicateNodes = new Set<Nodes>();

        nodesLog.forEach(nodes => {
            const nodeCounts = new Map<Nodes,number>();

            //count occurrences of each node
            nodes.forEach(node => {
                nodeCounts.set(node,(nodeCounts.get(node) || 0) + 1)
            })

            const seenElements = new Map<Nodes, number>();

            for (let i = 0; i < nodes.length; i++) {
                const node = nodes[i];
                if (nodeCounts.get(node)! > 1) {
                    duplicateNodes.add(node)
                    if (seenElements.has(node)) {
                        const startIndex = seenElements.get(node)!;
                        for (let j = startIndex + 1; j < i; j++) {
                            if (nodeCounts.get(nodes[j]) === 1) {
                                resultSet.add(nodes[j])
                            }
                        }
                    }
                    seenElements.set(node, i)
                }
            }
        })
        duplicateNodes.forEach(node => resultSet.delete(node))
        return resultSet;
    }

};
