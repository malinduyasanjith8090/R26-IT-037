import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

import {
    Animated,
    Image,
    PanResponder,
    StyleSheet,
    View,
} from 'react-native';

import Svg, {
    Circle,
    G,
    Path,
} from 'react-native-svg';

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

type Point = {
  x: number;
  y: number;
};

type TouchPoint = {
  t: number;
  x: number;
  y: number;
};

type Shape = {
  startPoint: [number, number];
  endPoint: [number, number];
  dotPositions: [number, number][];
  idealPath: [number, number][];
  imageId?: string;

  wheelCenters?: [number, number][];
  tireRadius?: number;
  tireStrokeColor?: string;
  tireStrokeWidth?: number;
};

type TrialMetrics = {
  pathDeviation: number;
  maxDeviation: number;
  completionTimeMs: number;
  hesitationCount: number;
  liftCount: number;
  startAccuracy: number;
  endAccuracy: number;
  velocityVariance: number;

  waypointHits: boolean[];
  waypointScore: number;
  blendedAccuracy: number;
};

type TrialResult = {
  metrics: TrialMetrics;
  touchPathSample: TouchPoint[];
  completed: boolean;
};

type TracingCanvasProps = {
  shape: Shape;
  shapeSize: number;
  onTrialComplete: (result: TrialResult) => void;
  guidanceLevel?: 'full' | 'partial' | 'minimal' | string;
};

/* -------------------------------------------------------------------------- */
/* WAYPOINT HIT CHECK                                                         */
/* -------------------------------------------------------------------------- */

function checkDotHit(
  x: number,
  y: number,
  dotPositions: [number, number][],
  shapeSize: number,
  threshold = 40,
): number {
  for (let i = 0; i < dotPositions.length; i++) {
    const px = dotPositions[i][0] * shapeSize;
    const py = dotPositions[i][1] * shapeSize;

    if (Math.hypot(x - px, y - py) < threshold) {
      return i;
    }
  }

  return -1;
}

/* -------------------------------------------------------------------------- */
/* CLOCKWISE WAYPOINT ORDER                                                   */
/* -------------------------------------------------------------------------- */

function getClockwiseDotOrder(
  dotPositions: [number, number][],
  startPoint: [number, number],
): number[] {
  if (!Array.isArray(dotPositions) || dotPositions.length === 0) {
    return [];
  }

  if (dotPositions.length === 1) {
    return [0];
  }

  const centroid = dotPositions.reduce(
    (acc, [x, y]) => ({
      x: acc.x + x,
      y: acc.y + y,
    }),
    {
      x: 0,
      y: 0,
    },
  );

  const cx = centroid.x / dotPositions.length;
  const cy = centroid.y / dotPositions.length;

  /*
   * Screen coordinates have Y increasing downward.
   * Sorting atan2 angles gives the required clockwise ordering
   * for the tracing points.
   */
  const ordered = dotPositions
    .map(([x, y], index) => ({
      index,
      angle: Math.atan2(y - cy, x - cx),
    }))
    .sort((a, b) => a.angle - b.angle)
    .map(item => item.index);

  if (!Array.isArray(startPoint) || startPoint.length < 2) {
    return ordered;
  }

  let rotationStart = 0;
  let minAngleDiff = Infinity;

  const startAngle = Math.atan2(
    startPoint[1] - cy,
    startPoint[0] - cx,
  );

  ordered.forEach((dotIndex, orderIndex) => {
    const [dx, dy] = dotPositions[dotIndex];

    const dotAngle = Math.atan2(
      dy - cy,
      dx - cx,
    );

    let diff = dotAngle - startAngle;

    if (diff <= 0) {
      diff += Math.PI * 2;
    }

    if (diff < minAngleDiff) {
      minAngleDiff = diff;
      rotationStart = orderIndex;
    }
  });

  return [
    ...ordered.slice(rotationStart),
    ...ordered.slice(0, rotationStart),
  ];
}

/* -------------------------------------------------------------------------- */
/* WAYPOINT COVERAGE                                                           */
/* -------------------------------------------------------------------------- */

function computeWaypointCoverage(
  touchPoints: TouchPoint[],
  dotPositions: [number, number][],
  shapeSize: number,
  threshold = 40,
): boolean[] {
  return dotPositions.map(([nx, ny]) => {
    const px = nx * shapeSize;
    const py = ny * shapeSize;

    return touchPoints.some(
      point =>
        Math.hypot(
          point.x - px,
          point.y - py,
        ) < threshold,
    );
  });
}

