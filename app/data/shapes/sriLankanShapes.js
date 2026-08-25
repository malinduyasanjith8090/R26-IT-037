/**
 * Tracing Shapes
 *
 * සියලුම coordinates 0-1 අතර normalized values වේ.
 * Tracing කිරීමේදී මේවා canvas pixel coordinates වලට convert කරයි.
 *
 * වැදගත්:
 * - දරුවා trace කරන්නේ object එකේ පිටත outline එක පමණයි.
 * - Object එකේ ඇතුළත තිබෙන lines tracing path එකට ඇතුළත් නොවේ.
 * - imageId එක final colorful image එක තෝරා ගැනීමට භාවිතා කරයි.
 */

export const SHAPES = {

  // =========================================================
  // LEVEL 1
  // =========================================================

ball: {
  id: 'ball_01',
  imageId: 'basketball',

  name: 'Ball',
  nameSinhala: 'බෝලය',

  category: 'basic',
  level: 1,

  /*
   * Basketball එකේ OUTER CIRCLE එක පමණයි.
   *
   * IMPORTANT:
   * ඇතුළත basketball lines කිසිවක්
   * idealPath එකට ඇතුළත් කරලා නැහැ.
   */

  idealPath: [
    [0.50, 0.20],

    [0.56, 0.21],
    [0.62, 0.23],
    [0.68, 0.26],
    [0.73, 0.30],
    [0.78, 0.35],
    [0.82, 0.41],
    [0.84, 0.47],
    [0.85, 0.53],
    [0.84, 0.59],
    [0.82, 0.65],
    [0.78, 0.71],
    [0.73, 0.76],
    [0.68, 0.79],
    [0.62, 0.82],
    [0.56, 0.84],
    [0.50, 0.85],

    [0.44, 0.84],
    [0.38, 0.82],
    [0.32, 0.79],
    [0.27, 0.76],
    [0.22, 0.71],
    [0.18, 0.65],
    [0.16, 0.59],
    [0.15, 0.53],
    [0.16, 0.47],
    [0.18, 0.41],
    [0.22, 0.35],
    [0.27, 0.30],
    [0.32, 0.26],
    [0.38, 0.23],
    [0.44, 0.21],

    [0.50, 0.20],
  ],

  /*
   * පටන් ගන්න තැන
   */
  startPoint: [0.50, 0.20],

  /*
   * සම්පූර්ණ circle එක trace කරලා
   * නැවත මේ point එකට ආවම complete.
   */
  endPoint: [0.50, 0.20],

  /*
   * Dots සියල්ලම OUTER EDGE එකේ.
   *
   * බෝලය ඇතුළේ dots නැහැ.
   */
  dotPositions: [
    [0.50, 0.20],

    [0.68, 0.26],

    [0.82, 0.41],

    [0.84, 0.59],

    [0.73, 0.76],

    [0.50, 0.85],

    [0.32, 0.79],

    [0.18, 0.65],

    [0.15, 0.47],

    [0.27, 0.30],

    [0.44, 0.21],
  ],

  /*
   * Dot එක hit කරන්න පුළුවන්
   * අවසර දෙන distance එක.
   */
  tolerancePx: 24,

  /*
   * Child tracing path එකේ color.
   */
  strokeColor: '#FF8C42',
},


  star: {
    id: 'star_01',
    imageId: 'star',
    name: 'Star',
    nameSinhala: 'තරුව',
    category: 'basic',
    level: 1,

    // තරුවේ පිටත සීමාව පමණයි
    idealPath: [
      [0.39, 0.67],
      [0.22, 0.58],
      [0.35, 0.43],
      [0.29, 0.23],
      [0.50, 0.34],
      [0.71, 0.23],
      [0.65, 0.43],
      [0.78, 0.58],
      [0.61, 0.67],
      [0.50, 0.80],
      [0.39, 0.67],
    ],

    startPoint: [0.39, 0.67],
    endPoint: [0.39, 0.67],

    dotPositions: [
      [0.22, 0.58],
      [0.50, 0.34],
      [0.78, 0.58],
      [0.50, 0.80],
    ],

    tolerancePx: 28,
    strokeColor: '#EF9F27',
  },


  // =========================================================
  // LEVEL 2
  // =========================================================

  flower: {
    id: 'flower_01',
    imageId: 'flower',
    name: 'Flower',
    nameSinhala: 'මල',
    category: 'plant',
    level: 2,

    // මලේ පිටත පෙතිවල outline එක පමණයි.
    // මැද circle එක හෝ මැදට යන lines නැත.
    idealPath: [
      [0.50, 0.28],

      [0.55, 0.34],
      [0.64, 0.30],
      [0.70, 0.33],
      [0.71, 0.40],
      [0.67, 0.47],

      [0.78, 0.50],
      [0.84, 0.55],
      [0.82, 0.63],
      [0.75, 0.67],
      [0.67, 0.64],

      [0.70, 0.74],
      [0.67, 0.82],
      [0.59, 0.85],
      [0.53, 0.80],
      [0.50, 0.72],

      [0.47, 0.80],
      [0.41, 0.85],
      [0.33, 0.82],
      [0.30, 0.74],
      [0.33, 0.64],

      [0.25, 0.67],
      [0.18, 0.63],
      [0.16, 0.55],
      [0.22, 0.50],
      [0.33, 0.47],

      [0.29, 0.40],
      [0.30, 0.33],
      [0.36, 0.30],
      [0.45, 0.34],

      [0.50, 0.28],
    ],

    startPoint: [0.50, 0.28],
    endPoint: [0.50, 0.28],

    dotPositions: [
      [0.50, 0.28],
      [0.71, 0.40],
      [0.84, 0.55],
      [0.67, 0.82],
      [0.33, 0.82],
      [0.16, 0.55],
      [0.30, 0.33],
    ],

    tolerancePx: 24,
    strokeColor: '#D4537E',
  },


  banana: {
    id: 'banana_01',
    imageId: 'banana',
    name: 'Banana',
    nameSinhala: 'කෙසෙල්',
    category: 'fruit',
    level: 2,

    // කෙසෙල් ගෙඩියේ සම්පූර්ණ පිටත boundary එක.
    idealPath: [
      [0.14, 0.55],

      // පිටත ඉහළ පැත්ත
      [0.18, 0.48],
      [0.24, 0.40],
      [0.32, 0.33],
      [0.40, 0.29],
      [0.50, 0.27],
      [0.60, 0.29],
      [0.68, 0.33],
      [0.76, 0.40],
      [0.82, 0.48],
      [0.86, 0.55],

      // පිටත පහළ පැත්ත
      [0.82, 0.58],
      [0.76, 0.54],
      [0.68, 0.50],
      [0.58, 0.47],
      [0.50, 0.46],
      [0.42, 0.47],
      [0.32, 0.50],
      [0.24, 0.54],
      [0.18, 0.57],

      [0.14, 0.55],
    ],

    startPoint: [0.14, 0.55],
    endPoint: [0.14, 0.55],

    dotPositions: [
      [0.32, 0.33],
      [0.50, 0.27],
      [0.68, 0.33],
      [0.86, 0.55],
      [0.50, 0.46],
    ],

    tolerancePx: 24,
    strokeColor: '#EF9F27',
  },


  // =========================================================
  // LEVEL 3
  // =========================================================

  ship: {
    id: 'ship_01',
    imageId: 'ship',
    name: 'Ship',
    nameSinhala: 'නැව',
    category: 'vehicle',
    level: 3,

    // නැවේ පිටත silhouette එක පමණයි.
    // Cabin, windows, funnel ඇතුළත lines trace නොකරයි.
    idealPath: [
      // පහළ hull එක
      [0.12, 0.72],
      [0.20, 0.75],
      [0.32, 0.76],
      [0.44, 0.76],
      [0.56, 0.75],
      [0.66, 0.73],

      // ඉදිරි bow එක
      [0.74, 0.68],
      [0.80, 0.62],
      [0.83, 0.56],

      // ඉහළ deck
      [0.83, 0.50],
      [0.76, 0.49],
      [0.68, 0.48],

      // ඉහළ superstructure silhouette
      [0.61, 0.45],
      [0.56, 0.39],
      [0.48, 0.38],
      [0.40, 0.42],
      [0.35, 0.46],

      [0.28, 0.46],
      [0.22, 0.48],
      [0.18, 0.50],
      [0.12, 0.50],

      // stern
      [0.12, 0.72],
    ],

    startPoint: [0.12, 0.72],
    endPoint: [0.12, 0.72],

    dotPositions: [
      [0.44, 0.76],
      [0.83, 0.56],
      [0.61, 0.45],
      [0.28, 0.46],
      [0.12, 0.50],
    ],

    tolerancePx: 20,
    strokeColor: '#378ADD',
  },


  car: {
    id: 'car_01',
    imageId: 'car',
    name: 'Car',
    nameSinhala: 'කාරය',
    category: 'vehicle',
    level: 3,

    // කාර් එකේ පිටත silhouette එක පමණයි.
    // Wheels ඇතුළත circles trace නොකරයි.
    idealPath: [
      // පහළ body
      [0.10, 0.72],
      [0.18, 0.72],

      // ඉදිරි wheel arch
      [0.22, 0.68],
      [0.28, 0.66],
      [0.34, 0.68],
      [0.38, 0.72],

      [0.46, 0.72],

      // පසුපස wheel arch
      [0.54, 0.72],
      [0.58, 0.68],
      [0.64, 0.66],
      [0.70, 0.68],
      [0.74, 0.72],

      [0.82, 0.72],

      // rear
      [0.88, 0.70],
      [0.90, 0.65],
      [0.90, 0.58],
      [0.88, 0.54],

      // roof
      [0.82, 0.46],
      [0.74, 0.40],
      [0.62, 0.36],
      [0.50, 0.34],
      [0.38, 0.36],
      [0.28, 0.40],
      [0.20, 0.46],
      [0.14, 0.53],

      // front bonnet
      [0.10, 0.58],
      [0.10, 0.72],
    ],

    startPoint: [0.10, 0.72],
    endPoint: [0.10, 0.72],

    dotPositions: [
      [0.28, 0.66],
      [0.64, 0.66],
      [0.90, 0.58],
      [0.50, 0.34],
      [0.20, 0.46],
    ],

    wheelCenters: [
      [0.28, 0.66],
      [0.64, 0.66],
    ],

    tireRadius: 0.08,
    tireStrokeWidth: 3,
    tireStrokeColor: '#333',

    tolerancePx: 20,
    strokeColor: '#1D9E75',
  },


  // =========================================================
  // LEVEL 4
  // =========================================================

  hand: {
    id: 'hand_01',
    imageId: 'hand',
    name: 'Hand',
    nameSinhala: 'අත',
    category: 'body',
    level: 4,

    // අතේ සම්පූර්ණ පිටත boundary එක.
    // ඇඟිලි අතර valleys outline එකේ කොටස්.
    idealPath: [
      // wrist
      [0.26, 0.90],
      [0.24, 0.80],
      [0.22, 0.70],
      [0.18, 0.62],

      // thumb
      [0.14, 0.57],
      [0.11, 0.50],
      [0.10, 0.43],
      [0.12, 0.36],
      [0.16, 0.38],
      [0.19, 0.44],
      [0.21, 0.51],
      [0.23, 0.58],

      // thumb-index valley
      [0.25, 0.54],
      [0.26, 0.50],

      // index finger
      [0.25, 0.43],
      [0.24, 0.34],
      [0.25, 0.25],
      [0.28, 0.20],
      [0.32, 0.23],
      [0.33, 0.32],
      [0.34, 0.41],
      [0.34, 0.50],

      // index-middle valley
      [0.35, 0.58],

      // middle finger
      [0.37, 0.50],
      [0.37, 0.40],
      [0.37, 0.30],
      [0.38, 0.20],
      [0.42, 0.14],
      [0.47, 0.18],
      [0.48, 0.28],
      [0.49, 0.38],
      [0.50, 0.48],

      // middle-ring valley
      [0.51, 0.58],

      // ring finger
      [0.53, 0.50],
      [0.53, 0.40],
      [0.54, 0.30],
      [0.55, 0.22],
      [0.58, 0.18],
      [0.62, 0.21],
      [0.63, 0.30],
      [0.64, 0.40],
      [0.65, 0.50],

      // ring-pinky valley
      [0.66, 0.58],

      // pinky
      [0.68, 0.52],
      [0.68, 0.44],
      [0.69, 0.36],
      [0.71, 0.28],
      [0.74, 0.24],
      [0.77, 0.27],
      [0.78, 0.34],
      [0.78, 0.42],
      [0.77, 0.52],

      // palm
      [0.78, 0.62],
      [0.77, 0.72],
      [0.76, 0.80],
      [0.74, 0.86],

      // wrist
      [0.66, 0.90],
      [0.54, 0.92],
      [0.40, 0.92],
      [0.26, 0.90],
    ],

    startPoint: [0.26, 0.90],
    endPoint: [0.26, 0.90],

    dotPositions: [
      [0.11, 0.50],
      [0.12, 0.36],
      [0.19, 0.44],

      [0.24, 0.34],
      [0.28, 0.20],
      [0.33, 0.32],

      [0.37, 0.30],
      [0.42, 0.14],
      [0.48, 0.28],

      [0.54, 0.30],
      [0.58, 0.18],
      [0.63, 0.30],

      [0.69, 0.36],
      [0.74, 0.24],
      [0.78, 0.34],

      [0.77, 0.72],
      [0.40, 0.92],
    ],

    tolerancePx: 22,
    strokeColor: '#D4537E',
  },


  tshirt: {
    id: 'tshirt_01',
    imageId: 'tshirt',
    name: 'T-Shirt',
    nameSinhala: 'ටී-ෂර්ට්',
    category: 'clothing',
    level: 4,

    // T-shirt එකේ පිටත සීමාව පමණයි.
    idealPath: [
      // bottom
      [0.18, 0.85],
      [0.34, 0.85],
      [0.50, 0.85],
      [0.66, 0.85],
      [0.82, 0.85],

      // right body
      [0.82, 0.70],
      [0.82, 0.57],

      // right sleeve
      [0.87, 0.52],
      [0.92, 0.45],
      [0.92, 0.36],
      [0.87, 0.31],
      [0.80, 0.30],

      // right shoulder
      [0.72, 0.32],
      [0.66, 0.38],
      [0.61, 0.40],

      // collar
      [0.58, 0.36],
      [0.55, 0.33],
      [0.50, 0.40],
      [0.45, 0.33],
      [0.42, 0.36],
      [0.39, 0.40],

      // left shoulder
      [0.34, 0.38],
      [0.28, 0.32],
      [0.20, 0.30],

      // left sleeve
      [0.13, 0.32],
      [0.08, 0.36],
      [0.09, 0.45],
      [0.14, 0.52],

      // left body
      [0.18, 0.57],
      [0.18, 0.70],
      [0.18, 0.85],
    ],

    startPoint: [0.18, 0.85],
    endPoint: [0.18, 0.85],

    dotPositions: [
      [0.50, 0.85],
      [0.82, 0.57],
      [0.80, 0.30],
      [0.50, 0.40],
      [0.20, 0.30],
      [0.18, 0.57],
    ],

    tolerancePx: 22,
    strokeColor: '#7F77DD',
  },

};


