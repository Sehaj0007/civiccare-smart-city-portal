import 'dotenv/config';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import LabourTeam from '../models/LabourTeam.js';
import WardOffice from '../models/WardOffice.js';
import Complaint from '../models/Complaint.js';
import Supervisor from '../models/Supervisor.js';
import bcrypt from 'bcryptjs';

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await LabourTeam.deleteMany({});
    await WardOffice.deleteMany({});
    await Complaint.deleteMany({});
    await Supervisor.deleteMany({});

    console.log('Cleared existing data');

    // Create sample users
    const userData = [
      {
        name: 'Rajesh Kumar',
        email: 'citizen1@civiccare.com',
        password: 'password123',
        phone: '9876543210',
        role: 'USER',
      },
      {
        name: 'Priya Sharma',
        email: 'citizen2@civiccare.com',
        password: 'password123',
        phone: '9876543211',
        role: 'USER',
      },
      {
        name: 'Admin Waste',
        email: 'admin.waste@civiccare.com',
        password: 'admin123',
        phone: '9000000001',
        role: 'ADMIN',
        department: 'WASTE_MANAGEMENT',
      },
      {
        name: 'Admin Roads',
        email: 'admin.roads@civiccare.com',
        password: 'admin123',
        phone: '9000000002',
        role: 'ADMIN',
        department: 'ROAD_MAINTENANCE',
      },
      {
        name: 'Admin Electricity',
        email: 'admin.electricity@civiccare.com',
        password: 'admin123',
        phone: '9000000003',
        role: 'ADMIN',
        department: 'ELECTRICITY',
      },
      {
        name: 'Admin Property',
        email: 'admin.property@civiccare.com',
        password: 'admin123',
        phone: '9000000004',
        role: 'ADMIN',
        department: 'PUBLIC_PROPERTY',
      },
      {
        name: 'Admin E-Waste',
        email: 'admin.ewaste@civiccare.com',
        password: 'admin123',
        phone: '9000000005',
        role: 'ADMIN',
        department: 'E_WASTE',
      },
      {
        name: 'Admin Security',
        email: 'admin.security@civiccare.com',
        password: 'admin123',
        phone: '9000000006',
        role: 'ADMIN',
        department: 'SECURITY',
      },
      {
        name: 'Supervisor Kumar',
        email: 'supervisor@civiccare.com',
        password: 'supervisor123',
        phone: '9000000007',
        role: 'SUPERVISOR',
      },
    ];

    // Hash passwords
    const hashedUsers = await Promise.all(
      userData.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 10),
      }))
    );

    // Create users with pre-hashed passwords
    const users = await User.insertMany(hashedUsers.map(user => ({
      ...user,
      _id: undefined, // Let MongoDB generate the ID
    })), { 
      runValidators: true,
    });

    console.log('Users created:', users.length);

    // Create supervisor profile for the supervisor user
    const supervisorUser = users.find(user => user.role === 'SUPERVISOR');
    if (supervisorUser) {
      await Supervisor.create({
        userId: supervisorUser._id,
        name: supervisorUser.name,
        email: supervisorUser.email,
        phone: supervisorUser.phone,
        designation: 'City Supervisor',
        department: null, // No specific department - oversees all
        assignedZones: ['ZONE_A', 'ZONE_B', 'ZONE_C', 'ZONE_D', 'ZONE_E'],
        supervisoryLevel: 'SENIOR',
        isActive: true,
      });
      console.log('Supervisor profile created');
    }

    // Create labour teams
    const teams = await LabourTeam.create([
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
        availabilityStatus: 'BUSY',
      },
      {
        teamName: 'Property Maintenance Team',
        departmentCategory: 'PUBLIC_PROPERTY',
        contactNumber: '8765432107',
        email: 'property.team@civiccare.com',
        availabilityStatus: 'AVAILABLE',
      },
      {
        teamName: 'E-Waste Collection Team',
        departmentCategory: 'E_WASTE',
        contactNumber: '8765432108',
        email: 'ewaste.team@civiccare.com',
        availabilityStatus: 'AVAILABLE',
      },
      {
        teamName: 'Security Response Team',
        departmentCategory: 'SECURITY',
        contactNumber: '8765432109',
        email: 'security.team@civiccare.com',
        availabilityStatus: 'AVAILABLE',
      },
    ]);

    console.log('Labour teams created:', teams.length);

    // Create ward offices
    const wardOffices = await WardOffice.create([
      {
        wardNumber: 'W001',
        officeName: 'Ward 1 Office',
        locality: ['Downtown', 'City Center'],
        email: 'ward1@civiccare.com',
        phone: '9100000001',
        address: '123 Main Street, Downtown',
      },
      {
        wardNumber: 'W002',
        officeName: 'Ward 2 Office',
        locality: ['North District', 'Sector 1'],
        email: 'ward2@civiccare.com',
        phone: '9100000002',
        address: '456 North Avenue, North District',
      },
      {
        wardNumber: 'W003',
        officeName: 'Ward 3 Office',
        locality: ['East Side', 'Industrial Area'],
        email: 'ward3@civiccare.com',
        phone: '9100000003',
        address: '789 East Road, East Side',
      },
      {
        wardNumber: 'W004',
        officeName: 'Ward 4 Office',
        locality: ['West End', 'Residential Area'],
        email: 'ward4@civiccare.com',
        phone: '9100000004',
        address: '321 West Lane, West End',
      },
    ]);

    console.log('Ward offices created:', wardOffices.length);

    // Create sample complaints
    const complaints = await Complaint.create([
      {
        trackingId: 'CC' + Date.now() + Math.random().toString(36).substr(2, 5),
        category: 'WASTE_MANAGEMENT',
        complaintType: 'Garbage Overflow',
        title: 'Garbage Overflow at Corner',
        description: 'Garbage bin at corner is overflowing for 3 days',
        locality: 'Downtown',
        address: '100 Main St, Downtown',
        imageUrl: null,
        status: 'PENDING',
        citizenId: users[0]._id,
      },
      {
        trackingId: 'CC' + Date.now() + Math.random().toString(36).substr(2, 5),
        category: 'POTHOLES',
        complaintType: 'Large Pothole',
        title: 'Dangerous Pothole on Main Road',
        description: 'Dangerous pothole on the main road causing accidents',
        locality: 'City Center',
        address: '200 Market Street, City Center',
        imageUrl: null,
        status: 'PENDING',
        citizenId: users[1]._id,
      },
      {
        trackingId: 'CC' + Date.now() + Math.random().toString(36).substr(2, 5),
        category: 'ELECTRICITY',
        complaintType: 'Streetlight Not Working',
        title: 'Streetlight Not Working at Night',
        description: 'Streetlight near market is not functioning at night',
        locality: 'Downtown',
        address: '150 Market Street, Downtown',
        imageUrl: null,
        status: 'ASSIGNED',
        assignedTeamId: teams[4]._id,
        assignedByAdminId: users[4]._id,
        actionType: 'ASSIGNED',
        citizenId: users[0]._id,
      },
      {
        trackingId: 'CC' + Date.now() + Math.random().toString(36).substr(2, 5),
        category: 'PUBLIC_PROPERTY',
        complaintType: 'Damaged Public Bench',
        title: 'Damaged Public Bench in Park',
        description: 'Public bench in park is broken and unusable',
        locality: 'North District',
        address: '75 Park Avenue, North District',
        imageUrl: null,
        status: 'FORWARDED',
        forwardedWardOfficeId: wardOffices[1]._id,
        assignedByAdminId: users[5]._id,
        actionType: 'FORWARDED',
        citizenId: users[1]._id,
      },
      {
        trackingId: 'CC' + Date.now() + Math.random().toString(36).substr(2, 5),
        category: 'E_WASTE',
        complaintType: 'Electronic Waste Disposal Request',
        title: 'Electronic Waste Disposal Needed',
        description: 'Need to dispose old computer equipment',
        locality: 'East Side',
        address: '500 Tech Street, East Side',
        imageUrl: null,
        status: 'RESOLVED',
        assignedTeamId: teams[7]._id,
        assignedByAdminId: users[6]._id,
        actionType: 'ASSIGNED',
        resolvedAt: new Date(),
        citizenId: users[0]._id,
      },
      {
        trackingId: 'CC' + Date.now() + Math.random().toString(36).substr(2, 5),
        category: 'SECURITY',
        complaintType: 'Suspicious Activity',
        title: 'Suspicious Activity in Residential Area',
        description: 'Suspicious people loitering near residential area',
        locality: 'West End',
        address: '300 Residential Lane, West End',
        imageUrl: null,
        status: 'IN_PROGRESS',
        assignedTeamId: teams[8]._id,
        assignedByAdminId: users[7]._id,
        actionType: 'ASSIGNED',
        citizenId: users[1]._id,
      },
    ]);

    console.log('Complaints created:', complaints.length);

    console.log('\n✅ Seed data created successfully!');
    console.log('\n📝 Sample Credentials:');
    console.log('\nCitizen Users:');
    console.log('  Email: citizen1@civiccare.com | Password: password123');
    console.log('  Email: citizen2@civiccare.com | Password: password123');
    console.log('\nAdmin Users:');
    console.log('  Waste: admin.waste@civiccare.com | Password: admin123');
    console.log('  Roads: admin.roads@civiccare.com | Password: admin123');
    console.log('  Electricity: admin.electricity@civiccare.com | Password: admin123');
    console.log('  Property: admin.property@civiccare.com | Password: admin123');
    console.log('  E-Waste: admin.ewaste@civiccare.com | Password: admin123');
    console.log('  Security: admin.security@civiccare.com | Password: admin123');
    console.log('\nSupervisor User:');
    console.log('  Email: supervisor@civiccare.com | Password: supervisor123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
