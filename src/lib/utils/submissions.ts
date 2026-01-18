export function formatSubmissionCount(count: number): string {
  if (count === 0) {
    return "No submissions";
  } else if (count < 5) {
    return "Less than 5 submissions";
  } else if (count < 10) {
    return "5-10 submissions";
  } else if (count < 20) {
    return "10-20 submissions";
  } else if (count < 50) {
    return "20-50 submissions";
  } else if (count < 100) {
    return "50-100 submissions";
  } else {
    return "100+ submissions";
  }
}

