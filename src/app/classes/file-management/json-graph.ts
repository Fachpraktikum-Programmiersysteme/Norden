import {Coords} from './coordinates';

export interface JsonGraph {

    log?: Array<Array<string>>

    supports?: Array<string>,

    events?: Array<string>,

    places?: Array<string>,

    transitions?: Array<string>,

    arcs?: {
        [arcID: string]: number
    },

    labels?: {
        [id: string]: string
    },

    layout?: {
        [nodeID_or_arcID: string]: Coords | Array<Coords>
    },

    marked?: [
        {
            [nodeID: string]: boolean
        },
        {
            [arcID: string]: boolean
        }
    ],

    dfgs?: [
        {
            [nodeID: string]: string
        },
        {
            [arcID: string]: string
        },
        {
            [dfgID: string]: [string, string, Array<string>, Array<string>]
        }
    ],

};