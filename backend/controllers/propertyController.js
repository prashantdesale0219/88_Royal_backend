const fs = require('fs');
const path = require('path');

// Path to the properties.json file
const propertiesFilePath = path.join(__dirname, '../data/properties.json');

// Get property data from JSON file
exports.getPropertyData = (req, res) => {
  try {
    // Read the properties.json file
    const propertyData = JSON.parse(fs.readFileSync(propertiesFilePath, 'utf8'));
    
    res.json({
      success: true,
      data: propertyData
    });
  } catch (error) {
    console.error('Error reading property data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching property data',
      error: error.message
    });
  }
};

// Get property data for internal use (not an API endpoint)
exports.getPropertyDataInternal = () => {
  try {
    // Read the properties.json file
    return JSON.parse(fs.readFileSync(propertiesFilePath, 'utf8'));
  } catch (error) {
    console.error('Error reading property data:', error);
    return null;
  }
};