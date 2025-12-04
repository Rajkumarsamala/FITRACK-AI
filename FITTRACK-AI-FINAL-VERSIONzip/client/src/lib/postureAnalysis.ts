export interface PostureLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export interface PostureAnalysisResult {
  postureScore: number;
  shoulderAlignment: number;
  hipAlignment: number;
  spineAlignment: number;
  headPosition: number;
  bodySymmetry: number;
  overallAssessment: string;
  recommendations: string[];
  issues: PostureIssue[];
}

export interface PostureIssue {
  type: 'warning' | 'concern' | 'good';
  area: string;
  message: string;
  severity: number;
}

const LANDMARK_INDICES = {
  NOSE: 0,
  LEFT_EYE_INNER: 1,
  LEFT_EYE: 2,
  LEFT_EYE_OUTER: 3,
  RIGHT_EYE_INNER: 4,
  RIGHT_EYE: 5,
  RIGHT_EYE_OUTER: 6,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  MOUTH_LEFT: 9,
  MOUTH_RIGHT: 10,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_PINKY: 17,
  RIGHT_PINKY: 18,
  LEFT_INDEX: 19,
  RIGHT_INDEX: 20,
  LEFT_THUMB: 21,
  RIGHT_THUMB: 22,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31,
  RIGHT_FOOT_INDEX: 32,
};

function calculateAngle(p1: PostureLandmark, p2: PostureLandmark, p3: PostureLandmark): number {
  const radians = Math.atan2(p3.y - p2.y, p3.x - p2.x) - Math.atan2(p1.y - p2.y, p1.x - p2.x);
  let angle = Math.abs(radians * 180 / Math.PI);
  if (angle > 180) angle = 360 - angle;
  return angle;
}

function calculateDistance(p1: PostureLandmark, p2: PostureLandmark): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

function calculateSlope(p1: PostureLandmark, p2: PostureLandmark): number {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
}

function analyzeShoulderAlignment(landmarks: PostureLandmark[]): { score: number; issues: PostureIssue[] } {
  const leftShoulder = landmarks[LANDMARK_INDICES.LEFT_SHOULDER];
  const rightShoulder = landmarks[LANDMARK_INDICES.RIGHT_SHOULDER];
  
  const issues: PostureIssue[] = [];
  const shoulderSlope = Math.abs(calculateSlope(leftShoulder, rightShoulder));
  
  let score = 100;
  
  if (shoulderSlope > 10) {
    score -= Math.min(50, shoulderSlope * 3);
    issues.push({
      type: shoulderSlope > 15 ? 'concern' : 'warning',
      area: 'Shoulders',
      message: shoulderSlope > 15 
        ? 'Significant shoulder imbalance detected. One shoulder is noticeably higher.' 
        : 'Slight shoulder asymmetry. Consider shoulder stretches.',
      severity: Math.min(10, shoulderSlope / 2),
    });
  } else {
    issues.push({
      type: 'good',
      area: 'Shoulders',
      message: 'Shoulders are well-aligned and balanced.',
      severity: 0,
    });
  }
  
  return { score: Math.max(0, score), issues };
}

function analyzeHipAlignment(landmarks: PostureLandmark[]): { score: number; issues: PostureIssue[] } {
  const leftHip = landmarks[LANDMARK_INDICES.LEFT_HIP];
  const rightHip = landmarks[LANDMARK_INDICES.RIGHT_HIP];
  
  const issues: PostureIssue[] = [];
  const hipSlope = Math.abs(calculateSlope(leftHip, rightHip));
  
  let score = 100;
  
  if (hipSlope > 8) {
    score -= Math.min(50, hipSlope * 4);
    issues.push({
      type: hipSlope > 12 ? 'concern' : 'warning',
      area: 'Hips',
      message: hipSlope > 12 
        ? 'Hip misalignment detected. This may affect your gait and lower back.' 
        : 'Slight hip tilt observed. Core strengthening exercises may help.',
      severity: Math.min(10, hipSlope / 1.5),
    });
  } else {
    issues.push({
      type: 'good',
      area: 'Hips',
      message: 'Hip alignment is balanced.',
      severity: 0,
    });
  }
  
  return { score: Math.max(0, score), issues };
}

