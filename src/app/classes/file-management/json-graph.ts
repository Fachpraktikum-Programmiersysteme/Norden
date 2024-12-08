import {Coords} from './coordinates';

export interface JsonGraph {

    log?: Array<Array<string>>

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

};