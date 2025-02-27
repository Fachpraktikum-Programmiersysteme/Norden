import {Coords} from './coordinates';

export interface JsonPetriNet {

    places: Array<string>,

    transitions: Array<string>,

    arcs?: {
        [idPair: string]: number
    },

    actions?: Array<string>,

    labels?: {
        [transitionId: string]: string
    },

    marking?: {
        [placeId: string]: number
    },

    layout?: {
        [idOrIdPair: string]: Coords | Array<Coords>
    }

};