function analyzeSpineAlignment(landmarks: PostureLandmark[]): { score: number; issues: PostureIssue[] } {
  const leftShoulder = landmarks[LANDMARK_INDICES.LEFT_SHOULDER];
  const rightShoulder = landmarks[LANDMARK_INDICES.RIGHT_SHOULDER];
  const leftHip = landmarks[LANDMARK_INDICES.LEFT_HIP];
  const rightHip = landmarks[LANDMARK_INDICES.RIGHT_HIP];
  
  const shoulderMidpoint = {
    x: (leftShoulder.x + rightShoulder.x) / 2,
    y: (leftShoulder.y + rightShoulder.y) / 2,
    z: (leftShoulder.z + rightShoulder.z) / 2,
  };
  
  const hipMidpoint = {
    x: (leftHip.x + rightHip.x) / 2,
    y: (leftHip.y + rightHip.y) / 2,
    z: (leftHip.z + rightHip.z) / 2,
  };
  
  const issues: PostureIssue[] = [];
  const lateralDeviation = Math.abs(shoulderMidpoint.x - hipMidpoint.x) * 100;
  
  let score = 100;
  
  if (lateralDeviation > 5) {
    score -= Math.min(50, lateralDeviation * 5);
    issues.push({
      type: lateralDeviation > 10 ? 'concern' : 'warning',
      area: 'Spine',
      message: lateralDeviation > 10 
        ? 'Lateral spine curvature detected. Consider consulting a healthcare professional.' 
        : 'Minor lateral deviation in spine. Posture exercises recommended.',
      severity: Math.min(10, lateralDeviation),
    });
  } else {
    issues.push({
      type: 'good',
      area: 'Spine',
      message: 'Spine alignment appears straight and centered.',
      severity: 0,
    });
  }
  
  return { score: Math.max(0, score), issues };
}

function analyzeHeadPosition(landmarks: PostureLandmark[]): { score: number; issues: PostureIssue[] } {
  const nose = landmarks[LANDMARK_INDICES.NOSE];
  const leftShoulder = landmarks[LANDMARK_INDICES.LEFT_SHOULDER];
  const rightShoulder = landmarks[LANDMARK_INDICES.RIGHT_SHOULDER];
  
  const shoulderMidpoint = {
    x: (leftShoulder.x + rightShoulder.x) / 2,
    y: (leftShoulder.y + rightShoulder.y) / 2,
    z: (leftShoulder.z + rightShoulder.z) / 2,
  };
  
  const issues: PostureIssue[] = [];
  const forwardHeadOffset = (nose.z - shoulderMidpoint.z) * 100;
  const lateralHeadOffset = Math.abs(nose.x - shoulderMidpoint.x) * 100;
  
  let score = 100;
  
  if (forwardHeadOffset > 5) {
    score -= Math.min(30, forwardHeadOffset * 3);
    issues.push({
      type: forwardHeadOffset > 10 ? 'concern' : 'warning',
      area: 'Head Position',
      message: forwardHeadOffset > 10 
        ? 'Forward head posture detected. This can cause neck strain and headaches.' 
        : 'Slight forward head tilt. Chin tucks can help correct this.',
      severity: Math.min(10, forwardHeadOffset),
    });
  }
  
  if (lateralHeadOffset > 5) {
    score -= Math.min(20, lateralHeadOffset * 2);
    issues.push({
      type: 'warning',
      area: 'Head Position',
      message: 'Head tilted to one side. Try to keep your head centered.',
      severity: Math.min(10, lateralHeadOffset),
    });
  }
  
  if (forwardHeadOffset <= 5 && lateralHeadOffset <= 5) {
    issues.push({
      type: 'good',
      area: 'Head Position',
      message: 'Head position is well-centered and aligned.',
      severity: 0,
    });
  }
  
  return { score: Math.max(0, score), issues };
}

function analyzeBodySymmetry(landmarks: PostureLandmark[]): { score: number; issues: PostureIssue[] } {
  const pairs = [
    [LANDMARK_INDICES.LEFT_SHOULDER, LANDMARK_INDICES.RIGHT_SHOULDER],
    [LANDMARK_INDICES.LEFT_ELBOW, LANDMARK_INDICES.RIGHT_ELBOW],
    [LANDMARK_INDICES.LEFT_HIP, LANDMARK_INDICES.RIGHT_HIP],
    [LANDMARK_INDICES.LEFT_KNEE, LANDMARK_INDICES.RIGHT_KNEE],
  ];
  
  const issues: PostureIssue[] = [];
  let totalAsymmetry = 0;
  
  pairs.forEach(([leftIdx, rightIdx]) => {
    const left = landmarks[leftIdx];
    const right = landmarks[rightIdx];
    totalAsymmetry += Math.abs(left.y - right.y);
  });
  
  const avgAsymmetry = (totalAsymmetry / pairs.length) * 100;
  let score = 100 - Math.min(50, avgAsymmetry * 5);
  
  if (avgAsymmetry > 5) {
    issues.push({
      type: avgAsymmetry > 10 ? 'concern' : 'warning',
      area: 'Body Symmetry',
      message: avgAsymmetry > 10 
        ? 'Noticeable body asymmetry. This may indicate muscle imbalances.' 
        : 'Minor asymmetry detected. Balanced exercises can help.',
      severity: Math.min(10, avgAsymmetry),
    });
  } else {
    issues.push({
      type: 'good',
      area: 'Body Symmetry',
      message: 'Good overall body symmetry.',
      severity: 0,
    });
  }
  
  return { score: Math.max(0, score), issues };
}

