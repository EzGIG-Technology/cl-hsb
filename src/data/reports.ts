export const monthlyCompletedAssignments = [
  { month: 'Jan', completed: 58 },
  { month: 'Feb', completed: 71 },
  { month: 'Mar', completed: 64 },
  { month: 'Apr', completed: 69 },
  { month: 'May', completed: 55 },
  { month: 'Jun', completed: 80 },
  { month: 'Jul', completed: 60 },
  { month: 'Aug', completed: 76 },
  { month: 'Sep', completed: 52 },
  { month: 'Oct', completed: 74 },
  { month: 'Nov', completed: 63 },
  { month: 'Dec', completed: 40 },
];

export const monthlyRevenue = [
  { month: 'Jan', revenue: 148500 },
  { month: 'Feb', revenue: 172300 },
  { month: 'Mar', revenue: 159800 },
  { month: 'Apr', revenue: 168900 },
  { month: 'May', revenue: 141200 },
  { month: 'Jun', revenue: 196500 },
  { month: 'Jul', revenue: 152700 },
  { month: 'Aug', revenue: 184900 },
  { month: 'Sep', revenue: 132600 },
  { month: 'Oct', revenue: 179400 },
  { month: 'Nov', revenue: 156100 },
  { month: 'Dec', revenue: 98200 },
];

/** CL payroll payout — hand-tuned to a realistic ~49-53% of that month's revenue, mirroring a labor-heavy care-services cost ratio. */
export const monthlyPayroll = [
  { month: 'Jan', payroll: 74000 },
  { month: 'Feb', payroll: 86500 },
  { month: 'Mar', payroll: 79500 },
  { month: 'Apr', payroll: 85200 },
  { month: 'May', payroll: 71800 },
  { month: 'Jun', payroll: 97200 },
  { month: 'Jul', payroll: 78400 },
  { month: 'Aug', payroll: 92800 },
  { month: 'Sep', payroll: 68500 },
  { month: 'Oct', payroll: 88900 },
  { month: 'Nov', payroll: 79800 },
  { month: 'Dec', payroll: 52400 },
];

export const attendanceToday = {
  scheduled: 247,
  onTime: 218,
  late: 18,
  notClockedIn: 11,
};

export const ratingDistribution = [
  { stars: 5, count: 412 },
  { stars: 4, count: 168 },
  { stars: 3, count: 44 },
  { stars: 2, count: 12 },
  { stars: 1, count: 6 },
];

export const packagePopularity = [
  { packageId: 'melur', bookings: 62 },
  { packageId: 'dahlia', bookings: 88 },
  { packageId: 'mawar', bookings: 74 },
  { packageId: 'rafflesia', bookings: 41 },
  { packageId: 'cempaka', bookings: 29 },
  { packageId: 'oversea', bookings: 15 },
  { packageId: 'seri-ibu', bookings: 33 },
];

// Real-world coordinates (WGS84) for Honey Spa's catchment around Bangi Sentral, Selangor.
// `count` = clients on the books who live in each area.
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
