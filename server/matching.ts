import { Report, Match, MatchLevel, db } from './db.js';

interface MatchResult {
  score: number;
  level: MatchLevel;
  reasons: string[];
}

function cleanStr(s?: string | null): string {
  if (!s) return '';
  return s.trim().toLowerCase();
}

function isUnknown(val?: string | null): boolean {
  if (!val) return true;
  const clean = cleanStr(val);
  return (
    clean === '' || 
    clean === 'unknown' || 
    clean === "i don't know" || 
    clean === 'dont know' || 
    clean === 'not sure' ||
    clean === 'n/a' ||
    clean === 'not applicable' ||
    clean === 'none'
  );
}

function textSimilarity(a: string, b: string): number {
  const cleanA = cleanStr(a);
  const cleanB = cleanStr(b);
  if (!cleanA || !cleanB) return 0;
  if (cleanA === cleanB) return 1.0;
  if (cleanA.includes(cleanB) || cleanB.includes(cleanA)) return 0.8;
  
  // Word overlap
  const wordsA = new Set(cleanA.split(/\W+/).filter(w => w.length > 2));
  const wordsB = new Set(cleanB.split(/\W+/).filter(w => w.length > 2));
  if (wordsA.size === 0 || wordsB.size === 0) return 0;
  
  let common = 0;
  wordsA.forEach(w => {
    if (wordsB.has(w)) common++;
  });
  
  return common / Math.max(wordsA.size, wordsB.size);
}

