// Volume and money for one outlet (Bangi Sentral plus home service). Roughly 350 to 550 sessions a
// month at an average ticket of about RM 95. March dips for Ramadan; June and December are busy with
// school holidays and wedding season.
export const monthlyCompletedAssignments = [
  { month: 'Jan', completed: 412 },
  { month: 'Feb', completed: 438 },
  { month: 'Mar', completed: 361 },
  { month: 'Apr', completed: 468 },
  { month: 'May', completed: 455 },
  { month: 'Jun', completed: 502 },
  { month: 'Jul', completed: 476 },
  { month: 'Aug', completed: 498 },
  { month: 'Sep', completed: 431 },
  { month: 'Oct', completed: 452 },
  { month: 'Nov', completed: 470 },
  { month: 'Dec', completed: 536 },
];

export const monthlyRevenue = [
  { month: 'Jan', revenue: 39600 },
  { month: 'Feb', revenue: 42300 },
  { month: 'Mar', revenue: 35400 },
  { month: 'Apr', revenue: 45200 },
  { month: 'May', revenue: 43900 },
  { month: 'Jun', revenue: 49100 },
  { month: 'Jul', revenue: 46000 },
  { month: 'Aug', revenue: 48300 },
  { month: 'Sep', revenue: 41500 },
  { month: 'Oct', revenue: 43600 },
  { month: 'Nov', revenue: 45400 },
  { month: 'Dec', revenue: 52800 },
];

/** Staff payroll (commission on treatment time), hand-tuned to about 45-47% of that month's revenue. */
export const monthlyPayroll = [
  { month: 'Jan', payroll: 18200 },
  { month: 'Feb', payroll: 19300 },
  { month: 'Mar', payroll: 16500 },
  { month: 'Apr', payroll: 20400 },
  { month: 'May', payroll: 19900 },
  { month: 'Jun', payroll: 22000 },
  { month: 'Jul', payroll: 20900 },
  { month: 'Aug', payroll: 21700 },
  { month: 'Sep', payroll: 18900 },
  { month: 'Oct', payroll: 19800 },
  { month: 'Nov', payroll: 20500 },
  { month: 'Dec', payroll: 23600 },
];

/** Today's sessions across the spa and home service, by check-in punctuality. */
export const attendanceToday = {
  scheduled: 26,
  onTime: 22,
  late: 3,
  notClockedIn: 1,
};

export const ratingDistribution = [
  { stars: 5, count: 268 },
  { stars: 4, count: 96 },
  { stars: 3, count: 21 },
  { stars: 2, count: 6 },
  { stars: 1, count: 3 },
];

/** Bookings per treatment this month. */
export const packagePopularity = [
  { packageId: 'traditional', bookings: 168 },
  { packageId: 'prenatal', bookings: 92 },
  { packageId: 'back', bookings: 74 },
  { packageId: 'foot', bookings: 61 },
  { packageId: 'mix-match', bookings: 38 },
  { packageId: 'totok-wajah', bookings: 24 },
  { packageId: 'mandi-bunga', bookings: 15 },
];

// Real-world coordinates (WGS84) for Honey Spa's catchment around Bangi Sentral, Selangor.
// `count` = customers on the books who live in each area.
export const locationTotals = [
  { name: 'Bandar Baru Bangi', lat: 2.9637, lng: 101.7686, count: 58 },
  { name: 'Kajang', lat: 2.993, lng: 101.788, count: 34 },
  { name: 'Putrajaya', lat: 2.9264, lng: 101.6964, count: 21 },
  { name: 'Cyberjaya', lat: 2.9213, lng: 101.6559, count: 15 },
  { name: 'Semenyih', lat: 2.9516, lng: 101.8433, count: 14 },
  { name: 'Seri Kembangan', lat: 3.0217, lng: 101.7055, count: 11 },
  { name: 'Nilai', lat: 2.8143, lng: 101.7974, count: 9 },
  { name: 'Dengkil', lat: 2.858, lng: 101.681, count: 6 },
];
