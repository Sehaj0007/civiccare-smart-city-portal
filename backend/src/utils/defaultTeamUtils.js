import LabourTeam from '../models/LabourTeam.js';

const departmentTeamDefaults = {
  WASTE_MANAGEMENT: [
    {
      teamName: 'Waste Management Team A',
      departmentCategory: 'WASTE_MANAGEMENT',
      contactNumber: '8765432101',
      email: 'waste.team.a@civiccare.com',
      availabilityStatus: 'AVAILABLE',
    },
    {
      teamName: 'Waste Management Team B',
      departmentCategory: 'WASTE_MANAGEMENT',
      contactNumber: '8765432102',
      email: 'waste.team.b@civiccare.com',
      availabilityStatus: 'AVAILABLE',
    },
  ],
  ROAD_MAINTENANCE: [
    {
      teamName: 'Road Repair Team A',
      departmentCategory: 'ROAD_MAINTENANCE',
      contactNumber: '8765432103',
      email: 'road.team.a@civiccare.com',
      availabilityStatus: 'AVAILABLE',
    },
    {
      teamName: 'Road Repair Team B',
      departmentCategory: 'ROAD_MAINTENANCE',
      contactNumber: '8765432104',
      email: 'road.team.b@civiccare.com',
      availabilityStatus: 'AVAILABLE',
    },
  ],
  ELECTRICITY: [
    {
      teamName: 'Electricity Team A',
      departmentCategory: 'ELECTRICITY',
      contactNumber: '8765432105',
      email: 'electricity.team.a@civiccare.com',
      availabilityStatus: 'AVAILABLE',
    },
    {
      teamName: 'Electricity Team B',
      departmentCategory: 'ELECTRICITY',
      contactNumber: '8765432106',
      email: 'electricity.team.b@civiccare.com',
      availabilityStatus: 'AVAILABLE',
    },
  ],
  WATER: [
    {
      teamName: 'Water Supply Team A',
      departmentCategory: 'WATER',
      contactNumber: '8765432107',
      email: 'water.team.a@civiccare.com',
      availabilityStatus: 'AVAILABLE',
    },
    {
      teamName: 'Water Supply Team B',
      departmentCategory: 'WATER',
      contactNumber: '8765432118',
      email: 'water.team.b@civiccare.com',
      availabilityStatus: 'AVAILABLE',
    },
  ],
  SANITATION: [
    {
      teamName: 'Sanitation Team A',
      departmentCategory: 'SANITATION',
      contactNumber: '8765432108',
      email: 'sanitation.team.a@civiccare.com',
      availabilityStatus: 'AVAILABLE',
    },
    {
      teamName: 'Sanitation Team B',
      departmentCategory: 'SANITATION',
      contactNumber: '8765432119',
      email: 'sanitation.team.b@civiccare.com',
      availabilityStatus: 'AVAILABLE',
    },
  ],
  PUBLIC_PROPERTY: [
    {
      teamName: 'Public Property Team A',
      departmentCategory: 'PUBLIC_PROPERTY',
      contactNumber: '8765432109',
      email: 'property.team.a@civiccare.com',
      availabilityStatus: 'AVAILABLE',
    },
    {
      teamName: 'Public Property Team B',
      departmentCategory: 'PUBLIC_PROPERTY',
      contactNumber: '8765432116',
      email: 'property.team.b@civiccare.com',
      availabilityStatus: 'AVAILABLE',
    },
  ],
  E_WASTE: [
    {
      teamName: 'E-Waste Team A',
      departmentCategory: 'E_WASTE',
      contactNumber: '8765432110',
      email: 'ewaste.team.a@civiccare.com',
      availabilityStatus: 'AVAILABLE',
    },
    {
      teamName: 'E-Waste Team B',
      departmentCategory: 'E_WASTE',
      contactNumber: '8765432120',
      email: 'ewaste.team.b@civiccare.com',
      availabilityStatus: 'AVAILABLE',
    },
  ],
  SECURITY: [
    {
      teamName: 'Security Team A',
      departmentCategory: 'SECURITY',
      contactNumber: '8765432111',
      email: 'security.team.a@civiccare.com',
      availabilityStatus: 'AVAILABLE',
    },
    {
      teamName: 'Security Team B',
      departmentCategory: 'SECURITY',
      contactNumber: '8765432117',
      email: 'security.team.b@civiccare.com',
      availabilityStatus: 'AVAILABLE',
    },
  ],
  HEALTH: [
    {
      teamName: 'Health Team A',
      departmentCategory: 'HEALTH',
      contactNumber: '8765432112',
      email: 'health.team.a@civiccare.com',
      availabilityStatus: 'AVAILABLE',
    },
    {
      teamName: 'Health Team B',
      departmentCategory: 'HEALTH',
      contactNumber: '8765432121',
      email: 'health.team.b@civiccare.com',
      availabilityStatus: 'AVAILABLE',
    },
  ],
  ENVIRONMENT: [
    {
      teamName: 'Environment Team A',
      departmentCategory: 'ENVIRONMENT',
      contactNumber: '8765432113',
      email: 'environment.team.a@civiccare.com',
      availabilityStatus: 'AVAILABLE',
    },
    {
      teamName: 'Environment Team B',
      departmentCategory: 'ENVIRONMENT',
      contactNumber: '8765432122',
      email: 'environment.team.b@civiccare.com',
      availabilityStatus: 'AVAILABLE',
    },
  ],
  TRANSPORT: [
    {
      teamName: 'Transport Team A',
      departmentCategory: 'TRANSPORT',
      contactNumber: '8765432114',
      email: 'transport.team.a@civiccare.com',
      availabilityStatus: 'AVAILABLE',
    },
    {
      teamName: 'Transport Team B',
      departmentCategory: 'TRANSPORT',
      contactNumber: '8765432123',
      email: 'transport.team.b@civiccare.com',
      availabilityStatus: 'AVAILABLE',
    },
  ],
  EDUCATION: [
    {
      teamName: 'Education Team A',
      departmentCategory: 'EDUCATION',
      contactNumber: '8765432115',
      email: 'education.team.a@civiccare.com',
      availabilityStatus: 'AVAILABLE',
    },
    {
      teamName: 'Education Team B',
      departmentCategory: 'EDUCATION',
      contactNumber: '8765432124',
      email: 'education.team.b@civiccare.com',
      availabilityStatus: 'AVAILABLE',
    },
  ],
};

export const getDepartmentDefaultTeams = (departmentCategory) =>
  departmentTeamDefaults[departmentCategory] || [];

export const ensureDepartmentDefaultTeams = async (departmentCategory) => {
  const defaults = getDepartmentDefaultTeams(departmentCategory);

  if (!defaults.length) {
    return LabourTeam.find({ departmentCategory }).sort({ teamName: 1 });
  }

  const existingTeams = await LabourTeam.find({ departmentCategory }).sort({ teamName: 1 });
  const existingNames = new Set(existingTeams.map((team) => team.teamName));
  const missingTeams = defaults.filter((team) => !existingNames.has(team.teamName));

  if (missingTeams.length > 0) {
    await LabourTeam.insertMany(missingTeams, { ordered: false });
  }

  return LabourTeam.find({ departmentCategory }).sort({ teamName: 1 });
};