export function calculateMatchScore(lost: Report, found: Report): MatchResult {
  let score = 0;
  const reasons: string[] = [];

  // 1. Category / Item Type (15%)
  const lostCat = cleanStr(lost.category);
  const foundCat = cleanStr(found.category);
  const lostItem = cleanStr(lost.itemType);
  const foundItem = cleanStr(found.itemType);

  if (!isUnknown(lostCat) && !isUnknown(foundCat) && lostCat === foundCat) {
    if (!isUnknown(lostItem) && !isUnknown(foundItem) && lostItem === foundItem) {
      score += 15;
      reasons.push(`✓ Same item type: ${lost.itemType}`);
    } else if (textSimilarity(lostItem, foundItem) >= 0.5) {
      score += 12;
      reasons.push(`✓ Similar item type: ${lost.itemType} / ${found.itemType}`);
    } else {
      score += 6;
      reasons.push(`✓ Same general category: ${lost.category}`);
    }
  } else if (!isUnknown(lostItem) && !isUnknown(foundItem) && lostItem === foundItem) {
    score += 15;
    reasons.push(`✓ Same item type: ${lost.itemType}`);
  }

  // 2. Brand (10%)
  const lostBrand = cleanStr(lost.brand);
  const foundBrand = cleanStr(found.brand);
  if (!isUnknown(lostBrand) && !isUnknown(foundBrand)) {
    if (lostBrand === foundBrand) {
      score += 10;
      reasons.push(`✓ Same brand: ${lost.brand}`);
    } else if (lostBrand.includes(foundBrand) || foundBrand.includes(lostBrand)) {
      score += 7;
      reasons.push(`✓ Matching brand: ${lost.brand}`);
    }
  }

  // 3. Model (10%)
  const lostModel = cleanStr(lost.model);
  const foundModel = cleanStr(found.model);
  if (!isUnknown(lostModel) && !isUnknown(foundModel)) {
    if (lostModel === foundModel) {
      score += 10;
      reasons.push(`✓ Exact model match: ${lost.model}`);
    } else {
      const sim = textSimilarity(lostModel, foundModel);
      if (sim >= 0.7) {
        score += 8;
        reasons.push(`✓ Very close model: ${lost.model} / ${found.model}`);
      } else if (sim >= 0.4) {
        score += 5;
        reasons.push(`✓ Similar model family`);
      }
    }
  }

  // 4. Colour (8%)
  const lostColour = cleanStr(lost.colour);
  const foundColour = cleanStr(found.colour);
  if (!isUnknown(lostColour) && !isUnknown(foundColour)) {
    if (lostColour === foundColour) {
      score += 8;
      reasons.push(`✓ Identical colour: ${lost.colour}`);
    } else if (lostColour.includes(foundColour) || foundColour.includes(lostColour)) {
      score += 6;
      reasons.push(`✓ Similar colour: ${lost.colour}`);
    }
  }

  // 5. Physical Features (15%)
  const lostMarks = cleanStr(lost.physicalMarks);
  const foundMarks = cleanStr(found.physicalMarks);
  const lostLock = cleanStr(lost.lockType);
  const foundLock = cleanStr(found.lockType);

  let physScore = 0;
  if (!isUnknown(lostMarks) && !isUnknown(foundMarks)) {
    const markSim = textSimilarity(lostMarks, foundMarks);
    if (markSim >= 0.5) {
      physScore += 10;
      reasons.push(`✓ Matching physical marks/scratches`);
    } else if (markSim >= 0.25) {
      physScore += 6;
      reasons.push(`✓ Corroborating physical descriptions`);
    }
  }
  // Lock type match for devices
  if (!isUnknown(lostLock) && !isUnknown(foundLock) && lostLock !== 'not applicable') {
    if (lostLock === foundLock) {
      physScore += 5;
      reasons.push(`✓ Same security lock type: ${lost.lockType}`);
    }
  }
  score += Math.min(15, physScore);

  // 6. Case / Accessories (8%)
  let caseScore = 0;
  const lostCaseCol = cleanStr(lost.caseColour);
  const foundCaseCol = cleanStr(found.caseColour);
  const lostCaseDes = cleanStr(lost.caseDesign);
  const foundCaseDes = cleanStr(found.caseDesign);
  const lostAcc = cleanStr(lost.accessories);
  const foundAcc = cleanStr(found.accessories);

  if (!isUnknown(lostCaseCol) && !isUnknown(foundCaseCol) && lostCaseCol === foundCaseCol) {
    caseScore += 4;
    reasons.push(`✓ Matching cover/case colour: ${lost.caseColour}`);
  }
  if (!isUnknown(lostCaseDes) && !isUnknown(foundCaseDes)) {
    if (textSimilarity(lostCaseDes, foundCaseDes) >= 0.4) {
      caseScore += 2;
      reasons.push(`✓ Matching case design/stickers`);
    }
  }
  if (!isUnknown(lostAcc) && !isUnknown(foundAcc)) {
    if (textSimilarity(lostAcc, foundAcc) >= 0.4) {
      caseScore += 2;
      reasons.push(`✓ Matching accessories`);
    }
  }
  score += Math.min(8, caseScore);

  // 7. Location (12%)
  const lostLoc = cleanStr(lost.location);
  const foundLoc = cleanStr(found.location);
  if (!isUnknown(lostLoc) && !isUnknown(foundLoc)) {
    if (lostLoc === foundLoc) {
      score += 12;
      reasons.push(`✓ Exact location match: ${lost.location}`);
    } else {
      const locSim = textSimilarity(lostLoc, foundLoc);
      if (locSim >= 0.5) {
        score += 9;
        reasons.push(`✓ Nearby/matching location: ${lost.location}`);
      } else if (locSim >= 0.2) {
        score += 5;
        reasons.push(`✓ Location in same general zone`);
      }
    }
  }

  // 8. Date / Time (8%)
  const lostDate = cleanStr(lost.dateLostFound);
  const foundDate = cleanStr(found.dateLostFound);
  const lostTime = cleanStr(lost.approxTime);
  const foundTime = cleanStr(found.approxTime);

  let dateTimeScore = 0;
  if (!isUnknown(lostDate) && !isUnknown(foundDate)) {
    if (lostDate === foundDate) {
      dateTimeScore += 5;
      reasons.push(`✓ Reported for the same date`);
    } else {
      // Check for proximity (e.g. today vs yesterday or nearby dates)
      dateTimeScore += 2;
    }
  }
  if (!isUnknown(lostTime) && !isUnknown(foundTime)) {
    if (textSimilarity(lostTime, foundTime) >= 0.5 || lostTime === foundTime) {
      dateTimeScore += 3;
      reasons.push(`✓ Matching time frame`);
    }
  }
  score += Math.min(8, dateTimeScore);

  // 9. Image Similarity (9%)
  // Check image analysis attributes if both uploaded photos
  if (lost.imageAnalysis && found.imageAnalysis) {
    let imgScore = 0;
    if (lost.imageAnalysis.colour && found.imageAnalysis.colour && 
        cleanStr(lost.imageAnalysis.colour) === cleanStr(found.imageAnalysis.colour)) {
      imgScore += 4;
    }
    if (lost.imageAnalysis.brand && found.imageAnalysis.brand && 
        cleanStr(lost.imageAnalysis.brand) === cleanStr(found.imageAnalysis.brand)) {
      imgScore += 3;
    }
    if (lost.imageAnalysis.marks && found.imageAnalysis.marks && 
        textSimilarity(lost.imageAnalysis.marks, found.imageAnalysis.marks) >= 0.3) {
      imgScore += 2;
    }
    if (imgScore > 0) {
      score += Math.min(9, imgScore);
      reasons.push(`✓ Image analysis confirms visual correlation`);
    }
  } else if (lost.imageUrl && found.imageUrl) {
    // Both have images uploaded
    score += 3;
    reasons.push(`✓ Photos available for visual verification`);
  }

  // 10. Unique Details (5%)
  const lostUnique = cleanStr(lost.safeUniqueDetails);
  const foundUnique = cleanStr(found.safeUniqueDetails);
  if (!isUnknown(lostUnique) && !isUnknown(foundUnique)) {
    const uSim = textSimilarity(lostUnique, foundUnique);
    if (uSim >= 0.4) {
      score += 5;
      reasons.push(`✓ Unique identifying traits match`);
    } else if (uSim >= 0.2) {
      score += 3;
      reasons.push(`✓ Some unique details align`);
    }
  }

  // 11. Item-Specific Dynamic Attributes Match (e.g. Department on ID card, Key count, Wallet material)
  if (lost.itemAttributes && found.itemAttributes) {
    const lostAttr = lost.itemAttributes;
    const foundAttr = found.itemAttributes;

    // College ID Card
    if (lostAttr.department && foundAttr.department && !isUnknown(lostAttr.department) && !isUnknown(foundAttr.department)) {
      if (cleanStr(lostAttr.department) === cleanStr(foundAttr.department)) {
        score += 8;
        reasons.push(`✓ Same department: ${lostAttr.department}`);
      }
    }
    if (lostAttr.studentName && foundAttr.studentName && !isUnknown(lostAttr.studentName) && !isUnknown(foundAttr.studentName)) {
      if (textSimilarity(lostAttr.studentName, foundAttr.studentName) >= 0.6) {
        score += 15;
        reasons.push(`✓ Matching student name on card`);
      }
    }
    if (lostAttr.institutionName && foundAttr.institutionName && !isUnknown(lostAttr.institutionName) && !isUnknown(foundAttr.institutionName)) {
      if (textSimilarity(lostAttr.institutionName, foundAttr.institutionName) >= 0.4) {
        score += 6;
        reasons.push(`✓ Same institution name`);
      }
    }

    // Keys
    if (lostAttr.keyType && foundAttr.keyType && !isUnknown(lostAttr.keyType) && !isUnknown(foundAttr.keyType)) {
      if (cleanStr(lostAttr.keyType) === cleanStr(foundAttr.keyType)) {
        score += 8;
        reasons.push(`✓ Matching key type: ${lostAttr.keyType}`);
      }
    }
    if (lostAttr.keychainType && foundAttr.keychainType && !isUnknown(lostAttr.keychainType) && !isUnknown(foundAttr.keychainType)) {
      if (cleanStr(lostAttr.keychainType) === cleanStr(foundAttr.keychainType)) {
        score += 6;
        reasons.push(`✓ Matching keychain type: ${lostAttr.keychainType}`);
      }
    }
    if (lostAttr.keychainDesign && foundAttr.keychainDesign && !isUnknown(lostAttr.keychainDesign) && !isUnknown(foundAttr.keychainDesign)) {
      if (textSimilarity(lostAttr.keychainDesign, foundAttr.keychainDesign) >= 0.3) {
        score += 8;
        reasons.push(`✓ Matching keychain design/logo`);
      }
    }

    // Wallet
    if (lostAttr.walletType && foundAttr.walletType && !isUnknown(lostAttr.walletType) && !isUnknown(foundAttr.walletType)) {
      if (cleanStr(lostAttr.walletType) === cleanStr(foundAttr.walletType)) {
        score += 7;
        reasons.push(`✓ Same wallet style: ${lostAttr.walletType}`);
      }
    }
    if (lostAttr.material && foundAttr.material && !isUnknown(lostAttr.material) && !isUnknown(foundAttr.material)) {
      if (cleanStr(lostAttr.material) === cleanStr(foundAttr.material)) {
        score += 6;
        reasons.push(`✓ Matching material: ${lostAttr.material}`);
      }
    }

    // Bag
    if (lostAttr.bagType && foundAttr.bagType && !isUnknown(lostAttr.bagType) && !isUnknown(foundAttr.bagType)) {
      if (cleanStr(lostAttr.bagType) === cleanStr(foundAttr.bagType)) {
        score += 8;
        reasons.push(`✓ Matching bag classification: ${lostAttr.bagType}`);
      }
    }

    // Charger
    if (lostAttr.chargerType && foundAttr.chargerType && !isUnknown(lostAttr.chargerType) && !isUnknown(foundAttr.chargerType)) {
      if (cleanStr(lostAttr.chargerType) === cleanStr(foundAttr.chargerType)) {
        score += 10;
        reasons.push(`✓ Matching charger type`);
      }
    }

    // Power Bank
    if (lostAttr.capacity && foundAttr.capacity && !isUnknown(lostAttr.capacity) && !isUnknown(foundAttr.capacity)) {
      if (cleanStr(lostAttr.capacity) === cleanStr(foundAttr.capacity)) {
        score += 8;
        reasons.push(`✓ Matching battery capacity: ${lostAttr.capacity}`);
      }
    }

    // Earbuds
    if (lostAttr.earbudsPart && foundAttr.earbudsPart && !isUnknown(lostAttr.earbudsPart) && !isUnknown(foundAttr.earbudsPart)) {
      if (cleanStr(lostAttr.earbudsPart) === cleanStr(foundAttr.earbudsPart)) {
        score += 8;
        reasons.push(`✓ Matching earbud components/configuration`);
      }
    }

    // Smart Watch
    if (lostAttr.strapColour && foundAttr.strapColour && !isUnknown(lostAttr.strapColour) && !isUnknown(foundAttr.strapColour)) {
      if (cleanStr(lostAttr.strapColour) === cleanStr(foundAttr.strapColour)) {
        score += 6;
        reasons.push(`✓ Matching watch strap colour`);
      }
    }
  }

  // Clamp strictly between 0 and 100
  const finalScore = Math.max(0, Math.min(100, Math.round(score)));

  let level: MatchLevel;
  if (finalScore >= 90) {
    level = 'STRONG MATCH';
  } else if (finalScore >= 75) {
    level = 'HIGH PROBABILITY';
  } else if (finalScore >= 60) {
    level = 'POSSIBLE MATCH';
  } else if (finalScore >= 50) {
    level = 'POTENTIAL MATCH';
  } else {
    level = 'LOW PROBABILITY';
  }

  if (reasons.length === 0) {
    reasons.push('Low correlation between reports');
  }

  return {
    score: finalScore,
    level,
    reasons,
  };
}