// =========================================================
// HELPERS
// =========================================================

/**
 * දීලා තියෙන level එකට අදාළ shapes ලබාගන්න.
 */
export function getShapesForLevel(level) {
  return Object.values(SHAPES).filter(
    shape => shape.level === level
  );
}


/**
 * පැරණි code එක සමඟ compatibility සඳහා.
 */
export function getShapesForDifficulty(level) {
  return getShapesForLevel(level);
}


/**
 * පැරණි code එක සමඟ compatibility සඳහා.
 */
export const SRI_LANKAN_SHAPES = SHAPES;


/**
 * Normalized coordinates
 * [0,1]
 *
 * Canvas pixels වලට convert කරයි.
 */
export function scalePath(
  path,
  width,
  height,
  padding = 20
) {
  const w = width - padding * 2;
  const h = height - padding * 2;

  return path.map(([nx, ny]) => [
    Math.round(padding + nx * w),
    Math.round(padding + ny * h),
  ]);
}


/**
 * දරුවාගේ tracing accuracy calculate කරයි.
 *
 * childPoints
 *     දරුවාගේ touch points
 *
 * scaledIdeal
 *     canvas pixels වලට convert කරපු ideal path
 *
 * tolerancePx
 *     allowed deviation
 */
export function scoreTrace(
  childPoints,
  scaledIdeal,
  tolerancePx
) {
  if (
    !childPoints.length ||
    !scaledIdeal.length
  ) {
    return 0;
  }

  // Ideal path එක තවත් smooth කිරීම සඳහා
  // points අතර 2px පමණ spacing එකක් හදනවා.
  const densePath = [];

  for (
    let i = 0;
    i < scaledIdeal.length - 1;
    i++
  ) {
    const [x0, y0] = scaledIdeal[i];
    const [x1, y1] = scaledIdeal[i + 1];

    const dist = Math.hypot(
      x1 - x0,
      y1 - y0
    );

    const steps = Math.max(
      1,
      Math.round(dist / 2)
    );

    for (
      let t = 0;
      t <= steps;
      t++
    ) {
      densePath.push([
        x0 + ((x1 - x0) * t) / steps,
        y0 + ((y1 - y0) * t) / steps,
      ]);
    }
  }


  // දරුවාගේ සෑම point එකකටම
  // ideal path එකේ ආසන්නම point එක හොයනවා.
  let totalDeviation = 0;

  for (const [cx, cy] of childPoints) {

    let minimumDistance = Infinity;

    for (const [ix, iy] of densePath) {

      const distance = Math.hypot(
        cx - ix,
        cy - iy
      );

      if (distance < minimumDistance) {
        minimumDistance = distance;
      }
    }

    totalDeviation += minimumDistance;
  }


  const averageDeviation =
    totalDeviation / childPoints.length;


  const score =
    100 -
    Math.min(
      100,
      (averageDeviation / tolerancePx) * 100
    );


  return Math.round(
    Math.max(0, score)
  );
}