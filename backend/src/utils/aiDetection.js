// AI-based category detection from description
export const detectCategoryFromDescription = (description) => {
  const lowerDesc = description.toLowerCase();
  
  const categoryKeywords = {
    WASTE_MANAGEMENT: ['waste', 'garbage', 'trash', 'dump', 'recycle', 'litter', 'junk'],
    POTHOLES: ['pothole', 'road', 'pavement', 'asphalt', 'crack', 'bump', 'repair'],
    ELECTRICITY: ['electricity', 'power', 'light', 'voltage', 'electrical', 'current', 'blackout', 'outage'],
    WATER: ['water', 'pipeline', 'supply', 'leak', 'contamination', 'drainage', 'quality'],
    SANITATION: ['sanitation', 'sewage', 'drain', 'sewer', 'hygiene', 'waste water'],
    PUBLIC_PROPERTY: ['property', 'bench', 'wall', 'vandalism', 'damage', 'public facility'],
    E_WASTE: ['e-waste', 'electronic', 'computer', 'mobile', 'battery', 'circuit', 'metal scrap'],
    SECURITY: ['security', 'crime', 'theft', 'vandalism', 'police', 'dangerous', 'safety'],
    HEALTH: ['health', 'hygiene', 'medical', 'hospital', 'disease', 'contamination'],
    ENVIRONMENT: ['environment', 'pollution', 'tree', 'green', 'air', 'noise', 'wildlife'],
    TRANSPORT: ['traffic', 'parking', 'transport', 'vehicle', 'bus', 'auto'],
    EDUCATION: ['school', 'college', 'education', 'student', 'university', 'facility'],
  };

  let detectedCategory = 'WASTE_MANAGEMENT'; // default
  let maxMatches = 0;

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    const matches = keywords.filter(keyword => lowerDesc.includes(keyword)).length;
    if (matches > maxMatches) {
      maxMatches = matches;
      detectedCategory = category;
    }
  }

  return detectedCategory;
};

// AI-based priority detection from description
export const detectPriorityFromDescription = (description, category) => {
  const lowerDesc = description.toLowerCase();

  // Urgent keywords
  const urgentKeywords = ['urgent', 'emergency', 'critical', 'danger', 'grave', 'serious', 'life threatening', 'major accident'];
  if (urgentKeywords.some(keyword => lowerDesc.includes(keyword))) {
    return 'URGENT';
  }

  // High priority keywords
  const highKeywords = ['severe', 'dangerous', 'risk', 'hazard', 'significant', 'flooding', 'fire'];
  if (highKeywords.some(keyword => lowerDesc.includes(keyword))) {
    return 'HIGH';
  }

  // Category-based priority defaults
  const categoryPriority = {
    ELECTRICITY: 'HIGH',
    SECURITY: 'HIGH',
    WATER: 'MEDIUM',
    SANITATION: 'MEDIUM',
    POTHOLES: 'MEDIUM',
    WASTE_MANAGEMENT: 'LOW',
    E_WASTE: 'LOW',
    TRANSPORT: 'MEDIUM',
    EDUCATION: 'LOW',
    HEALTH: 'HIGH',
    ENVIRONMENT: 'MEDIUM',
    PUBLIC_PROPERTY: 'MEDIUM',
  };

  return categoryPriority[category] || 'MEDIUM';
};

// Duplicate detection based on location and category
export const detectDuplicateComplaints = async (Complaint, location, category, citizenId, excludeComplaintId = null) => {
  try {
    const query = {
      category: category,
      status: { $ne: 'CLOSED' },
      isDuplicate: false,
    };

    if (excludeComplaintId) {
      query._id = { $ne: excludeComplaintId };
    }

    // Check for complaints within 100 meters
    if (location && location.coordinates) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: location.coordinates,
          },
          $maxDistance: 100, // 100 meters
        },
      };
    }

    const duplicates = await Complaint.find(query).limit(5);
    return duplicates;
  } catch (error) {
    console.error('Error detecting duplicates:', error);
    return [];
  }
};

// Generate unique tracking ID
export const generateTrackingId = () => {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return `CVC-${year}-${randomNum}`;
};

// Calculate SLA deadline
export const calculateSLADeadline = (category, createdAt = new Date()) => {
  const slaHours = {
    ELECTRICITY: 24,
    WATER: 48,
    POTHOLES: 72,
    SECURITY: 6,
    HEALTH: 12,
    SANITATION: 48,
    WASTE_MANAGEMENT: 48,
    PUBLIC_PROPERTY: 72,
    E_WASTE: 72,
    ENVIRONMENT: 96,
    TRANSPORT: 72,
    EDUCATION: 72,
  };

  const hours = slaHours[category] || 48;
  const deadline = new Date(createdAt);
  deadline.setHours(deadline.getHours() + hours);
  return deadline;
};