/* -------------------------------------------------------------------------- */
/* PATH DEVIATION                                                             */
/* -------------------------------------------------------------------------- */

function computePathDeviation(
  userPoints: Point[],
  scaledIdealPoints: Point[],
): number {
  if (userPoints.length < 3) {
    return 100;
  }

  if (scaledIdealPoints.length === 0) {
    return 100;
  }

  let totalDeviation = 0;

  userPoints.forEach(userPoint => {
    let minDist = Infinity;

    scaledIdealPoints.forEach(ideal => {
      const dx = userPoint.x - ideal.x;
      const dy = userPoint.y - ideal.y;

      const dist = Math.sqrt(
        dx * dx + dy * dy,
      );

      if (dist < minDist) {
        minDist = dist;
      }
    });

    totalDeviation += isFinite(minDist)
      ? minDist
      : 0;
  });

  return userPoints.length > 0
    ? totalDeviation / userPoints.length
    : 100;
}

/* -------------------------------------------------------------------------- */
/* HESITATION COUNT                                                           */
/* -------------------------------------------------------------------------- */

function countHesitations(
  touchPoints: TouchPoint[],
): number {
  let count = 0;

  for (let i = 1; i < touchPoints.length; i++) {
    const timeDifference =
      touchPoints[i].t -
      touchPoints[i - 1].t;

    if (timeDifference > 800) {
      count++;
    }
  }

  return count;
}

/* -------------------------------------------------------------------------- */
/* VELOCITY VARIANCE                                                          */
/* -------------------------------------------------------------------------- */

function computeVelocityVariance(
  touchPoints: TouchPoint[],
): number {
  if (touchPoints.length < 3) {
    return 1.0;
  }

  const velocities: number[] = [];

  for (let i = 1; i < touchPoints.length; i++) {
    const dt =
      touchPoints[i].t -
      touchPoints[i - 1].t;

    if (dt === 0) {
      continue;
    }

    const dx =
      touchPoints[i].x -
      touchPoints[i - 1].x;

    const dy =
      touchPoints[i].y -
      touchPoints[i - 1].y;

    const distance = Math.sqrt(
      dx * dx + dy * dy,
    );

    velocities.push(distance / dt);
  }

  if (velocities.length === 0) {
    return 1.0;
  }

  const mean =
    velocities.reduce(
      (a, b) => a + b,
      0,
    ) / velocities.length;

  const variance =
    velocities.reduce(
      (sum, velocity) =>
        sum +
        Math.pow(
          velocity - mean,
          2,
        ),
      0,
    ) / velocities.length;

  return Math.min(
    1.0,
    variance / 10,
  );
}

/* -------------------------------------------------------------------------- */
/* SVG PATH BUILDER                                                           */
/* -------------------------------------------------------------------------- */

function buildPathString(
  points: Point[],
): string {
  if (points.length < 2) {
    return '';
  }

  return points.reduce(
    (path, point, index) => {
      if (index === 0) {
        return `M${point.x},${point.y}`;
      }

      return `${path} L${point.x},${point.y}`;
    },
    '',
  );
}

/* -------------------------------------------------------------------------- */
/* ANIMATED CIRCLE                                                            */
/* -------------------------------------------------------------------------- */

const AnimatedCircle =
  Animated.createAnimatedComponent(Circle);

/* -------------------------------------------------------------------------- */
/* FINAL COLOR IMAGES                                                         */
/* -------------------------------------------------------------------------- */

/*
 * The final image is shown faintly from the beginning.
 * It becomes fully visible only after the child completes the outline.
 *
 * Add the other object images here as they are provided.
 */
const TRACING_IMAGES: Record<string, any> = {
  basketball: require('../assets/tracing/basketball.png'),
  ball: require('../assets/tracing/basketball.png'),
};

/* -------------------------------------------------------------------------- */
/* COMPONENT                                                                  */
/* -------------------------------------------------------------------------- */

