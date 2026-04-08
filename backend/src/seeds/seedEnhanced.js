import User from '../models/User.js';
import Department from '../models/Department.js';
import Team from '../models/Team.js';
import Complaint from '../models/Complaint.js';
import Supervisor from '../models/Supervisor.js';
import { generateTrackingId, calculateSLADeadline } from '../utils/aiDetection.js';

export const seedEnhancedData = async () => {
  console.log('🌱 Seeding enhanced CivicCare data...');

  try {
    // Clear existing data
    await User.deleteMany({});
    await Department.deleteMany({});
    await Team.deleteMany({});
    await Complaint.deleteMany({});
    await Supervisor.deleteMany({});

    // Create Supervisors
    const supervisors = await User.create([
      {
        name: 'Dr. Ramesh Kumar',
        email: 'supervisor@civiccare.com',
        phone: '9876543210',
        password: 'supervisor123',
        role: 'SUPERVISOR',
        department: null,
        isVerified: true,
        createdAt: new Date(),
      },
    ]);

    // Create linked supervisor profile required by /api/auth/supervisor-login
    await Supervisor.create({
      userId: supervisors[0]._id,
      name: supervisors[0].name,
      email: supervisors[0].email,
      phone: supervisors[0].phone,
      designation: 'City Supervisor',
      department: null,
      assignedZones: ['ZONE_A', 'ZONE_B'],
      supervisoryLevel: 'SENIOR',
      isActive: true,
    });

    // Create Departments with SLAs
    const departments = await Department.create([
      {
        name: 'WASTE_MANAGEMENT',
        displayName: 'Waste Management',
        description: 'Garbage collection, recycling, waste disposal',
        sla: {
          responseTime: 4,
          resolutionTime: 48,
          priority: 'MEDIUM',
        },
        stats: {
          totalComplaints: 0,
          resolvedComplaints: 0,
          pendingComplaints: 0,
          overdueComplaints: 0,
          performanceRating: 85,
        },
        isActive: true,
      },
      {
        name: 'POTHOLES',
        displayName: 'Roads & Potholes',
        description: 'Road repairs, potholes, street maintenance',
        sla: {
          responseTime: 6,
          resolutionTime: 72,
          priority: 'MEDIUM',
        },
        stats: {
          totalComplaints: 0,
          resolvedComplaints: 0,
          pendingComplaints: 0,
          overdueComplaints: 0,
          performanceRating: 78,
        },
        isActive: true,
      },
      {
        name: 'ELECTRICITY',
        displayName: 'Electricity Department',
        description: 'Power outages, street lights, electricity issues',
        sla: {
          responseTime: 2,
          resolutionTime: 24,
          priority: 'HIGH',
        },
        stats: {
          totalComplaints: 0,
          resolvedComplaints: 0,
          pendingComplaints: 0,
          overdueComplaints: 0,
          performanceRating: 92,
        },
        isActive: true,
      },
      {
        name: 'WATER',
        displayName: 'Water Supply',
        description: 'Water leaks, supply issues, contamination',
        sla: {
          responseTime: 4,
          resolutionTime: 48,
          priority: 'HIGH',
        },
        stats: {
          totalComplaints: 0,
          resolvedComplaints: 0,
          pendingComplaints: 0,
          overdueComplaints: 0,
          performanceRating: 88,
        },
        isActive: true,
      },
      {
        name: 'SANITATION',
        displayName: 'Sanitation',
        description: 'Sewage, drainage, public toilets, hygiene',
        sla: {
          responseTime: 6,
          resolutionTime: 48,
          priority: 'MEDIUM',
        },
        stats: {
          totalComplaints: 0,
          resolvedComplaints: 0,
          pendingComplaints: 0,
          overdueComplaints: 0,
          performanceRating: 82,
        },
        isActive: true,
      },
      {
        name: 'SECURITY',
        displayName: 'Security & Safety',
        description: 'Crime reports, security concerns, vandalism',
        sla: {
          responseTime: 1,
          resolutionTime: 6,
          priority: 'URGENT',
        },
        stats: {
          totalComplaints: 0,
          resolvedComplaints: 0,
          pendingComplaints: 0,
          overdueComplaints: 0,
          performanceRating: 90,
        },
        isActive: true,
      },
    ]);

    // Create Admin Users per Department
    const adminUsers = [];
    for (const dept of departments) {
      const admin = await User.create({
        name: `Admin ${dept.displayName}`,
        email: `admin.${dept.name.toLowerCase()}@civiccare.com`,
        phone: '9998887776',
        password: 'admin123',
        role: 'ADMIN',
        department: dept.name,
        isVerified: true,
        createdAt: new Date(),
      });
      adminUsers.push(admin);
      dept.headAdmin = admin._id;
      await dept.save();
    }

    // Create Teams per Department
    const teamData = [];
    for (let i = 0; i < departments.length; i++) {
      const dept = departments[i];
      for (let j = 1; j <= 2; j++) {
        const team = await Team.create({
          name: `${dept.displayName} Team ${j}`,
          department: dept._id,
          description: `Handling ${dept.displayName} complaints`,
          maxCapacity: 8,
          currentLoad: 0,
          availabilityStatus: 'AVAILABLE',
          performanceMetrics: {
            totalAssigned: 0,
            totalResolved: 0,
            slaComplianceRate: Math.random() * 100,
            overallRating: (Math.random() * 2 + 3).toFixed(1),
          },
          isActive: true,
        });

        // Create team members
        const memberCount = Math.floor(Math.random() * 3) + 2;
        for (let k = 0; k < memberCount; k++) {
          const member = await User.create({
            name: `${team.name} Member ${k + 1}`,
            email: `${team.name.toLowerCase().replace(/\s+/g, '.')}.member${k}@civiccare.com`,
            phone: `999888777${k}`,
            password: 'member123',
            role: 'TEAM_MEMBER',
            department: dept.name,
            isVerified: true,
            createdAt: new Date(),
          });
          team.members.push(member._id);
        }
        await team.save();
        dept.teams.push(team._id);
        teamData.push(team);
      }
      await dept.save();
    }

    // Create Citizen Users
    const citizens = await User.create([
      {
        name: 'Rajesh Kumar',
        email: 'rajesh@citizen.com',
        phone: '9876543210',
        password: 'citizen123',
        role: 'USER',
        isVerified: true,
        createdAt: new Date(),
      },
      {
        name: 'Priya Singh',
        email: 'priya@citizen.com',
        phone: '9876543211',
        password: 'citizen123',
        role: 'USER',
        isVerified: true,
        createdAt: new Date(),
      },
      {
        name: 'Amit Patel',
        email: 'amit@citizen.com',
        phone: '9876543212',
        password: 'citizen123',
        role: 'USER',
        isVerified: true,
        createdAt: new Date(),
      },
    ]);

    // Create Sample Complaints
    const complaintDescriptions = [
      {
        category: 'WASTE_MANAGEMENT',
        complaintType: 'Garbage overflow',
        description: 'Garbage bins at Indiranagar are overflowing for 3 days',
        locality: 'Indiranagar',
        address: '123 Indiranagar, Bangalore',
      },
      {
        category: 'POTHOLES',
        complaintType: 'Road damage',
        description: 'Large pothole on MG Road causing traffic hazard',
        locality: 'MG Road',
        address: '456 MG Road, Bangalore',
      },
      {
        category: 'ELECTRICITY',
        complaintType: 'Power outage',
        description: 'Frequent power cuts in Koramangala area',
        locality: 'Koramangala',
        address: '789 Koramangala, Bangalore',
      },
      {
        category: 'WATER',
        complaintType: 'Water leakage',
        description: 'Water pipeline leakage causing water loss',
        locality: 'Whitefield',
        address: '321 Whitefield, Bangalore',
      },
      {
        category: 'SANITATION',
        complaintType: 'Drain blockage',
        description: 'Drainage system blocked in Jayanagar area',
        locality: 'Jayanagar',
        address: '654 Jayanagar, Bangalore',
      },
      {
        category: 'SECURITY',
        complaintType: 'Street crime',
        description: 'Increased theft incidents in HSR Layout',
        locality: 'HSR Layout',
        address: '987 HSR Layout, Bangalore',
      },
    ];

    for (let i = 0; i < complaintDescriptions.length; i++) {
      const desc = complaintDescriptions[i];
      const citizen = citizens[i % citizens.length];
      const team = teamData.find(t => {
        const deptOfTeam = departments.find(d => d._id.toString() === t.department.toString());
        return deptOfTeam && deptOfTeam.name === desc.category;
      });

      const complaint = await Complaint.create({
        trackingId: generateTrackingId(),
        category: desc.category,
        complaintType: desc.complaintType,
        title: desc.complaintType,
        description: desc.description,
        locality: desc.locality,
        address: desc.address,
        city: 'Bangalore',
        location: {
          type: 'Point',
          coordinates: [77.5946 + Math.random() * 0.1, 12.9716 + Math.random() * 0.1],
        },
        images: [],
        priority: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'][Math.floor(Math.random() * 4)],
        status: ['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'][Math.floor(Math.random() * 4)],
        isDuplicate: Math.random() > 0.8,
        citizenId: citizen._id,
        assignedTeamId: team?._id,
        sla: {
          deadline: calculateSLADeadline(desc.category),
          isOverdue: Math.random() > 0.8,
          responseDeadline: new Date(new Date().getTime() + 6 * 60 * 60 * 1000),
          resolutionDeadline: calculateSLADeadline(desc.category),
        },
        timeline: [
          {
            status: 'PENDING',
            timestamp: new Date(),
            remarks: 'Complaint registered',
          },
        ],
        remarks: [],
        createdAt: new Date(new Date().getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      });

      // Update department stats
      const dept = departments.find(d => d.name === desc.category);
      if (dept) {
        dept.stats.totalComplaints += 1;
        if (complaint.status === 'RESOLVED') {
          dept.stats.resolvedComplaints += 1;
        } else if (complaint.status === 'PENDING') {
          dept.stats.pendingComplaints += 1;
        }
        if (complaint.sla.isOverdue) {
          dept.stats.overdueComplaints += 1;
        }
        await dept.save();
      }

      // Update team stats
      if (team) {
        team.assignedComplaints.push(complaint._id);
        team.currentLoad = Math.min(team.currentLoad + 1, team.maxCapacity);
        team.performanceMetrics.totalAssigned += 1;
        if (complaint.status === 'RESOLVED') {
          team.performanceMetrics.totalResolved += 1;
        }
        await team.save();
      }
    }

    console.log('✅ Enhanced seed data created successfully!');
    console.log('\n📊 Data Summary:');
    console.log(`✓ ${supervisors.length} Supervisor(s) created`);
    console.log(`✓ ${departments.length} Department(s) created`);
    console.log(`✓ ${adminUsers.length} Admin(s) created`);
    console.log(`✓ ${teamData.length} Teams created`);
    console.log(`✓ ${citizens.length} Citizen(s) created`);
    console.log(`✓ ${complaintDescriptions.length} Sample complaints created`);

    console.log('\n🔑 Login Credentials:');
    console.log('\nSupervisor:');
    console.log('  Email: supervisor@civiccare.com');
    console.log('  Password: supervisor123');
    console.log('\nAdmin (Waste Management):');
    console.log('  Email: admin.waste_management@civiccare.com');
    console.log('  Password: admin123');
    console.log('\nCitizen:');
    console.log('  Email: rajesh@citizen.com');
    console.log('  Password: citizen123');
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  }
};