/**
 * Triggers matching whenever a report is created or updated.
 * Compares: New Lost -> Active Found, or New Found -> Active Lost.
 * Prevents duplicates (upserts match record for lostReportId + foundReportId).
 */
export function triggerMatchingForReport(report: Report): Match[] {
  const generatedMatches: Match[] = [];

  const candidateType = report.type === 'LOST' ? 'FOUND' : 'LOST';
  const candidates = db.getActiveReportsByType(candidateType);

  for (const candidate of candidates) {
    // Don't match the same user's own items if tested, but in real case user A lost, user B found
    if (candidate.id === report.id) continue;

    const lostReport = report.type === 'LOST' ? report : candidate;
    const foundReport = report.type === 'FOUND' ? report : candidate;

    // Check if duplicate match already exists
    const existingMatch = db.getMatchByPair(lostReport.id, foundReport.id);

    const { score, level, reasons } = calculateMatchScore(lostReport, foundReport);

    // Only record match if score > 0
    if (score > 0) {
      const matchId = existingMatch ? existingMatch.id : `match_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const contactAvailable = score >= 50;

      const match: Match = {
        id: matchId,
        lostReportId: lostReport.id,
        foundReportId: foundReport.id,
        lostCaseId: lostReport.caseId,
        foundCaseId: foundReport.caseId,
        lostUserId: lostReport.userId,
        foundUserId: foundReport.userId,
        score,
        level,
        reasons,
        contactAvailable,
        status: existingMatch ? existingMatch.status : 'PENDING',
        createdAt: existingMatch ? existingMatch.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      db.saveMatch(match);
      generatedMatches.push(match);

      // Create notifications if this is a newly found or updated high probability match
      if (!existingMatch || existingMatch.score !== score) {
        const notifType = score >= 75 ? 'HIGH_PROBABILITY_MATCH' : (contactAvailable ? 'CONTACT_AVAILABLE' : 'POSSIBLE_MATCH');
        
        // Notify Lost owner
        db.addNotification({
          id: `notif_${Date.now()}_lost`,
          userId: lostReport.userId,
          title: `Match update for ${lostReport.caseId}`,
          message: `${score}% ${level} found with item ${foundReport.caseId} (${foundReport.itemType}).`,
          type: notifType,
          linkCaseId: lostReport.caseId,
          read: false,
          createdAt: new Date().toISOString(),
        });

        // Notify Finder
        db.addNotification({
          id: `notif_${Date.now()}_found`,
          userId: foundReport.userId,
          title: `Match update for ${foundReport.caseId}`,
          message: `${score}% ${level} found with item ${lostReport.caseId} (${lostReport.itemType}).`,
          type: notifType,
          linkCaseId: foundReport.caseId,
          read: false,
          createdAt: new Date().toISOString(),
        });

        // Add timeline events
        db.addTimelineEvent({
          id: `tl_${Date.now()}_lost`,
          caseId: lostReport.caseId,
          type: 'MATCH_FOUND',
          title: `Automatic Match Computed: ${score}% ${level}`,
          description: `Identified correlation with Found Case ${foundReport.caseId}.`,
          timestamp: new Date().toISOString(),
        });

        db.addTimelineEvent({
          id: `tl_${Date.now()}_found`,
          caseId: foundReport.caseId,
          type: 'MATCH_FOUND',
          title: `Automatic Match Computed: ${score}% ${level}`,
          description: `Identified correlation with Lost Case ${lostReport.caseId}.`,
          timestamp: new Date().toISOString(),
        });

        if (contactAvailable) {
          db.addTimelineEvent({
            id: `tl_${Date.now()}_cont_lost`,
            caseId: lostReport.caseId,
            type: 'CONTACT_RELEASED',
            title: 'Approved Contact Released',
            description: 'Match score qualifies (≥50%). Verified student contact accessible.',
            timestamp: new Date().toISOString(),
          });
        }
      }
    }
  }

  return generatedMatches;
}
