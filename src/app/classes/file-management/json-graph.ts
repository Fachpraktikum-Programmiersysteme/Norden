import {Coords} from './coordinates';

export interface JsonGraph {

    log?: Array<Array<string>>

    supports?: Array<string>,

    events?: Array<string>,

    places?: Array<string>,

    transitions?: Array<string>,

    start?: string,

    end?: string,

    arcs?: {
        [arcID: string]: number
    },

    labels?: {
        [id: string]: string
    },

    layout?: {
        [nodeID_or_arcID: string]: Coords | Array<Coords>
    },

    dfgs?: {
        [dfgID: string]: [string, string, Array<string>, Array<string>, Array<Array<string>>]
    },

    special?: {
        [nodeID: string]: boolean
    },

    marked?: [
        {
            [nodeID: string]: boolean
        },
        {
            [arcID: string]: boolean
        }
    ],

};