function generateRecommendations(issues: PostureIssue[]): string[] {
  const recommendations: string[] = [];
  
  const concernAreas = issues.filter(i => i.type === 'concern' || i.type === 'warning');
  
  concernAreas.forEach(issue => {
    switch (issue.area) {
      case 'Shoulders':
        recommendations.push('Perform shoulder shrugs and rolls daily');
        recommendations.push('Practice wall angels to improve shoulder mobility');
        break;
      case 'Hips':
        recommendations.push('Strengthen your core with planks and dead bugs');
        recommendations.push('Do hip stretches like pigeon pose');
        break;
      case 'Spine':
        recommendations.push('Practice cat-cow stretches for spinal mobility');
        recommendations.push('Consider yoga or pilates for core and back strength');
        break;
      case 'Head Position':
        recommendations.push('Do chin tucks throughout the day');
        recommendations.push('Adjust your workstation to reduce forward lean');
        break;
      case 'Body Symmetry':
        recommendations.push('Focus on unilateral exercises (single-leg, single-arm)');
        recommendations.push('Stretch tight muscles and strengthen weak ones');
        break;
    }
  });
  
  if (recommendations.length === 0) {
    recommendations.push('Maintain your excellent posture with regular stretching');
    recommendations.push('Continue strength training for postural muscles');
    recommendations.push('Take breaks every 30 minutes if sitting for long periods');
  }
  
  return Array.from(new Set(recommendations)).slice(0, 5);
}

function generateOverallAssessment(score: number, issues: PostureIssue[]): string {
  const concernCount = issues.filter(i => i.type === 'concern').length;
  const warningCount = issues.filter(i => i.type === 'warning').length;
  
  if (score >= 90 && concernCount === 0) {
    return 'Excellent posture! Your body alignment is well-balanced. Keep up the great work with regular exercise and stretching.';
  } else if (score >= 75 && concernCount === 0) {
    return 'Good posture overall with some minor areas for improvement. Focus on the specific recommendations to achieve optimal alignment.';
  } else if (score >= 60) {
    return 'Moderate posture with several areas needing attention. Implementing the suggested exercises and stretches can significantly improve your alignment.';
  } else {
    return 'Your posture shows multiple areas of concern. We recommend consulting with a healthcare professional and following a structured corrective exercise program.';
  }
}

export function analyzePosture(landmarks: PostureLandmark[]): PostureAnalysisResult {
  if (landmarks.length < 33) {
    throw new Error('Insufficient landmarks for analysis');
  }
  
  const shoulderAnalysis = analyzeShoulderAlignment(landmarks);
  const hipAnalysis = analyzeHipAlignment(landmarks);
  const spineAnalysis = analyzeSpineAlignment(landmarks);
  const headAnalysis = analyzeHeadPosition(landmarks);
  const symmetryAnalysis = analyzeBodySymmetry(landmarks);
  
  const allIssues = [
    ...shoulderAnalysis.issues,
    ...hipAnalysis.issues,
    ...spineAnalysis.issues,
    ...headAnalysis.issues,
    ...symmetryAnalysis.issues,
  ];
  
  const postureScore = Math.round(
    (shoulderAnalysis.score * 0.2 +
      hipAnalysis.score * 0.2 +
      spineAnalysis.score * 0.25 +
      headAnalysis.score * 0.2 +
      symmetryAnalysis.score * 0.15)
  );
  
  return {
    postureScore,
    shoulderAlignment: Math.round(shoulderAnalysis.score),
    hipAlignment: Math.round(hipAnalysis.score),
    spineAlignment: Math.round(spineAnalysis.score),
    headPosition: Math.round(headAnalysis.score),
    bodySymmetry: Math.round(symmetryAnalysis.score),
    overallAssessment: generateOverallAssessment(postureScore, allIssues),
    recommendations: generateRecommendations(allIssues),
    issues: allIssues,
  };
}
