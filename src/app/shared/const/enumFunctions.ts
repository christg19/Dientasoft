import { ToothNames } from "./enums/tooth.enum";

export const enumMap = new Map <string, Function> ([
    ['toothName', toothEnum]
  ])
  
  
  export function toothEnum(position: number){
    return ToothNames[position];
  }