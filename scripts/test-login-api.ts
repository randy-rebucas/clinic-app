/**
 * Script to test the login API endpoint
 * Run with: npx tsx scripts/test-login-api.ts
 */

interface TestLogin {
  email: string;
  password: string;
  name: string;
}

const testLogins: TestLogin[] = [
  {
    email: 'john.doe@demo.com',
    password: 'password123',
    name: 'John Doe'
  },
  {
    email: 'jane.smith@demo.com',
    password: 'password123',
    name: 'Jane Smith'
  },
  {
    email: 'admin@demo.com',
    password: 'admin123',
    name: 'Admin User'
  }
];

async function testLoginAPI(): Promise<void> {
  try {
    console.log('🔐 Testing login API endpoint...\n');

    for (const login of testLogins) {
      console.log(`Testing login for ${login.name} (${login.email})...`);

      try {
        const response = await fetch('http://localhost:3001/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: login.email,
            password: login.password
          }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log(`✅ Login successful for ${login.name}`);
          console.log(`   Role: ${data.employee.role}`);
          console.log(`   Department: ${data.employee.department || 'N/A'}`);
          console.log(`   Position: ${data.employee.position || 'N/A'}`);
        } else {
          const errorData = await response.json();
          console.log(`❌ Login failed for ${login.name}: ${errorData.error}`);
        }
      } catch (error) {
        console.log(`❌ Error testing ${login.name}:`, error);
      }
      
      console.log('');
    }

    console.log('🎉 Login API testing completed!');
    console.log('\n📋 Demo Account Credentials:');
    console.log('═'.repeat(60));
    
    testLogins.forEach((login, index) => {
      console.log(`\n${index + 1}. ${login.name}`);
      console.log(`   📧 Email: ${login.email}`);
      console.log(`   🔑 Password: ${login.password}`);
    });

    console.log('\n═'.repeat(60));
    console.log('🔐 Ready for testing!');
    console.log('   • Use these credentials in the login form');
    console.log('   • Make sure the development server is running');
    console.log('   • Test the login functionality in the browser');

  } catch (error) {
    console.error('❌ Error testing login API:', error);
    throw error;
  }
}

// Run the script
testLoginAPI()
  .then(() => {
    console.log('\n✨ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
