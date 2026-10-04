import { Person, Relationship } from '../types';

export interface LayoutPersonCard {
  person: Person;
  x: number;
  y: number;
  width: number;
  height: number;
  generation: number;
  partnerIds: string[];
  parentIds: string[];
  childrenIds: string[];
}

export interface PartnerConnection {
  id: string;
  p1Id: string;
  p2Id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  midX: number;
  midY: number;
}

export interface BranchConnection {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  path: string;
  fromPersonId: string;
  toPersonId: string;
}

export interface FamilyTreeLayout {
  cards: LayoutPersonCard[];
  partnerConnections: PartnerConnection[];
  branchConnections: BranchConnection[];
  bounds: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    width: number;
    height: number;
  };
}

const CARD_WIDTH = 220;
const CARD_HEIGHT = 110;
const SPOUSE_GAP = 40;
const SIBLING_GAP = 50;
const GENERATION_GAP = 140;

export function computeFamilyTreeLayout(
  people: Person[],
  relationships: Relationship[]
): FamilyTreeLayout {
  if (people.length === 0) {
    return {
      cards: [],
      partnerConnections: [],
      branchConnections: [],
      bounds: { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 },
    };
  }

  const peopleMap = new Map<string, Person>();
  people.forEach((p) => peopleMap.set(p.id, p));

  // Build relational graphs
  const parentsOf = new Map<string, string[]>(); // childId -> parentIds
  const childrenOf = new Map<string, string[]>(); // parentId -> childIds
  const partnersOf = new Map<string, string[]>(); // personId -> partnerIds

  people.forEach((p) => {
    parentsOf.set(p.id, []);
    childrenOf.set(p.id, []);
    partnersOf.set(p.id, []);
  });

  relationships.forEach((rel) => {
    if (rel.relationship_type === 'parent') {
      if (peopleMap.has(rel.person_id) && peopleMap.has(rel.related_person_id)) {
        parentsOf.get(rel.related_person_id)?.push(rel.person_id);
        childrenOf.get(rel.person_id)?.push(rel.related_person_id);
      }
    } else if (rel.relationship_type === 'partner') {
      if (peopleMap.has(rel.person_id) && peopleMap.has(rel.related_person_id)) {
        if (!partnersOf.get(rel.person_id)?.includes(rel.related_person_id)) {
          partnersOf.get(rel.person_id)?.push(rel.related_person_id);
        }
        if (!partnersOf.get(rel.related_person_id)?.includes(rel.person_id)) {
          partnersOf.get(rel.related_person_id)?.push(rel.person_id);
        }
      }
    }
  });

  // Calculate generation depths
  const generationDepth = new Map<string, number>();

  // Find root ancestors (people with 0 parents)
  // Give priority to Giovanni Bresciani / Teresa Vavassori if present
  function getPersonDepth(personId: string, visited: Set<string> = new Set()): number {
    if (visited.has(personId)) return 0;
    visited.add(personId);

    const parents = parentsOf.get(personId) || [];
    if (parents.length === 0) return 0;

    let maxParentDepth = 0;
    for (const pId of parents) {
      maxParentDepth = Math.max(maxParentDepth, getPersonDepth(pId, new Set(visited)) + 1);
    }
    return maxParentDepth;
  }

  people.forEach((p) => {
    generationDepth.set(p.id, getPersonDepth(p.id));
  });

  // Align partner generations so spouses are on the exact same vertical level
  for (let iter = 0; iter < 3; iter++) {
    relationships
      .filter((r) => r.relationship_type === 'partner')
      .forEach((r) => {
        const d1 = generationDepth.get(r.person_id) ?? 0;
        const d2 = generationDepth.get(r.related_person_id) ?? 0;
        const maxD = Math.max(d1, d2);
        generationDepth.set(r.person_id, maxD);
        generationDepth.set(r.related_person_id, maxD);
      });
  }

  // Find root family units
  // An atomic family unit is either:
  // - A couple (partner1, partner2) and their shared children
  // - A single person and their children
  const placedPeople = new Set<string>();
  const cardPositions = new Map<string, { x: number; y: number }>();

  // Group root people (generation 0 or minimum parents)
  // Let's sort roots to put Giovanni Bresciani & Teresa Vavassori first
  const rootPeople = people.filter((p) => (parentsOf.get(p.id) || []).length === 0);
  rootPeople.sort((a, b) => {
    const isBrescianiA = (a.last_name || '').toLowerCase().includes('bresciani') || (a.last_name || '').toLowerCase().includes('vavassori');
    const isBrescianiB = (b.last_name || '').toLowerCase().includes('bresciani') || (b.last_name || '').toLowerCase().includes('vavassori');
    if (isBrescianiA && !isBrescianiB) return -1;
    if (!isBrescianiA && isBrescianiB) return 1;
    const yearA = a.birth_date ? parseInt(a.birth_date.slice(0, 4)) : 9999;
    const yearB = b.birth_date ? parseInt(b.birth_date.slice(0, 4)) : 9999;
    return yearA - yearB;
  });

  interface SubtreeLayout {
    width: number;
    centerX: number; // Midpoint of primary node / couple
  }

  // Recursive layout for a person and their descendants
  function layoutPersonSubtree(personId: string, startX: number, startY: number): SubtreeLayout {
    if (placedPeople.has(personId)) {
      const pos = cardPositions.get(personId);
      return { width: CARD_WIDTH, centerX: pos ? pos.x + CARD_WIDTH / 2 : startX + CARD_WIDTH / 2 };
    }

    placedPeople.add(personId);
    const partners = (partnersOf.get(personId) || []).filter(pId => !placedPeople.has(pId));
    
    // Check all children of this person
    const myChildren = (childrenOf.get(personId) || []).slice();
    // Sort children by birth date
    myChildren.sort((aId, bId) => {
      const a = peopleMap.get(aId);
      const b = peopleMap.get(bId);
      const yearA = a?.birth_date ? a.birth_date : '9999';
      const yearB = b?.birth_date ? b.birth_date : '9999';
      return yearA.localeCompare(yearB);
    });

    // Mark partners as placed too
    partners.forEach(pId => placedPeople.add(pId));

    // Calculate width of this couple / node unit
    const numPartners = partners.length;
    const coupleWidth = CARD_WIDTH * (1 + numPartners) + SPOUSE_GAP * numPartners;

    // Layout children recursively
    let childrenTotalWidth = 0;
    const childLayouts: { childId: string; layout: SubtreeLayout; x: number }[] = [];

    if (myChildren.length > 0) {
      let currentChildX = startX;
      for (const childId of myChildren) {
        if (!placedPeople.has(childId)) {
          const childLayout = layoutPersonSubtree(
            childId,
            currentChildX,
            startY + CARD_HEIGHT + GENERATION_GAP
          );
          childLayouts.push({ childId, layout: childLayout, x: currentChildX });
          currentChildX += childLayout.width + SIBLING_GAP;
        }
      }
      if (childLayouts.length > 0) {
        childrenTotalWidth = currentChildX - startX - SIBLING_GAP;
      }
    }

    // Determine final width and positions
    const totalSubtreeWidth = Math.max(coupleWidth, childrenTotalWidth);

    let coupleStartX = startX;
    if (childrenTotalWidth > coupleWidth) {
      // Center the couple above the children
      coupleStartX = startX + (childrenTotalWidth - coupleWidth) / 2;
    } else if (coupleWidth > childrenTotalWidth && childLayouts.length > 0) {
      // Shift children to center under couple
      const childOffset = (coupleWidth - childrenTotalWidth) / 2;
      childLayouts.forEach((item) => {
        item.x += childOffset;
        shiftSubtree(item.childId, childOffset);
      });
    }

    // Position primary person
    cardPositions.set(personId, { x: coupleStartX, y: startY });

    // Position partners side-by-side
    let currentPartnerX = coupleStartX + CARD_WIDTH + SPOUSE_GAP;
    partners.forEach((pId) => {
      cardPositions.set(pId, { x: currentPartnerX, y: startY });
      currentPartnerX += CARD_WIDTH + SPOUSE_GAP;
    });

    const coupleCenterX = coupleStartX + coupleWidth / 2;

    return {
      width: totalSubtreeWidth,
      centerX: coupleCenterX,
    };
  }

  function shiftSubtree(personId: string, offsetX: number) {
    const pos = cardPositions.get(personId);
    if (pos) {
      pos.x += offsetX;
    }
    const partners = partnersOf.get(personId) || [];
    partners.forEach((pId) => {
      const pPos = cardPositions.get(pId);
      if (pPos) pPos.x += offsetX;
    });
    const children = childrenOf.get(personId) || [];
    children.forEach((cId) => shiftSubtree(cId, offsetX));
  }

  // Run layout for all root units
  let currentTreeX = 50;
  const START_Y = 60;

  rootPeople.forEach((root) => {
    if (!placedPeople.has(root.id)) {
      const subtree = layoutPersonSubtree(root.id, currentTreeX, START_Y);
      currentTreeX += subtree.width + SIBLING_GAP * 2;
    }
  });

  // If any stray person remains unplaced (e.g. disconnected nodes), place them in a bottom row
  people.forEach((p) => {
    if (!placedPeople.has(p.id)) {
      cardPositions.set(p.id, { x: currentTreeX, y: START_Y });
      currentTreeX += CARD_WIDTH + SIBLING_GAP;
      placedPeople.add(p.id);
    }
  });

  // Prepare result cards
  const cards: LayoutPersonCard[] = people.map((p) => {
    const pos = cardPositions.get(p.id) || { x: 0, y: 0 };
    return {
      person: p,
      x: pos.x,
      y: pos.y,
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      generation: generationDepth.get(p.id) ?? 0,
      partnerIds: partnersOf.get(p.id) || [],
      parentIds: parentsOf.get(p.id) || [],
      childrenIds: childrenOf.get(p.id) || [],
    };
  });

  // Generate Partner connections
  const partnerConnections: PartnerConnection[] = [];
  const processedPartnerPairs = new Set<string>();

  relationships
    .filter((r) => r.relationship_type === 'partner')
    .forEach((r) => {
      const pairKey = [r.person_id, r.related_person_id].sort().join('_');
      if (!processedPartnerPairs.has(pairKey)) {
        processedPartnerPairs.add(pairKey);
        const card1 = cards.find((c) => c.person.id === r.person_id);
        const card2 = cards.find((c) => c.person.id === r.related_person_id);

        if (card1 && card2) {
          // Identify left and right card
          const [leftCard, rightCard] = card1.x < card2.x ? [card1, card2] : [card2, card1];
          const x1 = leftCard.x + leftCard.width;
          const y1 = leftCard.y + leftCard.height / 2;
          const x2 = rightCard.x;
          const y2 = rightCard.y + rightCard.height / 2;

          partnerConnections.push({
            id: `partner_${pairKey}`,
            p1Id: leftCard.person.id,
            p2Id: rightCard.person.id,
            x1,
            y1,
            x2,
            y2,
            midX: (x1 + x2) / 2,
            midY: (y1 + y2) / 2,
          });
        }
      }
    });

  // Generate Parent-to-Child branch connections
  const branchConnections: BranchConnection[] = [];
  const processedChildParents = new Set<string>();

  // Group children by their set of parents
  const familyClusters = new Map<string, { parentIds: string[]; childIds: string[] }>();

  people.forEach((p) => {
    const parents = parentsOf.get(p.id) || [];
    if (parents.length > 0) {
      const clusterKey = parents.slice().sort().join('_');
      if (!familyClusters.has(clusterKey)) {
        familyClusters.set(clusterKey, { parentIds: parents, childIds: [] });
      }
      familyClusters.get(clusterKey)?.childIds.push(p.id);
    }
  });

  familyClusters.forEach((cluster, key) => {
    const parentCards = cluster.parentIds
      .map((id) => cards.find((c) => c.person.id === id))
      .filter((c): c is LayoutPersonCard => Boolean(c));

    if (parentCards.length === 0) return;

    // Calculate source point (bottom center of parents)
    let sourceX = 0;
    let sourceY = 0;

    if (parentCards.length === 1) {
      sourceX = parentCards[0].x + parentCards[0].width / 2;
      sourceY = parentCards[0].y + parentCards[0].height;
    } else {
      // Midpoint between the parents
      const minX = Math.min(...parentCards.map((c) => c.x));
      const maxX = Math.max(...parentCards.map((c) => c.x + c.width));
      sourceX = (minX + maxX) / 2;
      sourceY = parentCards[0].y + parentCards[0].height / 2; // From partner connector junction
    }

    // Children cards
    const childCards = cluster.childIds
      .map((id) => cards.find((c) => c.person.id === id))
      .filter((c): c is LayoutPersonCard => Boolean(c));

    if (childCards.length === 0) return;

    // Sibling bus Y level (midway between parent bottom and child top)
    const minYChild = Math.min(...childCards.map((c) => c.y));
    const busY = sourceY + (minYChild - sourceY) / 2;

    childCards.forEach((childCard) => {
      const targetX = childCard.x + childCard.width / 2;
      const targetY = childCard.y;

      // SVG path: Down to busY, across to child X, down to child top
      const path = `M ${sourceX} ${sourceY} L ${sourceX} ${busY} L ${targetX} ${busY} L ${targetX} ${targetY}`;

      branchConnections.push({
        id: `branch_${key}_${childCard.person.id}`,
        sourceX,
        sourceY,
        targetX,
        targetY,
        path,
        fromPersonId: cluster.parentIds[0],
        toPersonId: childCard.person.id,
      });
    });
  });

  // Calculate overall bounds with padding
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  cards.forEach((c) => {
    minX = Math.min(minX, c.x);
    minY = Math.min(minY, c.y);
    maxX = Math.max(maxX, c.x + c.width);
    maxY = Math.max(maxY, c.y + c.height);
  });

  if (minX === Infinity) {
    minX = 0;
    minY = 0;
    maxX = 800;
    maxY = 600;
  }

  return {
    cards,
    partnerConnections,
    branchConnections,
    bounds: {
      minX,
      minY,
      maxX,
      maxY,
      width: maxX - minX,
      height: maxY - minY,
    },
  };
}
