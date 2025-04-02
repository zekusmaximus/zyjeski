const fs = require('fs');
const path = require('path');

const configFilePath = path.join(__dirname, 'public', 'admin', 'config.yml');

// Read the config file
try {
  let configContent = fs.readFileSync(configFilePath, 'utf8');
  
  // Replace placeholders with environment variables
  configContent = configContent.replace('AUTH0_DOMAIN_PLACEHOLDER', process.env.AUTH0_DOMAIN);
  configContent = configContent.replace('AUTH0_CLIENT_ID_PLACEHOLDER', process.env.AUTH0_CLIENT_ID);
  
  // Write the updated content back
  fs.writeFileSync(configFilePath, configContent);
  console.log('Auth0 credentials injected successfully!');
} catch (error) {
  console.error('Error injecting Auth0 credentials:', error);
  process.exit(1);
}