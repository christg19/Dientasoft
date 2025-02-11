import { StatusNames, ToothNames } from "./enums/tooth.enum";

export const enumMap = new Map<string, (position: number) => string>([
  ['toothName', toothEnum],
  ['statusName', statusEnum],
]);

export function toothEnum(position: number): string {
  return ToothNames[position] || 'Diente desconocido';
}

export function statusEnum(position: number): string {
  return StatusNames[position] || 'Estado desconocido';
}