export default function TracingCanvas({
  shape,
  shapeSize,
  onTrialComplete,
  guidanceLevel = 'full',
}: TracingCanvasProps) {
  /* ------------------------------------------------------------------------ */
  /* STATE                                                                    */
  /* ------------------------------------------------------------------------ */

  const [userPath, setUserPath] =
    useState<Point[]>([]);

  const [isTracing, setIsTracing] =
    useState(false);

  const [trialStarted, setTrialStarted] =
    useState(false);

  const [hitDots, setHitDots] =
    useState<boolean[]>([]);

  // The full-color image is revealed only after the complete outline
  // has been traced correctly.
  const [showCompletedImage, setShowCompletedImage] =
    useState(false);

  /* ------------------------------------------------------------------------ */
  /* REFS                                                                     */
  /* ------------------------------------------------------------------------ */

  const hitDotsRef =
    useRef<boolean[]>([]);

  const nextExpectedDotRef =
    useRef(0);

  const clockwiseDotOrderRef =
    useRef<number[]>([]);

  const touchPointsRef =
    useRef<TouchPoint[]>([]);

  const trialStartTimeRef =
    useRef<number | null>(null);

  const liftCountRef =
    useRef(0);

  const isTracingRef =
    useRef(false);

  const shapeSizeRef =
    useRef(shapeSize);

  const scaledIdealPathRef =
    useRef<Point[]>([]);

  const startPointRef =
    useRef<Point>({
      x: 0,
      y: 0,
    });

  const endPointRef =
    useRef<Point>({
      x: 0,
      y: 0,
    });

  const pulseAnimsRef =
    useRef<Animated.Value[]>([]);

  const revealTimeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const panResponderRef =
    useRef<any>(null);

  const panHandlersRef =
    useRef<any>({});

  /* ------------------------------------------------------------------------ */
  /* SHAPE SIZE                                                                */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    shapeSizeRef.current = shapeSize;
  }, [shapeSize]);

  /* ------------------------------------------------------------------------ */
  /* CLOCKWISE DOT ORDER                                                       */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    clockwiseDotOrderRef.current =
      getClockwiseDotOrder(
        shape.dotPositions,
        shape.startPoint,
      );

    nextExpectedDotRef.current = 0;
  }, [shape]);

  /* ------------------------------------------------------------------------ */
  /* PULSE ANIMATIONS                                                          */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    pulseAnimsRef.current =
      shape.dotPositions.map(
        () => new Animated.Value(0),
      );
  }, [shape]);

  const triggerPulse =
    useCallback((index: number) => {
      const animation =
        pulseAnimsRef.current[index];

      if (!animation) {
        return;
      }

      animation.setValue(0);

      Animated.timing(animation, {
        toValue: 1,
        duration: 500,
        useNativeDriver: false,
      }).start();
    }, []);

  /* ------------------------------------------------------------------------ */
  /* SCALED IDEAL PATH                                                        */
  /* ------------------------------------------------------------------------ */

  const scaledIdealPath =
    useMemo<Point[]>(
      () =>
        Array.isArray(shape.idealPath)
          ? shape.idealPath.map(
              ([x, y]) => ({
                x: x * shapeSize,
                y: y * shapeSize,
              }),
            )
          : [],
      [shape, shapeSize],
    );

  useEffect(() => {
    scaledIdealPathRef.current =
      scaledIdealPath;
  }, [scaledIdealPath]);

  /* ------------------------------------------------------------------------ */
  /* START POINT                                                               */
  /* ------------------------------------------------------------------------ */

  const startPoint = useMemo<Point>(
    () => ({
      x: shape.startPoint[0] * shapeSize,
      y: shape.startPoint[1] * shapeSize,
    }),
    [shape, shapeSize],
  );

  useEffect(() => {
    startPointRef.current =
      startPoint;
  }, [startPoint]);

  /* ------------------------------------------------------------------------ */
  /* END POINT                                                                 */
  /* ------------------------------------------------------------------------ */

  const endPoint = useMemo<Point>(
    () => ({
      x: shape.endPoint[0] * shapeSize,
      y: shape.endPoint[1] * shapeSize,
    }),
    [shape, shapeSize],
  );

  useEffect(() => {
    endPointRef.current =
      endPoint;
  }, [endPoint]);

  /* ------------------------------------------------------------------------ */
  /* START / END OVERLAP                                                       */
  /* ------------------------------------------------------------------------ */

  const startAndEndOverlap =
    Math.hypot(
      startPoint.x - endPoint.x,
      startPoint.y - endPoint.y,
    ) < 1;

  /* ------------------------------------------------------------------------ */
  /* TRACING STATE                                                             */
  /* ------------------------------------------------------------------------ */

  const setTracingState =
    useCallback((value: boolean) => {
      isTracingRef.current =
        value;

      setIsTracing(value);
    }, []);

  /* ------------------------------------------------------------------------ */
  /* RESET TRIAL                                                               */
  /* ------------------------------------------------------------------------ */

  const resetTrial =
    useCallback(() => {
      setTracingState(false);

      setUserPath([]);

      setTrialStarted(false);

      setHitDots([]);
      setShowCompletedImage(false);

      hitDotsRef.current = [];

      nextExpectedDotRef.current = 0;

      touchPointsRef.current = [];

      trialStartTimeRef.current =
        null;

      liftCountRef.current = 0;

      pulseAnimsRef.current.forEach(
        animation =>
          animation.setValue(0),
      );
    }, [setTracingState]);

  /* ------------------------------------------------------------------------ */
  /* FINALISE TRIAL                                                            */
  /* ------------------------------------------------------------------------ */

  const finaliseTrial =
    useCallback(
      (
        endX: number,
        endY: number,
        completed: boolean,
      ) => {
        const touchPoints =
          touchPointsRef.current;

        if (
          !trialStartTimeRef.current ||
          touchPoints.length === 0
        ) {
          return;
        }

        const totalTime =
          Date.now() -
          trialStartTimeRef.current;

        const scaledIdeal =
          scaledIdealPathRef.current;

        const startPt =
          startPointRef.current;

        const endPt =
          endPointRef.current;

        /* ------------------------------------------------------------------ */
        /* METRICS                                                             */
        /* ------------------------------------------------------------------ */

        const pathDeviation =
          computePathDeviation(
            touchPoints,
            scaledIdeal,
          );

        const hesitationCount =
          countHesitations(
            touchPoints,
          );

        const velocityVariance =
          computeVelocityVariance(
            touchPoints,
          );

        /* ------------------------------------------------------------------ */
        /* WAYPOINT COVERAGE                                                   */
        /* ------------------------------------------------------------------ */

        const waypointHits =
          hitDotsRef.current.length ===
          shape.dotPositions.length
            ? [...hitDotsRef.current]
            : computeWaypointCoverage(
                touchPoints,
                shape.dotPositions,
                shapeSizeRef.current,
              );

        const waypointScore =
          waypointHits.filter(Boolean)
            .length /
          (waypointHits.length || 1);

        /* ------------------------------------------------------------------ */
        /* START ACCURACY                                                      */
        /* ------------------------------------------------------------------ */

        const firstPoint =
          touchPoints[0];

        const startDist =
          Math.hypot(
            (firstPoint?.x ?? 0) -
              startPt.x,
            (firstPoint?.y ?? 0) -
              startPt.y,
          );

        const startAccuracy =
          Math.max(
            0,
            1 - startDist / 80,
          );

        /* ------------------------------------------------------------------ */
        /* END ACCURACY                                                        */
        /* ------------------------------------------------------------------ */

        const endDist =
          Math.hypot(
            endX - endPt.x,
            endY - endPt.y,
          );

        const endAccuracy =
          Math.max(
            0,
            1 - endDist / 80,
          );

        /* ------------------------------------------------------------------ */
        /* MAX DEVIATION                                                      */
        /* ------------------------------------------------------------------ */

        const maxDeviation =
          touchPoints.length > 0
            ? Math.max(
                ...touchPoints.map(
                  point => {
                    let minDist =
                      Infinity;

                    scaledIdeal.forEach(
                      idealPoint => {
                        const distance =
                          Math.hypot(
                            point.x -
                              idealPoint.x,
                            point.y -
                              idealPoint.y,
                          );

                        if (
                          distance <
                          minDist
                        ) {
                          minDist =
                            distance;
                        }
                      },
                    );

                    return isFinite(
                      minDist,
                    )
                      ? minDist
                      : 0;
                  },
                ),
              )
            : 0;

        /* ------------------------------------------------------------------ */
        /* SAMPLE TOUCH PATH                                                  */
        /* ------------------------------------------------------------------ */

        const touchPathSample =
          touchPoints
            .filter(
              (_, index) =>
                index % 5 === 0,
            )
            .map(point => ({
              t: point.t,
              x: Math.round(
                point.x,
              ),
              y: Math.round(
                point.y,
              ),
            }));

        /* ------------------------------------------------------------------ */
        /* METRICS OBJECT                                                      */
        /* ------------------------------------------------------------------ */

        const blendedAccuracy =
          startAccuracy * 0.15 +
          endAccuracy * 0.15 +
          waypointScore * 0.30 +
          Math.max(
            0,
            1 - pathDeviation / 100,
          ) *
            0.40;

        const metrics: TrialMetrics =
          {
            pathDeviation:
              parseFloat(
                pathDeviation.toFixed(
                  2,
                ),
              ),

            maxDeviation:
              parseFloat(
                maxDeviation.toFixed(
                  2,
                ),
              ),

            completionTimeMs:
              totalTime,

            hesitationCount,

            liftCount:
              Math.max(
                0,
                liftCountRef.current -
                  1,
              ),

            startAccuracy:
              parseFloat(
                startAccuracy.toFixed(
                  3,
                ),
              ),

            endAccuracy:
              parseFloat(
                endAccuracy.toFixed(
                  3,
                ),
              ),

            velocityVariance:
              parseFloat(
                velocityVariance.toFixed(
                  4,
                ),
              ),

            waypointHits,

            waypointScore:
              parseFloat(
                waypointScore.toFixed(
                  3,
                ),
              ),

            blendedAccuracy:
              parseFloat(
                blendedAccuracy.toFixed(
                  3,
                ),
              ),
          };

        console.log(
          '[TracingCanvas] Waypoint hits:',
          waypointHits,
        );

        console.log(
          '[TracingCanvas] Waypoint score:',
          waypointScore,
        );

        console.log(
          '[TracingCanvas] Blended accuracy:',
          metrics.blendedAccuracy,
        );

        /* ------------------------------------------------------------------ */
        /* COMPLETION REVEAL                                                  */
        /* ------------------------------------------------------------------ */

        const finishAndNotify = () => {
          setShowCompletedImage(false);
          setTracingState(false);
          setUserPath([]);
          setTrialStarted(false);
          setHitDots([]);

          touchPointsRef.current = [];
          trialStartTimeRef.current = null;
          liftCountRef.current = 0;
          hitDotsRef.current = [];
          nextExpectedDotRef.current = 0;

          pulseAnimsRef.current.forEach(
            animation =>
              animation.setValue(0),
          );

          onTrialComplete({
            metrics,
            touchPathSample,
            completed,
          });
        };

        if (completed) {
          /*
           * Keep the completed picture on screen briefly so the child
           * can actually see the finished object before the next trial.
           */
          setShowCompletedImage(true);
          setTracingState(false);
          setUserPath([]);

          if (revealTimeoutRef.current) {
            clearTimeout(revealTimeoutRef.current);
          }

          revealTimeoutRef.current = setTimeout(
            finishAndNotify,
            1000,
          );
        } else {
          finishAndNotify();
        }
      },
      [
        onTrialComplete,
        shape,
        setTracingState,
      ],
    );

  /* ------------------------------------------------------------------------ */
  /* PAN RESPONDER                                                            */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    const responder =
      PanResponder.create({
        onStartShouldSetPanResponder:
          () => true,

        onMoveShouldSetPanResponder:
          () => true,

        onStartShouldSetPanResponderCapture:
          () => true,

        onMoveShouldSetPanResponderCapture:
          () => true,

        /* ------------------------------------------------------------------ */
        /* TOUCH START                                                        */
        /* ------------------------------------------------------------------ */

        onPanResponderGrant: event => {
          const {
            locationX: x,
            locationY: y,
          } = event.nativeEvent;

          const distToStart =
            Math.hypot(
              x -
                startPointRef.current.x,
              y -
                startPointRef.current.y,
            );

          if (distToStart < 60) {
            setTracingState(true);

            setTrialStarted(true);

            trialStartTimeRef.current =
              Date.now();

            liftCountRef.current = 0;

            touchPointsRef.current =
              [
                {
                  t: 0,
                  x,
                  y,
                },
              ];

            setUserPath([
              {
                x,
                y,
              },
            ]);

            hitDotsRef.current =
              new Array(
                shape.dotPositions.length,
              ).fill(false);

            setHitDots([
              ...hitDotsRef.current,
            ]);

            nextExpectedDotRef.current = 0;
          }
        },

        /* ------------------------------------------------------------------ */
        /* TOUCH MOVE                                                         */
        /* ------------------------------------------------------------------ */

        onPanResponderMove: event => {
          if (
            !isTracingRef.current ||
            !trialStartTimeRef.current
          ) {
            return;
          }

          const {
            locationX: x,
            locationY: y,
          } = event.nativeEvent;

          const t =
            Date.now() -
            trialStartTimeRef.current;

          touchPointsRef.current.push(
            {
              t,
              x,
              y,
            },
          );

          setUserPath(previous => [
            ...previous,
            {
              x,
              y,
            },
          ]);

          /* -------------------------------------------------------------- */
          /* WAYPOINT HIT                                                    */
          /* -------------------------------------------------------------- */

          const hitIndex =
            checkDotHit(
              x,
              y,
              shape.dotPositions,
              shapeSizeRef.current,
            );

          const expectedDotIndex =
            clockwiseDotOrderRef.current[
              nextExpectedDotRef.current
            ];

          if (
            hitIndex !== -1 &&
            hitIndex ===
              expectedDotIndex &&
            !hitDotsRef.current[
              hitIndex
            ]
          ) {
            hitDotsRef.current[
              hitIndex
            ] = true;

            nextExpectedDotRef.current +=
              1;

            setHitDots([
              ...hitDotsRef.current,
            ]);

            triggerPulse(
              hitIndex,
            );
          }
        },

        /* ------------------------------------------------------------------ */
        /* TOUCH RELEASE                                                      */
        /* ------------------------------------------------------------------ */

        onPanResponderRelease:
          event => {
            if (
              !isTracingRef.current
            ) {
              return;
            }

            const {
              locationX: x,
              locationY: y,
            } = event.nativeEvent;

            liftCountRef.current++;

            const distToEnd =
              Math.hypot(
                x -
                  endPointRef.current.x,
                y -
                  endPointRef.current.y,
              );

            const allWaypointsHit =
              hitDotsRef.current.length > 0 &&
              hitDotsRef.current.every(Boolean);

            /*
             * A trial is completed only when the child reaches the end
             * AND has followed every required waypoint.
             */
            const completed =
              distToEnd < 50 &&
              allWaypointsHit;

            if (completed) {
              finaliseTrial(
                x,
                y,
                true,
              );
            } else if (distToEnd < 50) {
              /*
               * The child reached the end but did not complete the
               * required outline. Record the attempt without revealing
               * the full-color image.
               */
              finaliseTrial(
                x,
                y,
                false,
              );
            } else {
              /*
               * Finger was lifted before reaching
               * the end. Keep the trace state available
               * for continuation.
               */
              setTracingState(false);
            }
          },

        /* ------------------------------------------------------------------ */
        /* TOUCH TERMINATED                                                   */
        /* ------------------------------------------------------------------ */

        onPanResponderTerminate:
          () => {
            if (
              isTracingRef.current
            ) {
              setTracingState(false);

              setUserPath([]);

              setTrialStarted(false);

              hitDotsRef.current = [];

              setHitDots([]);

              nextExpectedDotRef.current = 0;

              pulseAnimsRef.current.forEach(
                animation =>
                  animation.setValue(
                    0,
                  ),
              );

              touchPointsRef.current =
                [];

              trialStartTimeRef.current =
                null;
            }
          },
      });

    panResponderRef.current =
      responder;

    panHandlersRef.current =
      responder.panHandlers;
  }, [
    shape,
    shapeSize,
    finaliseTrial,
    setTracingState,
    triggerPulse,
  ]);

  useEffect(() => {
    return () => {
      if (revealTimeoutRef.current) {
        clearTimeout(revealTimeoutRef.current);
      }
    };
  }, []);

  /* ------------------------------------------------------------------------ */
  /* SVG PATHS                                                                */
  /* ------------------------------------------------------------------------ */

  const idealPathString =
    buildPathString(
      scaledIdealPath,
    );

  const userPathString =
    buildPathString(
      userPath,
    );

  /* ------------------------------------------------------------------------ */
  /* RENDER                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <View
      style={[
        styles.container,
        {
          width: shapeSize,
          height: shapeSize,
        },
      ]}
      {...panHandlersRef.current}
    >
      {/* ------------------------------------------------------------------ */}
      {/* FAINT FINAL IMAGE                                                  */}
      {/* ------------------------------------------------------------------ */}

      {shape.imageId &&
        TRACING_IMAGES[shape.imageId] && (
          <Image
            source={TRACING_IMAGES[shape.imageId]}
            style={[
              styles.finalImage,
              {
                width: shapeSize,
                height: shapeSize,
                opacity: showCompletedImage ? 1 : 0.12,
              },
            ]}
            resizeMode="contain"
            pointerEvents="none"
          />
        )}

      <Svg
        width={shapeSize}
        height={shapeSize}
        pointerEvents="none"
      >
        {!showCompletedImage && (
          <>
        {/* ================================================================ */}
        {/* IDEAL PATH                                                       */}
        {/* ================================================================ */}

        <Path
          d={idealPathString}
          stroke="#A0C8F0"
          strokeWidth={
            guidanceLevel === 'full'
              ? 6
              : 3
          }
          strokeDasharray="10,8"
          fill="none"
          strokeLinecap="round"
        />

        {/* ================================================================ */}
        {/* VEHICLE WHEEL GUIDES                                            */}
        {/* ================================================================ */}

        {Array.isArray(
          shape.wheelCenters,
        ) &&
          shape.wheelCenters.map(
            (center, index) => (
              <Circle
                key={`tire-${index}`}
                cx={
                  center[0] *
                  shapeSize
                }
                cy={
                  center[1] *
                  shapeSize
                }
                r={
                  (shape.tireRadius ||
                    0.08) *
                  shapeSize
                }
                stroke={
                  shape.tireStrokeColor ||
                  '#333'
                }
                strokeWidth={
                  shape.tireStrokeWidth ||
                  3
                }
                strokeDasharray="4,4"
                fill="none"
              />
            ),
          )}

        {/* ================================================================ */}
        {/* WAYPOINT DOTS                                                   */}
        {/* ================================================================ */}

        {shape.dotPositions.map(
          (position, index) => {
            const cx =
              position[0] *
              shapeSize;

            const cy =
              position[1] *
              shapeSize;

            const baseRadius =
              guidanceLevel ===
              'full'
                ? 8
                : 5;

            const isHit =
              !!hitDots[index];

            const animation =
              pulseAnimsRef.current[
                index
              ] ||
              new Animated.Value(
                0,
              );

            const ringRadius =
              animation.interpolate({
                inputRange: [
                  0,
                  0.3,
                  1,
                ],
                outputRange: [
                  baseRadius,
                  baseRadius * 1.5,
                  baseRadius * 3,
                ],
              });

            const ringOpacity =
              animation.interpolate({
                inputRange: [
                  0,
                  0.3,
                  1,
                ],
                outputRange: [
                  0.7,
                  0.5,
                  0,
                ],
              });

            return (
              <G key={index}>
                {/* Pulse ring */}

                <AnimatedCircle
                  cx={cx}
                  cy={cy}
                  r={ringRadius}
                  stroke="#4CAF50"
                  strokeWidth={2}
                  fill="none"
                  opacity={
                    ringOpacity
                  }
                />

                {/* Actual waypoint */}

                <Circle
                  cx={cx}
                  cy={cy}
                  r={
                    isHit
                      ? baseRadius *
                        1.3
                      : baseRadius
                  }
                  fill={
                    isHit
                      ? '#4CAF50'
                      : '#A0C8F0'
                  }
                  opacity={
                    isHit
                      ? 1
                      : 0.7
                  }
                />
              </G>
            );
          },
        )}

        {/* ================================================================ */}
        {/* USER TRACE                                                       */}
        {/* ================================================================ */}

        {userPathString !== '' && (
          <Path
            d={userPathString}
            stroke="#FF8C42"
            strokeWidth={8}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* ================================================================ */}
        {/* END DOT                                                         */}
        {/* ================================================================ */}

        <Circle
          cx={endPoint.x}
          cy={endPoint.y}
          r={
            startAndEndOverlap
              ? 24
              : 20
          }
          fill={
            startAndEndOverlap
              ? 'none'
              : '#F44336'
          }
          stroke={
            startAndEndOverlap
              ? '#F44336'
              : 'none'
          }
          strokeWidth={
            startAndEndOverlap
              ? 4
              : 0
          }
          opacity={0.9}
        />

        {/* ================================================================ */}
        {/* START DOT                                                        */}
        {/* ================================================================ */}

        <Circle
          cx={startPoint.x}
          cy={startPoint.y}
          r={20}
          fill="#4CAF50"
          opacity={0.9}
        />
          </>
        )}
      </Svg>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* STYLES                                                                     */
/* -------------------------------------------------------------------------- */

const styles = StyleSheet.create({
  finalImage: {
    position: 'absolute',
    left: 0,
    top: 0,
  },

  container: {
    backgroundColor: '#FFFBF0',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E8DCC8',
    overflow: 'hidden',
  },
});