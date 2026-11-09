import type { Build, PartBySlot, SlotId } from '../types/vehicle'

export const PART_CATALOG: { [K in SlotId]: readonly PartBySlot[K][] } = {
  chassis: [
    {
      id: 'scout',
      slot: 'chassis',
      style: 'scout',
      name: 'Scout S-1',
      description: 'Легка розвідувальна платформа на 4 колесах. Швидка, але крихка.',
      mass: 6,
      size: [1.5, 0.45, 2.2],
      wheelPairs: 2,
      enginePower: 70,
      armor: 25,
    },
    {
      id: 'pathfinder',
      slot: 'chassis',
      style: 'pathfinder',
      name: 'Pathfinder P-6',
      description: 'Збалансована 6-колісна платформа з повноповоротною рамою.',
      mass: 9,
      size: [1.7, 0.55, 2.7],
      wheelPairs: 3,
      enginePower: 105,
      armor: 55,
    },
    {
      id: 'titan',
      slot: 'chassis',
      style: 'titan',
      name: 'Titan T-9',
      description: 'Важкий броньований вантажник з потужним RTG-генератором.',
      mass: 14,
      size: [2.0, 0.7, 3.0],
      wheelPairs: 3,
      enginePower: 150,
      armor: 90,
    },
  ],
  wheels: [
    {
      id: 'tread',
      slot: 'wheels',
      style: 'tread',
      name: 'Регольові протектори',
      description: 'Універсальні колеса з глибоким протектором.',
      mass: 0.5,
      radius: 0.38,
      width: 0.3,
      frictionSlip: 3.2,
      suspensionStiffness: 28,
      suspensionTravel: 0.25,
    },
    {
      id: 'mesh',
      slot: 'wheels',
      style: 'mesh',
      name: 'Сітчасті колеса',
      description: 'Легкі пружні колеса з титанової сітки, як у Apollo LRV.',
      mass: 0.3,
      radius: 0.44,
      width: 0.26,
      frictionSlip: 2.4,
      suspensionStiffness: 22,
      suspensionTravel: 0.35,
    },
    {
      id: 'spike',
      slot: 'wheels',
      style: 'spike',
      name: 'Шиповані траки',
      description: 'Максимальне зчеплення на кам’янистих схилах.',
      mass: 0.8,
      radius: 0.42,
      width: 0.36,
      frictionSlip: 4.5,
      suspensionStiffness: 34,
      suspensionTravel: 0.2,
    },
  ],
  sensor: [
    {
      id: 'mast',
      slot: 'sensor',
      style: 'mast',
      name: 'Стерео-щогла',
      description: 'Висока щогла з парою навігаційних камер.',
      mass: 0.6,
      scanRange: 60,
    },
    {
      id: 'dome',
      slot: 'sensor',
      style: 'dome',
      name: 'Панорамний купол',
      description: 'Компактний 360° сенсорний купол.',
      mass: 0.4,
      scanRange: 40,
    },
    {
      id: 'lidar',
      slot: 'sensor',
      style: 'lidar',
      name: 'LIDAR-масив',
      description: 'Обертовий лазерний сканер для побудови 3D-мап.',
      mass: 1.0,
      scanRange: 95,
    },
  ],
  tool: [
    {
      id: 'none',
      slot: 'tool',
      style: 'none',
      name: 'Без інструмента',
      description: 'Мінімальна маса — максимальна швидкість.',
      mass: 0,
      utility: 0,
    },
    {
      id: 'arm',
      slot: 'tool',
      style: 'arm',
      name: 'Маніпулятор',
      description: 'Триланковий робот-маніпулятор для збору зразків.',
      mass: 1.2,
      utility: 60,
    },
    {
      id: 'drill',
      slot: 'tool',
      style: 'drill',
      name: 'Керновий бур',
      description: 'Бур для відбору глибинних проб ґрунту.',
      mass: 1.8,
      utility: 75,
    },
    {
      id: 'laser',
      slot: 'tool',
      style: 'laser',
      name: 'Плазмовий різак',
      description: 'Експериментальна гармата-різак для розчищення завалів.',
      mass: 2.2,
      utility: 90,
    },
  ],
}

export const SLOT_ORDER: readonly SlotId[] = ['chassis', 'wheels', 'sensor', 'tool']

export const SLOT_LABELS: Record<SlotId, string> = {
  chassis: 'Корпус',
  wheels: 'Колеса',
  sensor: 'Сенсори',
  tool: 'Інструмент',
}

export const DEFAULT_BUILD: Build = {
  chassis: 'pathfinder',
  wheels: 'tread',
  sensor: 'mast',
  tool: 'arm',
}

export function listParts<K extends SlotId>(slot: K): readonly PartBySlot[K][] {
  return PART_CATALOG[slot]
}

/** Looks a part up by id, falling back to the first catalog entry for unknown ids. */
export function getPart<K extends SlotId>(slot: K, id: string): PartBySlot[K] {
  const parts = PART_CATALOG[slot]
  const found = parts.find((part) => part.id === id) ?? parts[0]
  if (!found) throw new Error(`Catalog slot "${slot}" is empty`)
  return found
}

export function isKnownPart(slot: SlotId, id: string): boolean {
  return PART_CATALOG[slot].some((part) => part.id === id)
}
