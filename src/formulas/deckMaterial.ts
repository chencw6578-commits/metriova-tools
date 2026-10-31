import { CalculationResult } from '../types.js';

export const calculateDeckMaterial = (inputs: Record<string, number>): CalculationResult => {
  const deckLength = inputs.deckLength ?? 12; // feet
  const deckWidth = inputs.deckWidth ?? 16; // feet
  const boardWidth = inputs.boardWidth > 0 ? inputs.boardWidth : 5.5; // inches (nominal 6")
  const boardSpacing = inputs.boardSpacing ?? 0.25; // inches
  const joistSpacing = inputs.joistSpacing > 0 ? inputs.joistSpacing : 16; // inches on center
  const boardLength = inputs.boardLength > 0 ? inputs.boardLength : 16; // feet per board

  const deckArea = deckLength * deckWidth;

  // Effective board width including spacing (guard against zero board width)
  const effectiveBoardWidth = (boardWidth + Math.max(0, boardSpacing)) / 12; // convert to feet
  const safeEffectiveBoardWidth = effectiveBoardWidth > 0 ? effectiveBoardWidth : 0.5;

  // Number of board rows across the deck width
  const boardsAcross = Math.ceil(deckWidth / safeEffectiveBoardWidth);
  // Total linear feet of decking
  const totalLinearFeet = boardsAcross * deckLength;
  // Number of boards needed
  const boardsPerRow = Math.ceil(deckLength / boardLength);
  const boardsNeeded = boardsAcross * boardsPerRow;

  // Number of joists
  const joistCount = Math.ceil((deckLength * 12) / joistSpacing) + 1;

  // Screws needed (approximately 2 screws per board per joist intersection)
  const screwsPerBoard = joistCount * 2;
  const totalScrews = boardsNeeded * screwsPerBoard;
  const screwBoxes = Math.ceil(totalScrews / 350); // typical box has 350 screws

  // Waste factor (typically 10-15%)
  const wastePercent = inputs.wastePercent ?? 10;
  const boardsWithWaste = Math.ceil(boardsNeeded * (1 + wastePercent / 100));

  return {
    summary: {
      deckArea: { label: 'Deck Area (sq ft)', value: deckArea, type: 'number' },
      boardsNeeded: { label: 'Deck Boards Needed (incl. waste)', value: boardsWithWaste, type: 'number' },
      totalLinearFeet: { label: 'Total Linear Feet (incl. waste)', value: Math.ceil(totalLinearFeet * (1 + wastePercent / 100)), type: 'number' },
      joistCount: { label: 'Joists Needed', value: joistCount, type: 'number' },
      totalScrews: { label: 'Screws Needed', value: totalScrews, type: 'number' },
      screwBoxes: { label: 'Screw Boxes (350 ct)', value: screwBoxes, type: 'number' },
    },
    chartData: [
      { name: 'Deck Boards', value: boardsWithWaste },
      { name: 'Joists', value: joistCount },
      { name: 'Screw Boxes', value: screwBoxes },
    ],
  };
};