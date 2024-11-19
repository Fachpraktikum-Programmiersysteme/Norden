import {Coords} from './coordinates';

export interface JsonGraph {

    supports?: Array<string>,

    events?: Array<string>,

    places?: Array<string>,

    transitions?: Array<string>,

    arcs?: {
        [idPair: string]: number
    },

    labels?: {
        [sId_eId_tId: string]: string
    },

    layout?: {
        [id_idPair: string]: Coords | Array<Coords>
    },

    /* to be removed - start */

    /* fields 'marking' & 'actions' should not be needed */
    
    /* to be removed - end */

    // marking?: {
    //     [pId: string]: number
    // },

    // actions?: Array<string>

};